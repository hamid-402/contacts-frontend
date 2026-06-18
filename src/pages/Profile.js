import { useState, useEffect } from "react";
import { API, getUserProfile } from "../components/shared";
import { supabase } from "../supabase";
import { useSettings } from "../context/SettingsContext";

const IconUser  = () => <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconAt    = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>;
const IconMail  = () => <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconPhone = () => <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconLock  = () => <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconShield= () => <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

export default function Profile() {
  const [userId,          setUserId]          = useState(null);
  const [fullName,        setFullName]        = useState("");
  const [username,        setUsername]        = useState("");
  const [phone,           setPhone]           = useState("");
  const [email,           setEmail]           = useState("");
  const [userRole,        setUserRole]        = useState(4);
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [success,         setSuccess]         = useState("");
  const [error,           setError]           = useState("");
  const [unCheck,         setUnCheck]         = useState(null);

  const { lang } = useSettings();
  const fa = lang === "fa";

  const txt = {
    title:       fa ? "پروفایل من"                    : "My Profile",
    personal:    fa ? "اطلاعات شخصی"                  : "Personal info",
    saveName:    fa ? "ذخیره اطلاعات"                 : "Save info",
    saving:      fa ? "در حال ذخیره..."               : "Saving...",
    changePass:  fa ? "تغییر رمز عبور"                : "Change password",
    newPass:     fa ? "رمز عبور جدید"                 : "New password",
    confirmPass: fa ? "تأیید رمز عبور جدید"           : "Confirm new password",
    changeBtn:   fa ? "تغییر رمز عبور"                : "Change password",
    changing:    fa ? "در حال تغییر..."               : "Changing...",
    roleLabel:   fa ? "سطح دسترسی"                   : "Access level",
    emailLabel:  fa ? "ایمیل"                         : "Email",
    nameLabel:   fa ? "نام و نام خانوادگی"            : "Full name",
    unLabel:     fa ? "نام کاربری"                    : "Username",
    phoneLabel:  fa ? "شماره تلفن"                    : "Phone number",
    passShort:   fa ? "رمز عبور باید حداقل ۶ کاراکتر باشد" : "Password must be at least 6 characters",
    passMismatch:fa ? "رمز عبور مطابقت ندارد"         : "Passwords don't match",
    passEmpty:   fa ? "رمز عبور را وارد کنید"         : "Enter password",
    saveOk:      fa ? "اطلاعات با موفقیت ذخیره شد"   : "Info saved successfully",
    passOk:      fa ? "رمز عبور با موفقیت تغییر یافت": "Password changed successfully",
    unTaken:     fa ? "این نام کاربری قبلاً استفاده شده" : "Username already taken",
    unAvail:     fa ? "نام کاربری در دسترس است"       : "Username available",
    unMin:       fa ? "نام کاربری حداقل ۳ کاراکتر"   : "Username min 3 characters",
  };

  const roleLabels = {
    1: fa ? "ادمین"   : "Admin",
    2: fa ? "مدیر"        : "Manager",
    3: fa ? "کارمند"      : "Employee",
    4: fa ? "کاربر عادی" : "Regular User",
  };
  const roleColors = { 1:"var(--red)", 2:"var(--blue)", 3:"var(--accent)", 4:"var(--purple)" };

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) {
        setUserId(u.id);
        setFullName(u.full_name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setUsername(u.username || "");
        setUserRole(u.role || 4);
        setLoading(false);
      }
    });
  }, []);

  /* چک یکتا بودن username */
  const checkUsername = async (val) => {
    if (!val || val.length < 3) { setUnCheck(null); return; }
    try {
      const res  = await fetch(`${API}/check-username/${val}`);
      const data = await res.json();
      setUnCheck(data.available ? "ok" : "taken");
    } catch { setUnCheck(null); }
  };

  const saveInfo = async () => {
    setError(""); setSuccess("");
    if (unCheck === "taken") { setError(txt.unTaken); return; }
    if (username && username.length < 3) { setError(txt.unMin); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API}/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          username: username.trim().toLowerCase() || null,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess(txt.saveOk);
    } catch (err) {
      setError(err.message || "خطا");
    }
    setSaving(false);
  };

  const changePassword = async () => {
    setError(""); setSuccess("");
    if (!newPassword || !confirmPassword) { setError(txt.passEmpty); return; }
    if (newPassword !== confirmPassword)  { setError(txt.passMismatch); return; }
    if (newPassword.length < 6)           { setError(txt.passShort); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword(""); setConfirmPassword("");
      setSuccess(txt.passOk);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">{txt.title}</h2>
      </div>

      {error   && <div className="auth-error"   style={{ marginBottom:16 }}>{error}</div>}
      {success && <div className="auth-success" style={{ marginBottom:16 }}>{success}</div>}

      {/* ── کارت کاربر ── */}
      <div className="panel" style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
        <div style={{
          width:52, height:52, borderRadius:14,
          background:`${roleColors[userRole]}18`,
          border:`0.5px solid ${roleColors[userRole]}33`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18,
          color: roleColors[userRole], flexShrink:0,
        }}>
          {(fullName || email || "?").trim().split(" ").map((p) => p[0] || "").join("").substring(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:15, color:"var(--text1)" }}>
            {fullName || email}
          </div>
          <div style={{ fontSize:11, color:"var(--text3)", marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
            {username && <span style={{ color:"var(--accent)" }}>@{username}</span>}
            <span className="cat-badge" style={{ color:roleColors[userRole], borderColor:`${roleColors[userRole]}33`, fontSize:10 }}>
              {roleLabels[userRole]}
            </span>
          </div>
        </div>
        <div style={{ marginRight:"auto" }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`${roleColors[userRole]}12`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:roleColors[userRole], fill:"none", strokeWidth:2 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── اطلاعات شخصی ── */}
      <div className="panel">
        <div className="panel-label">{txt.personal}</div>

        {/* ایمیل — غیرقابل ویرایش */}
        <div className="input-wrap">
          <span className="input-icon"><IconMail /></span>
          <input className="app-input" value={email} disabled
            style={{ opacity:.45, cursor:"not-allowed" }}
            placeholder={txt.emailLabel} dir="ltr" />
        </div>

        {/* نام */}
        <div className="input-wrap">
          <span className="input-icon"><IconUser /></span>
          <input className="app-input"
            placeholder={txt.nameLabel}
            value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        {/* username */}
        <div className="input-wrap">
          <span className="input-icon"><IconAt /></span>
          <input className="app-input"
            placeholder={txt.unLabel}
            value={username}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
              setUsername(val);
              setUnCheck(null);
            }}
            onBlur={() => checkUsername(username)}
            dir="ltr" />
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
          <div style={{ fontSize:11, color:"var(--red)", marginTop:-6, marginBottom:8 }}>{txt.unTaken}</div>
        )}
        {unCheck === "ok" && (
          <div style={{ fontSize:11, color:"var(--accent)", marginTop:-6, marginBottom:8 }}>{txt.unAvail}</div>
        )}

        {/* شماره تلفن */}
        <div className="input-wrap" style={{ marginBottom:0 }}>
          <span className="input-icon"><IconPhone /></span>
          <input className="app-input"
            placeholder={txt.phoneLabel}
            value={phone} onChange={(e) => setPhone(e.target.value)}
            dir="ltr" />
        </div>

        <button className="btn-add" style={{ marginTop:12 }} onClick={saveInfo} disabled={saving || unCheck === "taken"}>
          {saving ? txt.saving : txt.saveName}
        </button>
      </div>

      {/* ── تغییر رمز عبور ── */}
      <div className="panel">
        <div className="panel-label">{txt.changePass}</div>

        <div className="input-wrap">
          <span className="input-icon"><IconLock /></span>
          <input className="app-input" type="password"
            placeholder={txt.newPass}
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            dir="ltr" />
        </div>

        <div className="input-wrap" style={{ marginBottom:0 }}>
          <span className="input-icon"><IconLock /></span>
          <input className="app-input" type="password"
            placeholder={txt.confirmPass}
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && changePassword()}
            dir="ltr" />
        </div>

        <button className="btn-add" style={{ marginTop:12 }} onClick={changePassword} disabled={saving}>
          {saving ? txt.changing : txt.changeBtn}
        </button>
      </div>
    </div>
  );
}
