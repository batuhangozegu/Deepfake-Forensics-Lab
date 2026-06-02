/* ============================================================
   USER MODALS — Add/Edit form, Delete confirm, Toast
   ============================================================ */
const { useState: useStateU, useEffect: useEffectU } = React;

/* ---------------- Toast ---------------- */
function Toast({ toast, onDone }) {
  useEffectU(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  const danger = toast.type === "danger";
  return (
    <div style={{
      position: "fixed", right: 26, bottom: 26, zIndex: 200,
      display: "flex", alignItems: "center", gap: 11,
      background: "var(--surface)", border: `1px solid ${danger ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`,
      borderRadius: 12, padding: "13px 18px",
      boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
      animation: "toastIn .35s var(--ease)",
    }}>
      <span style={{ color: danger ? "var(--danger)" : "var(--safe)", display: "flex" }}>
        {danger ? <IconTrash size={19} /> : <IconCheckCircle size={20} />}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{toast.msg}</span>
    </div>
  );
}

/* ---------------- Reusable modal shell ---------------- */
function ModalShell({ children, onClose, width = 480 }) {
  useEffectU(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "grid", placeItems: "center", padding: 24,
      animation: "fadeIn .2s var(--ease)",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="topline" style={{
        width: `min(${width}px, 100%)`, maxHeight: "90vh", overflow: "auto",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 20, boxShadow: "0 40px 100px rgba(0,0,0,0.6), var(--halo)",
        animation: "fadeInUp .3s var(--ease)",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ---------------- Form field ---------------- */
function Field({ Icon, type = "text", value, onChange, placeholder, error, toggle, onToggle, show }) {
  const [focus, setFocus] = useStateU(false);
  return (
    <div style={{ marginBottom: error ? 6 : 16 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, height: 48,
        background: "rgba(8,13,26,0.7)", borderRadius: "var(--r-ctrl)", padding: "0 14px",
        border: `1px solid ${error ? "var(--danger)" : focus ? "var(--primary)" : "var(--border)"}`,
        transition: "border-color .18s var(--ease)",
      }}>
        <span style={{ color: error ? "var(--danger)" : focus ? "var(--primary)" : "var(--muted-2)", display: "flex" }}>
          <Icon size={18} />
        </span>
        <input
          type={toggle ? (show ? "text" : "password") : type}
          value={value} placeholder={placeholder}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, height: "100%" }}
        />
        {toggle && (
          <button type="button" onClick={onToggle} style={{ color: "var(--muted-2)", display: "flex", padding: 4 }}>
            {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, marginBottom: 10 }}>
          <span style={{ color: "var(--danger)", display: "flex" }}><IconWarn size={13} /></span>
          <span style={{ fontSize: 11.5, color: "#f87171" }}>{error}</span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Add / Edit user modal ---------------- */
function UserFormModal({ mode, user, onClose, onSave }) {
  const editing = mode === "edit";
  const [name, setName]   = useStateU(editing ? user.name : "");
  const [email, setEmail] = useStateU(editing ? user.email : "");
  const [pass, setPass]   = useStateU("");
  const [pass2, setPass2] = useStateU("");
  const [show, setShow]   = useStateU(false);
  const [show2, setShow2] = useStateU(false);
  const [role, setRole]   = useStateU(editing ? user.role : "user");
  const [activeAcc, setActiveAcc] = useStateU(editing ? user.status === "active" : true);
  const [errs, setErrs]   = useStateU({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Ad soyad zorunludur.";
    if (!email.trim()) e.email = "E-posta zorunludur.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "Geçerli bir e-posta girin.";
    if (!editing || pass) {
      if (!editing && !pass) e.pass = "Şifre zorunludur.";
      else if (pass.length < 6) e.pass = "Şifre en az 6 karakter olmalı.";
      else if (pass !== pass2) e.pass2 = "Şifreler eşleşmiyor.";
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      id: editing ? user.id : undefined,
      name: name.trim(), email: email.trim(), role,
      status: activeAcc ? "active" : "passive",
      password: pass || undefined
    }, editing);
  };

  const RoleOpt = ({ value, Icon, label }) => {
    const on = role === value;
    return (
      <button type="button" onClick={() => setRole(value)} style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        height: 46, borderRadius: "var(--r-ctrl)", fontSize: 13.5, fontWeight: 600,
        color: on ? "#fff" : "var(--muted)",
        background: on ? "var(--grad-primary)" : "transparent",
        border: on ? "1px solid transparent" : "1px solid var(--border)",
        transition: "all .18s var(--ease)",
        boxShadow: on ? "0 6px 18px rgba(37,99,235,0.3)" : "none",
      }}>
        <Icon size={17} /> {label}
      </button>
    );
  };

  return (
    <ModalShell onClose={onClose} width={480}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--grad-primary)", display: "grid", placeItems: "center", color: "#fff", flexShrink: 0 }}>
          {editing ? <IconEdit size={20} /> : <IconUser size={21} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px" }}>
            {editing ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", fontFamily: "var(--mono)" }}>
            {editing ? `#${user.id}` : "yeni hesap oluştur"}
          </div>
        </div>
        <button onClick={onClose} className="modal-x2" style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", color: "var(--muted)", transition: "all .18s var(--ease)" }}>
          <IconX size={19} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 24 }}>
        <Field Icon={IconUser} value={name} onChange={setName} placeholder="Ad Soyad" error={errs.name} />
        <Field Icon={IconMail} type="email" value={email} onChange={setEmail} placeholder="E-posta adresi" error={errs.email} />
        <Field Icon={IconLock} toggle show={show} onToggle={() => setShow(s => !s)} value={pass} onChange={setPass}
          placeholder={editing ? "Değiştirmek için doldurun" : "Şifre"} error={errs.pass} />
        <Field Icon={IconLock} toggle show={show2} onToggle={() => setShow2(s => !s)} value={pass2} onChange={setPass2}
          placeholder="Şifre tekrar" error={errs.pass2} />

        {/* Rol seçimi */}
        <div style={{ marginTop: 4, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Rol</div>
          <div style={{ display: "flex", gap: 10 }}>
            <RoleOpt value="user" Icon={IconUser} label="Kullanıcı" />
            <RoleOpt value="admin" Icon={IconShield} label="Admin" />
          </div>
        </div>

        {/* Durum toggle */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--bg-deeper)", border: "1px solid var(--border)",
          borderRadius: "var(--r-ctrl)", padding: "13px 16px",
        }}>
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>Hesap Aktif</span>
          <button type="button" onClick={() => setActiveAcc(a => !a)} style={{
            width: 46, height: 26, borderRadius: 999, padding: 3, position: "relative",
            background: activeAcc ? "var(--safe)" : "#334155", transition: "background .2s var(--ease)",
          }}>
            <span style={{
              position: "absolute", top: 3, left: activeAcc ? 23 : 3,
              width: 20, height: 20, borderRadius: "50%", background: "#fff",
              transition: "left .2s var(--ease)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", gap: 12, padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
        <button onClick={onClose} className="btn-outline" style={{
          flex: 1, height: 46, borderRadius: "var(--r-ctrl)", background: "transparent",
          border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 600, fontSize: 14,
          transition: "all .2s var(--ease)",
        }}>İptal</button>
        <button onClick={submit} className="btn-grad" style={{
          flex: 1.4, height: 46, borderRadius: "var(--r-ctrl)", background: "var(--grad-primary)",
          color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "0 8px 22px rgba(37,99,235,0.3)",
          transition: "all .2s var(--ease)",
        }}>{editing ? "Değişiklikleri Kaydet" : "Kullanıcı Oluştur"}</button>
      </div>

      <style>{`
        .modal-x2:hover{ background: rgba(239,68,68,0.12); color: var(--danger); }
        .btn-outline:hover{ border-color: var(--primary); color: var(--text); background: rgba(37,99,235,0.06); }
        .btn-grad:hover{ transform: translateY(-1px); box-shadow: 0 12px 30px rgba(37,99,235,0.45); }
      `}</style>
    </ModalShell>
  );
}

/* ---------------- Delete confirm modal ---------------- */
function DeleteUserModal({ user, onClose, onConfirm }) {
  return (
    <ModalShell onClose={onClose} width={420}>
      <div style={{ padding: "30px 28px 24px", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, margin: "0 auto 18px", borderRadius: "50%",
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
          display: "grid", placeItems: "center", color: "var(--danger)",
        }}>
          <IconTrash size={28} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 9 }}>
          Kullanıcıyı Sil
        </div>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 24 }}>
          <strong style={{ color: "var(--text)" }}>{user.name}</strong> adlı kullanıcının hesabı kalıcı
          olarak silinecektir. Bu işlem geri alınamaz.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} className="btn-outline" style={{
            flex: 1, height: 46, borderRadius: "var(--r-ctrl)", background: "transparent",
            border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 600, fontSize: 14,
            transition: "all .2s var(--ease)",
          }}>Vazgeç</button>
          <button onClick={onConfirm} className="btn-danger" style={{
            flex: 1, height: 46, borderRadius: "var(--r-ctrl)", background: "var(--grad-danger)",
            color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "0 8px 22px rgba(239,68,68,0.3)",
            transition: "all .2s var(--ease)",
          }}>Evet, Sil</button>
        </div>
      </div>
      <style>{`
        .btn-danger:hover{ transform: translateY(-1px); box-shadow: 0 12px 30px rgba(239,68,68,0.5); }
      `}</style>
    </ModalShell>
  );
}

Object.assign(window, { Toast, UserFormModal, DeleteUserModal });
