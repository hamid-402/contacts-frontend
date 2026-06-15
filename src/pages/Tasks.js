import { useState, useEffect } from "react";
import { API, getUserProfile } from "../components/shared";
import { useSettings } from "../context/SettingsContext";

// تبدیل تاریخ میلادی به شمسی
function toShamsi(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const y = date.toLocaleDateString('fa-IR', { year: 'numeric', calendar: 'persian' });
    const m = date.toLocaleDateString('fa-IR', { month: '2-digit', calendar: 'persian' });
    const d = date.toLocaleDateString('fa-IR', { day: '2-digit', calendar: 'persian' });
    return `${y}/${m}/${d}`;
  } catch {
    return dateStr;
  }
}

export default function Tasks() {
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [userId, setUserId]           = useState(null);
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]       = useState(2);
  const [dueDate, setDueDate]         = useState("");
  const [startTime, setStartTime]     = useState("");
  const [endTime, setEndTime]         = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [filter, setFilter]           = useState("all");
  const { lang } = useSettings();

  useEffect(() => {
    getUserProfile().then((u) => {
      if (u) { setUserId(u.id); fetchTasks(u.id); }
    });
  }, []);

  const fetchTasks = async (uid) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/tasks?user_id=${uid}`);
      const data = await res.json();
      setTasks(data);
    } catch { setTasks([]); }
    setLoading(false);
  };

  const addTask = async () => {
    if (!title.trim()) return;
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        title: title.trim(),
        description,
        priority: Number(priority),
        due_date: dueDate || null,
        start_time: startTime || null,
        end_time: endTime || null,
      }),
    });
    setTitle(""); setDescription(""); setPriority(2);
    setDueDate(""); setStartTime(""); setEndTime("");
    setShowForm(false);
    fetchTasks(userId);
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

  const priorityLabel = { 1: "🔴 فوری", 2: "🟡 معمولی", 3: "🟢 کم اهمیت" };
  const priorityColor = { 1: "#e06060", 2: "#d4a017", 3: "#00d98b" };

  const filtered = tasks.filter(t => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "done") return t.status === "done";
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const doneCount = tasks.filter(t => t.status === "done").length;

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">وظایف روزانه</h2>
        <span className="page-count">{pendingCount} باقیمانده</span>
      </div>

      {/* آمار */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-num" style={{ color: "#d4a017" }}>{pendingCount}</div>
          <div className="stat-lbl">در انتظار</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: "#00d98b" }}>{doneCount}</div>
          <div className="stat-lbl">انجام شده</div>
        </div>
      </div>

      {/* فیلتر */}
      <div className="filter-pills" style={{ marginBottom: 16 }}>
        <button className={`pill ${filter === "all" ? "pill-active" : ""}`} onClick={() => setFilter("all")}>همه</button>
        <button className={`pill ${filter === "pending" ? "pill-active" : ""}`} onClick={() => setFilter("pending")}>در انتظار</button>
        <button className={`pill ${filter === "done" ? "pill-active" : ""}`} onClick={() => setFilter("done")}>انجام شده</button>
      </div>

      {/* دکمه اضافه کردن */}
      <button className="btn-add" style={{ marginBottom: 16 }} onClick={() => setShowForm(!showForm)}>
        {showForm ? "انصراف" : "+ وظیفه جدید"}
      </button>

      {/* فرم اضافه کردن */}
      {showForm && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-label">وظیفه جدید</div>
          <div className="input-wrap"><span className="input-icon">📝</span>
            <input className="app-input" placeholder="عنوان وظیفه" value={title}
              onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} />
          </div>
          <div className="input-wrap"><span className="input-icon">📄</span>
            <input className="app-input" placeholder="توضیحات (اختیاری)" value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="input-wrap"><span className="input-icon">⚡</span>
            <select className="app-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value={1}>🔴 فوری</option>
              <option value={2}>🟡 معمولی</option>
              <option value={3}>🟢 کم اهمیت</option>
            </select>
          </div>
          <div className="input-wrap"><span className="input-icon">📅</span>
            <input className="app-input" type="date" value={dueDate}
              onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="input-wrap"><span className="input-icon">🕐</span>
            <input className="app-input" type="time" value={startTime} placeholder="ساعت شروع"
              onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="input-wrap" style={{ marginBottom: 0 }}><span className="input-icon">🕔</span>
            <input className="app-input" type="time" value={endTime} placeholder="ساعت پایان"
              onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <button className="btn-add" style={{ marginTop: 12 }} onClick={addTask}>+ اضافه کن</button>
        </div>
      )}

      {/* لیست وظایف */}
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">✅</div><p>وظیفه‌ای وجود ندارد</p></div>
      ) : (
        <div className="contact-list">
          {filtered.map((task) => (
            <div key={task.id} className="contact-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <button
                  onClick={() => toggleStatus(task)}
                  style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    border: `1.5px solid ${task.status === "done" ? "#00d98b" : "#2e4d3c"}`,
                    background: task.status === "done" ? "#00d98b" : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#001a10", fontSize: 13, transition: "all .15s"
                  }}
                >
                  {task.status === "done" ? "✓" : ""}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="contact-name" style={{
                    textDecoration: task.status === "done" ? "line-through" : "none",
                    opacity: task.status === "done" ? 0.5 : 1
                  }}>
                    {task.title}
                    <span className="cat-badge" style={{ color: priorityColor[task.priority], borderColor: `${priorityColor[task.priority]}33`, marginRight: 8, fontSize: 10 }}>
                      {priorityLabel[task.priority]}
                    </span>
                  </div>
                  {task.description && <div className="contact-phone">{task.description}</div>}
                  <div className="contact-phone" style={{ display: "flex", gap: 12, marginTop: 2 }}>
                    {task.due_date && <span>📅 {toShamsi(task.due_date)}</span>}
                    {task.start_time && task.end_time && <span>🕐 {task.start_time.slice(0,5)} تا {task.end_time.slice(0,5)}</span>}
                    {task.start_time && !task.end_time && <span>🕐 از {task.start_time.slice(0,5)}</span>}
                  </div>
                </div>

                <div className="actions">
                  <button className="btn-icon btn-edit" onClick={() => setEditTarget(task)}>✎</button>
                  <button className="btn-icon btn-del" onClick={() => deleteTask(task.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال ویرایش */}
      {editTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditTarget(null)}>
          <div className="modal">
            <h3 className="modal-title">ویرایش وظیفه</h3>
            <div className="input-wrap"><span className="input-icon">📝</span>
              <input className="app-input" value={editTarget.title}
                onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })} placeholder="عنوان" />
            </div>
            <div className="input-wrap"><span className="input-icon">📄</span>
              <input className="app-input" value={editTarget.description || ""}
                onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })} placeholder="توضیحات" />
            </div>
            <div className="input-wrap"><span className="input-icon">⚡</span>
              <select className="app-input" value={editTarget.priority}
                onChange={(e) => setEditTarget({ ...editTarget, priority: Number(e.target.value) })}>
                <option value={1}>🔴 فوری</option>
                <option value={2}>🟡 معمولی</option>
                <option value={3}>🟢 کم اهمیت</option>
              </select>
            </div>
            <div className="input-wrap"><span className="input-icon">📅</span>
              <input className="app-input" type="date" value={editTarget.due_date ? editTarget.due_date.split('T')[0] : ""}
                onChange={(e) => setEditTarget({ ...editTarget, due_date: e.target.value })} />
            </div>
            <div className="input-wrap"><span className="input-icon">🕐</span>
              <input className="app-input" type="time" value={editTarget.start_time ? editTarget.start_time.slice(0,5) : ""}
                onChange={(e) => setEditTarget({ ...editTarget, start_time: e.target.value })} />
            </div>
            <div className="input-wrap" style={{ marginBottom: 0 }}><span className="input-icon">🕔</span>
              <input className="app-input" type="time" value={editTarget.end_time ? editTarget.end_time.slice(0,5) : ""}
                onChange={(e) => setEditTarget({ ...editTarget, end_time: e.target.value })} />
            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setEditTarget(null)}>انصراف</button>
              <button className="btn-save" onClick={saveEdit}>ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}