import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
        <h1 className="auth-title">Welcome back<span className="accent">.</span></h1>
        <p className="auth-sub">Sign in to your account</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="input-wrap">
          <span className="input-icon">✉️</span>
          <input className="app-input" type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        </div>

        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input className="app-input" type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        </div>

        <button className="btn-add" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}