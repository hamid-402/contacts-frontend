import { useState, useEffect } from "react";
import { API, getUserProfile } from "../components/shared";

function ResetPassword({ userId, adminId }) {
  const [newPass, setNewPass] = useState("");
  const [show, setShow]       = useState(false);
  const [msg, setMsg]         = useState("");

  const reset = async () => {
    if (!newPass || newPass.length < 6) { setMsg("حداقل ۶ کاراکتر"); return; }
    const res = await fetch(`${API}/users/${userId}/reset-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: adminId, new_password: newPass }),
    });
    const data = await res.json();
    if (data.error) { setMsg(data.error); return; }
    setMsg("✅ رمز ریست شد");
    setNewPass("");
    setTimeout(() => { setShow(false); setMsg(""); }, 2000);
  };

  return (
    <div>
      {!show ? (
        <button className="btn-cancel" style={{ width: "100%", fontSize: 12 }} onClick={() => setShow(true)}>
          🔑 ریست رمز عبور
        </button>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input className="app-input" type="password" placeholder="رمز جدید" value={newPass}
            onChange={(e) => setNewPass(e.target.value)} style={{ flex: 1 }} />
          <button className="btn-save" style={{ padding: "10px 14px" }} onClick={reset}>ریست</button>
          <button className="btn-cancel" style={{ padding: "10px 14px" }} onClick={() => { setShow(false); setMsg(""); }}>انصراف</button>
        </div>
      )}
      {msg && <div style={{ fontSize: 12, color: "#00d98b", marginTop: 6 }}>{msg}</div>}
    </div>
  );
}

export default function Admin() {
  const [users, setUsers]         = useState([]);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [userId, setUserId]       = useState(null);
  const [userRole, setUserRole]   = useState(null);
  const [email, setEmail]         = useState("");
  const [fullName, setFullName]   = useState("");
  const [password, setPassword]   = useState("");
  const [role, setRole]           = useState(4);
  const [adding, setAdding]       = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [activeTab, setActiveTab] = useState("requests");
  const [reqVisibility, setReqVisibility] = useState({});
  const [reqRole, setReqRole]     = useState({});

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) {
        setUserId(u.id);
        setUserRole(u.role);
        if (u.role === 1) {
          fetchUsers(u.id);
          fetchRequests(u.id);
        } else setLoading(false);
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

  const fetchRequests = async (uid) => {
    try {
      const res = await fetch(`${API}/contact-requests?user_id=${uid}`);
      const data = await res.json();
      setRequests(data);
    } catch { setRequests([]); }
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

  const handleRequest = async (id, status) => {
    const visibility = reqVisibility[id] || 4;
    const user_role = reqRole[id] || 4;
    try {
      const res = await fetch(`${API}/contact-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: userId,
          status,
          visibility: Number(visibility),
          user_role: Number(user_role),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      fetchRequests(userId);
      fetchUsers(userId);
    } catch (err) {
      alert(err.message);
    }
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
  const pendingRequests = requests.filter(r => r.status === "pending");

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">پنل مدیریت</h2>
        <span className="page-count">{users.length} کاربر</span>
      </div>

      {/* تب‌ها */}
      <div className="filter-pills" style={{ marginBottom: 20 }}>
        <button className={`pill ${activeTab === "requests" ? "pill-active" : ""}`} onClick={() => setActiveTab("requests")}>
          📬 درخواست‌ها {pendingRequests.length > 0 && `(${pendingRequests.length})`}
        </button>
        <button className={`pill ${activeTab === "users" ? "pill-active" : ""}`} onClick={() => setActiveTab("users")}>
          👥 کاربران
        </button>
        <button className={`pill ${activeTab === "add" ? "pill-active" : ""}`} onClick={() => setActiveTab("add")}>
          ➕ افزودن کاربر
        </button>
      </div>

      {/* تب درخواست‌ها */}
      {activeTab === "requests" && (
        <div>
          {requests.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p>درخواستی وجود ندارد</p></div>
          ) : (
            <div className="contact-list">
              {requests.map((r) => (
                <div key={r.id} className="panel" style={{ marginBottom: 12 }}>
                  {/* اطلاعات درخواست */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <div className="contact-name" style={{ fontSize: 15 }}>{r.full_name}</div>
                      <div className="contact-phone">{r.email}</div>
                      <div className="contact-phone">📞 {r.phone}</div>
                    </div>
                    <span className="cat-badge" style={{
                      color: r.status === "pending" ? "#d4a017" : r.status === "approved" ? "#00d98b" : "#e06060",
                      borderColor: r.status === "pending" ? "#d4a01733" : r.status === "approved" ? "#00d98b33" : "#e0606033",
                    }}>
                      {r.status === "pending" ? "در انتظار" : r.status === "approved" ? "تایید شده" : "رد شده"}
                    </span>
                  </div>

                  {r.status === "pending" && (
                    <>
                      {/* سطح دسترسی کاربر */}
                      <div style={{ marginBottom: 8 }}>
                        <div className="panel-label" style={{ marginBottom: 6 }}>سطح دسترسی این کاربر:</div>
                        <select className="app-input" value={reqRole[r.id] || 4}
                          onChange={(e) => setReqRole(prev => ({ ...prev, [r.id]: e.target.value }))}>
                          <option value={1}>مدیر ارشد</option>
                          <option value={2}>مدیر</option>
                          <option value={3}>کارمند</option>
                          <option value={4}>کاربر عادی</option>
                        </select>
                      </div>

                      {/* سطح محرمانگی شماره */}
                      <div style={{ marginBottom: 12 }}>
                        <div className="panel-label" style={{ marginBottom: 6 }}>سطح محرمانگی شماره تلفن:</div>
                        <select className="app-input" value={reqVisibility[r.id] || 4}
                          onChange={(e) => setReqVisibility(prev => ({ ...prev, [r.id]: e.target.value }))}>
                          <option value={1}>محرمانه (فقط مدیران)</option>
                          <option value={2}>نیمه محرمانه</option>
                          <option value={3}>عمومی شرکت</option>
                          <option value={4}>همه</option>
                        </select>
                      </div>

                      {/* دکمه‌های تایید/رد */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-action btn-edit-full" style={{ flex: 1 }}
                          onClick={() => handleRequest(r.id, "approved")}>
                          ✓ تایید و فعال‌سازی
                        </button>
                        <button className="btn-action btn-del-full" style={{ flex: 1 }}
                          onClick={() => handleRequest(r.id, "rejected")}>
                          ✕ رد درخواست
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* تب کاربران */}
      {activeTab === "users" && (
        <div className="contact-list">
          {users.map((u) => (
            <div key={u.id} className="panel" style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: u.id !== userId ? 12 : 0 }}>
                <div className="contact-info">
                  <div className="contact-name">
                    {u.full_name || "بدون نام"}
                    <span className="cat-badge" style={{ color: roleColors[u.role], borderColor: `${roleColors[u.role]}33`, marginRight: 8 }}>
                      {roleLabels[u.role]}
                    </span>
                  </div>
                  <div className="contact-phone">{u.email}</div>
                </div>
                <select className="role-select" value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value, u.full_name)}>
                  <option value={1}>مدیر ارشد</option>
                  <option value={2}>مدیر</option>
                  <option value={3}>کارمند</option>
                  <option value={4}>کاربر عادی</option>
                </select>
              </div>

              {u.id !== userId && (
                <ResetPassword userId={u.id} adminId={userId} />
              )}
            </div>
          ))}
        </div>
      )}
      {/* تب افزودن کاربر */}
      {activeTab === "add" && (
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
      )}
    </div>
  );
}