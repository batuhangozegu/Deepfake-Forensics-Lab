import os
import cv2
import torch
import timm
import numpy as np
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
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
all_preds = []

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
            all_preds.append(0 if prob_fake > 0.5 else 1)
            all_labels.append(label)

cm = confusion_matrix(all_labels, all_preds)
print(f"TN: {cm[0][0]}, FP: {cm[0][1]}, FN: {cm[1][0]}, TP: {cm[1][1]}")

disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['Fake', 'Real'])
disp.plot(cmap='Blues')
plt.title('EfficientNet-B5 Confusion Matrix')
plt.savefig('/home/bgozegu/Masaüstü/confusion_matrix.png', dpi=150, bbox_inches='tight')
print("Kaydedildi: confusion_matrix.png")