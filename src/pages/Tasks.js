import { useState, useEffect } from "react";
import { API, getUserProfile } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import PersianDatePicker from "../components/PersianDatePicker";
import TimeInput from "../components/TimeInput";

/* ── SVG آیکون‌ها ── */
const IconPlus     = () => <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit     = () => <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>;
const IconTrash    = () => <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconTitle    = () => <svg viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
const IconDesc     = () => <svg viewBox="0 0 24 24"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>;
const IconFlag     = () => <svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const IconCal      = () => <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconClock    = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheck    = () => <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const IconPin      = () => <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconTag      = () => <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;

/* ── اولویت ── */
const PRIORITY_COLOR = { 1: "#e06060", 2: "#d4a017", 3: "#00d98b" };

function priorityLabel(p, lang) {
  if (lang === "fa") return { 1: "فوری", 2: "معمولی", 3: "کم اهمیت" }[p];
  return { 1: "Urgent", 2: "Normal", 3: "Low" }[p];
}

/* ── نوع رویداد ── */
function eventTypeLabel(type, lang) {
  const fa = { meeting: "جلسه", call: "تماس", reminder: "یادآوری", other: "سایر" };
  const en = { meeting: "Meeting", call: "Call", reminder: "Reminder", other: "Other" };
  return (lang === "fa" ? fa : en)[type] || type;
}

/* ══════════════════════════════════════════
   TASKS PAGE
══════════════════════════════════════════ */
export default function Tasks() {
  const { lang } = useSettings();

  /* ── state وظایف ── */
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [userId,      setUserId]      = useState(null);
  const [filter,      setFilter]      = useState("all");
  const [editTarget,  setEditTarget]  = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [showEvent,   setShowEvent]   = useState(false);

  /* ── فرم وظیفه ── */
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [priority,    setPriority]    = useState(2);
  const [dueDate,     setDueDate]     = useState("");
  const [startTime,   setStartTime]   = useState("");
  const [endTime,     setEndTime]     = useState("");

  /* ── فرم رویداد ── */
  const [evTitle,     setEvTitle]     = useState("");
  const [evDesc,      setEvDesc]      = useState("");
  const [evType,      setEvType]      = useState("meeting");
  const [evDate,      setEvDate]      = useState("");
  const [evStart,     setEvStart]     = useState("");
  const [evEnd,       setEvEnd]       = useState("");

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) { setUserId(u.id); fetchTasks(u.id); }
    });
  }, []);

  const fetchTasks = async (uid) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/tasks?user_id=${uid}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch { setTasks([]); }
    setLoading(false);
  };

  const addTask = async () => {
    if (!title.trim()) return;
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId, title: title.trim(), description,
        priority: Number(priority),
        due_date: dueDate || null,
        start_time: startTime || null,
        end_time:   endTime   || null,
      }),
    });
    setTitle(""); setDescription(""); setPriority(2);
    setDueDate(""); setStartTime(""); setEndTime("");
    setShowForm(false);
    fetchTasks(userId);
  };

  const addEvent = async () => {
    if (!evTitle.trim() || !evDate) return;
    await fetch(`${API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId, title: evTitle.trim(), description: evDesc,
        date: evDate, type: evType,
        start_time: evStart || null,
        end_time:   evEnd   || null,
      }),
    });
    setEvTitle(""); setEvDesc(""); setEvType("meeting");
    setEvDate(""); setEvStart(""); setEvEnd("");
    setShowEvent(false);
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: newStatus }),
    });
    fetchTasks(userId);
  };

  const deleteTask = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    fetchTasks(userId);
  };

  const saveEdit = async () => {
    await fetch(`${API}/tasks/${editTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editTarget),
    });
    setEditTarget(null);
    fetchTasks(userId);
  };

  /* ── متن‌ها ── */
  const fa = lang === "fa";
  const txt = {
    title:       fa ? "وظایف"           : "Tasks",
    pending:     fa ? "باقیمانده"        : "Pending",
    done:        fa ? "انجام شده"        : "Done",
    all:         fa ? "همه"              : "All",
    addTask:     fa ? "+ وظیفه جدید"     : "+ New task",
    addEvent:    fa ? "+ رویداد جدید"    : "+ New event",
    cancel:      fa ? "انصراف"           : "Cancel",
    save:        fa ? "ذخیره"            : "Save",
    add:         fa ? "افزودن"           : "Add",
    taskTitle:   fa ? "عنوان وظیفه"      : "Task title",
    taskDesc:    fa ? "توضیحات (اختیاری)": "Description (optional)",
    taskPri:     fa ? "اولویت"           : "Priority",
    taskDate:    fa ? "تاریخ سررسید"     : "Due date",
    taskStart:   fa ? "ساعت شروع"        : "Start time",
    taskEnd:     fa ? "ساعت پایان"       : "End time",
    evTitle:     fa ? "عنوان رویداد"     : "Event title",
    evDesc:      fa ? "توضیحات"          : "Description",
    evType:      fa ? "نوع رویداد"       : "Event type",
    evDate:      fa ? "تاریخ رویداد"     : "Event date",
    noTasks:     fa ? "وظیفه‌ای وجود ندارد" : "No tasks found",
    editTask:    fa ? "ویرایش وظیفه"    : "Edit task",
    from:        fa ? "از"               : "from",
    to:          fa ? "تا"               : "to",
    newTaskPanel:fa ? "وظیفه جدید"      : "New task",
    newEventPanel:fa? "رویداد جدید"     : "New event",
  };

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "done")    return t.status === "done";
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const doneCount    = tasks.filter((t) => t.status === "done").length;

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">

      {/* ── هدر ── */}
      <div className="page-header">
        <h2 className="page-title">{txt.title}</h2>
        <span className="page-count">{pendingCount} {txt.pending}</span>
        <div className="page-spacer" />
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn-primary" onClick={() => { setShowForm(!showForm); setShowEvent(false); }}>
            <IconPlus />
            {fa ? "وظیفه" : "Task"}
          </button>
          <button
            className="btn-primary"
            style={{ background: "transparent", border: "0.5px solid #4ab8e033", color: "var(--blue)" }}
            onClick={() => { setShowEvent(!showEvent); setShowForm(false); }}
          >
            <IconCal />
            {fa ? "رویداد" : "Event"}
          </button>
        </div>
      </div>

      {/* ── KPI ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon ki-amber">
              <IconFlag />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--amber)" }}>{pendingCount}</div>
          <div className="kpi-label">{txt.pending}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon ki-green">
              <IconCheck />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--accent)" }}>{doneCount}</div>
          <div className="kpi-label">{txt.done}</div>
        </div>
      </div>

      {/* ── فیلتر ── */}
      <div className="tabs-row" style={{ marginBottom: 16 }}>
        {[
          { key: "all",     label: txt.all },
          { key: "pending", label: txt.pending },
          { key: "done",    label: txt.done },
        ].map((tb) => (
          <button key={tb.key}
            className={`tab-btn ${filter === tb.key ? "active" : ""}`}
            onClick={() => setFilter(tb.key)}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── فرم وظیفه جدید ── */}
      {showForm && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-label">{txt.newTaskPanel}</div>

          <div className="input-wrap">
            <span className="input-icon"><IconTitle /></span>
            <input className="app-input" placeholder={txt.taskTitle} value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()} />
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconDesc /></span>
            <input className="app-input" placeholder={txt.taskDesc} value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconFlag /></span>
            <select className="app-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value={1}>{fa ? "فوری" : "Urgent"}</option>
              <option value={2}>{fa ? "معمولی" : "Normal"}</option>
              <option value={3}>{fa ? "کم اهمیت" : "Low"}</option>
            </select>
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconCal /></span>
            <PersianDatePicker value={dueDate} onChange={setDueDate}
              placeholder={txt.taskDate} />
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconClock /></span>
            <TimeInput value={startTime} onChange={setStartTime} placeholder={txt.taskStart} />
          </div>
          <div className="input-wrap" style={{ marginBottom: 0 }}>
            <span className="input-icon"><IconClock /></span>
            <TimeInput value={endTime} onChange={setEndTime} placeholder={txt.taskEnd} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>{txt.cancel}</button>
            <button className="btn-save" onClick={addTask}>{txt.add}</button>
          </div>
        </div>
      )}

      {/* ── فرم رویداد جدید ── */}
      {showEvent && (
        <div className="panel" style={{ marginBottom: 16, borderColor: "#4ab8e022" }}>
          <div className="panel-label" style={{ color: "var(--blue)" }}>{txt.newEventPanel}</div>

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
              <option value="meeting">{fa ? "جلسه"    : "Meeting"}</option>
              <option value="call">{fa    ? "تماس"     : "Call"}</option>
              <option value="reminder">{fa? "یادآوری"  : "Reminder"}</option>
              <option value="other">{fa   ? "سایر"     : "Other"}</option>
            </select>
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconCal /></span>
            <PersianDatePicker value={evDate} onChange={setEvDate}
              placeholder={txt.evDate} />
          </div>
          <div className="input-wrap">
            <span className="input-icon"><IconClock /></span>
            <TimeInput value={evStart} onChange={setEvStart} placeholder={txt.taskStart} />
          </div>
          <div className="input-wrap" style={{ marginBottom: 0 }}>
            <span className="input-icon"><IconClock /></span>
            <TimeInput value={evEnd} onChange={setEvEnd} placeholder={txt.taskEnd} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn-cancel" onClick={() => setShowEvent(false)}>{txt.cancel}</button>
            <button className="btn-save"
              style={{ background: "var(--blue)", color: "#fff" }}
              onClick={addEvent}>{txt.add}</button>
          </div>
        </div>
      )}

      {/* ── لیست وظایف ── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IconCheck /></div>
          <p>{txt.noTasks}</p>
        </div>
      ) : (
        <div className="contact-list">
          {filtered.map((task) => (
            <div key={task.id} className="contact-item"
              style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>

                {/* چک‌باکس */}
                <button onClick={() => toggleStatus(task)} style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `1.5px solid ${task.status === "done" ? "var(--accent)" : "var(--border2)"}`,
                  background: task.status === "done" ? "var(--accent)" : "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#001a10", transition: "all .15s",
                }}>
                  {task.status === "done" && (
                    <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, stroke: "#001a10", fill: "none", strokeWidth: 3 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>

                {/* محتوا */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="contact-name" style={{
                    textDecoration: task.status === "done" ? "line-through" : "none",
                    opacity: task.status === "done" ? 0.45 : 1,
                  }}>
                    {task.title}
                    <span className="cat-badge" style={{
                      color: PRIORITY_COLOR[task.priority],
                      borderColor: `${PRIORITY_COLOR[task.priority]}33`,
                      marginRight: 6, fontSize: 10,
                    }}>
                      {priorityLabel(task.priority, lang)}
                    </span>
                  </div>

                  {task.description && (
                    <div className="contact-phone" style={{ marginTop: 2 }}>{task.description}</div>
                  )}

                  <div className="contact-phone" style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                    {task.due_date && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, stroke: "var(--text3)", fill: "none", strokeWidth: 2 }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {task.due_date}
                      </span>
                    )}
                    {task.start_time && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, stroke: "var(--text3)", fill: "none", strokeWidth: 2 }}>
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {task.start_time.slice(0, 5)}
                        {task.end_time && ` ${txt.to} ${task.end_time.slice(0, 5)}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* دکمه‌ها */}
                <div className="actions">
                  <button className="btn-icon btn-edit" onClick={() => setEditTarget(task)}>
                    <IconEdit />
                  </button>
                  <button className="btn-icon btn-del" onClick={() => deleteTask(task.id)}>
                    <IconTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── مودال ویرایش ── */}
      {editTarget && (
        <div className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setEditTarget(null)}>
          <div className="modal">
            <h3 className="modal-title">{txt.editTask}</h3>

            <div className="input-wrap">
              <span className="input-icon"><IconTitle /></span>
              <input className="app-input" value={editTarget.title}
                onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })}
                placeholder={txt.taskTitle} />
            </div>
            <div className="input-wrap">
              <span className="input-icon"><IconDesc /></span>
              <input className="app-input" value={editTarget.description || ""}
                onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })}
                placeholder={txt.taskDesc} />
            </div>
            <div className="input-wrap">
              <span className="input-icon"><IconFlag /></span>
              <select className="app-input" value={editTarget.priority}
                onChange={(e) => setEditTarget({ ...editTarget, priority: Number(e.target.value) })}>
                <option value={1}>{fa ? "فوری"       : "Urgent"}</option>
                <option value={2}>{fa ? "معمولی"     : "Normal"}</option>
                <option value={3}>{fa ? "کم اهمیت"   : "Low"}</option>
              </select>
            </div>
            <div className="input-wrap">
              <span className="input-icon"><IconCal /></span>
              <PersianDatePicker
                value={editTarget.due_date || ""}
                onChange={(val) => setEditTarget({ ...editTarget, due_date: val })}
                placeholder={txt.taskDate} />
            </div>
            <div className="input-wrap">
              <span className="input-icon"><IconClock /></span>
              <TimeInput
                value={editTarget.start_time ? editTarget.start_time.slice(0, 5) : ""}
                onChange={(v) => setEditTarget({ ...editTarget, start_time: v })}
                placeholder={txt.taskStart} />
            </div>
            <div className="input-wrap" style={{ marginBottom: 0 }}>
              <span className="input-icon"><IconClock /></span>
              <TimeInput
                value={editTarget.end_time ? editTarget.end_time.slice(0, 5) : ""}
                onChange={(v) => setEditTarget({ ...editTarget, end_time: v })}
                placeholder={txt.taskEnd} />
            </div>

            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setEditTarget(null)}>{txt.cancel}</button>
              <button className="btn-save" onClick={saveEdit}>{txt.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
