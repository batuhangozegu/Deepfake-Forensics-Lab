/* ============================================================
   SHARED — Sidebar, StatusPill, TypingConsole, ScorePlaceholder
   ============================================================ */
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

const getInitials = (n) => {
  if (!n) return "?";
  return n.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
};

/* ---------------- Sidebar ---------------- */
function Sidebar({ active, onNav, onLogout, isAdmin = true, user }) {
  const items = [
    { id: "live",    label: "Canlı Analiz",      Icon: IconScan },
    { id: "history", label: "Geçmiş Taramalar",  Icon: IconClock },
    ...(isAdmin ? [{ id: "admin", label: "Kullanıcı Yönetimi", Icon: IconUsers }] : []),
  ];
  return (
    <aside style={{
      width: 260, flexShrink: 0, height: "100%",
      background: "var(--bg-deeper)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "22px 16px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 8px 22px" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: "var(--grad-primary)",
          display: "grid", placeItems: "center", color: "#fff", flexShrink: 0,
          boxShadow: "0 6px 16px rgba(37,99,235,0.35)",
        }}>
          <IconShield size={20} />
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.15 }}>
          <span className="gradient-text">DEEPFAKE</span><br />
          <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 12 }}>DETECTOR</span>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "0 8px 16px" }} />

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {items.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => onNav(id)} className="nav-link"
              style={{
                position: "relative", display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: "var(--r-ctrl)", textAlign: "left",
                color: on ? "var(--text)" : "var(--muted)",
                background: on ? "rgba(37,99,235,0.1)" : "transparent",
                fontWeight: on ? 600 : 500, fontSize: 13.5,
                transition: "background .2s var(--ease), color .2s var(--ease)",
              }}>
              {on && <span style={{
                position: "absolute", left: 0, top: 8, bottom: 8, width: 3,
                borderRadius: 3, background: "var(--grad-primary)",
              }} />}
              <Icon size={19} /> {label}
            </button>
          );
        })}
      </nav>

      {/* Kullanıcı kartı */}
      <div className="topline" style={{
        display: "flex", alignItems: "center", gap: 11,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "11px 12px",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, background: "var(--grad-primary)",
          display: "grid", placeItems: "center", color: "#fff", fontWeight: 700,
          fontSize: 15, flexShrink: 0,
        }}>{getInitials(user?.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.name || "Kullanıcı"}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "var(--mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email || "user@detector.io"}
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn" title="Çıkış"
          style={{ color: "var(--muted)", padding: 6, borderRadius: 8, display: "flex",
                   transition: "background .2s, color .2s" }}>
          <IconLogout size={18} />
        </button>
      </div>

      <style>{`
        .nav-link:hover{ background: rgba(255,255,255,0.05) !important; color: var(--text) !important; }
        .logout-btn:hover{ background: rgba(239,68,68,0.12); color: var(--danger); }
      `}</style>
    </aside>
  );
}

/* ---------------- Status Pill ---------------- */
function StatusPill({ analyzing }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 9,
      fontSize: 12.5, fontWeight: 600, fontFamily: "var(--mono)",
      color: analyzing ? "var(--warn)" : "var(--safe)",
      background: analyzing ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
      border: `1px solid ${analyzing ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)"}`,
      borderRadius: 999, padding: "7px 14px",
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: analyzing ? "var(--warn)" : "var(--safe)",
        animation: `${analyzing ? "pulseDotWarn" : "pulseDot"} 2s infinite`,
      }} />
      {analyzing ? "Yapay Zeka Analiz Ediyor..." : "Sistem Aktif"}
    </div>
  );
}

/* ---------------- Typing Console ---------------- */
function TypingConsole({ lines, start = true, speed = 14, style }) {
  const full = lines.join("\n");
  const [out, setOut] = useStateS("");
  const [loading, setLoading] = useStateS(true);
  const idx = useRefS(0);

  useEffectS(() => {
    if (!start) return;
    setOut(""); setLoading(true); idx.current = 0;
    let timer;
    const boot = setTimeout(() => {
      setLoading(false);
      timer = setInterval(() => {
        idx.current += 1;
        setOut(full.slice(0, idx.current));
        if (idx.current >= full.length) clearInterval(timer);
      }, speed);
    }, 600);
    return () => { clearTimeout(boot); clearInterval(timer); };
  }, [full, start, speed]);

  return (
    <div style={{
      background: "#050A12", border: "1px solid var(--border)", borderRadius: 12,
      padding: "16px 18px", fontFamily: "var(--mono)", fontSize: 12.5,
      lineHeight: 1.75, color: "#34d399", minHeight: 120,
      whiteSpace: "pre-wrap", wordBreak: "break-word",
      boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)", ...style,
    }}>
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", gap: 10, color: "#34d399" }}>
          <span style={{
            width: 13, height: 13, border: "2px solid rgba(52,211,153,0.3)",
            borderTopColor: "#34d399", borderRadius: "50%", animation: "spin .7s linear infinite",
          }} />
          rapor oluşturuluyor...
        </span>
      ) : (
        <>{out}<span style={{ animation: "caretBlink 1s step-end infinite" }}>▋</span></>
      )}
    </div>
  );
}

Object.assign(window, { Sidebar, StatusPill, TypingConsole });
