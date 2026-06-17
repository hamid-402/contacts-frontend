import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API, todayKey, Avatar, CATEGORY_COLORS, CATEGORIES, getUserProfile } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { t } from "../context/translations";
import jalaali from "jalaali-js";

function toFarsiNum(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

function todayJalaaliStr() {
  const { jy, jm, jd } = jalaali.toJalaali(new Date());
  return `${toFarsiNum(jy)}/${toFarsiNum(String(jm).padStart(2,"0"))}/${toFarsiNum(String(jd).padStart(2,"0"))}`;
}

/* ── KPI Card ── */
function KpiCard({ iconClass, icon, value, label, trend, trendType }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className={`kpi-icon ${iconClass}`}>{icon}</div>
        {trend !== undefined && (
          <span className={`kpi-trend ${trendType}`}>{trend}</span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

export default function Home() {
  const [contacts, setContacts] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { lang } = useSettings();
  const tr = t[lang];

  const todayStr = todayJalaaliStr();

  useEffect(() => {
    getUserProfile().then((u) => {
      if (!u) return;
      const name = u.full_name || "";
      setUserName(name.split(" ")[0] || "");

      Promise.all([
        fetch(`${API}/contacts?user_id=${u.id}`).then((r) => r.json()),
        fetch(`${API}/tasks?user_id=${u.id}`).then((r) => r.json()),
        fetch(`${API}/events?user_id=${u.id}`).then((r) => r.json()),
      ])
        .then(([c, t, e]) => {
          setContacts(Array.isArray(c) ? c : []);
          setTasks(Array.isArray(t) ? t : []);
          setEvents(Array.isArray(e) ? e : []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  const todayCount    = contacts.filter((c) => c.date === todayKey).length;
  const pendingTasks  = tasks.filter((t) => t.status === "pending");
  const todayTasks    = tasks.filter((t) => t.due_date === todayStr && t.status === "pending");
  const todayEvents   = events.filter((e) => e.date === todayStr);
  const urgentTasks   = pendingTasks.filter((t) => t.priority === 1);
  const recent        = [...contacts].slice(0, 5);

  const catCounts = CATEGORIES.map((cat) => ({
    cat,
    count: contacts.filter((c) => c.category === cat).length,
  }));

  const priorityColor = { 1: "#e06060", 2: "#d4a017", 3: "#00d98b" };
  const priorityLabel = {
    1: lang === "fa" ? "فوری"      : "Urgent",
    2: lang === "fa" ? "معمولی"    : "Normal",
    3: lang === "fa" ? "کم اهمیت" : "Low",
  };
  const eventTypeLabel = {
    meeting:  lang === "fa" ? "جلسه"     : "Meeting",
    call:     lang === "fa" ? "تماس"     : "Call",
    reminder: lang === "fa" ? "یادآوری"  : "Reminder",
    other:    lang === "fa" ? "سایر"     : "Other",
  };
  const eventTypeColor = { meeting: "#4ab8e0", call: "#00d98b", reminder: "#d4a017", other: "#9b7de8" };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const greeting = lang === "fa"
    ? `${tr.greeting}${userName ? `، ${userName}` : ""}`
    : `${tr.greeting}${userName ? `, ${userName}` : ""}`;

  return (
    <div className="page">

      {/* ── Hero ── */}
      <div className="home-hero">
        <h1 className="home-title">{greeting}</h1>
        <p className="home-sub">{tr.greetingSub}</p>
      </div>

      {/* ── KPI ── */}
      <div className="kpi-grid">
        <KpiCard
          iconClass="ki-green"
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
          value={contacts.length}
          label={tr.totalContacts}
          trend={todayCount > 0 ? `+${todayCount} ${lang === "fa" ? "امروز" : "today"}` : undefined}
          trendType="up"
        />
        <KpiCard
          iconClass="ki-amber"
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          }
          value={pendingTasks.length}
          label={lang === "fa" ? "وظایف باقیمانده" : "Pending tasks"}
          trend={urgentTasks.length > 0 ? `${urgentTasks.length} ${lang === "fa" ? "فوری" : "urgent"}` : undefined}
          trendType="down"
        />
        <KpiCard
          iconClass="ki-blue"
          icon={
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
          }
          value={todayEvents.length}
          label={lang === "fa" ? "رویدادهای امروز" : "Today's events"}
        />
        <KpiCard
          iconClass="ki-purple"
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          }
          value={catCounts.find((c) => c.cat === "Work")?.count || 0}
          label={tr.workContacts}
        />
      </div>

      {/* ── وظایف امروز ── */}
      {todayTasks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>
            {lang === "fa" ? "وظایف امروز" : "Today's tasks"}
          </div>
          <div className="contact-list">
            {todayTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="contact-item"
                style={{ cursor: "default" }}
              >
                {/* نشانگر اولویت */}
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: priorityColor[task.priority],
                  flexShrink: 0,
                }} />
                <div className="contact-info">
                  <div className="contact-name">{task.title}</div>
                  <div className="contact-phone">
                    <span style={{ color: priorityColor[task.priority], fontSize: 10 }}>
                      {priorityLabel[task.priority]}
                    </span>
                    {task.start_time && (
                      <span style={{ marginRight: 8 }}>
                        {lang === "fa" ? "از" : "from"} {task.start_time.slice(0, 5)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigate("/tasks")}
                  style={{
                    fontSize: 11, color: "var(--accent)", background: "transparent",
                    border: "0.5px solid #00d98b22", borderRadius: 6,
                    padding: "3px 8px", cursor: "pointer",
                  }}
                >
                  {lang === "fa" ? "مشاهده" : "View"}
                </button>
              </div>
            ))}
            {todayTasks.length > 3 && (
              <div
                className="contact-item"
                style={{ justifyContent: "center", cursor: "pointer", color: "var(--accent)", fontSize: 12 }}
                onClick={() => navigate("/tasks")}
              >
                {lang === "fa"
                  ? `+ ${todayTasks.length - 3} وظیفه دیگر`
                  : `+ ${todayTasks.length - 3} more tasks`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── رویدادهای امروز ── */}
      {todayEvents.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>
            {lang === "fa" ? "رویدادهای امروز" : "Today's events"}
          </div>
          <div className="contact-list">
            {todayEvents.slice(0, 3).map((ev) => (
              <div key={ev.id} className="contact-item" style={{ cursor: "default" }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: eventTypeColor[ev.type] || "#4ab8e0",
                  flexShrink: 0,
                }} />
                <div className="contact-info">
                  <div className="contact-name">{ev.title}</div>
                  <div className="contact-phone" style={{ color: eventTypeColor[ev.type] }}>
                    {eventTypeLabel[ev.type]}
                    {ev.start_time && ` · ${ev.start_time.slice(0, 5)}`}
                  </div>
                </div>
                <button
                  onClick={() => navigate("/calendar")}
                  style={{
                    fontSize: 11, color: "var(--blue)", background: "transparent",
                    border: "0.5px solid #4ab8e022", borderRadius: 6,
                    padding: "3px 8px", cursor: "pointer",
                  }}
                >
                  {lang === "fa" ? "تقویم" : "Calendar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── دسته‌بندی‌ها ── */}
      <div className="section-title" style={{ marginBottom: 10 }}>{tr.categories}</div>
      <div className="cat-grid" style={{ marginBottom: 24 }}>
        {catCounts.map(({ cat, count }) => {
          const { accent } = CATEGORY_COLORS[cat];
          return (
            <div
              key={cat}
              className="cat-card"
              style={{ borderColor: `${accent}22` }}
              onClick={() => navigate("/categories")}
            >
              <div className="cat-count" style={{ color: accent }}>{count}</div>
              <div className="cat-name">{tr[cat.toLowerCase()] || cat}</div>
            </div>
          );
        })}
      </div>

      {/* ── آخرین مخاطبین ── */}
      <div className="section-title" style={{ marginBottom: 10 }}>{tr.recentlyAdded}</div>
      {recent.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <p>{tr.noContacts}</p>
        </div>
      ) : (
        <div className="contact-list">
          {recent.map((c) => (
            <div
              key={c.id}
              className="contact-item"
              onClick={() => navigate(`/contacts/${c.id}`)}
            >
              <Avatar name={c.name} />
              <div className="contact-info">
                <div className="contact-name">{c.name}</div>
                <div className="contact-phone">{c.phone}</div>
              </div>
              <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:"var(--text4)", fill:"none", strokeWidth:2, flexShrink:0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
