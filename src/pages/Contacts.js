import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API, todayKey, Avatar, CATEGORIES, getUser } from "../components/shared";

function EditModal({ contact, onSave, onClose }) {
  const [name, setName]         = useState(contact.name);
  const [phone, setPhone]       = useState(contact.phone);
  const [category, setCategory] = useState(contact.category || "Other");

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 className="modal-title">Edit Contact</h3>
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
        <div className="modal-btns">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={() => name.trim() && phone.trim() && onSave({ ...contact, name: name.trim(), phone: phone.trim(), category })}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Contacts() {
  const [contacts, setContacts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [name, setName]             = useState("");
  const [phone, setPhone]           = useState("");
  const [category, setCategory]     = useState("Other");
  const [nameErr, setNameErr]       = useState(false);
  const [phoneErr, setPhoneErr]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [newIds, setNewIds]         = useState(new Set());
  const [userId, setUserId]         = useState(null);
  const phoneRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    getUser().then((u) => {
      if (u) { setUserId(u.id); fetchContacts(u.id); }
    });
  }, []);

  const fetchContacts = async (uid) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/contacts?user_id=${uid}`);
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
    const res = await fetch(`${API}/contacts`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n, phone: p, category, date: todayKey, user_id: userId }),
    });
    const created = await res.json();
    setName(""); setPhone(""); setCategory("Other");
    setNewIds((prev) => new Set([...prev, created.id]));
    setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(created.id); return s; }), 2500);
    fetchContacts(userId);
  };

  const deleteContact = async (id) => {
    await fetch(`${API}/contacts/${id}`, { method: "DELETE" });
    fetchContacts(userId);
  };

  const saveEdit = async (updated) => {
    await fetch(`${API}/contacts/${updated.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setEditTarget(null);
    fetchContacts(userId);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Contacts</h2>
        <span className="page-count">{contacts.length}</span>
      </div>

      <div className="panel">
        <div className="panel-label">Add new contact</div>
        <div className="input-wrap"><span className="input-icon">👤</span>
          <input className={`app-input ${nameErr ? "input-err" : ""}`} placeholder="Full name" value={name}
            onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && phoneRef.current?.focus()} />
        </div>
        <div className="input-wrap"><span className="input-icon">📞</span>
          <input ref={phoneRef} className={`app-input ${phoneErr ? "input-err" : ""}`} placeholder="Phone number" value={phone}
            onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addContact()} />
        </div>
        <div className="input-wrap"><span className="input-icon">🏷️</span>
          <select className="app-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn-add" onClick={addContact}>+ Add Contact</button>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : contacts.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📭</div><p>No contacts yet</p></div>
      ) : (
        <div className="contact-list">
          {contacts.map((c) => (
            <div key={c.id} className={`contact-item ${newIds.has(c.id) ? "contact-new" : ""}`}>
              <div onClick={() => navigate(`/contacts/${c.id}`)} style={{ display:"flex", alignItems:"center", gap:12, flex:1, cursor:"pointer" }}>
                <Avatar name={c.name} />
                <div className="contact-info">
                  <div className="contact-name">{c.name}{newIds.has(c.id) && <span className="badge-new">new</span>}</div>
                  <div className="contact-phone">{c.phone}</div>
                </div>
              </div>
              <div className="actions">
                <button className="btn-icon btn-edit" onClick={() => setEditTarget(c)}>✎</button>
                <button className="btn-icon btn-del" onClick={() => deleteContact(c.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && <EditModal contact={editTarget} onSave={saveEdit} onClose={() => setEditTarget(null)} />}
    </div>
  );
}