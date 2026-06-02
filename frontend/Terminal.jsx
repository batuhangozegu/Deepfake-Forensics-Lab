/* ============================================================
   TERMINAL — Stage controller: upload → analyzing → result
   ============================================================ */
const { useState: useStateT, useEffect: useEffectT, useRef: useRefT } = React;

function UploadStage({ onFileSelect }) {
  const [drag, setDrag] = useStateT(false);
  const fileInputRef = useRefT(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      style={{
        border: `1.5px dashed ${drag ? "rgba(37,99,235,0.6)" : "rgba(37,99,235,0.3)"}`,
        background: drag ? "rgba(37,99,235,0.06)" : "rgba(37,99,235,0.03)",
        borderRadius: 20, padding: "64px 30px", textAlign: "center",
        transition: "all .25s var(--ease)", cursor: "pointer",
        animation: "fadeIn .35s var(--ease)",
      }}
      onClick={() => fileInputRef.current && fileInputRef.current.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: "none" }} 
        accept="video/mp4,video/x-m4v,video/*"
      />
      <div style={{
        width: 78, height: 78, margin: "0 auto 22px", borderRadius: 20,
        background: "var(--grad-primary)", display: "grid", placeItems: "center",
        color: "#fff", boxShadow: "0 14px 36px rgba(37,99,235,0.35)",
      }}>
        <IconUpload size={36} />
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 8 }}>
        VİDEO YÜKLE VEYA SÜRÜKLE
      </div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 26 }}>
        MP4, MOV, WEBM • Maksimum 500MB
      </div>
      <button onClick={(e) => { e.stopPropagation(); fileInputRef.current && fileInputRef.current.click(); }} className="pick-btn" style={{
        padding: "12px 28px", borderRadius: "var(--r-ctrl)", fontWeight: 600, fontSize: 13.5,
        background: "transparent", border: "1px solid var(--primary)", color: "#93b4fb",
        transition: "all .2s var(--ease)",
      }}>
        Dosya Seç
      </button>
      <style>{`
        .pick-btn:hover{ background: var(--grad-primary); color: #fff; border-color: transparent;
          box-shadow: 0 8px 22px rgba(37,99,235,0.4); }
      `}</style>
    </div>
  );
}

function AnalyzingStage({ progress, step }) {
  return (
    <div style={{
      padding: "56px 30px", textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Spinner */}
      <div style={{ position: "relative", width: 90, height: 90, marginBottom: 30 }}>
        <svg width="90" height="90" style={{ animation: "spin 1s linear infinite" }}>
          <defs>
            <linearGradient id="spg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <circle cx="45" cy="45" r="38" fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle cx="45" cy="45" r="38" fill="none" stroke="url(#spg)" strokeWidth="6"
            strokeLinecap="round" strokeDasharray="120 200" />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          color: "var(--primary)",
        }}>
          <IconScan size={26} />
        </div>
      </div>

      <div style={{
        fontFamily: "var(--mono)", fontSize: 14, color: "var(--text)", marginBottom: 30,
        minHeight: 20,
      }}>
        {step}
      </div>

      {/* İlerleme çubuğu */}
      <div style={{ width: "min(440px, 90%)" }}>
        <div style={{
          position: "relative", height: 10, borderRadius: 999,
          background: "var(--border)", overflow: "hidden",
        }}>
          <div style={{
            position: "relative", height: "100%", width: `${progress}%`,
            background: "var(--grad-primary)", borderRadius: 999,
            transition: "width .3s var(--ease)", overflow: "hidden",
          }}>
            <span style={{
              position: "absolute", top: 0, bottom: 0, width: 50,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
              animation: "shimmer 1.4s linear infinite",
            }} />
          </div>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", marginTop: 10,
          fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)",
        }}>
          <span>analiz_ediliyor</span>
          <span style={{ color: "var(--primary)" }}>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

function Terminal({ stage, setStage, result, setResult, onOpenReport, user }) {
  const [progress, setProgress] = useStateT(0);
  const [stepMessage, setStepMessage] = useStateT("Bağlantı kuruluyor...");
  const wsRef = useRefT(null);

  const startAnalysis = async (file) => {
    setStage("analyzing");
    setProgress(0);
    setStepMessage("Sunucuya bağlanıyor...");

    const taskId = Date.now() + '-' + Math.random().toString(36).substring(2);

    // 1. Setup WebSocket connection for progress updates
    const wsUrl = `ws://localhost:8000/ws/progress/${taskId}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.progress !== undefined) {
          setProgress(data.progress);
        }
        if (data.message) {
          setStepMessage(data.message);
        }
      } catch (err) {
        console.error("WS JSON Parse hatası:", err);
      }
    };

    wsRef.current.onerror = () => {
      console.warn("WebSocket bağlantısı kurulamadı. İlerleme simüle edilecek.");
      setStepMessage("Yapay Zeka Analiz Ediyor...");
    };

    // 2. Prepare Form Data for multipart upload
    const formData = new FormData();
    const selectedModel = 'Xception'; // Veya 'efficientnet'
    formData.append('video', file);
    formData.append('ai_model', selectedModel);
    formData.append('task_id', taskId);

    try {
      const response = await fetch('http://localhost:8080/api/analysis/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error("HTTP hata kodu: " + response.status);
      }

      let responseData = await response.json();
      if (typeof responseData === 'string') {
        responseData = JSON.parse(responseData);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      setProgress(100);

      // Simulate a small delay for premium feels
      setTimeout(async () => {
        if (responseData.status === "error" || responseData.result === "HATA") {
          alert("Analiz başarısız: " + (responseData.details || responseData.message || "Bilinmeyen hata"));
          resetSystem();
          return;
        }

        const fakeScore = responseData.confidence;
        const isDeepfake = responseData.result === "DEEPFAKE";

        // Save scan history database record with current user ID!
        const historyPayload = {
          fileName: file.name,
          aiModel: selectedModel,
          result: isDeepfake ? "DEEPFAKE" : "ORİJİNAL",
          confidenceScore: fakeScore,
          heatmapUrl: responseData.heatmap_url || null,
          heatmapVideoUrl: responseData.heatmap_video_url || null,
          userId: user.id
        };

        let scanHistoryId = null;
        try {
          const saveRes = await fetch('http://localhost:8080/api/scan-history/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(historyPayload)
          });
          if (saveRes.ok) {
            const savedData = await saveRes.json();
            scanHistoryId = savedData.id;
          }
        } catch (e) {
          console.error("Veritabanına kaydedilemedi:", e);
        }

        setResult({
          verdict: isDeepfake ? "deepfake" : "authentic",
          confidence: fakeScore,
          details: responseData.details,
          heatmap_url: responseData.heatmap_url,
          heatmap_video_url: responseData.heatmap_video_url,
          original_video_url: responseData.original_video_url,
          scanHistoryId: scanHistoryId,
          fileName: file.name
        });

        setStage("result");
      }, 500);

    } catch (err) {
      if (wsRef.current) wsRef.current.close();
      console.error("Bağlantı hatası:", err);
      alert("Analiz işlemi başarısız oldu. Sunucu bağlantılarını ve dosyayı kontrol edin.");
      resetSystem();
    }
  };

  const resetSystem = () => {
    setStage("upload");
    setResult(null);
    setProgress(0);
    setStepMessage("Bağlantı kuruluyor...");
  };

  useEffectT(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const analyzing = stage === "analyzing";

  return (
    <div style={{ padding: "30px 36px 50px", maxWidth: 1180, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 7 }}>
            Medya Doğrulama Terminali
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            Sisteme şüpheli videoyu yükleyin ve yapay zeka analiz etsin.
          </p>
        </div>
        <StatusPill analyzing={analyzing} />
      </div>

      {/* Stage container */}
      {stage === "result" ? (
        <ResultView
          result={result}
          onReset={resetSystem}
          onOpenReport={onOpenReport}
        />
      ) : (
        <div className="topline" style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r-card)", boxShadow: "var(--halo)",
        }}>
          {stage === "upload"
            ? <UploadStage onFileSelect={startAnalysis} />
            : <AnalyzingStage progress={progress} step={stepMessage} />}
        </div>
      )}
    </div>
  );
}
window.Terminal = Terminal;
