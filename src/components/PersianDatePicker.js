import { useState } from "react";
import jalaali from "jalaali-js";

const MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const DAYS = ["ش","ی","د","س","چ","پ","ج"];

function toFarsiNum(n) {
  return String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

export default function PersianDatePicker({ value, onChange, placeholder }) {
  const today = jalaali.toJalaali(new Date());
  const [open, setOpen] = useState(false);
  const [year, setYear]   = useState(today.jy);
  const [month, setMonth] = useState(today.jm);

  const daysInMonth = jalaali.jalaaliMonthLength(year, month);
  const firstDay = new Date(jalaali.toGregorian(year, month, 1).gy,
    jalaali.toGregorian(year, month, 1).gm - 1,
    jalaali.toGregorian(year, month, 1).gd).getDay();
  
  // تبدیل به شنبه اول
  const offset = (firstDay + 1) % 7;

  const selectDay = (day) => {
    const val = `${toFarsiNum(year)}/${toFarsiNum(String(month).padStart(2,'0'))}/${toFarsiNum(String(day).padStart(2,'0'))}`;
    onChange(val);
    setOpen(false);
  };

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        className="app-input"
        value={value}
        placeholder={placeholder || "انتخاب تاریخ"}
        readOnly
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer" }}
      />
      {open && (
        <div style={{
          position: "absolute", top: "110%", right: 0, zIndex: 999,
          background: "#0c1710", border: "0.5px solid #1e3828",
          borderRadius: 16, padding: 16, width: 280,
          boxShadow: "0 8px 32px #00000080"
        }}>
          {/* هدر ماه */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button onClick={nextMonth} style={{ background: "transparent", border: "none", color: "#00d98b", cursor: "pointer", fontSize: 18 }}>›</button>
            <span style={{ color: "#e0f0e8", fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}>
              {MONTHS[month - 1]} {toFarsiNum(year)}
            </span>
            <button onClick={prevMonth} style={{ background: "transparent", border: "none", color: "#00d98b", cursor: "pointer", fontSize: 18 }}>‹</button>
          </div>

          {/* روزهای هفته */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#2e4d3c", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* روزها */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                onClick={() => selectDay(day)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 2px",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#b8dcc8",
                  transition: "all .15s",
                }}
                onMouseEnter={e => e.target.style.background = "#1e3828"}
                onMouseLeave={e => e.target.style.background = "transparent"}
              >
                {toFarsiNum(day)}
              </button>
            ))}
          </div>

          {/* دکمه امروز */}
          <button
            onClick={() => { setYear(today.jy); setMonth(today.jm); selectDay(today.jd); }}
            style={{
              width: "100%", marginTop: 10, background: "#00d98b", border: "none",
              borderRadius: 8, padding: "8px", color: "#001a10",
              fontFamily: "Syne", fontWeight: 700, fontSize: 12, cursor: "pointer"
            }}
          >
            امروز
          </button>
        </div>
      )}
    </div>
  );
}