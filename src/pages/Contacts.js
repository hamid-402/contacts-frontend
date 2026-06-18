import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API, todayKey, Avatar, CATEGORIES, getUserProfile } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";

/* ── SVG آیکون‌های input ── */
const IconUser = () => (
  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.6 5.6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const IconTag = () => (
  <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
);

/* ── لیبل و رنگ visibility ── */
function VisBadge({ value, tr }) {
  const map = {
    1: { cls: "vis-badge vis-1", label: tr.visibility1 },
    2: { cls: "vis-badge vis-2", label: tr.visibility2 },
    3: { cls: "vis-badge vis-3", label: tr.visibility3 },
    4: { cls: "vis-badge vis-4", label: tr.visibility4 },
  };
  const v = map[value] || map[4];
  return <span className={v.cls}>{v.label}</span>;
}

/* ── مودال ویرایش ── */
function EditModal({ contact, onSave, onClose, tr, userRole, lang }) {
  const [name,       setName]       = useState(contact.name);
  const [phone,      setPhone]      = useState(contact.phone);
  const [category,   setCategory]   = useState(contact.category || CATEGORIES[0]);
  const [visibility, setVisibility] = useState(contact.visibility || 4);

  const catLabels = Object.fromEntries(CATEGORIES.map(c => [c, c]));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 className="modal-title">{tr.editContact}</h3>

        <div className="input-wrap">
          <span className="input-icon"><IconUser /></span>
          <input className="app-input" value={name}
            onChange={(e) => setName(e.target.value)} placeholder={tr.fullName} />
        </div>

        <div className="input-wrap">
          <span className="input-icon"><IconPhone /></span>
          <input className="app-input" value={phone}
            onChange={(e) => setPhone(e.target.value)} placeholder={tr.phoneNumber} />
        </div>

        <div className="input-wrap">
          <span className="input-icon"><IconTag /></span>
          <select className="app-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{catLabels[c] || c}</option>)}
          </select>
        </div>

        {userRole === 1 && (
          <div className="input-wrap" style={{ marginBottom: 0 }}>
            <span className="input-icon"><IconLock /></span>
            <select className="app-input" value={visibility}
              onChange={(e) => setVisibility(Number(e.target.value))}>
              <option value={1}>{tr.visibility1}</option>
              <option value={2}>{tr.visibility2}</option>
              <option value={3}>{tr.visibility3}</option>
              <option value={4}>{tr.visibility4}</option>
            </select>
          </div>
        )}

        <div className="modal-btns">
          <button className="btn-cancel" onClick={onClose}>{tr.cancel}</button>
          <button className="btn-save"
            onClick={() => name.trim() && phone.trim() &&
              onSave({ ...contact, name: name.trim(), phone: phone.trim(), category, visibility })}>
            {tr.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CONTACTS PAGE
══════════════════════════════════════════ */
export default function Contacts() {
  const [contacts,    setContacts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [category,    setCategory]    = useState(CATEGORIES[0]);
  const [visibility,  setVisibility]  = useState(4);
  const [nameErr,     setNameErr]     = useState(false);
  const [phoneErr,    setPhoneErr]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [newIds,      setNewIds]      = useState(new Set());
  const [userId,      setUserId]      = useState(null);
  const [userRole,    setUserRole]    = useState(4);
  const [activeTab,   setActiveTab]   = useState("all");
  const [showForm,    setShowForm]    = useState(false);
  const phoneRef = useRef();
  const navigate = useNavigate();
  const { lang } = useSettings();
  const tr = t[lang];

  const catLabels = Object.fromEntries(CATEGORIES.map(c => [c, c]));

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) {
        setUserId(u.id);
        setUserRole(u.role || 4);
        fetchContacts(u.id);
      }
    });
  }, []);

  const fetchContacts = async (uid) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/contacts?user_id=${uid}`);
      const data = await res.json();
      setContacts(data);
    } catch { setContacts([]); }
    setLoading(false);
  };

  const addContact = async () => {
    const n = name.trim(), p = phone.trim();
    let err = false;
    if (!n) { setNameErr(true); setTimeout(() => setNameErr(false), 1200); err = true; }
    if (!p) { setPhoneErr(true); setTimeout(() => setPhoneErr(false), 1200); err = true; }
    if (err) return;

    const res     = await fetch(`${API}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n, phone: p, category, date: todayKey, user_id: userId, visibility }),
    });
    const created = await res.json();
    setName(""); setPhone(""); setCategory(CATEGORIES[0]); setVisibility(4);
    setShowForm(false);
    setNewIds((prev) => new Set([...prev, created.id]));
    setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(created.id); return s; }), 3000);
    fetchContacts(userId);
  };

  const deleteContact = async (id) => {
    await fetch(`${API}/contacts/${id}`, { method: "DELETE" });
    fetchContacts(userId);
  };

  const saveEdit = async (updated) => {
    await fetch(`${API}/contacts/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setEditTarget(null);
    fetchContacts(userId);
  };

  /* فیلتر بر اساس tab — از CATEGORIES جدید */
  const tabs = [
    { key: "all", label: lang === "fa" ? "همه" : "All" },
    ...CATEGORIES.map(cat => ({ key: cat, label: cat })),
  ];

  const filtered = activeTab === "all"
    ? contacts
    : contacts.filter((c) => c.category === activeTab);

  return (
    <div className="page">

      {/* ── هدر ── */}
      <div className="page-header">
        <h2 className="page-title">{tr.contacts}</h2>
        <span className="page-count">{contacts.length}</span>
        <div className="page-spacer" />
        {userRole === 1 && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <IconPlus />
            {lang === "fa" ? "افزودن" : "Add"}
          </button>
        )}
      </div>

      {/* ── فرم افزودن (فقط role=1) ── */}
      {userRole === 1 && showForm && (
        <div className="panel">
          <div className="panel-label">{tr.addNew}</div>

          <div className="input-wrap">
            <span className="input-icon"><IconUser /></span>
            <input
              className={`app-input ${nameErr ? "input-err" : ""}`}
              placeholder={tr.fullName} value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && phoneRef.current?.focus()}
            />
          </div>

          <div className="input-wrap">
            <span className="input-icon"><IconPhone /></span>
            <input
              ref={phoneRef}
              className={`app-input ${phoneErr ? "input-err" : ""}`}
              placeholder={tr.phoneNumber} value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addContact()}
            />
          </div>

          <div className="input-wrap">
            <span className="input-icon"><IconTag /></span>
            <select className="app-input" value={category}
              onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{catLabels[c] || c}</option>)}
            </select>
          </div>

          <div className="input-wrap">
            <span className="input-icon"><IconLock /></span>
            <select className="app-input" value={visibility}
              onChange={(e) => setVisibility(Number(e.target.value))}>
              <option value={1}>{tr.visibility1}</option>
              <option value={2}>{tr.visibility2}</option>
              <option value={3}>{tr.visibility3}</option>
              <option value={4}>{tr.visibility4}</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>
              {tr.cancel}
            </button>
            <button className="btn-save" onClick={addContact}>
              {tr.addContact}
            </button>
          </div>
        </div>
      )}

      {/* ── tabs فیلتر ── */}
      <div className="tabs-row">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            className={`tab-btn ${activeTab === tb.key ? "active" : ""}`}
            onClick={() => setActiveTab(tb.key)}
          >
            {tb.label}
            {tb.key !== "all" && (
              <span style={{ marginRight: 4, opacity: .6, fontSize: 10 }}>
                ({contacts.filter((c) => c.category === tb.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── لیست ── */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <p>{tr.noContacts}</p>
        </div>
      ) : (
        <div className="contact-list">
          {filtered.map((c) => (
            <div key={c.id} className={`contact-item ${newIds.has(c.id) ? "contact-new" : ""}`}>

              {/* کلیک برای جزئیات */}
              <div
                onClick={() => navigate(`/contacts/${c.id}`)}
                style={{ display: "flex", alignItems: "center", gap: 11, flex: 1, cursor: "pointer", minWidth: 0 }}
              >
                <Avatar name={c.name} />
                <div className="contact-info">
                  <div className="contact-name">
                    {c.name}
                    {newIds.has(c.id) && <span className="badge-new">{lang === "fa" ? "جدید" : "new"}</span>}
                  </div>
                  <div className="contact-phone">{c.phone}</div>
                </div>
              </div>

              {/* badge دسته‌بندی */}
              <span className="cat-badge">{catLabels[c.category] || c.category}</span>

              {/* badge visibility فقط برای مدیر ارشد */}
              {userRole === 1 && <VisBadge value={c.visibility} tr={tr} />}

              {/* دکمه‌های عملیات فقط role=1 */}
              {userRole === 1 && (
                <div className="actions">
                  <button className="btn-icon btn-edit" onClick={() => setEditTarget(c)}
                    title={tr.editContact}>
                    <IconEdit />
                  </button>
                  <button className="btn-icon btn-del" onClick={() => deleteContact(c.id)}
                    title={lang === "fa" ? "حذف" : "Delete"}>
                    <IconTrash />
                  </button>
                </div>
              )}

              <div style={{ color: "var(--text4)", flexShrink: 0 }}
                onClick={() => navigate(`/contacts/${c.id}`)}
                className="chevron-svg">
                <IconChevron />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── مودال ویرایش ── */}
      {editTarget && (
        <EditModal
          contact={editTarget}
          onSave={saveEdit}
          onClose={() => setEditTarget(null)}
          tr={tr}
          userRole={userRole}
          lang={lang}
        />
      )}
    </div>
  );
}
