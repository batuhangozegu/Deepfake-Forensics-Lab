/* ============================================================
   HISTORY — Analiz Arşivi (table + search + pagination)
   ============================================================ */
const { useState: useStateH, useEffect: useEffectH, useMemo: useMemoH } = React;

function Badge({ v }) {
  const danger = v === "deepfake";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.4px",
      padding: "5px 11px", borderRadius: 999,
      color: danger ? "#fca5a5" : "#6ee7b7",
      background: danger ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
      border: `1px solid ${danger ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: danger ? "var(--danger)" : "var(--safe)" }} />
      {danger ? "DEEPFAKE" : "ORİJİNAL"}
    </span>
  );
}

function RowAction({ Icon, title, hue, onClick, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} className={`rowact rowact-${hue}`} title={title} style={{
      width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center",
      color: disabled ? "var(--muted-2)" : "var(--muted)", transition: "all .18s var(--ease)",
      opacity: disabled ? 0.35 : 1, cursor: disabled ? "not-allowed" : "pointer",
    }}>
      <Icon size={15} />
    </button>
  );
}

function History({ onOpenReport, user }) {
  const [records, setRecords] = useStateH([]);
  const [q, setQ] = useStateH("");
  const [focus, setFocus] = useStateH(false);
  const [page, setPage] = useStateH(1);
  const [loading, setLoading] = useStateH(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // If user is not admin, only fetch their records
      let url = "http://localhost:8080/api/scan-history/list";
      if (user.role !== "admin") {
        url += `?userId=${user.id}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Newest records first
        setRecords(data.reverse());
      }
    } catch (err) {
      console.error("Geçmiş kayıtları çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffectH(() => {
    fetchRecords();
  }, [user]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bu tarama kaydını kalıcı olarak silmek istediğinize emin misiniz?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/scan-history/delete/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setRecords(records.filter(r => r.id !== id));
      } else {
        alert("Silme işlemi sunucu tarafından reddedildi.");
      }
    } catch (err) {
      console.error(err);
      alert("Silme işlemi sırasında bağlantı hatası oluştu.");
    }
  };

  const rows = useMemoH(() => {
    return records.filter(r =>
      r.fileName.toLowerCase().includes(q.toLowerCase()) ||
      String(r.id).includes(q)
    );
  }, [q, records]);

  // Pagination calculation
  const itemsPerPage = 5;
  const totalPages = Math.ceil(rows.length / itemsPerPage) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const pageData = useMemoH(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return rows.slice(start, start + itemsPerPage);
  }, [rows, currentPage]);

  const cols = "76px 1fr 96px 60px 116px";

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div style={{ padding: "30px 30px 50px", maxWidth: 1180, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 26, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 7 }}>
            Analiz Arşivi
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            {user.role === "admin" ? "Sistem genelinde yapılmış tüm taramaların geçmişi." : "Kişisel tarama geçmişiniz."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 9, width: 280, height: 44,
            background: "var(--surface)", borderRadius: "var(--r-ctrl)", padding: "0 14px",
            border: `1px solid ${focus ? "var(--primary)" : "var(--border)"}`,
            transition: "border-color .2s var(--ease)",
          }}>
            <span style={{ color: focus ? "var(--primary)" : "var(--muted-2)", display: "flex" }}><IconSearch size={17} /></span>
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Dosya adı veya ID ara..."
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 13 }} />
          </div>
          <button onClick={fetchRecords} className="filter-btn" style={{
            width: 44, height: 44, borderRadius: "var(--r-ctrl)", display: "grid", placeItems: "center",
            background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)",
            transition: "all .2s var(--ease)",
          }} title="Yenile">
            <IconRefresh size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="topline" style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-card)", overflow: "hidden", boxShadow: "var(--halo)",
      }}>
        {/* head */}
        <div style={{
          display: "grid", gridTemplateColumns: cols, gap: 10, alignItems: "center",
          padding: "14px 20px", background: "var(--bg-deeper)",
          fontSize: 10.5, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase",
          color: "var(--muted-2)", borderBottom: "1px solid var(--border)",
        }}>
          <span>Tarama ID</span><span>Dosya</span>
          <span>Sonuç</span><span>Skor</span><span style={{ textAlign: "right" }}>İşlemler</span>
        </div>

        {/* rows */}
        {loading ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--muted)" }}>
            <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin .7s linear infinite", marginRight: 8, verticalAlign: "middle" }} />
            Yükleniyor...
          </div>
        ) : pageData.map((r) => {
          const danger = r.result === "DEEPFAKE";
          return (
            <div key={r.id} className="trow" style={{
              display: "grid", gridTemplateColumns: cols, gap: 10, alignItems: "center",
              padding: "15px 20px", borderBottom: "1px solid var(--border)",
              transition: "background .18s var(--ease)",
            }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--muted)" }}>#{r.id}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                <span style={{ color: "var(--muted-2)", display: "flex", flexShrink: 0 }}><IconFilm size={17} /></span>
                <span style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.fileName}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-2)", fontFamily: "var(--mono)", marginTop: 2 }}>{formatDate(r.createdAt)}</div>
                </span>
              </span>
              <span><Badge v={danger ? "deepfake" : "authentic"} /></span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13.5, fontWeight: 600, color: danger ? "#f87171" : "#34d399" }}>
                %{r.confidenceScore.toFixed(1)}
              </span>
              <span style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                <RowAction Icon={IconDoc}  title="Raporu Gör" hue="blue" onClick={() => onOpenReport(r)} />
                <RowAction Icon={IconGrid} title="Isı Haritası (Görsel)" hue="purple" disabled={!r.heatmapUrl} onClick={() => window.open(r.heatmapUrl, "_blank")} />
                <RowAction Icon={IconPlay} title="Analiz Videosunu Oynat" hue="blue" disabled={!r.heatmapVideoUrl} onClick={() => window.open(r.heatmapVideoUrl, "_blank")} />
                <RowAction Icon={IconTrash} title="Kayıt Logunu Sil" hue="red" onClick={() => handleDelete(r.id)} />
              </span>
            </div>
          );
        })}

        {!loading && pageData.length === 0 && (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>
            Kayıt bulunamadı.
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {!loading && rows.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            Toplam <strong style={{ color: "var(--text)" }}>{rows.length}</strong> tarama kaydı bulundu.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <PageBtn disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Önceki</PageBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} style={{
                minWidth: 36, height: 36, borderRadius: 9, fontSize: 13, fontWeight: 600,
                fontFamily: "var(--mono)",
                background: currentPage === n ? "var(--grad-primary)" : "transparent",
                color: currentPage === n ? "#fff" : "var(--muted)",
                border: currentPage === n ? "none" : "1px solid var(--border)",
                transition: "all .18s var(--ease)",
              }}>{n}</button>
            ))}
            <PageBtn disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Sonraki</PageBtn>
          </div>
        </div>
      )}

      <style>{`
        .trow:hover{ background: rgba(37,99,235,0.05); }
        .trow:last-child{ border-bottom: none; }
        .rowact:hover{ background: rgba(255,255,255,0.06); color: var(--text); }
        .rowact-blue:hover{ background: rgba(37,99,235,0.15); color: #93b4fb; }
        .rowact-purple:hover{ background: rgba(124,58,237,0.15); color: #c4b5fd; }
        .rowact-red:hover{ background: rgba(239,68,68,0.15); color: #fca5a5; }
        .filter-btn:hover{ border-color: var(--primary); color: var(--text); }
        .pagebtn:hover:not(:disabled){ border-color: var(--primary); color: var(--text); }
      `}</style>
    </div>
  );
}

function PageBtn({ children, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} className="pagebtn" style={{
      height: 36, padding: "0 14px", borderRadius: 9, fontSize: 13, fontWeight: 600,
      background: "transparent", border: "1px solid var(--border)",
      color: disabled ? "var(--muted-2)" : "var(--muted)",
      opacity: disabled ? 0.5 : 1, transition: "all .18s var(--ease)",
    }}>{children}</button>
  );
}
window.History = History;
