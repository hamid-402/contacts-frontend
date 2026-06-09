import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API, Avatar, CATEGORIES, CATEGORY_COLORS } from "../components/shared";

export default function Categories() {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen]         = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/contacts`).then((r) => r.json()).then(setContacts).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Categories</h2>
        <span className="page-count">{contacts.length}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CATEGORIES.map((cat) => {
          const { accent } = CATEGORY_COLORS[cat];
          const group = contacts.filter((c) => c.category === cat);
          const isOpen = open === cat;

          return (
            <div key={cat} className="cat-section" style={{ borderColor: `${accent}22` }}>
              {/* Header */}
              <div className="cat-section-header" onClick={() => setOpen(isOpen ? null : cat)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="cat-dot" style={{ background: accent }} />
                  <span className="cat-section-name">{cat}</span>
                  <span className="cat-section-count" style={{ color: accent }}>{group.length}</span>
                </div>
                <span className="cat-chevron" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
              </div>

              {/* Contacts in this category */}
              {isOpen && (
                <div className="cat-section-list">
                  {group.length === 0 ? (
                    <div className="cat-empty">No contacts in this category</div>
                  ) : (
                    group.map((c) => (
                      <div key={c.id} className="contact-item" onClick={() => navigate(`/contacts/${c.id}`)}>
                        <Avatar name={c.name} />
                        <div className="contact-info">
                          <div className="contact-name">{c.name}</div>
                          <div className="contact-phone">{c.phone}</div>
                        </div>
                        <span className="chevron">›</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
