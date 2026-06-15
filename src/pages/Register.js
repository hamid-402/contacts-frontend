import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";

export default function Register() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone]       = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const navigate = useNavigate();
  const { lang } = useSettings();
  const tr = t[lang];

  const handleRegister = async () => {
    setError("");
    if (!fullName.trim()) { setError("نام و نام خانوادگی را وارد کنید"); return; }
    if (!phone.trim()) { setError("شماره تلفن را وارد کنید"); return; }
    if (!email.trim()) { setError("ایمیل را وارد کنید"); return; }
    if (password.length < 6) { setError(tr.passwordShort); return; }
    if (password !== confirm) { setError(tr.passwordMismatch); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/register-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: password,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err.message || "خطا در ارسال درخواست");
    }
    setLoading(false);
  };

  if (done) return (
    <div className="auth-bg">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 className="auth-title">درخواست ارسال شد<span className="accent">.</span></h2>
        <p style={{ fontSize: 13, color: "#3a6a50", marginTop: 12, lineHeight: 1.7 }}>
          درخواست ثبت‌نام شما برای Admin ارسال شد.<br />
          پس از تایید، می‌توانید وارد شوید.
        </p>
        <button className="btn-add" style={{ marginTop: 24 }} onClick={() => navigate("/login")}>
          بازگشت به صفحه ورود
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h1 className="auth-title">{tr.createAccount}<span className="accent">.</span></h1>
        <p className="auth-sub">درخواست عضویت در سیستم</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="input-wrap">
          <span className="input-icon">👤</span>
          <input className="app-input" placeholder="نام و نام خانوادگی" value={fullName}
            onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="input-wrap">
          <span className="input-icon">📞</span>
          <input className="app-input" placeholder="شماره تلفن" value={phone}
            onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="input-wrap">
          <span className="input-icon">✉️</span>
          <input className="app-input" type="email" placeholder={tr.email} value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input className="app-input" type="password" placeholder={tr.password} value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input className="app-input" type="password" placeholder={tr.confirmPassword} value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()} />
        </div>

        <button className="btn-add" onClick={handleRegister} disabled={loading}>
          {loading ? "در حال ارسال..." : "📤 ارسال درخواست عضویت"}
        </button>

        <p className="auth-link">
          {tr.hasAccount} <Link to="/login">{tr.signIn}</Link>
        </p>
      </div>
    </div>
  );
}