/* ============================================================
   RESULT VIEW — Stage 3 (radial reveal, score, dual video, frame, console)
   ============================================================ */
const { useState: useStateR, useEffect: useEffectR, useRef: useRefR } = React;

/* Animated circular score gauge */
function ScoreGauge({ target, danger }) {
  const [val, setVal] = useStateR(0);
  const R = 62, C = 2 * Math.PI * R;
  const col = danger ? "var(--danger)" : "var(--safe)";

  useEffectR(() => {
    let raf, t0;
    const dur = 1000;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const off = C - (val / 100) * C;
  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="80" cy="80" r={R} fill="none" stroke="var(--border)" strokeWidth="11" />
        <circle cx="80" cy="80" r={R} fill="none" stroke={col} strokeWidth="11"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off}
          style={{ filter: `drop-shadow(0 0 8px ${danger ? "rgba(239,68,68,0.6)" : "rgba(16,185,129,0.55)"})` }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        flexDirection: "column", textAlign: "center",
      }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: val >= 100 ? 26 : val >= 10 ? 32 : 38, fontWeight: 700, color: col, lineHeight: 1 }}>
            {val.toFixed(1)}<span style={{ fontSize: val >= 100 ? 14 : 18 }}>%</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 4, letterSpacing: "1px" }}>
            GÜVEN SKORU
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoBox({ label, labelColor, url, videoRef, onPlay, onPause, onSeeked }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 10.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1px",
        color: labelColor, marginBottom: 7,
      }}>{label}</div>
      <div style={{
        position: "relative", borderRadius: 12, overflow: "hidden",
        border: "1px solid var(--border)", background: "#020617", height: 180,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {url ? (
          <video
            ref={videoRef}
            src={url}
            controls
            onPlay={onPlay}
            onPause={onPause}
            onSeeked={onSeeked}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--muted)", fontSize: 12 }}>
            Görüntü Akışı Yok
          </div>
        )}
      </div>
    </div>
  );
}

function HeatmapImageBox({ label, url }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 10.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1px",
        color: "var(--danger)", marginBottom: 7,
      }}>{label}</div>
      <div style={{
        position: "relative", borderRadius: 12, overflow: "hidden",
        border: "1px solid var(--border)", background: "#020617", height: 160,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {url ? (
          <img
            src={url}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            alt="Grad-CAM Isı Haritası"
          />
        ) : (
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--muted)", fontSize: 12 }}>
            Isı Haritası Görseli Bulunmuyor
          </div>
        )}
      </div>
    </div>
  );
}

function ResultView({ result, onReset, onOpenReport }) {
  const danger = result.verdict === "deepfake";
  const [revealed, setRevealed] = useStateR(false);
  const [showConsole, setShowConsole] = useStateR(false);
  const [reportText, setReportText] = useStateR([]);
  const [loadingReport, setLoadingReport] = useStateR(false);

  const videoRef1 = useRefR(null);
  const videoRef2 = useRefR(null);

  // Sync dual video playback
  const handlePlay = () => {
    if (videoRef2.current && videoRef2.current.paused) {
      videoRef2.current.play();
    }
  };
  const handlePause = () => {
    if (videoRef2.current && !videoRef2.current.paused) {
      videoRef2.current.pause();
    }
  };
  const handleSeeked = () => {
    if (videoRef1.current && videoRef2.current) {
      const diff = Math.abs(videoRef2.current.currentTime - videoRef1.current.currentTime);
      if (diff > 0.15) {
        videoRef2.current.currentTime = videoRef1.current.currentTime;
      }
    }
  };

  useEffectR(() => {
    const t = setTimeout(() => setRevealed(true), 520);
    return () => clearTimeout(t);
  }, []);

  const generateReport = async () => {
    if (showConsole) return;
    setShowConsole(true);
    setLoadingReport(true);

    try {
      const response = await fetch('http://localhost:8080/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: danger ? "DEEPFAKE" : "ORİJİNAL",
          confidence: result.confidence,
          heatmap_url: result.heatmap_url || "Bulunmuyor"
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        const text = data.report_text;
        setReportText(text.split('\n'));

        // Save report to the DB record if scanHistoryId exists
        if (result.scanHistoryId) {
          fetch(`http://localhost:8080/api/scan-history/update-report/${result.scanHistoryId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportText: text })
          }).catch(err => console.error("Rapor veritabanına kaydedilemedi:", err));
        }
      } else {
        setReportText(["Rapor oluşturulamadı: Sunucuda hata oluştu."]);
      }
    } catch (e) {
      console.error(e);
      setReportText(["Rapor oluşturulamadı: Sunucu bağlantı hatası."]);
    } finally {
      setLoadingReport(false);
    }
  };

  const card = (extra) => ({
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--r-card)", padding: 24, position: "relative", ...extra,
  });

  return (
    <div style={{ position: "relative" }}>
      {/* Radial reveal burst */}
      {!revealed && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none",
          display: "grid", placeItems: "center", background: "var(--bg)",
        }}>
          <div style={{
            width: 300, height: 300, borderRadius: "50%",
            background: danger
              ? "radial-gradient(circle, rgba(239,68,68,0.5), rgba(127,29,29,0.15) 60%, transparent 75%)"
              : "radial-gradient(circle, rgba(16,185,129,0.5), rgba(6,78,59,0.15) 60%, transparent 75%)",
            animation: "revealBurst .55s var(--ease) forwards",
          }} />
        </div>
      )}

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 20,
        opacity: revealed ? 1 : 0, animation: revealed ? "fadeIn .4s var(--ease)" : "none",
      }}>
        {/* ---------- SOL KART ---------- */}
        <div className="topline" style={card({
          display: "flex", flexDirection: "column", alignItems: "center",
          animation: danger ? "glowPulseRed 2.4s ease-in-out infinite" : "glowPulseGreen 2.8s ease-in-out infinite",
        })}>
          <div style={{ marginTop: 6, marginBottom: 22 }}>
            <ScoreGauge target={result.confidence} danger={danger} />
          </div>

          {/* Sonuç şeridi */}
          <div style={{
            position: "relative", width: "100%", overflow: "hidden",
            borderRadius: 12, padding: "16px 18px",
            background: danger ? "var(--grad-danger)" : "var(--grad-safe)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontWeight: 700, fontSize: 14, color: "#fff", textAlign: "center",
            boxShadow: danger ? "0 8px 28px rgba(239,68,68,0.3)" : "0 8px 28px rgba(16,185,129,0.25)",
          }}>
            <span style={{
              position: "absolute", top: 0, bottom: 0, width: 60,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
              animation: "scanline 3s var(--ease) infinite",
            }} />
            {danger ? <IconWarn size={18} /> : <IconCheck size={18} />}
            {danger ? "SONUÇ: DEEPFAKE TESPİT EDİLDİ" : "SONUÇ: GÜVENLİ — ORİJİNAL MEDYA"}
          </div>

          <p style={{
            marginTop: 16, fontFamily: "var(--mono)", fontSize: 11.5,
            color: "var(--muted)", textAlign: "center", lineHeight: 1.6,
          }}>
            {result.fileName} dosyası {danger ? "manipüle edilmiş yüz izleri içermektedir." : "yapay zeka müdahalesine dair iz barındırmamaktadır."}
          </p>
        </div>

        {/* ---------- SAĞ KART ---------- */}
        <div className="topline" style={card({})}>
          {/* Bilgi satırları */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {[
              { Icon: IconChip, k: "Model", v: "Xception v2" },
              { Icon: IconFilm, k: "Dosya Adı", v: result.fileName.length > 15 ? result.fileName.slice(0, 12) + "..." : result.fileName },
            ].map(({ Icon, k, v }) => (
              <div key={k} style={{
                flex: 1, display: "flex", alignItems: "center", gap: 11,
                background: "var(--bg-deeper)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "11px 14px",
              }}>
                <span style={{ color: "var(--primary)", display: "flex" }}><Icon size={20} /></span>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, fontFamily: "var(--mono)" }}>{v}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Dual video player */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end", position: "relative", marginBottom: 18 }}>
            <VideoBox
              label="ORİJİNAL VİDEO"
              labelColor="#60a5fa"
              url={result.original_video_url}
              videoRef={videoRef1}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeeked={handleSeeked}
            />
            <div style={{
              position: "absolute", left: "50%", top: "55%", transform: "translate(-50%,-50%)",
              width: 30, height: 30, borderRadius: "50%", background: "var(--surface)",
              border: "1px solid var(--border)", display: "grid", placeItems: "center",
              color: "var(--muted)", zIndex: 2,
            }}>
              <IconLink size={15} />
            </div>
            <VideoBox
              label="ISI HARİTASI VİDEOSU"
              labelColor="#a78bfa"
              url={result.heatmap_video_url}
              videoRef={videoRef2}
            />
          </div>

          {/* En şüpheli kare */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{
                fontSize: 9.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "0.5px",
                color: "#fff", background: "var(--danger)", padding: "3px 8px", borderRadius: 6,
              }}>GRAD-CAM ISI HARİTASI Karesi</span>
            </div>
            <HeatmapImageBox label="" url={result.heatmap_url} />
          </div>

          {/* Rapor butonu */}
          <button onClick={generateReport} className="report-btn" disabled={showConsole} style={{
            width: "100%", height: 46, borderRadius: "var(--r-ctrl)",
            background: showConsole ? "rgba(37,99,235,0.25)" : "var(--grad-primary)",
            color: "#fff", fontWeight: 700, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            transition: "transform .2s var(--ease), box-shadow .2s var(--ease)",
            boxShadow: showConsole ? "none" : "0 8px 22px rgba(37,99,235,0.3)",
            cursor: showConsole ? "default" : "pointer",
          }}>
            <IconDoc size={18} /> {showConsole ? "Rapor Oluşturuldu ✓" : "Detaylı Adli Rapor Oluştur"}
          </button>

          {/* Yeni tarama */}
          <button onClick={onReset} className="reset-btn" style={{
            width: "100%", height: 44, marginTop: 12, borderRadius: "var(--r-ctrl)",
            background: "transparent", border: "1px solid var(--border)", color: "var(--muted)",
            fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 9, transition: "all .2s var(--ease)",
          }}>
            <IconRefresh size={17} /> Yeni Tarama Başlat
          </button>
        </div>
      </div>

      {/* ── TAM GENİŞLİK ADLİ RAPOR TERMİNALİ ── */}
      {showConsole && (
        <div style={{ marginTop: 20, animation: "fadeInUp .4s var(--ease)" }}>
          {/* Terminal başlık çubuğu */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--r-card) var(--r-card) 0 0",
            borderBottom: "none",
            padding: "12px 18px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            {/* macOS tarzı trafik ışıkları */}
            <div style={{ display: "flex", gap: 7 }}>
              {["#ef4444","#f59e0b","#22c55e"].map((c, i) => (
                <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c, opacity: 0.8 }} />
              ))}
            </div>
            <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
              deepfake-detector — adli_rapor.txt
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.6px",
                padding: "3px 9px", borderRadius: 6,
                color: danger ? "#fca5a5" : "#6ee7b7",
                background: danger ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                border: `1px solid ${danger ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
              }}>
                {danger ? "● DEEPFAKE" : "● ORİJİNAL"}
              </span>
            </div>
          </div>

          {/* Terminal gövdesi */}
          <div style={{
            background: "rgba(2,6,23,0.95)", border: "1px solid var(--border)",
            borderRadius: "0 0 var(--r-card) var(--r-card)",
            padding: "18px 22px",
            maxHeight: 340, overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(37,99,235,0.35) transparent",
          }}>
            <TypingConsole
              lines={reportText.length > 0 ? reportText : ["$ bağlanıyor...", "▌"]}
              start={!loadingReport}
              speed={11}
            />
          </div>
        </div>
      )}

      <style>{`
        .report-btn:hover:not(:disabled){ transform: translateY(-1px); box-shadow: 0 12px 30px rgba(37,99,235,0.45); }
        .reset-btn:hover{ border-color: var(--primary); color: var(--text); background: rgba(37,99,235,0.06); }
      `}</style>
    </div>
  );
}
window.ResultView = ResultView;
