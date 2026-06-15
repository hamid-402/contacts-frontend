import { useState, useEffect } from "react";
import { API, getUserProfile } from "../components/shared";
import jalaali from "jalaali-js";
import PersianDatePicker from "../components/PersianDatePicker";

const MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const DAYS = ["ش","ی","د","س","چ","پ","ج"];

function toFarsiNum(n) {
  return String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

function todayJalaali() {
  return jalaali.toJalaali(new Date());
}

export default function Calendar() {
  const today = todayJalaali();
  const [year, setYear]         = useState(today.jy);
  const [month, setMonth]       = useState(today.jm);
  const [selectedDay, setSelectedDay] = useState(today.jd);
  const [userId, setUserId]     = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAddTask, setShowAddTask]   = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  // فرم وظیفه
  const [taskTitle, setTaskTitle]       = useState("");
  const [taskPriority, setTaskPriority] = useState(2);
  const [taskStart, setTaskStart]       = useState("");
  const [taskEnd, setTaskEnd]           = useState("");

  // فرم رویداد
  const [eventTitle, setEventTitle]         = useState("");
  const [eventDesc, setEventDesc]           = useState("");
  const [eventType, setEventType]           = useState("meeting");
  const [eventStart, setEventStart]         = useState("");
  const [eventEnd, setEventEnd]             = useState("");

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) {
        setUserId(u.id);
        fetchAll(u.id);
      }
    });
  }, []);

  const fetchAll = async (uid) => {
    setLoading(true);
    try {
      const [t, e] = await Promise.all([
        fetch(`${API}/tasks?user_id=${uid}`).then(r => r.json()),
        fetch(`${API}/events?user_id=${uid}`).then(r => r.json()),
      ]);
      setTasks(Array.isArray(t) ? t : []);
      setEvents(Array.isArray(e) ? e : []);
    } catch { setTasks([]); setEvents([]); }
    setLoading(false);
  };

  const selectedDateStr = `${toFarsiNum(year)}/${toFarsiNum(String(month).padStart(2,'0'))}/${toFarsiNum(String(selectedDay).padStart(2,'0'))}`;

  const dayTasks  = tasks.filter(t => t.due_date === selectedDateStr);
  const dayEvents = events.filter(e => e.date === selectedDateStr);

  const addTask = async () => {
    if (!taskTitle.trim()) return;
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        title: taskTitle,
        priority: Number(taskPriority),
        due_date: selectedDateStr,
        start_time: taskStart || null,
        end_time: taskEnd || null,
        description: "",
      }),
    });
    setTaskTitle(""); setTaskPriority(2); setTaskStart(""); setTaskEnd("");
    setShowAddTask(false);
    fetchAll(userId);
  };

  const addEvent = async () => {
    if (!eventTitle.trim()) return;
    await fetch(`${API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        title: eventTitle,
        description: eventDesc,
        date: selectedDateStr,
        start_time: eventStart || null,
        end_time: eventEnd || null,
        type: eventType,
      }),
    });
    setEventTitle(""); setEventDesc(""); setEventType("meeting");
    setEventStart(""); setEventEnd("");
    setShowAddEvent(false);
    fetchAll(userId);
  };

  const deleteTask = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    fetchAll(userId);
  };

  const deleteEvent = async (id) => {
    await fetch(`${API}/events/${id}`, { method: "DELETE" });
    fetchAll(userId);
  };

  const toggleTask = async (task) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: newStatus }),
    });
    fetchAll(userId);
  };

  // ساختار تقویم
  const daysInMonth = jalaali.jalaaliMonthLength(year, month);
  const greg = jalaali.toGregorian(year, month, 1);
  const firstDayOfWeek = new Date(greg.gy, greg.gm - 1, greg.gd).getDay();
  const offset = (firstDayOfWeek + 1) % 7;

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDay(1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDay(1);
  };

  const getDayStr = (d) => `${toFarsiNum(year)}/${toFarsiNum(String(month).padStart(2,'0'))}/${toFarsiNum(String(d).padStart(2,'0'))}`;

  const hasTasks  = (d) => tasks.some(t => t.due_date === getDayStr(d));
  const hasEvents = (d) => events.some(e => e.date === getDayStr(d));

  const priorityColor = { 1: "#e06060", 2: "#d4a017", 3: "#00d98b" };
  const priorityLabel = { 1: "🔴 فوری", 2: "🟡 معمولی", 3: "🟢 کم اهمیت" };
  const eventTypeLabel = { meeting: "جلسه", call: "تماس", reminder: "یادآوری", other: "سایر" };
  const eventTypeColor = { meeting: "#4ab8e0", call: "#00d98b", reminder: "#d4a017", other: "#7c6fcd" };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">تقویم</h2>
      </div>

      {/* تقویم ماهانه */}
      <div className="panel" style={{ marginBottom: 16 }}>
        {/* هدر ماه */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={nextMonth} style={{ background: "transparent", border: "none", color: "#00d98b", cursor: "pointer", fontSize: 22 }}>›</button>
          <span style={{ color: "#e0f0e8", fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}>
            {MONTHS[month - 1]} {toFarsiNum(year)}
          </span>
          <button onClick={prevMonth} style={{ background: "transparent", border: "none", color: "#00d98b", cursor: "pointer", fontSize: 22 }}>‹</button>
        </div>

        {/* روزهای هفته */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, color: "#2e4d3c", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* روزها */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isToday = day === today.jd && month === today.jm && year === today.jy;
            const isSelected = day === selectedDay;
            const _hasTasks = hasTasks(day);
            const _hasEvents = hasEvents(day);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  background: isSelected ? "#00d98b" : isToday ? "#0f2018" : "transparent",
                  border: isToday && !isSelected ? "0.5px solid #00d98b44" : "none",
                  borderRadius: 10,
                  padding: "8px 2px 4px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: isSelected ? "#001a10" : "#b8dcc8",
                  fontWeight: isToday || isSelected ? 700 : 400,
                  transition: "all .15s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {toFarsiNum(day)}
                <div style={{ display: "flex", gap: 2 }}>
                  {_hasTasks  && <div style={{ width: 4, height: 4, borderRadius: "50%", background: isSelected ? "#001a10" : "#00d98b" }} />}
                  {_hasEvents && <div style={{ width: 4, height: 4, borderRadius: "50%", background: isSelected ? "#001a10" : "#4ab8e0" }} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* راهنما */}
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "#2e4d3c" }}>
          <span><span style={{ color: "#00d98b" }}>●</span> وظیفه</span>
          <span><span style={{ color: "#4ab8e0" }}>●</span> رویداد/جلسه</span>
        </div>
      </div>

      {/* روز انتخاب شده */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ color: "#e0f0e8", fontFamily: "Syne", fontWeight: 700, fontSize: 15 }}>
          {selectedDateStr}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-icon btn-edit" style={{ width: "auto", padding: "6px 12px", fontSize: 12 }}
            onClick={() => { setShowAddTask(!showAddTask); setShowAddEvent(false); }}>
            + وظیفه
          </button>
          <button className="btn-icon" style={{ width: "auto", padding: "6px 12px", fontSize: 12, color: "#4ab8e0", borderColor: "#4ab8e033" }}
            onClick={() => { setShowAddEvent(!showAddEvent); setShowAddTask(false); }}>
            + رویداد
          </button>
        </div>
      </div>

      {/* فرم اضافه کردن وظیفه */}
      {showAddTask && (
        <div className="panel" style={{ marginBottom: 12 }}>
          <div className="panel-label">وظیفه جدید برای {selectedDateStr}</div>
          <div className="input-wrap"><span className="input-icon">📝</span>
            <input className="app-input" placeholder="عنوان وظیفه" value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)} />
          </div>
          <div className="input-wrap"><span className="input-icon">⚡</span>
            <select className="app-input" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
              <option value={1}>🔴 فوری</option>
              <option value={2}>🟡 معمولی</option>
              <option value={3}>🟢 کم اهمیت</option>
            </select>
          </div>
          <div className="input-wrap"><span className="input-icon">🕐</span>
            <input className="app-input" type="time" value={taskStart} onChange={(e) => setTaskStart(e.target.value)} />
          </div>
          <div className="input-wrap" style={{ marginBottom: 0 }}><span className="input-icon">🕔</span>
            <input className="app-input" type="time" value={taskEnd} onChange={(e) => setTaskEnd(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn-save" style={{ flex: 1 }} onClick={addTask}>ذخیره</button>
            <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setShowAddTask(false)}>انصراف</button>
          </div>
        </div>
      )}

      {/* فرم اضافه کردن رویداد */}
      {showAddEvent && (
        <div className="panel" style={{ marginBottom: 12 }}>
          <div className="panel-label">رویداد جدید برای {selectedDateStr}</div>
          <div className="input-wrap"><span className="input-icon">📌</span>
            <input className="app-input" placeholder="عنوان رویداد" value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)} />
          </div>
          <div className="input-wrap"><span className="input-icon">📄</span>
            <input className="app-input" placeholder="توضیحات (اختیاری)" value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)} />
          </div>
          <div className="input-wrap"><span className="input-icon">🏷️</span>
            <select className="app-input" value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <option value="meeting">جلسه</option>
              <option value="call">تماس</option>
              <option value="reminder">یادآوری</option>
              <option value="other">سایر</option>
            </select>
          </div>
          <div className="input-wrap"><span className="input-icon">🕐</span>
            <input className="app-input" type="time" value={eventStart} onChange={(e) => setEventStart(e.target.value)} />
          </div>
          <div className="input-wrap" style={{ marginBottom: 0 }}><span className="input-icon">🕔</span>
            <input className="app-input" type="time" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn-save" style={{ flex: 1 }} onClick={addEvent}>ذخیره</button>
            <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setShowAddEvent(false)}>انصراف</button>
          </div>
        </div>
      )}

      {/* لیست وظایف روز */}
      {dayTasks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>وظایف</div>
          <div className="contact-list">
            {dayTasks.map(task => (
              <div key={task.id} className="contact-item">
                <button onClick={() => toggleTask(task)} style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `1.5px solid ${task.status === "done" ? "#00d98b" : "#2e4d3c"}`,
                  background: task.status === "done" ? "#00d98b" : "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#001a10", fontSize: 12,
                }}>
                  {task.status === "done" ? "✓" : ""}
                </button>
                <div className="contact-info">
                  <div className="contact-name" style={{ textDecoration: task.status === "done" ? "line-through" : "none", opacity: task.status === "done" ? 0.5 : 1 }}>
                    {task.title}
                    <span className="cat-badge" style={{ color: priorityColor[task.priority], borderColor: `${priorityColor[task.priority]}33`, marginRight: 6, fontSize: 10 }}>
                      {priorityLabel[task.priority]}
                    </span>
                  </div>
                  {task.start_time && <div className="contact-phone">🕐 {task.start_time.slice(0,5)}{task.end_time ? ` تا ${task.end_time.slice(0,5)}` : ""}</div>}
                </div>
                <button className="btn-icon btn-del" onClick={() => deleteTask(task.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* لیست رویدادهای روز */}
      {dayEvents.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>رویدادها</div>
          <div className="contact-list">
            {dayEvents.map(event => (
              <div key={event.id} className="contact-item">
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: eventTypeColor[event.type] || "#4ab8e0", flexShrink: 0 }} />
                <div className="contact-info">
                  <div className="contact-name">
                    {event.title}
                    <span className="cat-badge" style={{ color: eventTypeColor[event.type], borderColor: `${eventTypeColor[event.type]}33`, marginRight: 6, fontSize: 10 }}>
                      {eventTypeLabel[event.type]}
                    </span>
                  </div>
                  {event.description && <div className="contact-phone">{event.description}</div>}
                  {event.start_time && <div className="contact-phone">🕐 {event.start_time.slice(0,5)}{event.end_time ? ` تا ${event.end_time.slice(0,5)}` : ""}</div>}
                </div>
                <button className="btn-icon btn-del" onClick={() => deleteEvent(event.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* اگه روز خالی باشه */}
      {dayTasks.length === 0 && dayEvents.length === 0 && !showAddTask && !showAddEvent && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>برنامه‌ای برای این روز ندارید</p>
        </div>
      )}
    </div>
  );
}