import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }
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
        <h1 className="auth-title">Create account<span className="accent">.</span></h1>
        <p className="auth-sub">Start managing your contacts</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="input-wrap">
          <span className="input-icon">✉️</span>
          <input className="app-input" type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input className="app-input" type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input className="app-input" type="password" placeholder="Confirm password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()} />
        </div>

        <button className="btn-add" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}