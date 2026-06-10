import { useSettings } from "../context/SettingsContext";

export default function TopBar() {
  const { theme, lang, toggleTheme, toggleLang } = useSettings();

  return (
    <div className="topbar">
      <div className="topbar-brand">
        <span className="topbar-dot" />
        {lang === "fa" ? "دفتر تلفن آنلاین" : "Online Contacts"}
      </div>
      <div className="topbar-actions">
        <button className="btn-setting" onClick={toggleTheme}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button className="btn-lang" onClick={toggleLang}>
          {lang === "fa" ? "EN" : "FA"}
        </button>
      </div>
    </div>
  );
}