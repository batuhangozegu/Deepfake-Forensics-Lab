<div align="center">

# 🔍 Derin Öğrenme ile Deepfake Tespiti

<img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
<img src="https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
<img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/PyTorch-2.x-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />

<br /><br />

**Deepfake tespiti için uçtan uca adli analiz platformu.**  
EfficientNet-B5 tabanlı yapay zeka motoru, Grad-CAM ısı haritaları ve Ollama destekli adli rapor üretimiyle şüpheli videoları gerçek zamanlı olarak inceler.

</div>

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Mimari](#-mimari)
- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Model Performans Karşılaştırması](#-model-performans-karşılaştırması)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [API Referansı](#-api-referansı)
- [Kullanım Akışı](#-kullanım-akışı)
- [Veritabanı Şeması](#-veritabanı-şeması)

---

## 🎯 Proje Hakkında

**Derin Öğrenme ile Deepfake Tespiti**, video içeriklerindeki deepfake manipülasyonlarını tespit etmek için geliştirilmiş bir **adli analiz (forensic analysis) platformudur**. Proje, üç bağımsız servisin birlikte çalıştığı bir **mikro-servis mimarisi** üzerine kurulmuştur:

1. **AI Sunucusu** – Yüz tespiti, çerçeve bazlı deepfake skoru hesaplama ve Grad-CAM görselleştirmesi
2. **Backend API** – Kullanıcı yönetimi, tarama geçmişi, Ollama ile doğal dil rapor üretimi
3. **Frontend** – Gerçek zamanlı ilerleme takibi, ikili video oynatıcı ve yönetim paneli

---

## 🏗 Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                        KULLANICI                            │
│            (Tarayıcı — React 18 / Vanilla JSX)              │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot 3.4.3 (Port 8080)                  │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │Auth/User   │  │ScanHistory  │  │ Report (Ollama AI)  │  │
│  │Controller  │  │Controller   │  │ Controller          │  │
│  └────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
│  ← PostgreSQL ──────────────────────────────────────────→  │
│    (users, scan_history)                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │  Multipart HTTP (RestTemplate)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                FastAPI AI Sunucusu (Port 8000)              │
│                                                             │
│  ① MTCNN — Yüz tespiti (facenet-pytorch)                   │
│  ② EfficientNet-B5 — Deepfake sınıflandırma (timm)         │
│  ③ Grad-CAM — Isı haritası üretimi                         │
│  ④ FFmpeg — H.264 MP4 çıktı (tarayıcı uyumlu)             │
│  ⑤ WebSocket /ws/progress/{task_id} — İlerleme yayını      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Özellikler

### 🤖 Yapay Zeka & Analiz
- **EfficientNet-B5** tabanlı deepfake sınıflandırma (%96 doğruluk, AUC: 0.9834)
- **MTCNN** ile kare bazında otomatik yüz tespiti
- **Grad-CAM** ile manipüle edilmiş bölgelerin ısı haritası görselleştirmesi
- Tüm video kareleri üzerinde çerçeve bazında analiz ve ortalama güven skoru
- En şüpheli karenin JPG olarak çıkarılması (Ollama raporu için)

### 📡 Gerçek Zamanlı İletişim
- **WebSocket** üzerinden kare bazında ilerleme (`/ws/progress/{task_id}`)
- Analiz süreci boyunca canlı yüzde ve adım mesajları

### 📊 Sonuç Görüntüleme
- Animasyonlu **dairesel güven skoru göstergesi**
- Radial renk geçişli **reveal animasyonu** (DEEPFAKE → kırmızı, ORİJİNAL → yeşil)
- Orijinal video & Grad-CAM videosu **senkronize ikili oynatıcı**
- En şüpheli karenin Grad-CAM ısı haritası görüntüsü

### 🧾 Adli Rapor
- **Ollama** entegrasyonu (Spring AI) ile LLM destekli doğal dil adli rapor üretimi
- Rapor, **veritabanına** kaydedilir ve geçmişten tekrar görüntülenebilir
- Terminal temalı **typing-console** animasyonuyla satır satır akış

### 👤 Kullanıcı & Yönetim
- Salt + SHA-256 tabanlı özel şifre hash sistemi (Spring Security kullanılmadan)
- `admin` ve `user` rolleri; admin paneli yalnızca adminlere görünür
- **Admin Paneli**: Kullanıcı oluşturma, silme, aktif/pasif durumu değiştirme
- Pasif kullanıcılar giriş yapamaz (`403 Forbidden`)
- Kullanıcılar yalnızca kendi tarama geçmişlerini görür; adminler tüm geçmişi görür
- LocalStorage tabanlı oturum kalıcılığı

### 📜 Tarama Geçmişi
- Tüm analizler otomatik olarak veritabanına kaydedilir
- Geçmiş kayıtlardan adli rapor modal penceresiyle yeniden görüntüleme
- Kullanıcı bazlı filtreleme

---

## 🔧 Teknoloji Yığını

| Katman | Teknoloji | Sürüm |
|--------|-----------|-------|
| **AI Sunucusu** | FastAPI + Uvicorn | 0.115+ |
| | PyTorch + CUDA | 2.x |
| | timm (EfficientNet-B5) | latest |
| | facenet-pytorch (MTCNN) | latest |
| | pytorch-grad-cam | latest |
| | OpenCV | 4.x |
| | FFmpeg | system |
| **Backend** | Spring Boot | 3.4.3 |
| | Spring Data JPA + Hibernate | 3.4.x |
| | Spring AI (Ollama) | 1.0.0-M6 |
| | PostgreSQL Driver | 42.x |
| | Lombok | 1.18.x |
| | Java | 17 |
| **Frontend** | React (UMD / CDN) | 18.3.1 |
| | Babel Standalone | 7.29.0 |
| | Inter + JetBrains Mono | Google Fonts |
| | Vanilla CSS | — |
| **Veritabanı** | PostgreSQL | 15+ |
| **LLM** | Ollama (yerel) | — |

---

## 📈 Model Performans Karşılaştırması

Modeller, **50,623 video karesi** içeren test veri seti üzerinde değerlendirilmiştir (43,877 sahte / 6,746 gerçek).

| Model | Accuracy | Fake F1 | Real F1 | AUC | Boyut |
|-------|----------|---------|---------|-----|-------|
| EfficientNet-B4 | %52 | 0.61 | 0.35 | 0.804 | ~44 MB |
| Xception | %46 | 0.62 | 0.02 | 0.803 | ~83 MB |
| **EfficientNet-B5** | **%96** | **0.98** | **0.86** | **0.983** | **~114 MB** |
| EfficientNet-B5 + SBI | %96 | 0.98 | 0.85 | 0.981 | ~114 MB |
| ConvNeXt-Base | %95 | 0.97 | 0.83 | 0.982 | ~350 MB |

> ✅ **Üretimde kullanılan model:** `EfficientNet-B5` — En yüksek AUC (0.9834) ve denge puanı ile seçilmiştir.

---

## 📁 Proje Yapısı

```
BitirmeProjesi/
│
├── ai-server/                      # Python FastAPI yapay zeka sunucusu
│   ├── ai_server.py                # Ana sunucu: analiz, Grad-CAM, WebSocket
│   ├── test_video.py               # Video test scripti
│   ├── test_foto.py                # Fotoğraf test scripti
│   ├── test_Veriseti.py            # Veri seti değerlendirme
│   ├── test_allmodels.py           # Tüm modellerin karşılaştırmalı testi
│   ├── Confusion_matrix.py         # Karmaşıklık matrisi üretimi
│   ├── roc_egrisi.py               # ROC eğrisi çizimi
│   ├── sonuclar.txt                # Model test sonuçları
│   └── static_images/             # Üretilen heatmap JPG ve MP4 dosyaları
│
├── backend/                        # Spring Boot Java backend
│   ├── pom.xml
│   └── src/main/java/com/deepfake/backend/
│       ├── BackendApplication.java # Uygulama giriş noktası + seed kullanıcıları
│       ├── config/                 # AppConfig (CORS vb.)
│       ├── controller/
│       │   ├── AnalysisController.java     # POST /api/analysis/analyze
│       │   ├── AuthController.java         # POST /api/auth/login
│       │   ├── ReportController.java       # POST /api/report/generate
│       │   ├── ScanHistoryController.java  # CRUD /api/scan-history
│       │   ├── SystemController.java       # Sistem durumu
│       │   └── UserController.java         # CRUD /api/users
│       ├── service/
│       │   ├── AnalysisService.java        # Python'a multipart köprüleme
│       │   ├── ReportService.java          # Ollama rapor üretimi
│       │   └── ScanHistoryService.java
│       ├── entity/
│       │   ├── User.java
│       │   └── ScanHistory.java
│       ├── dto/                    # Request/Response DTO'ları
│       ├── repository/             # Spring Data JPA Repository arayüzleri
│       ├── mapper/                 # Entity ↔ DTO dönüşümleri
│       └── util/
│           └── PasswordEncoder.java  # Salt + SHA-256 hash
│
├── frontend/                       # React tabanlı SPA
│   ├── index.html                  # CDN React + Babel yükleyici
│   ├── styles.css                  # Global CSS değişkenleri ve animasyonlar
│   ├── App.jsx                     # Router + global state
│   ├── LoginScreen.jsx             # Giriş ekranı
│   ├── Terminal.jsx                # Upload / Analyzing aşamaları + WebSocket
│   ├── ResultView.jsx              # Analiz sonucu + çift video + Grad-CAM
│   ├── History.jsx                 # Tarama geçmişi listesi
│   ├── AdminPanel.jsx              # Kullanıcı yönetim paneli
│   ├── UserModals.jsx              # Kullanıcı ekleme/düzenleme modalleri
│   ├── ReportModal.jsx             # Geçmişten rapor görüntüleme
│   ├── shared.jsx                  # Sidebar, StatusPill, TypingConsole
│   └── icons.jsx                   # SVG ikon bileşenleri
│
└── models/                         # Eğitilmiş PyTorch model ağırlıkları
    ├── en_iyi_efficientnet_b5sinan.pth  ← Aktif model (~114 MB)
    ├── en_iyi_convnext.pth
    ├── en_iyi_swin.pth
    ├── best_xception.pth
    └── ...
```

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- **Java 17+** ve **Maven 3.8+**
- **Python 3.10+**
- **PostgreSQL 15+**
- **Ollama** (yerel LLM — `ollama serve`)
- **FFmpeg** (sistem PATH'inde)
- CUDA destekli GPU (opsiyonel, CPU fallback mevcut)

---

### 1️⃣ Veritabanını Hazırla

```sql
CREATE DATABASE deepfake_db;
```

`backend/src/main/resources/application.properties` dosyasını düzenleyin:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/deepfake_db
spring.datasource.username=KULLANICI_ADINIZ
spring.datasource.password=ŞİFRENİZ
spring.jpa.hibernate.ddl-auto=update
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.options.model=gemma4
```

---

### 2️⃣ Python AI Sunucusunu Başlat

```bash
# Sanal ortam oluştur
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükle
pip install fastapi uvicorn torch torchvision timm facenet-pytorch \
            pytorch-grad-cam opencv-python pillow numpy

# Sunucuyu başlat (Port 8000)
cd ai-server
python ai_server.py
```

> Model yolu `ai_server.py` içinde hardcoded'dır. Kendi `models/` dizininizdeki `.pth` dosya yolunu güncelleyin:
> ```python
> model.load_state_dict(torch.load("/PATH/TO/models/en_iyi_efficientnet_b5sinan.pth", map_location=device))
> ```

---

### 3️⃣ Spring Boot Backend'i Başlat

```bash
cd backend
./mvnw spring-boot:run
```

Uygulama `http://localhost:8080` adresinde başlar. İlk çalıştırmada veritabanı boşsa iki varsayılan kullanıcı oluşturulur:

| E-posta | Şifre | Rol |
|---------|-------|-----|
| `admin@detector.io` | `admin123` | admin |
| `user@detector.io` | `user123` | user |

---

### 4️⃣ Ollama'yı Başlat

```bash
ollama serve
ollama pull gemma4   # veya tercih ettiğiniz model
```

---

### 5️⃣ Frontend'i Başlat

```bash
cd frontend
npx http-server . -p 3000 --cors
```

Tarayıcıda `http://localhost:3000` adresini açın.

---

## 📡 API Referansı

### 🔐 Auth

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/auth/login` | Giriş — `{email, password}` |

### 🎬 Analiz

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/analysis/analyze` | Video yükle ve deepfake analizi başlat |
| `WS` | `ws://localhost:8000/ws/progress/{task_id}` | Gerçek zamanlı ilerleme akışı |

**Analiz İsteği (multipart/form-data):**
```
video:    <video dosyası>
ai_model: "EfficientNet-B5"
task_id:  "1718541234567-abc123xyz"
```

**Analiz Yanıtı:**
```json
{
  "status": "success",
  "result": "DEEPFAKE",
  "confidence": 87.4,
  "details": "EfficientNet-B5 modeli ile 142 yüz karesi incelendi.",
  "heatmap_url": "http://localhost:8000/static/heatmap_video.jpg",
  "heatmap_video_url": "http://localhost:8000/static/heatmap_video.mp4",
  "original_video_url": "http://localhost:8000/static/original_video.mp4"
}
```

### 🧾 Rapor

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/report/generate` | Ollama ile adli rapor üret |

### 📜 Tarama Geçmişi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/scan-history/save` | Analiz kaydını kaydet |
| `GET` | `/api/scan-history/user/{userId}` | Kullanıcıya ait kayıtlar |
| `GET` | `/api/scan-history/all` | Tüm kayıtlar (admin) |
| `POST` | `/api/scan-history/update-report/{id}` | Rapor metnini güncelle |

### 👤 Kullanıcı (Admin)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/users` | Tüm kullanıcıları listele |
| `POST` | `/api/users` | Yeni kullanıcı oluştur |
| `PUT` | `/api/users/{id}` | Kullanıcıyı güncelle |
| `DELETE` | `/api/users/{id}` | Kullanıcıyı sil |
| `PATCH` | `/api/users/{id}/status` | Aktif/Pasif durumu değiştir |

---

## 🖥 Kullanım Akışı

```
1. Giriş Yap
   └─ E-posta + şifre ile kimlik doğrulama

2. Medya Doğrulama Terminali
   ├─ Upload Aşaması: Video sürükle-bırak veya dosya seç
   ├─ Analyzing Aşaması: WebSocket ile canlı ilerleme çubuğu
   └─ Result Aşaması:
       ├─ Animasyonlu güven skoru göstergesi
       ├─ DEEPFAKE / ORİJİNAL verdict banner
       ├─ Orijinal video ↔ Grad-CAM video senkronize oynatıcı
       ├─ En şüpheli karenin Grad-CAM ısı haritası
       └─ "Adli Rapor Oluştur" (Ollama LLM → typing-console animasyonu)

3. Tarama Geçmişi
   └─ Geçmiş kayıtları görüntüle, kayıtlı raporları aç

4. Admin Paneli (sadece admin rolü)
   └─ Kullanıcı yönetimi: ekleme, silme, aktif/pasif
```

---

## 🗄 Veritabanı Şeması

### `users`

| Kolon | Tür | Açıklama |
|-------|-----|----------|
| `id` | BIGSERIAL PK | Otomatik artan kimlik |
| `email` | VARCHAR UNIQUE | Giriş e-postası |
| `password` | VARCHAR | SHA-256 hash |
| `salt` | VARCHAR | Şifre tuzu |
| `name` | VARCHAR | Görünen ad |
| `role` | VARCHAR | `admin` veya `user` |
| `status` | VARCHAR | `active` veya `passive` |
| `created_at` | TIMESTAMP | Oluşturma zamanı |

### `scan_history`

| Kolon | Tür | Açıklama |
|-------|-----|----------|
| `id` | BIGSERIAL PK | Otomatik artan kimlik |
| `file_name` | VARCHAR | Analiz edilen video adı |
| `ai_model` | VARCHAR | Kullanılan model adı |
| `result` | VARCHAR | `DEEPFAKE` veya `ORİJİNAL` |
| `confidence_score` | DOUBLE | Güven yüzdesi (0-100) |
| `heatmap_url` | VARCHAR(500) | Grad-CAM JPG URL |
| `heatmap_video_url` | VARCHAR(500) | Grad-CAM MP4 URL |
| `report_text` | TEXT | Ollama adli rapor metni |
| `user_id` | BIGINT FK | İlgili kullanıcı |
| `created_at` | TIMESTAMP | Tarama zamanı |

---

## 🔒 Güvenlik

- Şifreler **salt + SHA-256** ile hash'lenir; düz metin asla saklanmaz
- `passive` kullanıcılar giriş denemesinde `403 Forbidden` alır
- Admin işlemleri rol kontrolüne tabidir (backend + frontend)
- CORS tüm origin'lere açıktır (geliştirme ortamı için) — production'da kısıtlanmalıdır

<div align="center">

**Derin Öğrenme ile Deepfake Tespiti** — Görünmeyeni görür.

*Bitirme Projesi — 2026*

</div>
