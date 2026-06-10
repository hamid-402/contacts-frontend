import { useSettings } from "../context/SettingsContext";

export default function TopBar() {
  const { theme, lang, toggleTheme, toggleLang } = useSettings();

  return (
    <div className="topbar">
      <div className="topbar-brand">
        <span className="topbar-dot" />
        {lang === "fa" ? "مخاطبین" : "Contacts"}<span className="accent">.</span>
      </div>
      <div className="topbar-actions">
        <button className="btn-setting" onClick={toggleTheme} title={theme === "dark" ? "حالت روشن" : "حالت تاریک"}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button className="btn-lang" onClick={toggleLang}>
          {lang === "fa" ? "EN" : "FA"}
        </button>
      </div>
    </div>
  );
}