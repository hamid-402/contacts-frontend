import { useState, useEffect } from "react";
import { API, getUserProfile } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import jalaali from "jalaali-js";

const MONTHS_FA = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const MONTHS_EN = ["Farvardin","Ordibehesht","Khordad","Tir","Mordad","Shahrivar","Mehr","Aban","Azar","Dey","Bahman","Esfand"];
const DAYS_FA   = ["ش","ی","د","س","چ","پ","ج"];
const DAYS_EN   = ["Sa","Su","Mo","Tu","We","Th","Fr"];

function toFarsiNum(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

function todayJalaali() {
  return jalaali.toJalaali(new Date());
}

/* ── SVG آیکون‌ها ── */
const IconEdit    = () => <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>;
const IconTrash   = () => <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconPlus    = () => <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconChevL   = () => <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevR   = () => <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>;
const IconTitle   = () => <svg viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
const IconDesc    = () => <svg viewBox="0 0 24 24"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>;
const IconFlag    = () => <svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const IconClock   = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconTag     = () => <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IconPin     = () => <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconCal     = () => <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const PRIORITY_COLOR = { 1: "#e06060", 2: "#d4a017", 3: "#00d98b" };
const EVENT_COLOR    = { meeting: "#4ab8e0", call: "#00d98b", reminder: "#d4a017", other: "#9b7de8" };

export default function Calendar() {
  const { lang } = useSettings();
  const fa = lang === "fa";

  const today = todayJalaali();
  const [year,        setYear]        = useState(today.jy);
  const [month,       setMonth]       = useState(today.jm);
  const [selectedDay, setSelectedDay] = useState(today.jd);
  const [userId,      setUserId]      = useState(null);
  const [tasks,       setTasks]       = useState([]);
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showAddTask,  setShowAddTask]  = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editTask,    setEditTask]    = useState(null);
  const [editEvent,   setEditEvent]   = useState(null);

  /* فرم وظیفه */
  const [taskTitle,    setTaskTitle]    = useState("");
  const [taskPriority, setTaskPriority] = useState(2);
  const [taskStart,    setTaskStart]    = useState("");
  const [taskEnd,      setTaskEnd]      = useState("");

  /* فرم رویداد */
  const [evTitle, setEvTitle] = useState("");
  const [evDesc,  setEvDesc]  = useState("");
  const [evType,  setEvType]  = useState("meeting");
  const [evStart, setEvStart] = useState("");
  const [evEnd,   setEvEnd]   = useState("");

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) { setUserId(u.id); fetchAll(u.id); }
    });
  }, []);

  const fetchAll = async (uid) => {
    setLoading(true);
    try {
      const [t, e] = await Promise.all([
        fetch(`${API}/tasks?user_id=${uid}`).then((r) => r.json()),
        fetch(`${API}/events?user_id=${uid}`).then((r) => r.json()),
      ]);
      setTasks(Array.isArray(t) ? t : []);
      setEvents(Array.isArray(e) ? e : []);
    } catch { setTasks([]); setEvents([]); }
    setLoading(false);
  };

  /* تاریخ انتخاب‌شده به صورت رشته فارسی */
  const selectedDateStr = `${toFarsiNum(year)}/${toFarsiNum(String(month).padStart(2,"0"))}/${toFarsiNum(String(selectedDay).padStart(2,"0"))}`;

  const dayTasks  = tasks.filter((t) => t.due_date === selectedDateStr);
  const dayEvents = events.filter((e) => e.date === selectedDateStr);

  /* ── CRUD ── */
  const addTask = async () => {
    if (!taskTitle.trim()) return;
    await fetch(`${API}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId, title: taskTitle,
        priority: Number(taskPriority), due_date: selectedDateStr,
        start_time: taskStart || null, end_time: taskEnd || null, description: "",
      }),
    });
    setTaskTitle(""); setTaskPriority(2); setTaskStart(""); setTaskEnd("");
    setShowAddTask(false);
    fetchAll(userId);
  };

  const addEvent = async () => {
    if (!evTitle.trim()) return;
    await fetch(`${API}/events`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId, title: evTitle, description: evDesc,
        date: selectedDateStr, type: evType,
        start_time: evStart || null, end_time: evEnd || null,
      }),
    });
    setEvTitle(""); setEvDesc(""); setEvType("meeting"); setEvStart(""); setEvEnd("");
    setShowAddEvent(false);
    fetchAll(userId);
  };

  const deleteTask  = async (id) => { await fetch(`${API}/tasks/${id}`,  { method: "DELETE" }); fetchAll(userId); };
  const deleteEvent = async (id) => { await fetch(`${API}/events/${id}`, { method: "DELETE" }); fetchAll(userId); };

  const toggleTask = async (task) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: newStatus }),
    });
    fetchAll(userId);
  };

  const saveEditTask = async () => {
    await fetch(`${API}/tasks/${editTask.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editTask),
    });
    setEditTask(null); fetchAll(userId);
  };

  const saveEditEvent = async () => {
    await fetch(`${API}/events/${editEvent.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editEvent),
    });
    setEditEvent(null); fetchAll(userId);
  };

  /* ── ساختار تقویم ── */
  const daysInMonth    = jalaali.jalaaliMonthLength(year, month);
  const greg           = jalaali.toGregorian(year, month, 1);
  const firstDayOfWeek = new Date(greg.gy, greg.gm - 1, greg.gd).getDay();
  const offset         = (firstDayOfWeek + 1) % 7;

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); } else setMonth((m) => m - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); } else setMonth((m) => m + 1);
    setSelectedDay(1);
  };

  const getDayStr = (d) =>
    `${toFarsiNum(year)}/${toFarsiNum(String(month).padStart(2,"0"))}/${toFarsiNum(String(d).padStart(2,"0"))}`;

  const hasTasks  = (d) => tasks.some((t) => t.due_date === getDayStr(d));
  const hasEvents = (d) => events.some((e) => e.date    === getDayStr(d));

  /* ── متن‌های دوزبانه ── */
  const txt = {
    calTitle:    fa ? "تقویم"          : "Calendar",
    task:        fa ? "وظیفه"          : "Task",
    event:       fa ? "رویداد"         : "Event",
    tasks:       fa ? "وظایف"          : "Tasks",
    events:      fa ? "رویدادها"       : "Events",
    addTask:     fa ? "+ وظیفه"        : "+ Task",
    addEvent:    fa ? "+ رویداد"       : "+ Event",
    save:        fa ? "ذخیره"          : "Save",
    cancel:      fa ? "انصراف"         : "Cancel",
    noSchedule:  fa ? "برنامه‌ای برای این روز ندارید" : "Nothing scheduled for this day",
    taskTitle:   fa ? "عنوان وظیفه"   : "Task title",
    evTitle:     fa ? "عنوان رویداد"  : "Event title",
    evDesc:      fa ? "توضیحات"        : "Description",
    priority:    fa ? "اولویت"         : "Priority",
    startTime:   fa ? "ساعت شروع"     : "Start time",
    endTime:     fa ? "ساعت پایان"    : "End time",
    evType:      fa ? "نوع رویداد"    : "Event type",
    urgent:      fa ? "فوری"          : "Urgent",
    normal:      fa ? "معمولی"        : "Normal",
    low:         fa ? "کم اهمیت"      : "Low",
    meeting:     fa ? "جلسه"          : "Meeting",
    call:        fa ? "تماس"          : "Call",
    reminder:    fa ? "یادآوری"       : "Reminder",
    other:       fa ? "سایر"          : "Other",
    legendTask:  fa ? "وظیفه"         : "Task",
    legendEvent: fa ? "رویداد/جلسه"   : "Event",
    to:          fa ? "تا"             : "to",
    newTask:     fa ? "وظیفه جدید برای" : "New task for",
    newEvent:    fa ? "رویداد جدید برای" : "New event for",
    editTask:    fa ? "ویرایش وظیفه"  : "Edit task",
    editEvent:   fa ? "ویرایش رویداد" : "Edit event",
  };

  const MONTHS = fa ? MONTHS_FA : MONTHS_EN;
  const DAYS   = fa ? DAYS_FA   : DAYS_EN;

  const priorityLabel = (p) => ({ 1: txt.urgent, 2: txt.normal, 3: txt.low }[p]);
  const eventTypeLabel = (t) => ({ meeting: txt.meeting, call: txt.call, reminder: txt.reminder, other: txt.other }[t] || t);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">{txt.calTitle}</h2>
      </div>

      {/* ── تقویم ماهانه ── */}
      <div className="panel" style={{ marginBottom: 16 }}>

        {/* هدر ماه */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <button onClick={nextMonth} className="tb-icon-btn"><IconChevR /></button>
          <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:15, color:"var(--text1)" }}>
            {MONTHS[month - 1]} {fa ? toFarsiNum(year) : year}
          </span>
          <button onClick={prevMonth} className="tb-icon-btn"><IconChevL /></button>
        </div>

        {/* روزهای هفته */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6 }}>
          {DAYS.map((d) => (
            <div key={d} style={{ textAlign:"center", fontSize:11, color:"var(--text3)", padding:"3px 0" }}>{d}</div>
          ))}
        </div>

        {/* روزها */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
          {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const isToday    = day === today.jd && month === today.jm && year === today.jy;
            const isSelected = day === selectedDay;
            const _hasTasks  = hasTasks(day);
            const _hasEvents = hasEvents(day);
            return (
              <button key={day} onClick={() => setSelectedDay(day)} style={{
                background: isSelected ? "var(--accent)" : isToday ? "var(--bg4)" : "transparent",
                border: isToday && !isSelected ? "0.5px solid #00d98b33" : "none",
                borderRadius: 9,
                padding: "7px 2px 4px",
                cursor: "pointer",
                fontSize: 12,
                color: isSelected ? "#001a10" : isToday ? "var(--accent)" : "var(--text2)",
                fontWeight: isToday || isSelected ? 700 : 400,
                fontFamily: fa ? "inherit" : "DM Sans, sans-serif",
                transition: "all .15s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              }}>
                {fa ? toFarsiNum(day) : day}
                <div style={{ display:"flex", gap:2 }}>
                  {_hasTasks  && <div style={{ width:4, height:4, borderRadius:"50%", background: isSelected ? "#001a10" : "var(--accent)" }} />}
                  {_hasEvents && <div style={{ width:4, height:4, borderRadius:"50%", background: isSelected ? "#001a10" : "var(--blue)" }} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* راهنما */}
        <div style={{ display:"flex", gap:16, marginTop:12, fontSize:11, color:"var(--text3)" }}>
          <span><span style={{ color:"var(--accent)" }}>●</span> {txt.legendTask}</span>
          <span><span style={{ color:"var(--blue)" }}>●</span> {txt.legendEvent}</span>
        </div>
      </div>

      {/* ── روز انتخاب‌شده ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:14, color:"var(--text1)" }}>
          {selectedDateStr}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button className="btn-primary" style={{ fontSize:11, padding:"6px 12px" }}
            onClick={() => { setShowAddTask(!showAddTask); setShowAddEvent(false); }}>
            <IconPlus />{txt.addTask}
          </button>
          <button className="btn-primary"
            style={{ fontSize:11, padding:"6px 12px", background:"transparent", border:"0.5px solid #4ab8e033", color:"var(--blue)" }}
            onClick={() => { setShowAddEvent(!showAddEvent); setShowAddTask(false); }}>
            <IconPlus />{txt.addEvent}
          </button>
        </div>
      </div>

      {/* ── فرم وظیفه ── */}
      {showAddTask && (
        <div className="panel" style={{ marginBottom:12 }}>
          <div className="panel-label">{txt.newTask} {selectedDateStr}</div>
          <div className="input-wrap">
            <span className="input-icon"><IconTitle /></span>
            <input className="app-input" placeholder={txt.taskTitle} value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)} />
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconFlag /></span>
            <select className="app-input" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
              <option value={1}>{txt.urgent}</option>
              <option value={2}>{txt.normal}</option>
              <option value={3}>{txt.low}</option>
            </select>
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconClock /></span>
            <input className="app-input" type="time" value={taskStart} onChange={(e) => setTaskStart(e.target.value)} />
          </div>
          <div className="input-wrap" style={{ marginBottom:0 }}>
            <span className="input-icon"><IconClock /></span>
            <input className="app-input" type="time" value={taskEnd} onChange={(e) => setTaskEnd(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button className="btn-cancel" onClick={() => setShowAddTask(false)}>{txt.cancel}</button>
            <button className="btn-save" onClick={addTask}>{txt.save}</button>
          </div>
        </div>
      )}

      {/* ── فرم رویداد ── */}
      {showAddEvent && (
        <div className="panel" style={{ marginBottom:12, borderColor:"#4ab8e022" }}>
          <div className="panel-label" style={{ color:"var(--blue)" }}>{txt.newEvent} {selectedDateStr}</div>
          <div className="input-wrap">
            <span className="input-icon"><IconPin /></span>
            <input className="app-input" placeholder={txt.evTitle} value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)} />
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconDesc /></span>
            <input className="app-input" placeholder={txt.evDesc} value={evDesc}
              onChange={(e) => setEvDesc(e.target.value)} />
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconTag /></span>
            <select className="app-input" value={evType} onChange={(e) => setEvType(e.target.value)}>
              <option value="meeting">{txt.meeting}</option>
              <option value="call">{txt.call}</option>
              <option value="reminder">{txt.reminder}</option>
              <option value="other">{txt.other}</option>
            </select>
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconClock /></span>
            <input className="app-input" type="time" value={evStart} onChange={(e) => setEvStart(e.target.value)} />
          </div>
          <div className="input-wrap" style={{ marginBottom:0 }}>
            <span className="input-icon"><IconClock /></span>
            <input className="app-input" type="time" value={evEnd} onChange={(e) => setEvEnd(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button className="btn-cancel" onClick={() => setShowAddEvent(false)}>{txt.cancel}</button>
            <button className="btn-save" style={{ background:"var(--blue)", color:"#fff" }} onClick={addEvent}>{txt.save}</button>
          </div>
        </div>
      )}

      {/* ── وظایف روز ── */}
      {dayTasks.length > 0 && (
        <div style={{ marginBottom:14 }}>
          <div className="section-title" style={{ marginBottom:8 }}>{txt.tasks}</div>
          <div className="contact-list">
            {dayTasks.map((task) => (
              <div key={task.id} className="contact-item">
                <button onClick={() => toggleTask(task)} style={{
                  width:22, height:22, borderRadius:6, flexShrink:0,
                  border:`1.5px solid ${task.status === "done" ? "var(--accent)" : "var(--border2)"}`,
                  background: task.status === "done" ? "var(--accent)" : "transparent",
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#001a10", transition:"all .15s",
                }}>
                  {task.status === "done" && (
                    <svg viewBox="0 0 24 24" style={{ width:11, height:11, stroke:"#001a10", fill:"none", strokeWidth:3 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
                <div className="contact-info">
                  <div className="contact-name" style={{
                    textDecoration: task.status === "done" ? "line-through" : "none",
                    opacity: task.status === "done" ? 0.45 : 1,
                  }}>
                    {task.title}
                    <span className="cat-badge" style={{
                      color: PRIORITY_COLOR[task.priority],
                      borderColor: `${PRIORITY_COLOR[task.priority]}33`,
                      marginRight:6, fontSize:10,
                    }}>
                      {priorityLabel(task.priority)}
                    </span>
                  </div>
                  {task.start_time && (
                    <div className="contact-phone" style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <svg viewBox="0 0 24 24" style={{ width:11, height:11, stroke:"var(--text3)", fill:"none", strokeWidth:2 }}>
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {task.start_time.slice(0,5)}
                      {task.end_time && ` ${txt.to} ${task.end_time.slice(0,5)}`}
                    </div>
                  )}
                </div>
                <div className="actions">
                  <button className="btn-icon btn-edit" onClick={() => setEditTask(task)}><IconEdit /></button>
                  <button className="btn-icon btn-del"  onClick={() => deleteTask(task.id)}><IconTrash /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── رویدادهای روز ── */}
      {dayEvents.length > 0 && (
        <div style={{ marginBottom:14 }}>
          <div className="section-title" style={{ marginBottom:8 }}>{txt.events}</div>
          <div className="contact-list">
            {dayEvents.map((ev) => (
              <div key={ev.id} className="contact-item">
                <div style={{ width:10, height:10, borderRadius:"50%", background: EVENT_COLOR[ev.type] || "var(--blue)", flexShrink:0 }} />
                <div className="contact-info">
                  <div className="contact-name">
                    {ev.title}
                    <span className="cat-badge" style={{ color: EVENT_COLOR[ev.type], borderColor:`${EVENT_COLOR[ev.type]}33`, marginRight:6, fontSize:10 }}>
                      {eventTypeLabel(ev.type)}
                    </span>
                  </div>
                  {ev.description && <div className="contact-phone">{ev.description}</div>}
                  {ev.start_time && (
                    <div className="contact-phone" style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <svg viewBox="0 0 24 24" style={{ width:11, height:11, stroke:"var(--text3)", fill:"none", strokeWidth:2 }}>
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {ev.start_time.slice(0,5)}
                      {ev.end_time && ` ${txt.to} ${ev.end_time.slice(0,5)}`}
                    </div>
                  )}
                </div>
                <div className="actions">
                  <button className="btn-icon btn-edit" onClick={() => setEditEvent(ev)}><IconEdit /></button>
                  <button className="btn-icon btn-del"  onClick={() => deleteEvent(ev.id)}><IconTrash /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── خالی ── */}
      {dayTasks.length === 0 && dayEvents.length === 0 && !showAddTask && !showAddEvent && (
        <div className="empty-state">
          <div className="empty-icon"><IconCal /></div>
          <p>{txt.noSchedule}</p>
        </div>
      )}

      {/* ── مودال ویرایش وظیفه ── */}
      {editTask && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditTask(null)}>
          <div className="modal">
            <h3 className="modal-title">{txt.editTask}</h3>
            <div className="input-wrap"><span className="input-icon"><IconTitle /></span>
              <input className="app-input" value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} placeholder={txt.taskTitle} />
            </div>
            <div className="input-wrap"><span className="input-icon"><IconFlag /></span>
              <select className="app-input" value={editTask.priority}
                onChange={(e) => setEditTask({ ...editTask, priority: Number(e.target.value) })}>
                <option value={1}>{txt.urgent}</option>
                <option value={2}>{txt.normal}</option>
                <option value={3}>{txt.low}</option>
              </select>
            </div>
            <div className="input-wrap"><span className="input-icon"><IconClock /></span>
              <input className="app-input" type="time" value={editTask.start_time ? editTask.start_time.slice(0,5) : ""}
                onChange={(e) => setEditTask({ ...editTask, start_time: e.target.value })} />
            </div>
            <div className="input-wrap" style={{ marginBottom:0 }}><span className="input-icon"><IconClock /></span>
              <input className="app-input" type="time" value={editTask.end_time ? editTask.end_time.slice(0,5) : ""}
                onChange={(e) => setEditTask({ ...editTask, end_time: e.target.value })} />
            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setEditTask(null)}>{txt.cancel}</button>
              <button className="btn-save" onClick={saveEditTask}>{txt.save}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── مودال ویرایش رویداد ── */}
      {editEvent && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditEvent(null)}>
          <div className="modal">
            <h3 className="modal-title">{txt.editEvent}</h3>
            <div className="input-wrap"><span className="input-icon"><IconPin /></span>
              <input className="app-input" value={editEvent.title}
                onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })} placeholder={txt.evTitle} />
            </div>
            <div className="input-wrap"><span className="input-icon"><IconDesc /></span>
              <input className="app-input" value={editEvent.description || ""}
                onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })} placeholder={txt.evDesc} />
            </div>
            <div className="input-wrap"><span className="input-icon"><IconTag /></span>
              <select className="app-input" value={editEvent.type}
                onChange={(e) => setEditEvent({ ...editEvent, type: e.target.value })}>
                <option value="meeting">{txt.meeting}</option>
                <option value="call">{txt.call}</option>
                <option value="reminder">{txt.reminder}</option>
                <option value="other">{txt.other}</option>
              </select>
            </div>
            <div className="input-wrap"><span className="input-icon"><IconClock /></span>
              <input className="app-input" type="time" value={editEvent.start_time ? editEvent.start_time.slice(0,5) : ""}
                onChange={(e) => setEditEvent({ ...editEvent, start_time: e.target.value })} />
            </div>
            <div className="input-wrap" style={{ marginBottom:0 }}><span className="input-icon"><IconClock /></span>
              <input className="app-input" type="time" value={editEvent.end_time ? editEvent.end_time.slice(0,5) : ""}
                onChange={(e) => setEditEvent({ ...editEvent, end_time: e.target.value })} />
            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setEditEvent(null)}>{txt.cancel}</button>
              <button className="btn-save" style={{ background:"var(--blue)", color:"#fff" }} onClick={saveEditEvent}>{txt.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
