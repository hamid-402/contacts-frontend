import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, Avatar, CATEGORIES, CATEGORY_COLORS } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [category, setCategory] = useState("Other");
  const { lang } = useSettings();
  const tr = t[lang];

  useEffect(() => {
    fetch(`${API}/contacts/${id}`)
      .then((r) => r.json())
      .then((c) => { setContact(c); setName(c.name); setPhone(c.phone); setCategory(c.category || "Other"); })
      .catch(() => navigate("/contacts"));
  }, [id, navigate]);

  const save = async () => {
    const updated = { ...contact, name: name.trim(), phone: phone.trim(), category };
    await fetch(`${API}/contacts/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setContact(updated); setEditing(false);
  };

  const del = async () => {
    if (!window.confirm(tr.deleteConfirm)) return;
    await fetch(`${API}/contacts/${id}`, { method: "DELETE" });
    navigate("/contacts");
  };

  if (!contact) return <div className="page-loading"><div className="spinner" /></div>;

  const { accent } = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS["Other"];

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(-1)}>{tr.back}</button>

      <div className="detail-card">
        <Avatar name={contact.name} size={72} />
        <div className="detail-name">{contact.name}</div>
        <div className="detail-cat" style={{ color: accent }}>{tr[contact.category?.toLowerCase()] || contact.category || tr.other}</div>
      </div>

      {!editing ? (
        <div className="info-panel">
          <div className="info-row">
            <span className="info-label">📞 {tr.phone}</span>
            <span className="info-value">{contact.phone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">🏷️ {tr.category}</span>
            <span className="info-value" style={{ color: accent }}>{tr[contact.category?.toLowerCase()] || contact.category}</span>
          </div>
          <div className="info-row">
            <span className="info-label">📅 {tr.addedOn}</span>
            <span className="info-value">{contact.date || "—"}</span>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-label">{tr.editContact}</div>
          <div className="input-wrap"><span className="input-icon">👤</span>
            <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={tr.fullName} />
          </div>
          <div className="input-wrap"><span className="input-icon">📞</span>
            <input className="app-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={tr.phoneNumber} />
          </div>
          <div className="input-wrap" style={{ marginBottom: 0 }}><span className="input-icon">🏷️</span>
            <select className="app-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="detail-actions">
        {!editing ? (
          <>
            <button className="btn-action btn-edit-full" onClick={() => setEditing(true)}>✎ {tr.edit}</button>
            <button className="btn-action btn-del-full" onClick={del}>✕ {tr.delete}</button>
          </>
        ) : (
          <>
            <button className="btn-action btn-edit-full" onClick={save}>{tr.save}</button>
            <button className="btn-action btn-cancel-full" onClick={() => setEditing(false)}>{tr.cancel}</button>
          </>
        )}
      </div>
    </div>
  );
}