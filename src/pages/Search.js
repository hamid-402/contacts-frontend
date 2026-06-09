import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API, Avatar, CATEGORIES, getUser } from "../components/shared";

export default function Search() {
  const [contacts, setContacts]   = useState([]);
  const [query, setQuery]         = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const navigate = useNavigate();

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
        <h2 className="page-title">Search</h2>
      </div>

      <div className="input-wrap" style={{ marginBottom: 14 }}>
        <span className="input-icon">🔍</span>
        <input className="app-input" placeholder="Search by name or phone..." value={query}
          onChange={(e) => setQuery(e.target.value)} autoFocus />
      </div>

      <div className="filter-pills">
        {["All", ...CATEGORIES].map((cat) => (
          <button key={cat} className={`pill ${filterCat === cat ? "pill-active" : ""}`}
            onClick={() => setFilterCat(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="search-results-label">
        {query || filterCat !== "All"
          ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
          : `${contacts.length} total contacts`}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <p>{query ? `No results for "${query}"` : "No contacts in this category"}</p>
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
              {c.category && <span className="cat-badge">{c.category}</span>}
              <span className="chevron">›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}