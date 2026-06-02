/* ============================================================
   ADMIN PANEL — Kullanıcı Yönetimi
   ============================================================ */
const { useState: useStateAd, useEffect: useEffectAd, useMemo: useMemoAd } = React;

const AVATAR_HUES = [
  "linear-gradient(135deg,#2563EB,#7C3AED)",
  "linear-gradient(135deg,#7C3AED,#db2777)",
  "linear-gradient(135deg,#0ea5e9,#2563EB)",
  "linear-gradient(135deg,#10b981,#0ea5e9)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#6366f1)",
];
const initials = (n) => n ? n.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
const hueFor = (id) => AVATAR_HUES[(id) % AVATAR_HUES.length];

function RoleBadge({ role }) {
  const admin = role === "admin";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.4px", padding: "5px 11px", borderRadius: 999,
      color: admin ? "#c4b5fd" : "#93b4fb",
      background: admin ? "rgba(124,58,237,0.2)" : "rgba(37,99,235,0.2)",
      border: `1px solid ${admin ? "rgba(124,58,237,0.4)" : "rgba(37,99,235,0.4)"}`,
    }}>
      {admin ? <IconShield size={12} /> : <IconUser size={12} />}
      {admin ? "ADMIN" : "KULLANICI"}
    </span>
  );
}

function StatusTag({ status }) {
  const active = status === "active";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: active ? "#34d399" : "var(--muted-2)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "var(--safe)" : "#475569",
        animation: active ? "pulseDot 2s infinite" : "none" }} />
      {active ? "AKTİF" : "PASİF"}
    </span>
  );
}

function StatCard({ Icon, value, label }) {
  return (
    <div className="topline" style={{
      flex: 1, display: "flex", alignItems: "center", gap: 15,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--r-card)", padding: "18px 20px",
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--grad-primary)", display: "grid", placeItems: "center", color: "#fff", flexShrink: 0, boxShadow: "0 8px 20px rgba(37,99,235,0.3)" }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--mono)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5 }}>{label}</div>
      </div>
    </div>
  );
}

/* lightweight select */
function MiniSelect({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        appearance: "none", WebkitAppearance: "none",
        height: 44, padding: "0 36px 0 14px", borderRadius: "var(--r-ctrl)",
        background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)",
        fontSize: 13, fontWeight: 500, cursor: "pointer", outline: "none",
      }}>
        {options.map(o => <option key={o.v} value={o.v} style={{ background: "#0F1623" }}>{o.l}</option>)}
      </select>
      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none", display: "flex" }}>
        <IconChevronDown size={15} />
      </span>
    </div>
  );
}

function AdminPanel() {
  const [users, setUsers]   = useStateAd([]);
  const [q, setQ]           = useStateAd("");
  const [qFocus, setQFocus] = useStateAd(false);
  const [roleF, setRoleF]   = useStateAd("all");
  const [statF, setStatF]   = useStateAd("all");
  const [modal, setModal]   = useStateAd(null);  // {type:'add'} | {type:'edit', user} | {type:'delete', user}
  const [toast, setToast]   = useStateAd(null);
  const [justAdded, setJustAdded] = useStateAd(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Kullanıcı listesi çekilemedi:", err);
    }
  };

  useEffectAd(() => {
    fetchUsers();
  }, []);

  const filtered = useMemoAd(() => users.filter(u => {
    const mq = u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase());
    const mr = roleF === "all" || u.role === roleF;
    const ms = statF === "all" || u.status === statF;
    return mq && mr && ms;
  }), [users, q, roleF, statF]);

  const stats = useMemoAd(() => ({
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    admins: users.filter(u => u.role === "admin").length,
  }), [users]);

  const saveUser = async (data, editing) => {
    try {
      let response;
      if (editing) {
        response = await fetch(`http://localhost:8080/api/users/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } else {
        response = await fetch("http://localhost:8080/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      }

      const resData = await response.json();

      if (response.ok) {
        setToast({ type: "success", msg: editing ? "Kullanıcı bilgileri güncellendi" : "Kullanıcı başarıyla oluşturuldu" });
        if (!editing) {
          setJustAdded(resData.id);
          setTimeout(() => setJustAdded(null), 700);
        }
        fetchUsers();
        setModal(null);
      } else {
        alert(resData.message || "İşlem başarısız.");
      }
    } catch (err) {
      console.error("Kullanıcı kaydetme hatası:", err);
      alert("Bağlantı hatası: Değişiklikler sunucuya iletilemedi.");
    }
  };

  const deleteUser = async () => {
    const name = modal.user.name;
    try {
      const response = await fetch(`http://localhost:8080/api/users/${modal.user.id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setToast({ type: "danger", msg: `Kullanıcı silindi · ${name}` });
        fetchUsers();
        setModal(null);
      } else {
        alert("Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error("Kullanıcı silme hatası:", err);
      alert("Bağlantı hatası: Silme isteği sunucuya iletilemedi.");
    }
  };

  const cols = "72px minmax(0,1fr) 96px 114px 80px 72px";
  const empty = users.length === 0;

  const newBtn = (
    <button onClick={() => setModal({ type: "add" })} className="add-user-btn" style={{
      display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 18px",
      borderRadius: "var(--r-ctrl)", background: "var(--grad-primary)", color: "#fff",
      fontWeight: 700, fontSize: 13.5, boxShadow: "0 8px 22px rgba(37,99,235,0.3)",
      transition: "all .2s var(--ease)",
    }}>
      <IconPlus size={18} /> Yeni Kullanıcı Ekle
    </button>
  );

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div style={{ padding: "30px 30px 50px", maxWidth: 1180, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 7 }}>Kullanıcı Yönetimi</h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Sisteme erişim yetkisi tanımlı kullanıcı hesapları.</p>
        </div>
        {newBtn}
      </div>

      {/* İstatistik kartları */}
      <div style={{ display: "flex", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <StatCard Icon={IconUsers}     value={stats.total}  label="Kayıtlı hesap" />
        <StatCard Icon={IconUserCheck} value={stats.active} label="Aktif kullanıcı sayısı" />
        <StatCard Icon={IconShield}    value={stats.admins} label="Yönetici (Admin) sayısı" />
      </div>

      {/* Araç çubuğu */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 220, height: 44,
          background: "var(--surface)", borderRadius: "var(--r-ctrl)", padding: "0 14px",
          border: `1px solid ${qFocus ? "var(--primary)" : "var(--border)"}`, transition: "border-color .2s var(--ease)",
        }}>
          <span style={{ color: qFocus ? "var(--primary)" : "var(--muted-2)", display: "flex" }}><IconSearch size={17} /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İsim veya e-posta ara..."
            onFocus={() => setQFocus(true)} onBlur={() => setQFocus(false)}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 13 }} />
        </div>
        <MiniSelect value={roleF} onChange={setRoleF} options={[
          { v: "all", l: "Tüm Roller" }, { v: "admin", l: "Admin" }, { v: "user", l: "Kullanıcı" },
        ]} />
        <MiniSelect value={statF} onChange={setStatF} options={[
          { v: "all", l: "Tümü" }, { v: "active", l: "Aktif" }, { v: "passive", l: "Pasif" },
        ]} />
      </div>

      {/* Tablo / boş durum */}
      {empty ? (
        <div className="topline" style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-card)",
          padding: "70px 30px", textAlign: "center", boxShadow: "var(--halo)",
        }}>
          <div style={{ color: "#334155", marginBottom: 18, display: "flex", justifyContent: "center" }}><IconUsers size={80} /></div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Henüz kullanıcı eklenmedi</div>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 24 }}>Sisteme erişim yetkisi tanımlamak için kullanıcı ekleyin.</p>
          <div style={{ display: "flex", justifyContent: "center" }}>{newBtn}</div>
        </div>
      ) : (
        <div className="topline" style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-card)",
          overflow: "hidden", boxShadow: "var(--halo)",
        }}>
          {/* head */}
          <div style={{
            display: "grid", gridTemplateColumns: cols, gap: 10, alignItems: "center",
            padding: "14px 20px", background: "var(--bg-deeper)",
            fontSize: 10.5, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase",
            color: "var(--muted-2)", borderBottom: "1px solid var(--border)",
          }}>
            <span>ID</span><span>Ad Soyad</span><span>Rol</span>
            <span>Kayıt Tarihi</span><span>Durum</span><span style={{ textAlign: "right" }}>İşlem</span>
          </div>

          {filtered.map(u => (
            <div key={u.id} className="trow" style={{
              display: "grid", gridTemplateColumns: cols, gap: 10, alignItems: "center",
              padding: "13px 20px", borderBottom: "1px solid var(--border)",
              transition: "background .18s var(--ease)",
              animation: justAdded === u.id ? "rowSlideIn .45s var(--ease)" : "none",
            }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--muted)" }}>#{u.id}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: hueFor(u.id), display: "grid", placeItems: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {initials(u.name)}
                </span>
                <span style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-2)", fontFamily: "var(--mono)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                </span>
              </span>
              <span><RoleBadge role={u.role} /></span>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{formatDate(u.createdAt)}</span>
              <span><StatusTag status={u.status} /></span>
              <span style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                <button onClick={() => setModal({ type: "edit", user: u })} className="rowact rowact-blue" title="Düzenle"
                  style={{ width: 28, height: 28, borderRadius: 7, display: "grid", placeItems: "center", color: "var(--muted)", transition: "all .18s var(--ease)" }}>
                  <IconEdit size={15} />
                </button>
                <button onClick={() => setModal({ type: "delete", user: u })} className="rowact rowact-red" title="Sil"
                  style={{ width: 28, height: 28, borderRadius: 7, display: "grid", placeItems: "center", color: "var(--muted)", transition: "all .18s var(--ease)" }}>
                  <IconTrash size={15} />
                </button>
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: "50px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>
              Eşleşen kullanıcı bulunamadı.
            </div>
          )}
        </div>
      )}

      {/* Alt bilgi */}
      {!empty && (
        <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
          <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> kullanıcı gösteriliyor
          {filtered.length !== users.length && ` (toplam ${users.length})`}.
        </div>
      )}

      {/* Modallar */}
      {modal?.type === "add"    && <UserFormModal mode="add"  onClose={() => setModal(null)} onSave={saveUser} />}
      {modal?.type === "edit"   && <UserFormModal mode="edit" user={modal.user} onClose={() => setModal(null)} onSave={saveUser} />}
      {modal?.type === "delete" && <DeleteUserModal user={modal.user} onClose={() => setModal(null)} onConfirm={deleteUser} />}
      <Toast toast={toast} onDone={() => setToast(null)} />

      <style>{`
        .add-user-btn:hover{ transform: translateY(-1px); box-shadow: 0 12px 30px rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}
window.AdminPanel = AdminPanel;
