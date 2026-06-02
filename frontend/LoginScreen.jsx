/* ============================================================
   LOGIN SCREEN
   ============================================================ */
const { useState: useStateL } = React;

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useStateL("admin@detector.io");
  const [pass, setPass]   = useStateL("admin123");
  const [show, setShow]   = useStateL(false);
  const [focus, setFocus] = useStateL(null);
  const [submitting, setSubmitting] = useStateL(false);
  const [error, setError] = useStateL(null);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.message || "Giriş başarısız.");
      }
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError("Sunucuya bağlanılamadı. Sunucunun çalıştığından emin olun.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputWrap = (active) => ({
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(8,13,26,0.7)",
    border: `1px solid ${error ? "var(--danger)" : active ? "var(--primary)" : "var(--border)"}`,
    borderRadius: "var(--r-ctrl)", padding: "0 14px", height: 50,
    transition: "border-color .2s var(--ease), box-shadow .2s var(--ease)",
    boxShadow: active ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
  });
  const inputEl = {
    flex: 1, background: "none", border: "none", outline: "none",
    color: "var(--text)", fontSize: 14.5, height: "100%",
  };

  return (
    <div style={{
      height: "100%", display: "grid", placeItems: "center",
      background: "var(--bg)", position: "relative", overflow: "hidden",
    }}>
      {/* radial glow arkaplan */}
      <div style={{
        position: "absolute", width: 900, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(124,58,237,0.03) 35%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* ince grid dokusu */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none",
        backgroundImage: "radial-gradient(rgba(148,163,184,0.05) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }} />

      <form onSubmit={submit} className="topline" style={{
        position: "relative", width: "min(420px, 90vw)",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-card)", padding: "38px 34px 30px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5), var(--halo)",
        backdropFilter: "blur(12px)",
        animation: "fadeInUp .4s var(--ease) both",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, background: "var(--grad-primary)",
            display: "grid", placeItems: "center", color: "#fff",
            boxShadow: "0 8px 22px rgba(37,99,235,0.4)",
          }}>
            <IconShield size={24} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, letterSpacing: "-0.5px" }}>
            <span style={{ fontSize: 21, fontWeight: 800 }}>DEEPFAKE</span>
            <span style={{ fontSize: 21, fontWeight: 300, color: "var(--muted)" }}>DETECTOR</span>
          </div>
        </div>

        <p style={{
          fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted)",
          lineHeight: 1.6, marginBottom: 20,
        }}>
          Sisteme erişim için kimlik doğrulama gereklidir.
        </p>

        <div style={{ height: 1, background: "var(--border)", margin: "0 0 22px" }} />

        {/* Error message */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--r-ctrl)",
            padding: "10px 14px",
            color: "var(--danger)",
            fontSize: 13,
            marginBottom: 20,
            animation: "fadeInUp 0.3s var(--ease)",
          }}>
            {error}
          </div>
        )}

        {/* Email */}
        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={inputWrap(focus === "email")}>
            <span style={{ color: focus === "email" ? "var(--primary)" : "var(--muted-2)", display: "flex" }}>
              <IconMail size={18} />
            </span>
            <input style={inputEl} type="email" value={email} placeholder="E-posta adresi" required
              onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}
              onChange={(e) => setEmail(e.target.value)} />
          </div>
        </label>

        {/* Password */}
        <label style={{ display: "block", marginBottom: 22 }}>
          <div style={inputWrap(focus === "pass")}>
            <span style={{ color: focus === "pass" ? "var(--primary)" : "var(--muted-2)", display: "flex" }}>
              <IconLock size={18} />
            </span>
            <input style={inputEl} type={show ? "text" : "password"} value={pass} placeholder="Şifre" required
              onFocus={() => setFocus("pass")} onBlur={() => setFocus(null)}
              onChange={(e) => setPass(e.target.value)} />
            <button type="button" onClick={() => setShow(s => !s)}
              style={{ color: "var(--muted-2)", display: "flex", padding: 4 }}>
              {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </label>

        {/* Submit */}
        <button type="submit" className="login-btn" disabled={submitting} style={{
          width: "100%", height: 50, borderRadius: "var(--r-ctrl)",
          background: "var(--grad-primary)", color: "#fff",
          fontSize: 15, fontWeight: 700, letterSpacing: "0.2px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "transform .2s var(--ease), box-shadow .2s var(--ease)",
          boxShadow: "0 10px 26px rgba(37,99,235,0.32)",
          opacity: submitting ? 0.85 : 1,
        }}>
          {submitting ? (
            <><span style={{
              width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)",
              borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite",
            }} /> Doğrulanıyor...</>
          ) : "Giriş Yap"}
        </button>

        <p style={{
          marginTop: 18, textAlign: "center", fontSize: 11,
          color: "var(--muted-2)", fontFamily: "var(--mono)",
        }}>
          Yetkisiz erişim girişimleri kayıt altına alınır.
        </p>
      </form>

      <style>{`
        .login-btn:hover:not(:disabled){ transform: scale(1.012); box-shadow: 0 12px 34px rgba(37,99,235,0.5), 0 0 0 1px rgba(124,58,237,0.4) inset; }
        .login-btn:active:not(:disabled){ transform: scale(0.995); }
      `}</style>
    </div>
  );
}
window.LoginScreen = LoginScreen;
