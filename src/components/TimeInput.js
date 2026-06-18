import { useState, useEffect, useRef } from "react";

export default function TimeInput({ value, onChange, placeholder, style }) {
  const [hour,    setHour]    = useState("");
  const [minute,  setMinute]  = useState("");
  const [active,  setActive]  = useState(false);
  const hourRef   = useRef(null);
  const minuteRef = useRef(null);
  const wrapRef   = useRef(null);

  useEffect(() => {
    if (value) {
      const parts = value.split(":");
      setHour(parts[0] || "");
      setMinute(parts[1] ? parts[1].slice(0, 2) : "");
    } else {
      setHour(""); setMinute("");
    }
  }, [value]);

  const emitValue = (h, m) => {
    if (!h && !m) { onChange(""); return; }
    onChange(`${(h||"00").padStart(2,"0")}:${(m||"00").padStart(2,"0")}`);
  };

  const handleHourChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") { setHour(""); emitValue("", minute); return; }
    const v = raw.length > 2 ? raw.slice(-1) : raw;
    if (parseInt(v,10) > 23) return;
    setHour(v);
    emitValue(v, minute);
    if (v.length === 2 || parseInt(v,10) > 2) {
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinuteChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") { setMinute(""); emitValue(hour, ""); return; }
    const v = raw.length > 2 ? raw.slice(-1) : raw;
    if (parseInt(v,10) > 59) return;
    setMinute(v);
    emitValue(hour, v);
  };

  const handleHourKey = (e) => {
    if (e.key === ":" || e.key === "Tab" || e.key === "ArrowRight") {
      e.preventDefault();
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinuteKey = (e) => {
    if (e.key === "ArrowLeft" || (e.key === "Backspace" && minute === "")) {
      e.preventDefault();
      hourRef.current?.focus();
      hourRef.current?.select();
    }
  };

  const showPlaceholder = !hour && !minute && !active;

  return (
    <div
      ref={wrapRef}
      style={{
        display: "flex", alignItems: "center",
        background: "var(--bg)",
        border: `0.5px solid ${active ? "#00d98b33" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: "11px 14px 11px 42px",
        cursor: "text",
        boxShadow: active ? "0 0 0 3px #00d98b08" : "none",
        transition: "border-color .2s, box-shadow .2s",
        position: "relative",
        minHeight: 44,
        ...style,
      }}
      onClick={() => { setActive(true); hourRef.current?.focus(); }}
    >
      {/* placeholder */}
      {showPlaceholder && (
        <span style={{
          position: "absolute", left: 42, right: 14,
          color: "var(--text4)", fontSize: 13,
          fontFamily: "DM Sans,sans-serif",
          pointerEvents: "none",
        }}>
          {placeholder || "HH:mm"}
        </span>
      )}

      {/* inputs — همیشه render میشن ولی پنهانن */}
      <div style={{ display: "flex", alignItems: "center", opacity: showPlaceholder ? 0 : 1 }}>
        <input
          ref={hourRef}
          value={hour}
          onChange={handleHourChange}
          onKeyDown={handleHourKey}
          onFocus={() => setActive(true)}
          onBlur={(e) => {
            if (!wrapRef.current?.contains(e.relatedTarget)) setActive(false);
          }}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "var(--text2)", fontFamily: "DM Sans,sans-serif",
            fontSize: 13, width: 26, textAlign: "center", padding: 0,
          }}
          placeholder="HH"
          maxLength={2}
          inputMode="numeric"
          type="text"
          dir="ltr"
        />
        <span style={{ color: "var(--text3)", fontSize: 14, userSelect: "none", margin: "0 2px" }}>:</span>
        <input
          ref={minuteRef}
          value={minute}
          onChange={handleMinuteChange}
          onKeyDown={handleMinuteKey}
          onFocus={() => setActive(true)}
          onBlur={(e) => {
            if (!wrapRef.current?.contains(e.relatedTarget)) setActive(false);
          }}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "var(--text2)", fontFamily: "DM Sans,sans-serif",
            fontSize: 13, width: 26, textAlign: "center", padding: 0,
          }}
          placeholder="mm"
          maxLength={2}
          inputMode="numeric"
          type="text"
          dir="ltr"
        />
      </div>
    </div>
  );
}
