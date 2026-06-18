import { useState, useEffect, useRef } from "react";

export default function TimeInput({ value, onChange, placeholder, style }) {
  const [hour,   setHour]   = useState("");
  const [minute, setMinute] = useState("");
  const hourRef   = useRef(null);
  const minuteRef = useRef(null);

  useEffect(() => {
    if (value) {
      const parts = value.split(":");
      setHour(parts[0] || "");
      setMinute(parts[1] ? parts[1].slice(0, 2) : "");
    } else {
      setHour("");
      setMinute("");
    }
  }, [value]);

  const emitValue = (h, m) => {
    if (!h && !m) { onChange(""); return; }
    const hh = (h || "00").padStart(2, "0");
    const mm = (m || "00").padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  const handleHourChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setHour("");
      emitValue("", minute);
      return;
    }
    // فقط آخرین کاراکتر رو بگیر اگه بیشتر از 2 رقم شد
    const v = raw.length > 2 ? raw.slice(-1) : raw;
    const n = parseInt(v, 10);
    if (n > 23) return;
    setHour(v);
    emitValue(v, minute);
    // اگه 2 رقم شد یا عدد > 2 بود برو به minute
    if (v.length === 2 || n > 2) {
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinuteChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setMinute("");
      emitValue(hour, "");
      return;
    }
    const v = raw.length > 2 ? raw.slice(-1) : raw;
    const n = parseInt(v, 10);
    if (n > 59) return;
    setMinute(v);
    emitValue(hour, v);
  };

  const handleHourKeyDown = (e) => {
    if (e.key === ":" || e.key === "Tab" || e.key === "ArrowRight") {
      e.preventDefault();
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
    if (e.key === "Backspace" && hour === "") {
      onChange("");
    }
  };

  const handleMinuteKeyDown = (e) => {
    if (e.key === "ArrowLeft" || (e.key === "Backspace" && minute === "")) {
      e.preventDefault();
      hourRef.current?.focus();
      hourRef.current?.select();
    }
  };

  const showPlaceholder = !hour && !minute;

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    background: "var(--bg)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "11px 14px 11px 42px",
    cursor: "text",
    transition: "border-color .2s",
    ...style,
  };

  const inputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text2)",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
    width: 24,
    textAlign: "center",
    padding: 0,
    caretColor: "var(--accent)",
  };

  return (
    <div
      style={containerStyle}
      onClick={() => hourRef.current?.focus()}
      onFocus={(e) => e.currentTarget.style.borderColor = "#00d98b33"}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          e.currentTarget.style.borderColor = "var(--border)";
        }
      }}
    >
      {showPlaceholder ? (
        <span style={{ color: "var(--text4)", fontSize: 13, fontFamily: "DM Sans,sans-serif", flex: 1 }}>
          {placeholder || "HH:mm"}
        </span>
      ) : (
        <>
          <input
            ref={hourRef}
            style={inputStyle}
            value={hour}
            onChange={handleHourChange}
            onKeyDown={handleHourKeyDown}
            onFocus={(e) => e.target.select()}
            placeholder="HH"
            maxLength={2}
            inputMode="numeric"
            dir="ltr"
            type="text"
          />
          <span style={{ color: "var(--text3)", fontSize: 14, userSelect: "none", margin: "0 2px" }}>:</span>
          <input
            ref={minuteRef}
            style={inputStyle}
            value={minute}
            onChange={handleMinuteChange}
            onKeyDown={handleMinuteKeyDown}
            onFocus={(e) => e.target.select()}
            placeholder="mm"
            maxLength={2}
            inputMode="numeric"
            dir="ltr"
            type="text"
          />
        </>
      )}
    </div>
  );
}
