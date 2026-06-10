import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API, Avatar, CATEGORIES, getUser } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";

export default function Search() {
  const [contacts, setContacts]   = useState([]);
  const [query, setQuery]         = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const navigate = useNavigate();
  const { lang } = useSettings();
  const tr = t[lang];

  useEffect(() => {
    getUser().then((u) => {
      if (u) {
        fetch(`${API}/contacts?user_id=${u.id}`)
          .then((r) => r.json())
          .then(setContacts)
          .catch(() => {});
      }
    });
  }, []);

  const filtered = contacts.filter((c) => {
    const matchQ = !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query);
    const matchCat = filterCat === "All" || c.category === filterCat;
    return matchQ && matchCat;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">{tr.search}</h2>
      </div>

      <div className="input-wrap" style={{ marginBottom: 14 }}>
        <span className="input-icon">🔍</span>
        <input className="app-input" placeholder={tr.searchPlaceholder} value={query}
          onChange={(e) => setQuery(e.target.value)} autoFocus />
      </div>

      <div className="filter-pills">
        {["All", ...CATEGORIES].map((cat) => (
          <button key={cat} className={`pill ${filterCat === cat ? "pill-active" : ""}`}
            onClick={() => setFilterCat(cat)}>
            {cat === "All" ? tr.all : tr[cat.toLowerCase()] || cat}
          </button>
        ))}
      </div>

      <div className="search-results-label">
        {query || filterCat !== "All"
          ? `${filtered.length} ${tr.results}`
          : `${contacts.length} ${tr.totalCount}`}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <p>{query ? `${tr.noResults} "${query}"` : tr.noContactsInCat}</p>
        </div>
      ) : (
        <div className="contact-list">
          {filtered.map((c) => (
            <div key={c.id} className="contact-item" onClick={() => navigate(`/contacts/${c.id}`)}>
              <Avatar name={c.name} />
              <div className="contact-info">
                <div className="contact-name">{c.name}</div>
                <div className="contact-phone">{c.phone}</div>
              </div>
              {c.category && <span className="cat-badge">{tr[c.category.toLowerCase()] || c.category}</span>}
              <span className="chevron">›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}