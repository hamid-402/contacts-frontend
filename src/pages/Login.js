import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";
import { API } from "../components/shared";

const IconMail  = () => <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconLock  = () => <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconUser  = () => <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // ایمیل یا username
  const [password,   setPassword]   = useState("");
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const navigate = useNavigate();
  const { lang, toggleTheme, toggleLang, theme } = useSettings();
  const tr = t[lang];
  const fa = lang === "fa";

  /* تشخیص ایمیل یا username */
  const isEmail = (val) => val.includes("@");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      let emailToUse = identifier.trim();

      /* اگه username بود، ایمیلش رو از سرور بگیر */
      if (!isEmail(emailToUse)) {
        const res  = await fetch(`${API}/login-username`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: emailToUse }),
        });
        const data = await res.json();
        if (data.error) {
          setError(fa ? "نام کاربری یافت نشد" : "Username not found");
          setLoading(false);
          return;
        }
        emailToUse = data.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        setError(fa ? "ایمیل یا رمز عبور اشتباه است" : "Invalid email or password");
      } else {
        navigate("/");
      }
    } catch {
      setError(fa ? "خطا در ورود" : "Login error");
    }

    setLoading(false);
  };

  return (
    <div className="auth-bg">

      {/* دکمه‌های تم و زبان */}
      <div className="auth-settings-btns">
        <button className="btn-setting" onClick={toggleTheme}>
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
        <button className="btn-setting" onClick={toggleLang} style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:11 }}>
          {lang === "fa" ? "EN" : "FA"}
        </button>
      </div>

      <div className="auth-card">

        {/* لوگو */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:"#002818", border:"0.5px solid #00d98b22",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg viewBox="0 0 24 24" style={{ width:18, height:18, stroke:"var(--accent)", fill:"none", strokeWidth:2 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:16, color:"var(--text1)" }}>
            {fa ? <>دفتر تلفن<span style={{ color:"var(--accent)" }}>.</span></> : <>Phonebook<span style={{ color:"var(--accent)" }}>.</span></>}
          </div>
        </div>

        <h1 className="auth-title">
          {tr.welcomeBack}<span className="accent">.</span>
        </h1>
        <p className="auth-sub">{tr.signInSub}</p>

        {error && <div className="auth-error">{error}</div>}

        {/* فیلد ایمیل یا username */}
        <div className="input-wrap">
          <span className="input-icon">
            {isEmail(identifier) ? <IconMail /> : <IconUser />}
          </span>
          <input
            className="app-input"
            type="text"
            placeholder={fa ? "ایمیل یا نام کاربری" : "Email or username"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && document.getElementById("pass-input").focus()}
            autoComplete="username"
            dir="ltr"
          />
        </div>

        {/* رمز عبور */}
        <div className="input-wrap">
          <span className="input-icon"><IconLock /></span>
          <input
            id="pass-input"
            className="app-input"
            type="password"
            placeholder={tr.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoComplete="current-password"
            dir="ltr"
          />
        </div>

        <button className="btn-add" onClick={handleLogin} disabled={loading}>
          {loading ? (fa ? "در حال ورود..." : "Signing in...") : tr.signIn}
        </button>

        <p className="auth-link">
          {tr.noAccount} <Link to="/register">{tr.register}</Link>
        </p>
      </div>
    </div>
  );
}
