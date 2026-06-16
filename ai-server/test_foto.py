import cv2
import torch
import timm
import numpy as np
import argparse
from pathlib import Path
import albumentations as A
from albumentations.pytorch import ToTensorV2

# --- Argümanlar ---
parser = argparse.ArgumentParser(description="Tek Fotoğraf Üzerinde Deepfake Testi")
parser.add_argument("--image", required=True, help="Test edilecek görselin yolu")
parser.add_argument("--model", default=None,  help="Model .pth yolu (varsayılan: ../models/en_iyi_efficientnet_b5sinan.pth)")
args = parser.parse_args()

# --- Dosya Yolları ---
BASE_DIR   = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR.parent / "models"
model_path = Path(args.model) if args.model else MODELS_DIR / "en_iyi_efficientnet_b5sinan.pth"

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = timm.create_model('efficientnet_b5', pretrained=False, num_classes=2)
model.load_state_dict(torch.load(model_path, map_location=device))
model = model.to(device)
model.eval()

transform = A.Compose([
    A.Resize(224, 224),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
])

img = cv2.imread(args.image)
if img is None:
    print(f"Görsel okunamadı: {args.image}")
    exit(1)

img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

augmented = transform(image=img_rgb)
input_tensor = augmented['image'].unsqueeze(0).to(device)

with torch.no_grad():
    outputs = model(input_tensor)
    probs = torch.softmax(outputs, dim=1)
    prob_fake = probs[0][0].item() * 100
    prob_real = probs[0][1].item() * 100

print(f"Fake olasılığı: %{prob_fake:.1f}")
print(f"Real olasılığı: %{prob_real:.1f}")