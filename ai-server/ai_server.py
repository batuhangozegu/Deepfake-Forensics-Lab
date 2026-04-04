from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
import shutil
import os
import cv2
import torch
import torch.nn as nn
from torchvision import models, transforms
from facenet_pytorch import MTCNN
import timm
from PIL import Image
import numpy as np

app = FastAPI()

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
print(f"Kullanılan Cihaz: {device.type.upper()} (Sistem devrede!)")

print("Yapay Zeka Modeli (EfficientNet) Yükleniyor...")
model = timm.create_model('xception', pretrained=False, num_classes=2)



model.load_state_dict(torch.load("best_xception.pth", map_location=device))
model.to(device)
model.eval()


mtcnn = MTCNN(keep_all=False, margin=20, device=device)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

print("Model Hazır! İstekler bekleniyor...")

@app.post("/predict")
async def analyze_deepfake(video: UploadFile = File(...), ai_model: str = Form(...)):
    print(f"\n--- YENİ VİDEO ANALİZİ BAŞLADI ---")

    # Videoyu geçici olarak kaydet
    temp_video_path = f"temp_{video.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    v_cap = cv2.VideoCapture(temp_video_path)
    v_len = int(v_cap.get(cv2.CAP_PROP_FRAME_COUNT))


    sample_indices = range(0, v_len)

    fake_votes = 0
    processed_faces = 0

    # Sinan'ın Yüz Bulma ve Analiz Döngüsü
    for idx in sample_indices:
        v_cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        success, frame = v_cap.read()
        if not success: continue

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face = mtcnn(frame_rgb) # Yüzü bul!

        if face is not None:
            processed_faces += 1
            face_img = Image.fromarray(((face.permute(1, 2, 0).numpy() + 1) * 127.5).astype(np.uint8))
            input_tensor = transform(face_img).unsqueeze(0).to(device)

            with torch.no_grad():
                outputs = model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                prob_fake = probabilities[0][1].item() * 100 # Sahtelik yüzdesi

                fake_votes += prob_fake

    v_cap.release()
    os.remove(temp_video_path)


    if processed_faces == 0:
        return {
            "status": "success",
            "result": "HATA",
            "confidence": 0,
            "details": "Videoda net bir yüz tespit edilemedi."
        }

    # ORTALAMA SKORU HESAPLA
    final_score = fake_votes / processed_faces
    durum = "DEEPFAKE" if final_score > 50 else "ORİJİNAL"

    print(f"İncelenen Yüz: {processed_faces} | Sonuç: {durum} (%{final_score:.1f})")

    return {
        "status": "success",
        "result": durum,
        "confidence": round(final_score, 1),
        "details": f"{ai_model.upper()} modeli ile {processed_faces} yüz karesi incelendi."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)