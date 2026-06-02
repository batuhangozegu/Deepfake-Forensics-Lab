/* ============================================================
   APP — router + global state
   ============================================================ */
const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [user, setUser] = useStateA(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [nav, setNav]       = useStateA("live");      // live | history | admin
  const [stage, setStage]   = useStateA("upload");    // upload | analyzing | result
  const [result, setResult] = useStateA(null);
  const [modal, setModal]   = useStateA(null);        // record object or null

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setNav("live");
    setStage("upload");
    setResult(null);
  };

  // If user role is not admin and nav is set to admin, redirect to live
  useEffectA(() => {
    if (user && user.role !== "admin" && nav === "admin") {
      setNav("live");
    }
  }, [user, nav]);

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // report opened from the live result uses the current result verdict
  const openLiveReport = () => {};

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg)" }}>
      <Sidebar
        active={nav}
        onNav={setNav}
        onLogout={handleLogout}
        isAdmin={user.role === "admin"}
        user={user}
      />

      <main style={{ flex: 1, height: "100%", overflow: "auto" }}>
        {nav === "live" ? (
          <Terminal
            stage={stage} setStage={setStage}
            result={result} setResult={setResult}
            onOpenReport={openLiveReport}
            user={user}
          />
        ) : nav === "history" ? (
          <History onOpenReport={(rec) => setModal(rec)} user={user} />
        ) : (
          <AdminPanel user={user} />
        )}
      </main>

      {modal && <ReportModal record={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
