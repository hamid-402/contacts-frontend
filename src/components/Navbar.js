import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { lang } = useSettings();
  const tr = t[lang];

  const links = [
    { to: "/",           icon: "⊞", label: tr.home       },
    { to: "/contacts",   icon: "👥", label: tr.contacts   },
    { to: "/search",     icon: "🔍", label: tr.search     },
    { to: "/categories", icon: "🏷️", label: tr.categories },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="navbar">
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
        <button className="btn-logout" onClick={handleLogout}>{tr.signOut}</button>
      </div>
    </nav>
  );
}