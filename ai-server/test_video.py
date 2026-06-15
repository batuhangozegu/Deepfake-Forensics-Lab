import cv2
import torch
import timm
import numpy as np
import albumentations as A
from albumentations.pytorch import ToTensorV2
from facenet_pytorch import MTCNN

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = timm.create_model('efficientnet_b5', pretrained=False, num_classes=2)
model.load_state_dict(torch.load('/home/bgozegu/Masaüstü/BitirmeProjesi/models/en_iyi_efficientnet_b5sinan.pth', map_location=device))
model = model.to(device)
model.eval()

detector = MTCNN(keep_all=True, device=device)

transform = A.Compose([
    A.Resize(224, 224),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
])

# Test videosu — elindeki fake bir videoyu yaz
video_path = '/home/bgozegu/Masaüstü/model/celebdf/Celeb-synthesis/id0_id1_0000.mp4'

cap = cv2.VideoCapture(video_path)
cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
success, frame = cap.read()
cap.release()

frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
boxes, probs = detector.detect(frame_rgb)
print(f"Yüz bulundu mu: {boxes is not None}")
print(f"Box: {boxes}")

if boxes is not None:
    x1, y1, x2, y2 = map(int, boxes[0])
    h, w = frame_rgb.shape[:2]
    x1 = max(0, x1 - 20)
    y1 = max(0, y1 - 20)
    x2 = min(w, x2 + 20)
    y2 = min(h, y2 + 20)
    
    yuz = frame_rgb[y1:y2, x1:x2]
    yuz = cv2.resize(yuz, (224, 224))
    
    augmented = transform(image=yuz)
    input_tensor = augmented['image'].unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.softmax(outputs, dim=1)
        prob_fake = probs[0][0].item() * 100
        prob_real = probs[0][1].item() * 100
    
    print(f"Fake: %{prob_fake:.1f}")
    print(f"Real: %{prob_real:.1f}")