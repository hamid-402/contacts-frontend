import { useState, useEffect } from "react";

/**
 * TimeInput — همیشه فرمت ۲۴ ساعته نمایش میده
 * value: "HH:mm" یا "HH:mm:ss"
 * onChange: (val) => void — val به فرمت "HH:mm"
 */
export default function TimeInput({ value, onChange, placeholder, style }) {
  const [hour,   setHour]   = useState("");
  const [minute, setMinute] = useState("");

  /* مقدار اولیه */
  useEffect(() => {
    if (value) {
      const parts = value.split(":");
      setHour(parts[0]   || "");
      setMinute(parts[1] ? parts[1].slice(0, 2) : "");
    } else {
      setHour(""); setMinute("");
    }
  }, [value]);

  const emit = (h, m) => {
    if (h === "" && m === "") { onChange(""); return; }
    const hh = String(h).padStart(2, "0");
    const mm = String(m || "00").padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  const handleHour = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2);
    const n = parseInt(v, 10);
    if (v !== "" && (isNaN(n) || n > 23)) return;
    setHour(v);
    emit(v, minute);
    /* اگه ۲ رقم شد برو به دقیقه */
    if (v.length === 2) {
      const next = document.getElementById(`time-min-${placeholder}`);
      if (next) next.focus();
    }
  };

  const handleMinute = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2);
    const n = parseInt(v, 10);
    if (v !== "" && (isNaN(n) || n > 59)) return;
    setMinute(v);
    emit(hour, v);
  };

  const handleHourKey = (e) => {
    if (e.key === ":" || e.key === "ArrowLeft") {
      const next = document.getElementById(`time-min-${placeholder}`);
      if (next) next.focus();
    }
  };

  const wrap = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    background: "var(--bg)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "11px 14px 11px 42px",
    ...style,
  };

  const inp = {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text2)",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
    width: 28,
    textAlign: "center",
    padding: 0,
  };

  const sep = {
    color: "var(--text3)",
    fontSize: 14,
    userSelect: "none",
    lineHeight: 1,
  };

  const ph = {
    color: "var(--text4)",
    fontSize: 13,
    fontFamily: "DM Sans, sans-serif",
  };

  if (!hour && !minute && placeholder) {
    return (
      <div style={{ ...wrap, cursor: "text" }}
        onClick={() => document.getElementById(`time-hr-${placeholder}`)?.focus()}>
        <span style={ph}>{placeholder}</span>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <input
        id={`time-hr-${placeholder}`}
        style={inp}
        value={hour}
        onChange={handleHour}
        onKeyDown={handleHourKey}
        placeholder="HH"
        maxLength={2}
        inputMode="numeric"
        dir="ltr"
      />
      <span style={sep}>:</span>
      <input
        id={`time-min-${placeholder}`}
        style={inp}
        value={minute}
        onChange={handleMinute}
        placeholder="mm"
        maxLength={2}
        inputMode="numeric"
        dir="ltr"
      />
    </div>
  );
}
