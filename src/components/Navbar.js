import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";
import { useState, useEffect } from "react";
import { getUserProfile } from "./shared";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { lang } = useSettings();
  const tr = t[lang];
  const [userRole, setUserRole] = useState(4);

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) setUserRole(u.role || 4);
    });
  }, []);

  const links = [
    { to: "/",           icon: "⊞", label: tr.home       },
    { to: "/contacts",   icon: "👥", label: tr.contacts   },
    { to: "/search",     icon: "🔍", label: tr.search     },
    { to: "/categories", icon: "🏷️", label: tr.categories },
    { to: "/tasks",      icon: "✅", label: lang === "fa" ? "وظایف" : "Tasks" },
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

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">پروفایل</span>
        </NavLink>

        {userRole === 1 && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">مدیریت</span>
          </NavLink>
        )}
      </div>

      <div className="navbar-bottom">
        <div className="nav-user">✉️ {user?.email}</div>
        <button className="btn-logout" onClick={handleLogout}>{tr.signOut}</button>
      </div>
    </nav>
  );
}