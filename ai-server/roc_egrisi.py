import os
import cv2
import torch
import timm
import numpy as np
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt
import albumentations as A
from albumentations.pytorch import ToTensorV2
from tqdm import tqdm

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = timm.create_model('efficientnet_b5', pretrained=False, num_classes=2)
model.load_state_dict(torch.load('/home/bgozegu/Masaüstü/BitirmeProjesi/models/en_iyi_efficientnet_b5sinan.pth', map_location=device))
model = model.to(device)
model.eval()

transform = A.Compose([
    A.Resize(224, 224),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
])

fake_folder = "/home/bgozegu/Masaüstü/model/dataset_v2/val/fake"
real_folder = "/home/bgozegu/Masaüstü/model/dataset_v2/val/real"

all_labels = []
all_probs = []

for folder, label in [(fake_folder, 0), (real_folder, 1)]:
    for img_name in tqdm(os.listdir(folder), desc=os.path.basename(folder)):
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

fpr, tpr, _ = roc_curve(all_labels, all_probs)
roc_auc = auc(fpr, tpr)
if roc_auc < 0.5:
    roc_auc = 1 - roc_auc
    fpr, tpr = tpr, fpr

plt.figure(figsize=(6, 5))
plt.plot(fpr, tpr, color='blue', lw=2, label=f'ROC (AUC = {roc_auc:.4f})')
plt.plot([0, 1], [0, 1], color='gray', linestyle='--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('EfficientNet-B5 ROC Eğrisi')
plt.legend(loc='lower right')
plt.tight_layout()
plt.savefig('/home/bgozegu/Masaüstü/roc_curve.png', dpi=150, bbox_inches='tight')
print(f"AUC: {roc_auc:.4f} - Kaydedildi: roc_curve.png")