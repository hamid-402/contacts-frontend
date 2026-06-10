import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );
  const [lang, setLang] = useState(
    localStorage.getItem("lang") || "fa"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");
  }, [lang]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const toggleLang  = () => setLang((l)  => (l  === "fa"   ? "en"    : "fa"));

  return (
    <SettingsContext.Provider value={{ theme, lang, toggleTheme, toggleLang }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);