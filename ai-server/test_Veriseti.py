import os
import cv2
import torch
import timm
import numpy as np
from tqdm import tqdm
from sklearn.metrics import classification_report
import albumentations as A
from albumentations.pytorch import ToTensorV2

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = timm.create_model('efficientnet_b5', pretrained=False, num_classes=2)
model.load_state_dict(torch.load('/home/bgozegu/Masaüstü/BitirmeProjesi/models/en_iyi_b5_sbi.pth', map_location=device))
model = model.to(device)
model.eval()

transform = A.Compose([
    A.Resize(224, 224),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
])

def test_folder(folder, true_label):
    preds = []
    
    for img_name in tqdm(os.listdir(folder), desc=folder):
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
            pred = 0 if prob_fake > 0.5 else 1
            preds.append((true_label, pred))
    return preds

# Klasör yollarını değiştir
fake_folder = "/home/bgozegu/Masaüstü/model/dataset_v2/val/fake"
real_folder = "/home/bgozegu/Masaüstü/model/dataset_v2/val/real"

results = test_folder(fake_folder, 0) + test_folder(real_folder, 1)
y_true = [r[0] for r in results]
y_pred = [r[1] for r in results]

print(classification_report(y_true, y_pred, target_names=['fake', 'real']))

from sklearn.metrics import roc_auc_score
import torch.nn.functional as F

def test_folder_probs(folder, true_label):
    results = []
    for img_name in tqdm(os.listdir(folder), desc=folder):
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
            results.append((true_label, prob_fake))
    return results

results = test_folder_probs(fake_folder, 0) + test_folder_probs(real_folder, 1)
y_true = [r[0] for r in results]
y_scores = [r[1] for r in results]

auc = roc_auc_score(y_true, y_scores)
print(f"AUC: {auc:.4f}")