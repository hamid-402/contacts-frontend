import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API, todayKey, Avatar, CATEGORY_COLORS, CATEGORIES, getUser } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";

export default function Home() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();
  const { lang } = useSettings();
  const tr = t[lang];

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
        <h1 className="home-title">{tr.greeting} <span className="accent">🌿</span></h1>
        <p className="home-sub">{tr.greetingSub}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-big">
          <div className="stat-num accent">{contacts.length}</div>
          <div className="stat-lbl">{tr.totalContacts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{todayCount}</div>
          <div className="stat-lbl">{tr.addedToday}</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{catCounts.find(c=>c.cat==="Work")?.count || 0}</div>
          <div className="stat-lbl">{tr.workContacts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{catCounts.find(c=>c.cat==="Family")?.count || 0}</div>
          <div className="stat-lbl">{tr.family}</div>
        </div>
      </div>

      <div className="section-title">{tr.categories}</div>
      <div className="cat-grid">
        {catCounts.map(({ cat, count }) => {
          const { accent } = CATEGORY_COLORS[cat];
          return (
            <div key={cat} className="cat-card" style={{ borderColor: `${accent}33` }}
              onClick={() => navigate("/categories")}>
              <div className="cat-count" style={{ color: accent }}>{count}</div>
              <div className="cat-name">{tr[cat.toLowerCase()] || cat}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title" style={{ marginTop: 28 }}>{tr.recentlyAdded}</div>
      {recent.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📭</div><p>{tr.noContacts}</p></div>
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