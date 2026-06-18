import { useState, useEffect, useRef } from "react";

/**
 * TimeInput — همیشه فرمت ۲۴ ساعته نمایش میده
 * value: "HH:mm" یا "HH:mm:ss"
 * onChange: (val) => void — val به فرمت "HH:mm"
 */
export default function TimeInput({ value, onChange, placeholder, style }) {
  const [hour,    setHour]    = useState("");
  const [minute,  setMinute]  = useState("");
  const [focused, setFocused] = useState(false);
  const hourRef   = useRef(null);
  const minuteRef = useRef(null);

  useEffect(() => {
    if (value) {
      const parts = value.split(":");
      setHour(parts[0] || "");
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
    if (v.length > 2) v = v.slice(-1);
    const n = parseInt(v, 10);
    if (v !== "" && (isNaN(n) || n > 23)) return;
    setHour(v);
    emit(v, minute);
    if (v.length === 2) minuteRef.current?.focus();
  };

  const handleMinute = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(-1);
    const n = parseInt(v, 10);
    if (v !== "" && (isNaN(n) || n > 59)) return;
    setMinute(v);
    emit(hour, v);
  };

  const handleHourKey = (e) => {
    if (e.key === ":" || e.key === "ArrowRight") minuteRef.current?.focus();
    if (e.key === "Backspace" && hour === "") { onChange(""); }
  };

  const handleMinuteKey = (e) => {
    if (e.key === "Backspace" && minute === "") hourRef.current?.focus();
  };

  const showPlaceholder = !hour && !minute && !focused;

  const wrap = {
    display: "flex",
    alignItems: "center",
    background: "var(--bg)",
    border: `0.5px solid ${focused ? "#00d98b33" : "var(--border)"}`,
    borderRadius: "var(--radius)",
    padding: "11px 14px 11px 42px",
    cursor: "text",
    boxShadow: focused ? "0 0 0 3px #00d98b08" : "none",
    transition: "border-color .2s, box-shadow .2s",
    position: "relative",
    ...style,
  };

  const inp = {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text2)",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
    width: showPlaceholder ? 0 : 26,
    textAlign: "center",
    padding: 0,
    opacity: showPlaceholder ? 0 : 1,
    transition: "width .1s, opacity .1s",
  };

  return (
    <div style={wrap} onClick={() => hourRef.current?.focus()}>
      {showPlaceholder && (
        <span style={{ color:"var(--text4)", fontSize:13, fontFamily:"DM Sans,sans-serif",
          position:"absolute", pointerEvents:"none" }}>
          {placeholder || "HH:mm"}
        </span>
      )}
      <input
        ref={hourRef}
        style={inp}
        value={hour}
        onChange={handleHour}
        onKeyDown={handleHourKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(minuteRef.current === document.activeElement)}
        placeholder={showPlaceholder ? "" : "HH"}
        maxLength={2}
        inputMode="numeric"
        dir="ltr"
      />
      {!showPlaceholder && (
        <span style={{ color:"var(--text3)", fontSize:14, userSelect:"none", lineHeight:1, margin:"0 1px" }}>:</span>
      )}
      <input
        ref={minuteRef}
        style={inp}
        value={minute}
        onChange={handleMinute}
        onKeyDown={handleMinuteKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={showPlaceholder ? "" : "mm"}
        maxLength={2}
        inputMode="numeric"
        dir="ltr"
      />
    </div>
  );
}
