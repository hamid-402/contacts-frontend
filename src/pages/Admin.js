import { useState, useEffect } from "react";
import { API, getUserProfile, CATEGORIES } from "../components/shared";
import { useSettings } from "../context/SettingsContext";

const IconUser    = () => <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconAt      = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>;
const IconMail    = () => <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconPhone   = () => <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconLock    = () => <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconShield  = () => <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconTrash   = () => <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconPlus    = () => <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconUsers   = () => <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconInbox   = () => <svg viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
const IconBan     = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>;
const IconEye     = () => <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

function ResetPassword({ userId, adminId, lang }) {
  const [newPass, setNewPass] = useState("");
  const [show,    setShow]    = useState(false);
  const [msg,     setMsg]     = useState("");
  const [loading, setLoading] = useState(false);
  const fa = lang === "fa";

  const reset = async () => {
    if (!newPass || newPass.length < 6) { setMsg(fa ? "حداقل ۶ کاراکتر" : "Min 6 characters"); return; }
    setLoading(true);
    const res  = await fetch(`${API}/users/${userId}/reset-password`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: adminId, new_password: newPass }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setMsg(data.error); return; }
    setMsg(fa ? "رمز با موفقیت ریست شد" : "Password reset successfully");
    setNewPass("");
    setTimeout(() => { setShow(false); setMsg(""); }, 2000);
  };

  if (!show) return (
    <button onClick={() => setShow(true)} style={{
      width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
      gap:6, padding:"7px 12px", borderRadius:"var(--radius-sm)",
      border:"0.5px solid var(--border)", background:"transparent",
      color:"var(--text3)", fontSize:12, cursor:"pointer", fontFamily:"DM Sans,sans-serif",
    }}
      onMouseOver={(e) => e.currentTarget.style.background="var(--bg4)"}
      onMouseOut={(e)  => e.currentTarget.style.background="transparent"}
    >
      <svg viewBox="0 0 24 24" style={{ width:13, height:13, stroke:"currentColor", fill:"none", strokeWidth:2 }}>
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
      </svg>
      {fa ? "ریست رمز عبور" : "Reset password"}
    </button>
  );

  return (
    <div>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <div style={{ position:"relative", flex:1 }}>
          <span className="input-icon"><IconLock /></span>
          <input className="app-input" type="password"
            placeholder={fa ? "رمز جدید (حداقل ۶ کاراکتر)" : "New password (min 6 chars)"}
            value={newPass} onChange={(e) => setNewPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && reset()} />
        </div>
        <button className="btn-save" style={{ padding:"10px 14px", flexShrink:0 }} onClick={reset} disabled={loading}>
          {loading ? "..." : (fa ? "ریست" : "Reset")}
        </button>
        <button className="btn-cancel" style={{ padding:"10px 14px", flexShrink:0 }}
          onClick={() => { setShow(false); setMsg(""); }}>
          {fa ? "انصراف" : "Cancel"}
        </button>
      </div>
      {msg && <div style={{ fontSize:11, color: msg.includes("موفق")||msg.includes("success") ? "var(--accent)" : "var(--red)", marginTop:6 }}>{msg}</div>}
    </div>
  );
}

export default function Admin() {
  const { lang } = useSettings();
  const fa = lang === "fa";

  const [users,     setUsers]     = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [userId,    setUserId]    = useState(null);
  const [userRole,  setUserRole]  = useState(null);
  const [activeTab, setActiveTab] = useState("requests");
  const [fullName,   setFullName]   = useState("");
  const [username,   setUsername]   = useState("");
  const [email,      setEmail]      = useState("");
  const [phone,      setPhone]      = useState("");
  const [password,   setPassword]   = useState("");
  const [role,       setRole]       = useState(4);
  const [visibility, setVisibility] = useState(4);
  const [managerId,  setManagerId]  = useState("");
  const [department, setDepartment] = useState("");
  const [adding,     setAdding]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [unCheck,    setUnCheck]    = useState(null);
  const [reqVisibility, setReqVisibility] = useState({});
  const [reqRole,       setReqRole]       = useState({});

  const txt = {
    title:       fa?"پنل مدیریت":"Admin Panel", users:fa?"کاربران":"Users",
    requests:    fa?"درخواست‌ها":"Requests",    addUser:fa?"افزودن کاربر":"Add user",
    pending:     fa?"در انتظار":"Pending",       approved:fa?"تایید شده":"Approved",
    rejected:    fa?"رد شده":"Rejected",         approve:fa?"تایید و فعال‌سازی":"Approve",
    reject:      fa?"رد درخواست":"Reject",       noRequests:fa?"درخواستی وجود ندارد":"No requests",
    accessLevel: fa?"سطح دسترسی:":"Access level:", visLevel:fa?"سطح محرمانگی شماره:":"Phone visibility:",
    fullName:    fa?"نام و نام خانوادگی":"Full name", usernameL:fa?"نام کاربری":"Username",
    emailLabel:  fa?"ایمیل":"Email",             passLabel:fa?"رمز عبور":"Password",
    phoneLabel:  fa?"شماره تلفن":"Phone number", roleLabel:fa?"سطح دسترسی":"Access level",
    visLabel:    fa?"سطح محرمانگی شماره":"Phone visibility",
    addBtn:      fa?"افزودن کاربر":"Add user",   adding:fa?"در حال افزودن...":"Adding...",
    fillAll:     fa?"همه فیلدهای اجباری را پر کنید":"Fill required fields",
    addedOk:     fa?"کاربر با موفقیت اضافه شد":"User added",
    deleteConfirm:fa?"آیا از حذف این کاربر اطمینان دارید؟":"Are you sure?",
    noAccess:    fa?"شما دسترسی به این صفحه ندارید":"No access",
    senior:      fa?"ادمین":"Admin", manager:fa?"مدیر":"Manager",
    employee:    fa?"کارمند":"Employee",           user:fa?"کاربر عادی":"Regular User",
    vis1:fa?"محرمانه":"Confidential", vis2:fa?"نیمه محرمانه":"Semi-confidential",
    vis3:fa?"عمومی شرکت":"Company-wide", vis4:fa?"همه":"Everyone",
    unTaken:fa?"این نام کاربری قبلاً استفاده شده":"Username taken",
    unAvail:fa?"نام کاربری در دسترس است":"Username available",
    optional:fa?"(اختیاری)":"(optional)",
    managerLabel:fa?"مدیر مستقیم":"Direct manager",
    noManager:fa?"بدون مدیر مستقیم":"No manager",
    deptLabel:fa?"بخش / تیم":"Department",
    noDept:fa?"بدون بخش":"No department",
  };

  const roleLabels = { 1:txt.senior, 2:txt.manager, 3:txt.employee, 4:txt.user };
  const roleColors = { 1:"var(--red)", 2:"var(--blue)", 3:"var(--accent)", 4:"var(--purple)" };

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) {
        setUserId(u.id); setUserRole(u.role);
        if (u.role === 1) { fetchUsers(u.id); fetchRequests(u.id); }
        else setLoading(false);
      }
    });
  }, []);

  const fetchUsers = async (uid) => {
    setLoading(true);
    try { const r = await fetch(`${API}/users?user_id=${uid}`); setUsers(await r.json()); }
    catch { setUsers([]); }
    setLoading(false);
  };

  const fetchRequests = async (uid) => {
    try { const r = await fetch(`${API}/contact-requests?user_id=${uid}`); setRequests(await r.json()); }
    catch { setRequests([]); }
  };

  const checkUsername = async (val) => {
    if (!val || val.length < 3) { setUnCheck(null); return; }
    try { const r = await fetch(`${API}/check-username/${val}`); const d = await r.json(); setUnCheck(d.available?"ok":"taken"); }
    catch { setUnCheck(null); }
  };

  const addUser = async () => {
    setError(""); setSuccess("");
    if (!fullName.trim()||!email.trim()||!password.trim()) { setError(txt.fillAll); return; }
    if (unCheck === "taken") { setError(txt.unTaken); return; }
    setAdding(true);
    try {
      const res = await fetch(`${API}/users`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ admin_id:userId, email:email.trim(), full_name:fullName.trim(),
          username:username.trim().toLowerCase()||null, password:password.trim(),
          phone:phone.trim()||null, role:Number(role), visibility:Number(visibility),
          manager_id: managerId || null, department: department || null }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFullName(""); setUsername(""); setEmail(""); setPhone("");
      setPassword(""); setRole(4); setVisibility(4); setManagerId(""); setDepartment(""); setUnCheck(null);
      setSuccess(txt.addedOk); fetchUsers(userId);
    } catch (err) { setError(err.message||"Error"); }
    setAdding(false);
  };

  const updateRole = async (id, newRole, name) => {
    await fetch(`${API}/users/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({admin_id:userId, role:Number(newRole), full_name:name}) });
    fetchUsers(userId);
  };

  const updateManager = async (id, newManagerId, name, role) => {
    await fetch(`${API}/users/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({admin_id:userId, role:Number(role), full_name:name, manager_id:newManagerId||null}) });
    fetchUsers(userId);
  };

  const updateDepartment = async (id, newDept, name, role, managerId) => {
    await fetch(`${API}/users/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({admin_id:userId, role:Number(role), full_name:name, manager_id:managerId||null, department:newDept||null}) });
    fetchUsers(userId);
  };

  const deleteUser = async (id) => {
    if (!window.confirm(txt.deleteConfirm)) return;
    await fetch(`${API}/users/${id}`, { method:"DELETE", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({admin_id:userId}) });
    fetchUsers(userId);
  };

  const handleRequest = async (id, status) => {
    try {
      const res = await fetch(`${API}/contact-requests/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ admin_id:userId, status,
          visibility:Number(reqVisibility[id]||4), user_role:Number(reqRole[id]||4) }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      fetchRequests(userId); fetchUsers(userId);
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;

  if (userRole !== 1) return (
    <div className="page"><div className="empty-state">
      <div className="empty-icon"><IconBan/></div><p>{txt.noAccess}</p>
    </div></div>
  );

  const pendingRequests = requests.filter((r) => r.status === "pending");

  function UserAvatar({ name, role }) {
    const ini = (name||"?").trim().split(" ").map((p)=>p[0]||"").join("").substring(0,2).toUpperCase();
    const color = roleColors[role];
    return (
      <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,background:`${color}18`,
        border:`0.5px solid ${color}33`,display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:12,color }}>
        {ini}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">{txt.title}</h2>
        <span className="page-count">{users.length} {txt.users}</span>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns:"repeat(3,1fr)", marginBottom:20 }}>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon ki-green"><IconUsers/></div></div>
          <div className="kpi-value">{users.length}</div>
          <div className="kpi-label">{txt.users}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon ki-amber"><IconInbox/></div>
            {pendingRequests.length > 0 && <span className="kpi-trend down">{pendingRequests.length}</span>}
          </div>
          <div className="kpi-value">{requests.length}</div>
          <div className="kpi-label">{txt.requests}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon ki-red"><IconShield/></div></div>
          <div className="kpi-value">{users.filter((u)=>u.role===1).length}</div>
          <div className="kpi-label">{txt.senior}</div>
        </div>
      </div>

      <div className="tabs-row" style={{ marginBottom:20 }}>
        <button className={`tab-btn ${activeTab==="requests"?"active":""}`} onClick={()=>setActiveTab("requests")}>
          {txt.requests}
          {pendingRequests.length > 0 && (
            <span style={{ marginRight:5,background:"var(--red)",color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:8,fontWeight:700 }}>
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button className={`tab-btn ${activeTab==="users"?"active":""}`} onClick={()=>setActiveTab("users")}>{txt.users}</button>
        <button className={`tab-btn ${activeTab==="add"?"active":""}`} onClick={()=>setActiveTab("add")}>{txt.addUser}</button>
      </div>

      {activeTab === "requests" && (
        requests.length === 0 ? (
          <div className="empty-state"><div className="empty-icon"><IconInbox/></div><p>{txt.noRequests}</p></div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {requests.map((r) => (
              <div key={r.id} className="panel">
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                  <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                    <div style={{ width:38,height:38,borderRadius:10,background:"var(--bg4)",
                      border:"0.5px solid var(--border)",display:"flex",alignItems:"center",
                      justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"var(--text2)" }}>
                      {(r.full_name||"?")[0]}
                    </div>
                    <div>
                      <div className="contact-name" style={{ fontSize:14 }}>{r.full_name}</div>
                      {r.username && <div className="contact-phone" style={{ color:"var(--accent)" }}>@{r.username}</div>}
                      <div className="contact-phone">{r.email}</div>
                      {r.phone && (
                        <div className="contact-phone" style={{ display:"flex",alignItems:"center",gap:4,marginTop:2 }}>
                          <svg viewBox="0 0 24 24" style={{ width:11,height:11,stroke:"var(--text3)",fill:"none",strokeWidth:2 }}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          {r.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="cat-badge" style={{
                    color: r.status==="pending"?"var(--amber)":r.status==="approved"?"var(--accent)":"var(--red)",
                    borderColor: r.status==="pending"?"#d4a01733":r.status==="approved"?"#00d98b33":"#e0606033",
                  }}>
                    {r.status==="pending"?txt.pending:r.status==="approved"?txt.approved:txt.rejected}
                  </span>
                </div>
                {r.status === "pending" && (
                  <>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12 }}>
                      <div>
                        <div className="panel-label" style={{ marginBottom:5 }}>{txt.accessLevel}</div>
                        <select className="app-input" style={{ paddingLeft:12 }}
                          value={reqRole[r.id]||4}
                          onChange={(e)=>setReqRole((p)=>({...p,[r.id]:e.target.value}))}>
                          <option value={1}>{txt.senior}</option><option value={2}>{txt.manager}</option>
                          <option value={3}>{txt.employee}</option><option value={4}>{txt.user}</option>
                        </select>
                      </div>
                      <div>
                        <div className="panel-label" style={{ marginBottom:5 }}>{txt.visLevel}</div>
                        <select className="app-input" style={{ paddingLeft:12 }}
                          value={reqVisibility[r.id]||4}
                          onChange={(e)=>setReqVisibility((p)=>({...p,[r.id]:e.target.value}))}>
                          <option value={1}>{txt.vis1}</option><option value={2}>{txt.vis2}</option>
                          <option value={3}>{txt.vis3}</option><option value={4}>{txt.vis4}</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button className="btn-action btn-edit-full"
                        style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}
                        onClick={()=>handleRequest(r.id,"approved")}>
                        <svg viewBox="0 0 24 24" style={{ width:13,height:13,stroke:"currentColor",fill:"none",strokeWidth:2.5 }}><polyline points="20 6 9 17 4 12"/></svg>
                        {txt.approve}
                      </button>
                      <button className="btn-action btn-del-full"
                        style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}
                        onClick={()=>handleRequest(r.id,"rejected")}>
                        <svg viewBox="0 0 24 24" style={{ width:13,height:13,stroke:"currentColor",fill:"none",strokeWidth:2.5 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        {txt.reject}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "users" && (
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {users.map((u) => (
            <div key={u.id} className="panel">
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:u.id!==userId?12:0 }}>
                <UserAvatar name={u.full_name} role={u.role}/>
                <div className="contact-info" style={{ flex:1 }}>
                  <div className="contact-name">
                    {u.full_name||"—"}
                    <span className="cat-badge" style={{ color:roleColors[u.role],borderColor:`${roleColors[u.role]}33`,marginRight:6 }}>
                      {roleLabels[u.role]}
                    </span>
                  </div>
                  <div className="contact-phone" style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {u.username && <span style={{ color:"var(--accent)" }}>@{u.username}</span>}
                    <span>{u.email}</span>
                    {u.phone && <span>{u.phone}</span>}
                  </div>
                  {/* مدیر مستقیم */}
                  {u.manager_name && (
                    <div style={{ fontSize:10, color:"var(--text3)", marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                      <svg viewBox="0 0 24 24" style={{ width:10,height:10,stroke:"var(--text3)",fill:"none",strokeWidth:2 }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      {fa?"مدیر:":"Manager:"} <span style={{ color:"var(--text2)" }}>{u.manager_name}</span>
                    </div>
                  )}
                  {/* بخش */}
                  {u.department && (
                    <div style={{ fontSize:10, color:"var(--text3)", marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
                      <svg viewBox="0 0 24 24" style={{ width:10,height:10,stroke:"var(--text3)",fill:"none",strokeWidth:2 }}>
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                      <span style={{ color:"var(--accent)" }}>{u.department}</span>
                    </div>
                  )}
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <select className="role-select" value={u.role}
                    onChange={(e)=>updateRole(u.id,e.target.value,u.full_name)}>
                    <option value={1}>{txt.senior}</option><option value={2}>{txt.manager}</option>
                    <option value={3}>{txt.employee}</option><option value={4}>{txt.user}</option>
                  </select>
                  {u.id !== userId && (
                    <button className="btn-icon btn-del" onClick={()=>deleteUser(u.id)}><IconTrash/></button>
                  )}
                </div>
              </div>
              {/* انتخاب بخش و مدیر مستقیم */}
              {u.id !== userId && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                  <div>
                    <div className="panel-label" style={{ marginBottom:4 }}>{txt.deptLabel}</div>
                    <select className="app-input" style={{ paddingLeft:12 }}
                      value={u.department || ""}
                      onChange={(e) => updateDepartment(u.id, e.target.value, u.full_name, u.role, u.manager_id)}>
                      <option value="">{txt.noDept}</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  {u.role >= 3 && (
                    <div>
                      <div className="panel-label" style={{ marginBottom:4 }}>{txt.managerLabel}</div>
                      <select className="app-input" style={{ paddingLeft:12 }}
                        value={u.manager_id || ""}
                        onChange={(e) => updateManager(u.id, e.target.value, u.full_name, u.role)}>
                        <option value="">{txt.noManager}</option>
                        {users.filter(m => m.role <= 2 && m.id !== u.id).map(m => (
                          <option key={m.id} value={m.id}>{m.full_name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
              {u.id !== userId && <ResetPassword userId={u.id} adminId={userId} lang={lang}/>}
            </div>
          ))}
        </div>
      )}

      {activeTab === "add" && (
        <div className="panel">
          <div className="panel-label">{txt.addUser}</div>
          {error   && <div className="auth-error"   style={{ marginBottom:12 }}>{error}</div>}
          {success && <div className="auth-success" style={{ marginBottom:12 }}>{success}</div>}

          <div className="input-wrap">
            <span className="input-icon"><IconUser/></span>
            <input className="app-input" placeholder={txt.fullName} value={fullName} onChange={(e)=>setFullName(e.target.value)}/>
          </div>

          <div className="input-wrap">
            <span className="input-icon"><IconAt/></span>
            <input className="app-input" dir="ltr" placeholder={`${txt.usernameL} ${txt.optional}`}
              value={username}
              onChange={(e)=>{ const v=e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""); setUsername(v); setUnCheck(null); }}
              onBlur={()=>checkUsername(username)}/>
            {unCheck==="ok" && <div style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)" }}>
              <svg viewBox="0 0 24 24" style={{ width:14,height:14,stroke:"var(--accent)",fill:"none",strokeWidth:2.5 }}><polyline points="20 6 9 17 4 12"/></svg>
            </div>}
            {unCheck==="taken" && <div style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)" }}>
              <svg viewBox="0 0 24 24" style={{ width:14,height:14,stroke:"var(--red)",fill:"none",strokeWidth:2.5 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>}
          </div>
          {unCheck==="taken" && <div style={{ fontSize:11,color:"var(--red)",marginTop:-6,marginBottom:8 }}>{txt.unTaken}</div>}
          {unCheck==="ok"    && <div style={{ fontSize:11,color:"var(--accent)",marginTop:-6,marginBottom:8 }}>{txt.unAvail}</div>}

          <div className="input-wrap">
            <span className="input-icon"><IconMail/></span>
            <input className="app-input" type="email" dir="ltr" placeholder={txt.emailLabel} value={email} onChange={(e)=>setEmail(e.target.value)}/>
          </div>

          <div className="input-wrap">
            <span className="input-icon"><IconPhone/></span>
            <input className="app-input" dir="ltr" placeholder={`${txt.phoneLabel} ${txt.optional}`} value={phone} onChange={(e)=>setPhone(e.target.value)}/>
          </div>

          <div className="input-wrap">
            <span className="input-icon"><IconLock/></span>
            <input className="app-input" type="password" dir="ltr" placeholder={txt.passLabel} value={password} onChange={(e)=>setPassword(e.target.value)}/>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            <div>
              <div className="panel-label" style={{ marginBottom:5 }}>{txt.roleLabel}</div>
              <div style={{ position:"relative" }}>
                <span className="input-icon"><IconShield/></span>
                <select className="app-input" value={role} onChange={(e)=>setRole(e.target.value)}>
                  <option value={1}>{txt.senior}</option><option value={2}>{txt.manager}</option>
                  <option value={3}>{txt.employee}</option><option value={4}>{txt.user}</option>
                </select>
              </div>
            </div>
            <div>
              <div className="panel-label" style={{ marginBottom:5 }}>{txt.visLabel}</div>
              <div style={{ position:"relative" }}>
                <span className="input-icon"><IconEye/></span>
                <select className="app-input" value={visibility} onChange={(e)=>setVisibility(e.target.value)}>
                  <option value={1}>{txt.vis1}</option><option value={2}>{txt.vis2}</option>
                  <option value={3}>{txt.vis3}</option><option value={4}>{txt.vis4}</option>
                </select>
              </div>
            </div>
          </div>

          {/* مدیر مستقیم */}
          <div style={{ marginTop:8 }}>
            <div className="panel-label" style={{ marginBottom:5 }}>{txt.deptLabel} {txt.optional}</div>
            <div style={{ position:"relative" }}>
              <span className="input-icon">
                <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </span>
              <select className="app-input" value={department} onChange={(e)=>setDepartment(e.target.value)}>
                <option value="">{txt.noDept}</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* مدیر مستقیم */}
          <div style={{ marginTop:8 }}>
            <div className="panel-label" style={{ marginBottom:5 }}>{txt.managerLabel} {txt.optional}</div>
            <div style={{ position:"relative" }}>
              <span className="input-icon">
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <select className="app-input" value={managerId} onChange={(e)=>setManagerId(e.target.value)}>
                <option value="">{txt.noManager}</option>
                {users.filter(u => u.role <= 2).map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} ({roleLabels[u.role]})</option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn-add" style={{ marginTop:12 }} onClick={addUser} disabled={adding||unCheck==="taken"}>
            {adding ? txt.adding : <><IconPlus/>{txt.addBtn}</>}
          </button>
        </div>
      )}
    </div>
  );
}
