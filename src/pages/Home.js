import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API, todayKey, Avatar, CATEGORY_COLORS, CATEGORIES, getUser } from "../components/shared";

export default function Home() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUser().then((u) => {
      if (u) {
        fetch(`${API}/contacts?user_id=${u.id}`)
          .then((r) => r.json())
          .then((d) => { setContacts(d); setLoading(false); })
          .catch(() => setLoading(false));
      }
    });
  }, []);

  const todayCount = contacts.filter((c) => c.date === todayKey).length;
  const catCounts = CATEGORIES.map((cat) => ({
    cat,
    count: contacts.filter((c) => c.category === cat).length,
  }));
  const recent = [...contacts].slice(0, 5);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="home-hero">
        <h1 className="home-title">Good to see you <span className="accent">👋</span></h1>
        <p className="home-sub">Here's what's in your address book today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-big">
          <div className="stat-num accent">{contacts.length}</div>
          <div className="stat-lbl">Total contacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{todayCount}</div>
          <div className="stat-lbl">Added today</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{catCounts.find(c=>c.cat==="Work")?.count || 0}</div>
          <div className="stat-lbl">Work contacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{catCounts.find(c=>c.cat==="Family")?.count || 0}</div>
          <div className="stat-lbl">Family</div>
        </div>
      </div>

      <div className="section-title">Categories</div>
      <div className="cat-grid">
        {catCounts.map(({ cat, count }) => {
          const { accent } = CATEGORY_COLORS[cat];
          return (
            <div key={cat} className="cat-card" style={{ borderColor: `${accent}33` }}
              onClick={() => navigate("/categories")}>
              <div className="cat-count" style={{ color: accent }}>{count}</div>
              <div className="cat-name">{cat}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title" style={{ marginTop: 28 }}>Recently added</div>
      {recent.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📭</div><p>No contacts yet</p></div>
      ) : (
        <div className="contact-list">
          {recent.map((c) => (
            <div key={c.id} className="contact-item" onClick={() => navigate(`/contacts/${c.id}`)}>
              <Avatar name={c.name} />
              <div className="contact-info">
                <div className="contact-name">{c.name}</div>
                <div className="contact-phone">{c.phone}</div>
              </div>
              <span className="chevron">›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}