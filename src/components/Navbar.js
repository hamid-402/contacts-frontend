import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";
import { useState, useEffect } from "react";
import { getUserProfile } from "./shared";

/* ── SVG آیکون‌ها ── */
const Icons = {
  home: (
    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  ),
  contacts: (
    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  organizations: (
    <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  search: (
    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
  ),
  categories: (
    <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
};

function NavItem({ to, icon, label, badge, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-link${isActive ? " nav-active" : ""}`}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
      {badge > 0 && <span className="nav-badge">{badge}</span>}
    </NavLink>
  );
}

export default function Navbar({ user }) {
  const navigate  = useNavigate();
  const { lang }  = useSettings();
  const tr        = t[lang];
  const [userRole,     setUserRole]     = useState(4);
  const [userName,     setUserName]     = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [roleLabel,    setRoleLabel]    = useState("");

  const roleLabelMap = {
    1: lang === "fa" ? "مدیر ارشد"  : "Senior Manager",
    2: lang === "fa" ? "مدیر"       : "Manager",
    3: lang === "fa" ? "کارمند"     : "Employee",
    4: lang === "fa" ? "کاربر عادی" : "User",
  };

  useEffect(() => {
    getUserProfile().then((u) => {
      if (!u) return;
      setUserRole(u.role || 4);
      const name = u.full_name || u.email || "";
      const parts = name.trim().split(" ");
      setUserName(parts[0] || "");
      if (parts.length >= 2) {
        setUserInitials((parts[0][0] || "") + (parts[1][0] || ""));
      } else {
        setUserInitials((parts[0] || "").substring(0, 2).toUpperCase());
      }
      setRoleLabel(roleLabelMap[u.role || 4]);
    });
  }, [lang]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const mainLabel    = lang === "fa" ? "اصلی"      : "Main";
  const prodLabel    = lang === "fa" ? "بهره‌وری"  : "Productivity";
  const accountLabel = lang === "fa" ? "حساب"      : "Account";

  return (
    <nav className="navbar">

      {/* ── گروه اصلی ── */}
      <div className="navbar-section">
        <div className="navbar-section-label">{mainLabel}</div>

        <NavItem to="/"            end   icon={Icons.home}          label={tr.home}       />
        <NavItem to="/contacts"          icon={Icons.contacts}      label={tr.contacts}   />
        <NavItem to="/organizations"     icon={Icons.organizations} label={lang === "fa" ? "سازمان‌ها" : "Organizations"} />
        <NavItem to="/search"            icon={Icons.search}        label={tr.search}     />
        <NavItem to="/categories"        icon={Icons.categories}    label={tr.categories} />
      </div>

      {/* ── گروه بهره‌وری ── */}
      <div className="navbar-section">
        <div className="navbar-section-label">{prodLabel}</div>

        <NavItem to="/tasks"    icon={Icons.tasks}    label={lang === "fa" ? "وظایف"   : "Tasks"}    />
        <NavItem to="/calendar" icon={Icons.calendar} label={lang === "fa" ? "تقویم"   : "Calendar"} />
        {/* گزارش‌ها فقط مدیر ارشد */}
        {userRole === 1 && (
          <NavItem to="/reports" icon={Icons.reports} label={lang === "fa" ? "گزارش‌ها" : "Reports"} />
        )}
      </div>

      {/* ── گروه حساب ── */}
      <div className="navbar-section">
        <div className="navbar-section-label">{accountLabel}</div>

        <NavItem to="/profile" icon={Icons.profile} label={lang === "fa" ? "پروفایل" : "Profile"} />
        {/* مدیریت فقط مدیر ارشد */}
        {userRole === 1 && (
          <NavItem to="/admin" icon={Icons.admin} label={lang === "fa" ? "مدیریت" : "Admin"} />
        )}
      </div>

      {/* ── پایین sidebar ── */}
      <div className="navbar-bottom">
        <div className="nav-user-card">
          <div className="nav-user-row">
            <div className="nav-user-avatar">{userInitials}</div>
            <div>
              <div className="nav-user-name">{userName || user?.email}</div>
              <div className="nav-user-role">{roleLabel}</div>
            </div>
          </div>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          {Icons.logout}
          {tr.signOut}
        </button>
      </div>

    </nav>
  );
}
