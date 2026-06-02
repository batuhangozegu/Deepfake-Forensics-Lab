/* ============================================================
   REPORT MODAL — typing console overlay
   ============================================================ */
const { useState: useStateM, useEffect: useEffectM } = React;

function ReportModal({ record, onClose }) {
  const [lines, setLines] = useStateM([]);
  const [loading, setLoading] = useStateM(false);

  useEffectM(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffectM(() => {
    if (record.reportText) {
      setLines(record.reportText.split("\n"));
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/report/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            result: record.result,
            confidence: record.confidenceScore,
            heatmap_url: record.heatmapUrl || "Bulunmuyor"
          })
        });
        const data = await response.json();
        if (data.status === 'success') {
          setLines(data.report_text.split("\n"));
          
          // Save report back to DB
          fetch(`http://localhost:8080/api/scan-history/update-report/${record.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportText: data.report_text })
          }).then(() => {
            record.reportText = data.report_text;
          }).catch(e => console.error("Rapor güncellenemedi:", e));
        } else {
          setLines(["Rapor oluşturulamadı: Sunucu hatası."]);
        }
      } catch (err) {
        console.error(err);
        setLines(["Rapor oluşturulamadı: Sunucu bağlantı hatası."]);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [record]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "grid", placeItems: "center", padding: 24,
      animation: "fadeIn .2s var(--ease)",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="topline" style={{
        width: "min(680px, 100%)", maxHeight: "85vh", overflow: "hidden",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 20, boxShadow: "0 40px 100px rgba(0,0,0,0.6), var(--halo)",
        display: "flex", flexDirection: "column",
        animation: "fadeInUp .3s var(--ease)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 13, padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, background: "var(--grad-primary)",
            display: "grid", placeItems: "center", color: "#fff", flexShrink: 0,
          }}>
            <IconDoc size={21} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px" }}>Analiz Raporu</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", fontFamily: "var(--mono)" }}>
              #{record.id} · {record.fileName}
            </div>
          </div>
          <button onClick={onClose} className="modal-x" style={{
            width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center",
            color: "var(--muted)", transition: "all .18s var(--ease)",
          }}>
            <IconX size={19} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 22, overflow: "auto" }}>
          <TypingConsole lines={lines} start={!loading} speed={9} style={{ minHeight: 320 }} />
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose} className="modal-close" style={{
            width: "100%", height: 44, borderRadius: "var(--r-ctrl)",
            background: "transparent", border: "1px solid var(--border)", color: "var(--muted)",
            fontWeight: 600, fontSize: 14, transition: "all .2s var(--ease)",
          }}>
            Kapat
          </button>
        </div>
      </div>

      <style>{`
        .modal-x:hover{ background: rgba(239,68,68,0.12); color: var(--danger); }
        .modal-close:hover{ border-color: var(--primary); color: var(--text); background: rgba(37,99,235,0.06); }
      `}</style>
    </div>
  );
}
window.ReportModal = ReportModal;
