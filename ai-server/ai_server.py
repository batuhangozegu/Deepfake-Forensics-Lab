from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional
import uvicorn
import shutil
import os
import cv2
import torch
import subprocess
from torchvision import transforms
from facenet_pytorch import MTCNN
import timm
from PIL import Image
import numpy as np
import tempfile
from pathlib import Path

# Scriptin bulunduğu klasör: .../BitirmeProjesi/ai-server/
BASE_DIR = Path(__file__).resolve().parent
# Modeller klasörü: .../BitirmeProjesi/models/
MODELS_DIR = BASE_DIR.parent / "models"

# Grad-CAM kütüphaneleri
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image

from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

class LogRequestMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/predict":
            print(f"[INCOMING] Content-Type: {request.headers.get('content-type', 'MISSING')}")
        return await call_next(request)

app.add_middleware(LogRequestMiddleware)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    print(f"Content-Type header: {request.headers.get('content-type', 'MISSING')}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, task_id: str):
        await websocket.accept()
        self.active_connections[task_id] = websocket

    def disconnect(self, task_id: str):
        if task_id in self.active_connections:
            del self.active_connections[task_id]

    async def send_message(self, message: dict, task_id: str):
        if task_id in self.active_connections:
            try:
                await self.active_connections[task_id].send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/progress/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await manager.connect(websocket, task_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(task_id)


STATIC_DIR = "static_images"
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
print(f"Kullanılan Cihaz: {device.type.upper()} (Sistem devrede!)")

print("Yapay Zeka Modeli (efficientnet_b5) Yükleniyor...")
model = timm.create_model('efficientnet_b5', pretrained=False, num_classes=2)

model.load_state_dict(torch.load(MODELS_DIR / "en_iyi_efficientnet_b5sinan.pth", map_location=device))
model.to(device)
model.eval()

# Grad-CAM Kurulumu (Xception'ın conv4 katmanına kanca atıyoruz)
target_layers = [model.conv_head]
cam = GradCAM(model=model, target_layers=target_layers)

mtcnn = MTCNN(keep_all=False, margin=20, device=device)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

print("Model Hazır! İstekler bekleniyor...")

@app.post("/predict")
async def analyze_deepfake(video: UploadFile = File(...), ai_model: str = Form(...), task_id: Optional[str] = Form(None)):
    print(f"\n--- YENİ VİDEO ANALİZİ BAŞLADI ---")

    # Videoyu sistemin geçici klasörüne kaydet
    temp_dir = tempfile.gettempdir()
    temp_video_path = os.path.join(temp_dir, f"temp_{video.filename}")

    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    v_cap = cv2.VideoCapture(temp_video_path)
    v_len = int(v_cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = v_cap.get(cv2.CAP_PROP_FPS) or 25.0

    FRAME_SIZE = (224, 224)

    base_name = os.path.splitext(video.filename)[0]

    # Geçici AVI (tarayıcı uyumsuz, sonra ffmpeg ile dönüştürülecek)
    temp_avi_path = os.path.join(temp_dir, f"temp_heatmap_{base_name}.avi")
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    video_writer = cv2.VideoWriter(temp_avi_path, fourcc, fps, FRAME_SIZE)

    fake_votes = 0
    processed_faces = 0
    total_frames_written = 0

    # En şüpheli kareyi tutmak için değişkenler (Ollama JPG için)
    max_fake_prob = -1
    worst_face_img_np = None
    worst_face_tensor = None

    # Yüz Bulma ve Analiz Döngüsü — Her kareyi işle
    for idx in range(v_len):
        v_cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        success, frame = v_cap.read()
        if not success:
            continue

        if task_id:
            # Send progress every few frames to avoid overwhelming the socket
            if idx % 5 == 0 or idx == v_len - 1:
                progress = int((idx / v_len) * 100)
                await manager.send_message({"progress": progress, "message": f"Kareler işleniyor ({idx}/{v_len})..."}, task_id)
                # Event loop'a kontrol ver — GPU işlemleri loop'u bloklar,
                # bu satır olmadan WebSocket mesajları tarayıcıya ulaşamaz
                await asyncio.sleep(0)

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face = mtcnn(frame_rgb)

        if face is not None:
            processed_faces += 1

            face_img = Image.fromarray(
                ((face.permute(1, 2, 0).numpy() + 1) * 127.5).astype(np.uint8)
            )
            input_tensor = transform(face_img).unsqueeze(0).to(device)

            with torch.no_grad():
                outputs = model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                prob_fake = probabilities[0][0].item() * 100
                fake_votes += prob_fake

                # En sahte kareyi yakala (Ollama JPG için)
                if prob_fake > max_fake_prob:
                    max_fake_prob = prob_fake
                    face_img_resized = face_img.resize(FRAME_SIZE)
                    worst_face_img_np = np.array(face_img_resized, dtype=np.float32) / 255.0
                    worst_face_tensor = input_tensor

            # --- BU KARE İÇİN GRAD-CAM ÜRET (Video için) ---
            face_np = np.array(face_img.resize(FRAME_SIZE), dtype=np.float32) / 255.0
            targets = [ClassifierOutputTarget(0)]
            grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0, :]

            visualization_rgb = show_cam_on_image(face_np, grayscale_cam, use_rgb=True)
            visualization_bgr = cv2.cvtColor(visualization_rgb, cv2.COLOR_RGB2BGR)
            video_writer.write(visualization_bgr)
            total_frames_written += 1

    v_cap.release()
    video_writer.release()

    # --- ORİJİNAL VİDEOYU DA STATIC KLASÖRÜNE KOPYALA (tarayıcı için H.264 MP4) ---
    original_mp4_filename = "yok"
    original_mp4_path = os.path.join(STATIC_DIR, f"original_{base_name}.mp4")
    ffmpeg_orig_cmd = [
        "ffmpeg", "-y",
        "-i", temp_video_path,
        "-vcodec", "libx264",
        "-acodec", "aac",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "23",
        "-movflags", "+faststart",
        original_mp4_path
    ]
    orig_result = subprocess.run(ffmpeg_orig_cmd, capture_output=True, text=True)
    if orig_result.returncode == 0:
        original_mp4_filename = f"original_{base_name}.mp4"
        print(f"📹 Orijinal video static'e kopyalandı: {original_mp4_path}")
    else:
        print(f"⚠️  Orijinal video dönüştürülemedi: {orig_result.stderr[:200]}")

    os.remove(temp_video_path)

    if processed_faces == 0:
        if os.path.exists(temp_avi_path):
            os.remove(temp_avi_path)
        return {
            "status": "success",
            "result": "HATA",
            "confidence": 0,
            "details": "Videoda net bir yüz tespit edilemedi.",
            "heatmap_url": None,
            "heatmap_video_url": None
        }

    final_score = fake_votes / processed_faces
    durum = "DEEPFAKE" if final_score > 50 else "ORİJİNAL"

    # --- 1) EN SAHTE KARE → JPG (Ollama için) ---
    heatmap_jpg_filename = "yok"
    if worst_face_tensor is not None:
        targets = [ClassifierOutputTarget(1)]
        grayscale_cam = cam(input_tensor=worst_face_tensor, targets=targets)[0, :]
        visualization = show_cam_on_image(worst_face_img_np, grayscale_cam, use_rgb=True)

        heatmap_jpg_filename = f"heatmap_{base_name}.jpg"
        save_path = os.path.join(STATIC_DIR, heatmap_jpg_filename)
        cv2.imwrite(save_path, cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))
        print(f"🖼️  Isı haritası JPG üretildi: {save_path} (Skor: %{max_fake_prob:.1f})")

    # --- 2) TÜM KARELER → H.264 MP4 (Tarayıcı için, ffmpeg ile) ---
    heatmap_mp4_filename = "yok"
    if total_frames_written > 0 and os.path.exists(temp_avi_path):
        heatmap_mp4_filename = f"heatmap_{base_name}.mp4"
        output_mp4_path = os.path.join(STATIC_DIR, heatmap_mp4_filename)

        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-i", temp_avi_path,
            "-vcodec", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            "-crf", "23",
            output_mp4_path
        ]
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        os.remove(temp_avi_path)

        if result.returncode == 0:
            print(f"🎬 Grad-CAM videosu üretildi: {output_mp4_path} ({total_frames_written} kare)")
        else:
            print(f"❌ ffmpeg hatası: {result.stderr}")
            heatmap_mp4_filename = "yok"

    print(f"İncelenen Yüz Karesi: {processed_faces} | Sonuç: {durum} (%{final_score:.1f})")

    return {
        "status": "success",
        "result": durum,
        "confidence": round(final_score, 1),
        "details": f"{ai_model.upper()} modeli ile {processed_faces} yüz karesi incelendi.",
        # Ollama bu URL'yi kullanacak (JPG)
        "heatmap_url": f"http://localhost:8000/static/{heatmap_jpg_filename}" if heatmap_jpg_filename != "yok" else None,
        # Frontend heatmap videoyu bu URL ile oynatacak (H.264 MP4)
        "heatmap_video_url": f"http://localhost:8000/static/{heatmap_mp4_filename}" if heatmap_mp4_filename != "yok" else None,
        # Frontend orijinal videoyu bu URL ile oynatacak (H.264 MP4)
        "original_video_url": f"http://localhost:8000/static/{original_mp4_filename}" if original_mp4_filename != "yok" else None
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)