import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const links = [
  { to: "/",           icon: "⊞", label: "Home"       },
  { to: "/contacts",   icon: "👥", label: "Contacts"   },
  { to: "/search",     icon: "🔍", label: "Search"     },
  { to: "/categories", icon: "🏷️", label: "Categories" },
];

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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

      <div className="navbar-bottom">
        <div className="nav-user">✉️ {user?.email}</div>
        <button className="btn-logout" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}