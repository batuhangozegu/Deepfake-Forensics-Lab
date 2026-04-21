from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
import uvicorn
import shutil
import os
import cv2
import torch
from torchvision import transforms
from facenet_pytorch import MTCNN
import timm
from PIL import Image
import numpy as np
import tempfile

# Grad-CAM kütüphaneleri
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image

app = FastAPI()

# Frontend resimlere ulaşabilsin diye bulunduğumuz klasörü "/static" ismiyle dışa açıyoruz
# "static_images" diye bir klasör açalım ki ortalık karışmasın
STATIC_DIR = "static_images"
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
print(f"Kullanılan Cihaz: {device.type.upper()} (Sistem devrede!)")

print("Yapay Zeka Modeli (Xception) Yükleniyor...")
model = timm.create_model('xception', pretrained=False, num_classes=2)

model.load_state_dict(torch.load("C:/Users/BGzeg/Desktop/BitirmeProjesi/models/best_xception.pth", map_location=device))
model.to(device)
model.eval()

# Grad-CAM Kurulumu (Xception'ın conv4 katmanına kanca atıyoruz)
target_layers = [model.conv4]
cam = GradCAM(model=model, target_layers=target_layers)

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

    # Videoyu sistemin geçici klasörüne kaydet
    temp_dir = tempfile.gettempdir()
    temp_video_path = os.path.join(temp_dir, f"temp_{video.filename}")
    
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    v_cap = cv2.VideoCapture(temp_video_path)
    v_len = int(v_cap.get(cv2.CAP_PROP_FRAME_COUNT))
    sample_indices = range(0, v_len)

    fake_votes = 0
    processed_faces = 0

    # En şüpheli kareyi tutmak için değişkenler
    max_fake_prob = -1
    worst_face_img_np = None
    worst_face_tensor = None

    # Yüz Bulma ve Analiz Döngüsü
    for idx in sample_indices:
        v_cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        success, frame = v_cap.read()
        if not success: continue

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face = mtcnn(frame_rgb)

        if face is not None:
            processed_faces += 1
            face_img = Image.fromarray(((face.permute(1, 2, 0).numpy() + 1) * 127.5).astype(np.uint8))
            input_tensor = transform(face_img).unsqueeze(0).to(device)

            with torch.no_grad():
                outputs = model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                prob_fake = probabilities[0][1].item() * 100

                fake_votes += prob_fake
                
                # En sahte kareyi (Smoking Gun) yakala
                if prob_fake > max_fake_prob:
                    max_fake_prob = prob_fake
                    # BOYUT UYUŞMAZLIĞINI (Shape Mismatch) ÇÖZDÜĞÜMÜZ YER: 160'dan 224'e çekiyoruz
                    face_img_resized = face_img.resize((224, 224))
                    worst_face_img_np = np.array(face_img_resized, dtype=np.float32) / 255.0
                    worst_face_tensor = input_tensor

    v_cap.release()
    os.remove(temp_video_path)

    if processed_faces == 0:
        return {
            "status": "success",
            "result": "HATA",
            "confidence": 0,
            "details": "Videoda net bir yüz tespit edilemedi.",
            "heatmap_url": None
        }

    final_score = fake_votes / processed_faces
    durum = "DEEPFAKE" if final_score > 50 else "ORİJİNAL"
    
    # --- ISI HARİTASI (GRAD-CAM) ÜRETİMİ ---
    heatmap_filename = "yok"
    if worst_face_tensor is not None:
        targets = [ClassifierOutputTarget(1)] # Neden sahte dedin?
        grayscale_cam = cam(input_tensor=worst_face_tensor, targets=targets)[0, :]
        visualization = show_cam_on_image(worst_face_img_np, grayscale_cam, use_rgb=True)
        
        # Resmi, Frontend'in görebileceği "static_images" klasörüne kaydediyoruz
        base_name = os.path.splitext(video.filename)[0]
        heatmap_filename = f"heatmap_{base_name}.jpg"
        save_path = os.path.join(STATIC_DIR, heatmap_filename)
        
        cv2.imwrite(save_path, cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))
        print(f"🔥 Isı haritası üretildi: {save_path} (Skor: %{max_fake_prob:.1f})")

    print(f"İncelenen Yüz: {processed_faces} | Sonuç: {durum} (%{final_score:.1f})")

    return {
        "status": "success",
        "result": durum,
        "confidence": round(final_score, 1),
        "details": f"{ai_model.upper()} modeli ile {processed_faces} yüz karesi incelendi.",
        # Frontend bu URL'yi kullanarak resmi çekecek: http://localhost:8000/static/heatmap_video.jpg
        "heatmap_url": f"http://localhost:8000/static/{heatmap_filename}" if heatmap_filename != "yok" else None
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)