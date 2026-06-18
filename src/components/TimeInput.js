import { useState, useEffect } from "react";

export default function TimeInput({ value, onChange, placeholder, style }) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (value) setText(value.slice(0, 5));
    else setText("");
  }, [value]);

  const handleChange = (e) => {
    let v = e.target.value;
    
    // فقط عدد و : قبول کن
    v = v.replace(/[^\d:]/g, "");
    
    // خودکار : اضافه کن بعد از ۲ رقم
    if (v.length === 2 && !v.includes(":") && text.length === 1) {
      v = v + ":";
    }
    
    // حداکثر ۵ کاراکتر (HH:mm)
    if (v.length > 5) return;
    
    setText(v);
    
    // اگه فرمت کامل بود emit کن
    if (/^\d{2}:\d{2}$/.test(v)) {
      const [h, m] = v.split(":").map(Number);
      if (h <= 23 && m <= 59) onChange(v);
    } else if (v === "") {
      onChange("");
    }
  };

  const handleBlur = () => {
    // موقع blur اگه نیمه‌کامل بود تلاش کن درست کنی
    if (!text) return;
    
    let v = text.replace(/[^\d:]/g, "");
    
    if (/^\d{1,2}$/.test(v)) {
      // فقط ساعت
      const h = parseInt(v, 10);
      if (h <= 23) { const formatted = `${String(h).padStart(2,"0")}:00`; setText(formatted); onChange(formatted); }
      else { setText(""); onChange(""); }
    } else if (/^\d{1,2}:\d{1,2}$/.test(v)) {
      const [h, m] = v.split(":").map(Number);
      if (h <= 23 && m <= 59) {
        const formatted = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
        setText(formatted);
        onChange(formatted);
      } else { setText(""); onChange(""); }
    } else if (v !== text) {
      setText(""); onChange("");
    }
  };

  return (
    <input
      className="app-input"
      type="text"
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder || "HH:mm"}
      maxLength={5}
      inputMode="numeric"
      dir="ltr"
      style={{ ...style }}
    />
  );
}
