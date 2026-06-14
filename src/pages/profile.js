import { useState, useEffect } from "react";
import { API, getUserProfile } from "../components/shared";
import { supabase } from "../supabase";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";

export default function Profile() {
  const [userId, setUserId]       = useState(null);
  const [fullName, setFullName]   = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");
  const { lang } = useSettings();

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) {
        setUserId(u.id);
        setFullName(u.full_name || "");
        setPhone(u.phone || "");
        setEmail(u.email || "");
        setLoading(false);
      }
    });
  }, []);

  const saveProfile = async () => {
    setError(""); setSuccess("");
    setSaving(true);
    try {
      await fetch(`${API}/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone }),
      });
      setSuccess("پروفایل با موفقیت ذخیره شد");
    } catch {
      setError("خطا در ذخیره پروفایل");
    }
    setSaving(false);
  };

  const changePassword = async () => {
    setError(""); setSuccess("");
    if (!newPassword || !confirmPassword) { setError("رمز عبور را وارد کنید"); return; }
    if (newPassword !== confirmPassword) { setError("رمز عبور مطابقت ندارد"); return; }
    if (newPassword.length < 6) { setError("رمز عبور باید حداقل ۶ کاراکتر باشد"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword(""); setConfirmPassword("");
      setSuccess("رمز عبور با موفقیت تغییر یافت");
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">پروفایل من</h2>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="auth-success" style={{ marginBottom: 16 }}>{success}</div>}

      {/* اطلاعات شخصی */}
      <div className="panel">
        <div className="panel-label">اطلاعات شخصی</div>
        <div className="input-wrap"><span className="input-icon">✉️</span>
          <input className="app-input" value={email} disabled style={{ opacity: 0.5 }} placeholder="ایمیل" />
        </div>
        <div className="input-wrap"><span className="input-icon">👤</span>
          <input className="app-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="نام و نام خانوادگی" />
        </div>
        <div className="input-wrap" style={{ marginBottom: 0 }}><span className="input-icon">📞</span>
          <input className="app-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره تلفن" />
        </div>
        <button className="btn-add" style={{ marginTop: 12 }} onClick={saveProfile} disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره اطلاعات"}
        </button>
      </div>

      {/* تغییر رمز عبور */}
      <div className="panel">
        <div className="panel-label">تغییر رمز عبور</div>
        <div className="input-wrap"><span className="input-icon">🔒</span>
          <input className="app-input" type="password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} placeholder="رمز عبور جدید" />
        </div>
        <div className="input-wrap" style={{ marginBottom: 0 }}><span className="input-icon">🔒</span>
          <input className="app-input" type="password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} placeholder="تأیید رمز عبور جدید" />
        </div>
        <button className="btn-add" style={{ marginTop: 12 }} onClick={changePassword} disabled={saving}>
          {saving ? "در حال تغییر..." : "تغییر رمز عبور"}
        </button>
      </div>
    </div>
  );
}