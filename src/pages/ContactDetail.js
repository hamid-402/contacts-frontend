import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, Avatar, CATEGORIES, CATEGORY_COLORS } from "../components/shared";

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [category, setCategory] = useState("Other");

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
    if (!window.confirm("Delete this contact?")) return;
    await fetch(`${API}/contacts/${id}`, { method: "DELETE" });
    navigate("/contacts");
  };

  if (!contact) return <div className="page-loading"><div className="spinner" /></div>;

  const { accent } = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS["Other"];

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(-1)}>‹ Back</button>

      {/* Profile card */}
      <div className="detail-card">
        <Avatar name={contact.name} size={72} />
        <div className="detail-name">{contact.name}</div>
        <div className="detail-cat" style={{ color: accent }}>{contact.category || "Other"}</div>
      </div>

      {/* Info rows */}
      {!editing ? (
        <div className="info-panel">
          <div className="info-row">
            <span className="info-label">📞 Phone</span>
            <span className="info-value">{contact.phone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">🏷️ Category</span>
            <span className="info-value" style={{ color: accent }}>{contact.category || "Other"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">📅 Added</span>
            <span className="info-value">{contact.date || "—"}</span>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-label">Edit contact</div>
          <div className="input-wrap"><span className="input-icon">👤</span>
            <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="input-wrap"><span className="input-icon">📞</span>
            <input className="app-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
          </div>
          <div className="input-wrap" style={{ marginBottom: 0 }}><span className="input-icon">🏷️</span>
            <select className="app-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="detail-actions">
        {!editing ? (
          <>
            <button className="btn-action btn-edit-full" onClick={() => setEditing(true)}>✎ Edit</button>
            <button className="btn-action btn-del-full" onClick={del}>✕ Delete</button>
          </>
        ) : (
          <>
            <button className="btn-action btn-edit-full" onClick={save}>✓ Save</button>
            <button className="btn-action btn-cancel-full" onClick={() => setEditing(false)}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
