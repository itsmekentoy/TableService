"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Demo credentials — replace with real auth
const DEMO_USERS = [
  { username: "admin",   password: "admin123",   role: "admin",   name: "Admin",        redirect: "/dashboard" },
  { username: "cashier", password: "cashier123", role: "cashier", name: "Cashier",      redirect: "/dashboard" },
  { username: "waiter",  password: "waiter123",  role: "waiter",  name: "Waiter",       redirect: "/dashboard" },
  { username: "kitchen", password: "kitchen123", role: "kitchen", name: "Kitchen Staff", redirect: "/dashboard" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [animIn, setAnimIn]     = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setAnimIn(true), 50);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 900));
    const user = DEMO_USERS.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password
    );
    if (user) {
      // Store session (replace with real auth in production)
      if (typeof window !== "undefined") {
        localStorage.setItem("zestbite_user", JSON.stringify({ username: user.username, role: user.role, name: user.name }));
      }
      router.push(user.redirect);
    } else {
      setLoading(false);
      setError("Invalid username or password. Please try again.");
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0E0500; }

        @keyframes float-slow  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(4deg)} }
        @keyframes float-med   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(-3deg)} }
        @keyframes float-fast  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glow-pulse  { 0%,100%{opacity:0.55} 50%{opacity:0.85} }
        @keyframes card-in     { from{opacity:0;transform:translateY(32px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes label-up    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake       { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        @keyframes spin-loader { to{transform:rotate(360deg)} }
        @keyframes dots-drift  { 0%{background-position:0 0} 100%{background-position:60px 60px} }

        .card-anim  { animation: card-in .55s cubic-bezier(.22,1,.36,1) forwards; }
        .error-shake{ animation: shake .4s ease; }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(249,115,22,0.25);
          border-radius: 12px;
          padding: 13px 44px 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.3); }
        .login-input:focus {
          border-color: #F97316;
          background: rgba(249,115,22,0.08);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #F97316, #EA580C);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 6px 24px rgba(249,115,22,0.4);
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 10px 32px rgba(249,115,22,0.5); }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.65; cursor: default; }

        .role-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          cursor: pointer;
          transition: all .15s;
          border: 1px solid transparent;
        }
        .role-chip:hover { transform: scale(1.05); }

        .show-btn {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          transition: color .15s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .show-btn:hover { color: #F97316; }
      `}</style>

      {/* Full-page background */}
      <div style={{ minHeight: "100vh", background: "#0E0500", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative", overflow: "hidden" }}>

        {/* Animated background blobs */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)", animation: "glow-pulse 4s ease infinite" }} />
          <div style={{ position: "absolute", bottom: "-15%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,88,12,0.14) 0%, transparent 70%)", animation: "glow-pulse 5s ease infinite 1s" }} />
          <div style={{ position: "absolute", top: "40%", right: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,45,18,0.2) 0%, transparent 70%)", animation: "glow-pulse 3.5s ease infinite 0.5s" }} />
          {/* Dot grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(249,115,22,0.12) 1px, transparent 1px)", backgroundSize: "30px 30px", animation: "dots-drift 20s linear infinite" }} />
        </div>

        {/* Floating food emojis */}
        {[
          { e:"🍔", top:"8%",  left:"6%",  size:40, anim:"float-slow 6s ease infinite" },
          { e:"🍕", top:"15%", right:"8%", size:36, anim:"float-med 5s ease infinite 1s" },
          { e:"🍣", top:"70%", left:"4%",  size:32, anim:"float-fast 4s ease infinite 0.5s" },
          { e:"🌮", top:"80%", right:"6%", size:38, anim:"float-slow 7s ease infinite 2s" },
          { e:"🥤", top:"45%", left:"2%",  size:28, anim:"float-med 5.5s ease infinite 1.5s" },
          { e:"🍰", top:"30%", right:"3%", size:30, anim:"float-fast 4.5s ease infinite 0.8s" },
        ].map((f, i) => (
          <div key={i} style={{ position: "absolute", top: f.top, left: (f as any).left, right: (f as any).right, fontSize: f.size, animation: f.anim, opacity: 0.25, userSelect: "none", pointerEvents: "none", filter: "grayscale(20%)" }}>
            {f.e}
          </div>
        ))}

        {/* Login card */}
        <div
          className={animIn ? "card-anim" : ""}
          style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 10, opacity: animIn ? undefined : 0 }}
        >
          {/* Card */}
          <div style={{ background: "rgba(20,8,0,0.82)", backdropFilter: "blur(24px)", borderRadius: 24, border: "1px solid rgba(249,115,22,0.2)", padding: "2.5rem 2rem 2rem", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.08)" }}>

            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, background: "linear-gradient(135deg,#F97316,#EA580C)", borderRadius: 18, marginBottom: "1rem", boxShadow: "0 8px 24px rgba(249,115,22,0.45)", fontSize: "1.8rem" }}>
                🍽️
              </div>
              <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.75rem", color: "#fff", lineHeight: 1 }}>
                Zest<span style={{ color: "#F97316" }}>Bite</span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: 400 }}>
                Restaurant Management System
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)", marginBottom: "1.75rem" }} />

            {/* Sign in label */}
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: "1.25rem", animation: animIn ? "label-up .5s .2s ease both" : "none" }}>
              Sign in to your account
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Username */}
              <div style={{ animation: animIn ? "label-up .5s .25s ease both" : "none" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 7 }}>Username</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="login-input"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    autoComplete="username"
                    autoFocus
                  />
                  <div style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div style={{ animation: animIn ? "label-up .5s .3s ease both" : "none" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 7 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="login-input"
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    autoComplete="current-password"
                  />
                  <button type="button" className="show-btn" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-shake" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FCA5A5", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <div style={{ animation: animIn ? "label-up .5s .35s ease both" : "none", marginTop: 4 }}>
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "spin-loader .7s linear infinite" }} />
                      Signing in…
                    </span>
                  ) : (
                    "Sign In →"
                  )}
                </button>
              </div>
            </form>

            {/* Demo credentials */}
            <div style={{ marginTop: "1.75rem", animation: animIn ? "label-up .5s .4s ease both" : "none" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, marginBottom: 10, textAlign: "center" }}>Demo Accounts — click to fill</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {DEMO_USERS.map((u) => {
                  const colors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
                    admin:   { bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.35)", text: "#FED7AA", dot: "#F97316" },
                    cashier: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)",  text: "#BFDBFE", dot: "#3B82F6" },
                    waiter:  { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)",  text: "#A7F3D0", dot: "#10B981" },
                    kitchen: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  text: "#FDE68A", dot: "#F59E0B" },
                  };
                  const c = colors[u.role];
                  return (
                    <button
                      key={u.username}
                      type="button"
                      className="role-chip"
                      onClick={() => { setUsername(u.username); setPassword(u.password); setError(""); }}
                      style={{ background: c.bg, borderColor: c.border, color: c.text }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block", flexShrink: 0 }} />
                      {u.name}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} ZestBite · Restaurant Management
          </div>
        </div>
      </div>
    </>
  );
}