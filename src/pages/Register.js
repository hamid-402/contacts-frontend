import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";

export default function Register() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { lang } = useSettings();
  const tr = t[lang];

  const handleRegister = async () => {
    setError("");
    if (password !== confirm) { setError(tr.passwordMismatch); return; }
    if (password.length < 6)  { setError(tr.passwordShort); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h1 className="auth-title">{tr.createAccount}<span className="accent">.</span></h1>
        <p className="auth-sub">{tr.createAccountSub}</p>

        {error && <div className="auth-error">{error}</div>}

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
          {loading ? tr.creating : tr.createAccount}
        </button>

        <p className="auth-link">
          {tr.hasAccount} <Link to="/login">{tr.signIn}</Link>
        </p>
      </div>
    </div>
  );
}