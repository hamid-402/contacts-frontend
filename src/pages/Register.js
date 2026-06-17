import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";

const IconUser  = () => <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconAt    = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>;
const IconPhone = () => <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail  = () => <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconLock  = () => <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconSend  = () => <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

export default function Register() {
  const [fullName,  setFullName]  = useState("");
  const [username,  setUsername]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [unCheck,   setUnCheck]   = useState(null); // null | "ok" | "taken"

  const navigate = useNavigate();
  const { lang, toggleTheme, toggleLang, theme } = useSettings();
  const tr = t[lang];
  const fa = lang === "fa";

  /* چک یکتا بودن username با تاخیر */
  const checkUsername = async (val) => {
    if (!val || val.length < 3) { setUnCheck(null); return; }
    try {
      const res  = await fetch(`${API}/check-username/${val}`);
      const data = await res.json();
      setUnCheck(data.available ? "ok" : "taken");
    } catch { setUnCheck(null); }
  };

  const handleRegister = async () => {
    setError("");

    if (!fullName.trim())  { setError(fa ? "نام و نام خانوادگی را وارد کنید" : "Enter your full name"); return; }
    if (!username.trim())  { setError(fa ? "نام کاربری را وارد کنید" : "Enter a username"); return; }
    if (username.length < 3) { setError(fa ? "نام کاربری حداقل ۳ کاراکتر باشد" : "Username must be at least 3 characters"); return; }
    if (unCheck === "taken") { setError(fa ? "این نام کاربری قبلاً استفاده شده است" : "Username already taken"); return; }
    if (!phone.trim())     { setError(fa ? "شماره تلفن را وارد کنید" : "Enter your phone number"); return; }
    if (!email.trim())     { setError(fa ? "ایمیل را وارد کنید" : "Enter your email"); return; }
    if (password.length < 6) { setError(tr.passwordShort); return; }
    if (password !== confirm)  { setError(tr.passwordMismatch); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API}/register-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          username:  username.trim().toLowerCase(),
          phone:     phone.trim(),
          email:     email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err.message || (fa ? "خطا در ارسال درخواست" : "Request failed"));
    }
    setLoading(false);
  };

  /* ── صفحه موفقیت ── */
  if (done) return (
    <div className="auth-bg">
      <div className="auth-card" style={{ textAlign:"center" }}>
        <div style={{
          width:56, height:56, borderRadius:16,
          background:"var(--accent-bg)", border:"0.5px solid #00d98b22",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 20px",
        }}>
          <svg viewBox="0 0 24 24" style={{ width:26, height:26, stroke:"var(--accent)", fill:"none", strokeWidth:2 }}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="auth-title">
          {fa ? "درخواست ارسال شد" : "Request sent"}<span className="accent">.</span>
        </h2>
        <p style={{ fontSize:13, color:"var(--text3)", marginTop:12, lineHeight:1.8 }}>
          {fa
            ? <>درخواست ثبت‌نام شما برای مدیر ارسال شد.<br/>پس از تایید، می‌توانید وارد شوید.</>
            : <>Your registration request has been sent to the admin.<br/>You can log in after approval.</>
          }
        </p>
        <button className="btn-add" style={{ marginTop:24 }} onClick={() => navigate("/login")}>
          {fa ? "بازگشت به صفحه ورود" : "Back to login"}
        </button>
      </div>
    </div>
  );

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
        <button className="btn-setting" onClick={toggleLang}
          style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:11 }}>
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
          {tr.createAccount}<span className="accent">.</span>
        </h1>
        <p className="auth-sub">{fa ? "درخواست عضویت در سیستم" : "Request to join the system"}</p>

        {error && <div className="auth-error">{error}</div>}

        {/* نام و نام خانوادگی */}
        <div className="input-wrap">
          <span className="input-icon"><IconUser /></span>
          <input className="app-input"
            placeholder={fa ? "نام و نام خانوادگی" : "Full name"}
            value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        {/* نام کاربری */}
        <div className="input-wrap">
          <span className="input-icon"><IconAt /></span>
          <input className="app-input"
            placeholder={fa ? "نام کاربری (حداقل ۳ کاراکتر)" : "Username (min 3 chars)"}
            value={username}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
              setUsername(val);
              setUnCheck(null);
            }}
            onBlur={() => checkUsername(username)}
            dir="ltr"
          />
          {/* نشانگر وضعیت username */}
          {unCheck === "ok" && (
            <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}>
              <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:"var(--accent)", fill:"none", strokeWidth:2.5 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          )}
          {unCheck === "taken" && (
            <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}>
              <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:"var(--red)", fill:"none", strokeWidth:2.5 }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
          )}
        </div>
        {unCheck === "taken" && (
          <div style={{ fontSize:11, color:"var(--red)", marginTop:-6, marginBottom:8, paddingRight:4 }}>
            {fa ? "این نام کاربری قبلاً استفاده شده" : "Username already taken"}
          </div>
        )}
        {unCheck === "ok" && (
          <div style={{ fontSize:11, color:"var(--accent)", marginTop:-6, marginBottom:8, paddingRight:4 }}>
            {fa ? "نام کاربری در دسترس است" : "Username available"}
          </div>
        )}

        {/* شماره تلفن */}
        <div className="input-wrap">
          <span className="input-icon"><IconPhone /></span>
          <input className="app-input"
            placeholder={fa ? "شماره تلفن" : "Phone number"}
            value={phone} onChange={(e) => setPhone(e.target.value)}
            dir="ltr" />
        </div>

        {/* ایمیل */}
        <div className="input-wrap">
          <span className="input-icon"><IconMail /></span>
          <input className="app-input" type="email"
            placeholder={tr.email}
            value={email} onChange={(e) => setEmail(e.target.value)}
            dir="ltr" />
        </div>

        {/* رمز عبور */}
        <div className="input-wrap">
          <span className="input-icon"><IconLock /></span>
          <input className="app-input" type="password"
            placeholder={tr.password}
            value={password} onChange={(e) => setPassword(e.target.value)}
            dir="ltr" />
        </div>

        {/* تکرار رمز */}
        <div className="input-wrap">
          <span className="input-icon"><IconLock /></span>
          <input className="app-input" type="password"
            placeholder={tr.confirmPassword}
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            dir="ltr" />
        </div>

        <button className="btn-add" onClick={handleRegister} disabled={loading || unCheck === "taken"}>
          {loading ? (fa ? "در حال ارسال..." : "Sending...") : <><IconSend />{fa ? "ارسال درخواست عضویت" : "Send request"}</>}
        </button>

        <p className="auth-link">
          {tr.hasAccount} <Link to="/login">{tr.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
