import { NavLink } from "react-router-dom";

const links = [
  { to: "/",           icon: "⊞", label: "Home"       },
  { to: "/contacts",   icon: "👥", label: "Contacts"   },
  { to: "/search",     icon: "🔍", label: "Search"     },
  { to: "/categories", icon: "🏷️", label: "Categories" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-dot" />
        Contacts<span className="brand-accent">.</span>
      </div>
      <div className="navbar-links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
          >
            <span className="nav-icon">{l.icon}</span>
            <span className="nav-label">{l.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
