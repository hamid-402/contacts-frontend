import { useSettings } from "../context/SettingsContext";
import { getUserProfile } from "./shared";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const { theme, lang, toggleTheme, toggleLang } = useSettings();
  const [userName, setUserName]     = useState("");
  const [userInitials, setUserInitials] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getUserProfile().then((u) => {
      if (!u) return;
      const name = u.full_name || u.email || "";
      const parts = name.trim().split(" ");
      setUserName(parts[0] || "");
      if (parts.length >= 2) {
        setUserInitials((parts[0][0] || "") + (parts[1][0] || ""));
      } else {
        setUserInitials((parts[0] || "").substring(0, 2).toUpperCase());
      }
    });
  }, []);

  return (
    <div className="topbar">

      {/* لوگو */}
      <div className="topbar-logo">
        <div className="topbar-logomark">
          <svg viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div className="topbar-logotext">
          {lang === "fa" ? <>دفتر تلفن<em>.</em></> : <>Phonebook<em>.</em></>}
        </div>
      </div>

      {/* جستجوی سریع */}
      <div className="topbar-search" onClick={() => navigate("/search")}>
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <span>{lang === "fa" ? "جستجوی سریع..." : "Quick search..."}</span>
        <kbd>⌘K</kbd>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-right">

        {/* تم */}
        <div className="tb-icon-btn" onClick={toggleTheme} title={lang === "fa" ? "تغییر تم" : "Toggle theme"}>
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1"  x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1"  y1="12" x2="3"  y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
              <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </div>

        <div className="topbar-divider" />

        {/* زبان */}
        <div className="tb-icon-btn tb-lang" onClick={toggleLang}>
          {lang === "fa" ? "EN" : "FA"}
        </div>

        {/* کاربر */}
        <div className="tb-user" onClick={() => navigate("/profile")}>
          <div className="tb-avatar">{userInitials}</div>
          {userName && <span className="tb-username">{userName}</span>}
          <div className="tb-chevron">
            <svg viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
