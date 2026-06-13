import { useState, useEffect } from "react";
import { API, getUserProfile } from "../components/shared";

export default function Admin() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [userId, setUserId]     = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [email, setEmail]       = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState(4);
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) {
        setUserId(u.id);
        setUserRole(u.role);
        if (u.role === 1) fetchUsers(u.id);
        else setLoading(false);
      }
    });
  }, []);

  const fetchUsers = async (uid) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users?user_id=${uid}`);
      const data = await res.json();
      setUsers(data);
    } catch { setUsers([]); }
    setLoading(false);
  };

  const addUser = async () => {
    setError(""); setSuccess("");
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setError("همه فیلدها را پر کنید");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: userId,
          email: email.trim(),
          full_name: fullName.trim(),
          password: password.trim(),
          role: Number(role),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEmail(""); setPassword(""); setFullName(""); setRole(4);
      setSuccess("کاربر با موفقیت اضافه شد");
      fetchUsers(userId);
    } catch (err) {
      setError(err.message || "خطا در اضافه کردن کاربر");
    }
    setAdding(false);
  };

  const updateRole = async (id, newRole, name) => {
    await fetch(`${API}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: userId, role: Number(newRole), full_name: name }),
    });
    fetchUsers(userId);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("آیا از حذف این کاربر اطمینان دارید؟")) return;
    await fetch(`${API}/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: userId }),
    });
    fetchUsers(userId);
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (userRole !== 1) return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-icon">🚫</div>
        <p>شما دسترسی به این صفحه ندارید</p>
      </div>
    </div>
  );

  const roleLabels = { 1: "مدیر ارشد", 2: "مدیر", 3: "کارمند", 4: "کاربر عادی" };
  const roleColors = { 1: "#e06060", 2: "#4ab8e0", 3: "#00d98b", 4: "#7c6fcd" };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">پنل مدیریت</h2>
        <span className="page-count">{users.length} کاربر</span>
      </div>

      <div className="panel">
        <div className="panel-label">افزودن کاربر جدید</div>
        {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
        {success && <div className="auth-success" style={{ marginBottom: 12 }}>{success}</div>}
        <div className="input-wrap"><span className="input-icon">👤</span>
          <input className="app-input" placeholder="نام و نام خانوادگی" value={fullName}
            onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="input-wrap"><span className="input-icon">✉️</span>
          <input className="app-input" type="email" placeholder="ایمیل" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-wrap"><span className="input-icon">🔒</span>
          <input className="app-input" type="password" placeholder="رمز عبور" value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="input-wrap"><span className="input-icon">⭐</span>
          <select className="app-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value={1}>مدیر ارشد</option>
            <option value={2}>مدیر</option>
            <option value={3}>کارمند</option>
            <option value={4}>کاربر عادی</option>
          </select>
        </div>
        <button className="btn-add" onClick={addUser} disabled={adding}>
          {adding ? "در حال افزودن..." : "+ افزودن کاربر"}
        </button>
      </div>

      <div className="section-title">کاربران سیستم</div>
      <div className="contact-list">
        {users.map((u) => (
          <div key={u.id} className="contact-item">
            <div className="contact-info" style={{ flex: 1 }}>
              <div className="contact-name">
                {u.full_name || "بدون نام"}
                <span className="cat-badge" style={{ color: roleColors[u.role], borderColor: `${roleColors[u.role]}33`, marginRight: 8 }}>
                  {roleLabels[u.role]}
                </span>
              </div>
              <div className="contact-phone">{u.email}</div>
            </div>
            <div className="actions">
              <select className="role-select" value={u.role}
                onChange={(e) => updateRole(u.id, e.target.value, u.full_name)}>
                <option value={1}>مدیر ارشد</option>
                <option value={2}>مدیر</option>
                <option value={3}>کارمند</option>
                <option value={4}>کاربر عادی</option>
              </select>
              {u.id !== userId && (
                <button className="btn-icon btn-del" onClick={() => deleteUser(u.id)}>✕</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}