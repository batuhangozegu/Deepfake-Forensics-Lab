import os
import cv2
import torch
import timm
import numpy as np
import argparse
from pathlib import Path
from sklearn.metrics import classification_report, roc_auc_score
from tqdm import tqdm
import albumentations as A
from albumentations.pytorch import ToTensorV2
import torchvision.models as tv_models

# --- Argümanlar ---
parser = argparse.ArgumentParser(description="Tüm Modelleri Karşılaştırmalı Test Et")
parser.add_argument("--fake", required=True, help="Fake görsel klasörünün yolu")
parser.add_argument("--real", required=True, help="Real görsel klasörünün yolu")
args = parser.parse_args()

fake_folder = args.fake
real_folder = args.real

# --- Dosya Yolları ---
BASE_DIR   = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR.parent / "models"

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

transform = A.Compose([
    A.Resize(224, 224),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
])

models_config = [
    {
        "name": "EfficientNet-B4",
        "model_fn": lambda: timm.create_model('efficientnet_b4', pretrained=False, num_classes=2),
        "path": MODELS_DIR / "en_iyi_deepfake_modeli.pth"
    },
    {
        "name": "Xception",
        "model_fn": lambda: timm.create_model('xception', pretrained=False, num_classes=2),
        "path": MODELS_DIR / "best_xception.pth"
    },
    {
        "name": "ConvNeXt-Base",
        "model_fn": lambda: timm.create_model('convnext_base', pretrained=False, num_classes=2),
        "path": MODELS_DIR / "en_iyi_convnext.pth"
    },
    {
        "name": "EfficientNet-B5",
        "model_fn": lambda: timm.create_model('efficientnet_b5', pretrained=False, num_classes=2),
        "path": MODELS_DIR / "en_iyi_efficientnet_b5sinan.pth"
    },
    {
        "name": "EfficientNet-B5 + SBI",
        "model_fn": lambda: timm.create_model('efficientnet_b5', pretrained=False, num_classes=2),
        "path": MODELS_DIR / "en_iyi_b5_sbi.pth"
    },
]

def test_model(model, fake_folder, real_folder):
    all_labels = []
    all_probs = []

    for folder, label in [(fake_folder, 0), (real_folder, 1)]:
        for img_name in tqdm(os.listdir(folder), desc=f"{os.path.basename(folder)}"):
            if not img_name.endswith(('.jpg', '.png', '.jpeg')):
                continue
            img = cv2.imread(os.path.join(folder, img_name))
            if img is None:
                continue
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            aug = transform(image=img_rgb)
            inp = aug['image'].unsqueeze(0).to(device)
            with torch.no_grad():
                out = model(inp)
                prob_fake = torch.softmax(out, dim=1)[0][0].item()
                all_probs.append(prob_fake)
                all_labels.append(label)

    y_pred = [0 if p > 0.5 else 1 for p in all_probs]
    auc = roc_auc_score(all_labels, all_probs)
    if auc < 0.5:
        auc = 1 - auc

    return all_labels, y_pred, auc


print("=" * 60)
for cfg in models_config:
    print(f"\n🔄 Test ediliyor: {cfg['name']}")
    model = cfg['model_fn']()
    model.load_state_dict(torch.load(cfg['path'], map_location=device))
    model = model.to(device)
    model.eval()

    labels, preds, auc = test_model(model, fake_folder, real_folder)

    print(f"\n📊 {cfg['name']} Sonuçları:")
    print(classification_report(labels, preds, target_names=['fake', 'real']))
    print(f"AUC: {auc:.4f}")
    print("=" * 60)

    # Belleği boşalt
    del model
    torch.cuda.empty_cache()