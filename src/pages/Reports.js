import { useState, useEffect } from "react";
import { API, getUserProfile, CATEGORIES, CATEGORY_COLORS } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import jalaali from "jalaali-js";

function toFarsiNum(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}
function todayJalaali() { return jalaali.toJalaali(new Date()); }
const MONTHS_FA = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const DAYS_FA   = ["ش","ی","د","س","چ","پ","ج"];

function Bar({ value, max, color, height = 6 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ flex:1, height, background:"var(--bg4)", borderRadius:height/2, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:height/2, transition:"width .5s ease" }}/>
    </div>
  );
}

/* ── کارت KPI ── */
function KPI({ icon, value, label, trend, trendType, color = "var(--accent)" }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background:`${color}14` }}>
          <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:color, fill:"none", strokeWidth:2 }}>
            {icon}
          </svg>
        </div>
        {trend !== undefined && (
          <span className={`kpi-trend ${trendType || "flat"}`}>{trend}</span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

/* ── کارت عملکرد کاربر ── */
function UserPerfCard({ user, lang, expanded, onToggle }) {
  const fa = lang === "fa";
  const p = user.performance;
  const roleColors = { 1:"var(--red)", 2:"var(--blue)", 3:"var(--accent)", 4:"var(--purple)" };
  const roleLabels = { 1:fa?"مدیر ارشد":"Senior", 2:fa?"مدیر":"Manager", 3:fa?"کارمند":"Employee", 4:fa?"کاربر":"User" };
  const color = roleColors[user.role];

  /* رنگ بر اساس عملکرد */
  const perfColor = p.done_rate >= 70 ? "var(--accent)" : p.done_rate >= 40 ? "var(--amber)" : "var(--red)";

  return (
    <div className="panel" style={{ marginBottom:8, cursor:"pointer" }} onClick={onToggle}>
      {/* هدر */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}18`,
          border:`0.5px solid ${color}33`, display:"flex", alignItems:"center",
          justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:12, color, flexShrink:0 }}>
          {(user.full_name||"?").trim().split(" ").map(p=>p[0]||"").join("").substring(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"var(--text1)",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {user.full_name || user.email}
          </div>
          <div style={{ fontSize:10, color:"var(--text3)", display:"flex", gap:6, marginTop:2 }}>
            {user.username && <span style={{ color:"var(--accent)" }}>@{user.username}</span>}
            <span className="cat-badge" style={{ color, borderColor:`${color}33`, fontSize:9 }}>
              {roleLabels[user.role]}
            </span>
          </div>
        </div>
        {/* نرخ تکمیل */}
        <div style={{ textAlign:"center", flexShrink:0 }}>
          <div style={{ fontSize:16, fontFamily:"Syne,sans-serif", fontWeight:800, color:perfColor }}>
            {fa ? toFarsiNum(p.done_rate) : p.done_rate}%
          </div>
          <div style={{ fontSize:9, color:"var(--text3)" }}>{fa?"تکمیل":"done"}</div>
        </div>
        {/* آیکون expand */}
        <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:"var(--text3)", fill:"none",
          strokeWidth:2, flexShrink:0, transform: expanded ? "rotate(90deg)" : "rotate(0)",
          transition:"transform .2s" }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      {/* progress bar نرخ تکمیل */}
      <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
        <Bar value={p.done_rate} max={100} color={perfColor} height={4} />
      </div>

      {/* جزئیات — وقتی expanded */}
      {expanded && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:"0.5px solid var(--border)" }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:10 }}>
            {[
              { label:fa?"کل وظایف":"Total", value:p.total_tasks, color:"var(--text2)" },
              { label:fa?"انجام شده":"Done", value:p.done_tasks, color:"var(--accent)" },
              { label:fa?"باقیمانده":"Pending", value:p.pending_tasks, color:"var(--amber)" },
              { label:fa?"عقب افتاده":"Overdue", value:p.overdue_tasks, color:"var(--red)" },
              { label:fa?"فوری":"Urgent", value:p.urgent_tasks, color:"var(--red)" },
              { label:fa?"رویدادها":"Events", value:p.total_events, color:"var(--blue)" },
            ].map(({ label, value, color: c }) => (
              <div key={label} style={{ background:"var(--bg4)", borderRadius:"var(--radius-sm)",
                padding:"8px", textAlign:"center" }}>
                <div style={{ fontSize:16, fontFamily:"Syne,sans-serif", fontWeight:800, color:c }}>
                  {fa ? toFarsiNum(value) : value}
                </div>
                <div style={{ fontSize:9, color:"var(--text3)", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* نرخ تکمیل فوری */}
          {p.urgent_tasks > 0 && (
            <div style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:"var(--text2)" }}>{fa?"نرخ تکمیل فوری":"Urgent completion"}</span>
                <span style={{ fontSize:11, fontFamily:"Syne,sans-serif", fontWeight:700, color:"var(--red)" }}>
                  {fa ? toFarsiNum(p.urgent_rate) : p.urgent_rate}%
                </span>
              </div>
              <Bar value={p.urgent_rate} max={100} color="var(--red)" height={4} />
            </div>
          )}

          {/* آخرین فعالیت */}
          {p.last_activity && (
            <div style={{ fontSize:11, color:"var(--text3)" }}>
              {fa ? "آخرین فعالیت:" : "Last activity:"}{" "}
              <span style={{ color:"var(--text2)" }}>
                {new Date(p.last_activity).toLocaleDateString(fa ? "fa-IR" : "en-US")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   REPORTS PAGE
══════════════════════════════════════════ */
export default function Reports() {
  const { lang } = useSettings();
  const fa = lang === "fa";

  const [userRole,   setUserRole]   = useState(null);
  const [userId,     setUserId]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("personal");
  const [expanded,   setExpanded]   = useState({});

  /* داده‌ها */
  const [myPerf,     setMyPerf]     = useState(null);
  const [myContacts, setMyContacts] = useState([]);
  const [myEvents,   setMyEvents]   = useState([]);
  const [allData,    setAllData]    = useState(null);   // مدیر ارشد
  const [teamData,   setTeamData]   = useState(null);   // مدیر

  const today = todayJalaali();

  useEffect(() => {
    getUserProfile().then(async (u) => {
      if (!u) return;
      setUserRole(u.role || 4);
      setUserId(u.id);

      try {
        const [perf, contacts, events] = await Promise.all([
          fetch(`${API}/reports/me?user_id=${u.id}`).then(r => r.json()),
          fetch(`${API}/contacts?user_id=${u.id}`).then(r => r.json()),
          fetch(`${API}/events?user_id=${u.id}`).then(r => r.json()),
        ]);
        setMyPerf(perf);
        setMyContacts(Array.isArray(contacts) ? contacts : []);
        setMyEvents(Array.isArray(events) ? events : []);

        if (u.role === 1) {
          const all = await fetch(`${API}/reports/all?user_id=${u.id}`).then(r => r.json());
          setAllData(all);
        } else if (u.role === 2) {
          const team = await fetch(`${API}/reports/team?user_id=${u.id}`).then(r => r.json());
          setTeamData(team);
        }
      } catch {}
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;

  /* ── آمار شخصی ── */
  const catStats = CATEGORIES
    .map(cat => ({ cat, count: myContacts.filter(c => c.category === cat).length }))
    .filter(c => c.count > 0).sort((a,b) => b.count - a.count);

  const thisMonthStr = `${toFarsiNum(today.jy)}/${toFarsiNum(String(today.jm).padStart(2,"0"))}`;
  const thisMonthEvents = myEvents.filter(e => e.date?.startsWith(thisMonthStr));

  /* ── هشدارها ── */
  const alerts = [];
  if (myPerf?.overdue_tasks > 0)
    alerts.push({ type:"red", msg: fa ? `${myPerf.overdue_tasks} وظیفه سررسید گذشته دارید` : `${myPerf.overdue_tasks} overdue tasks` });
  if (myPerf?.urgent_tasks > 0)
    alerts.push({ type:"amber", msg: fa ? `${myPerf.urgent_tasks} وظیفه فوری باقیمانده` : `${myPerf.urgent_tasks} urgent tasks pending` });

  /* tabs */
  const tabs = [
    { key:"personal", label: fa?"گزارش من":"My Report" },
    ...(userRole === 2 ? [{ key:"team", label: fa?"گزارش تیم":"Team Report" }] : []),
    ...(userRole === 1 ? [
      { key:"team", label: fa?"گزارش تیم":"Team Report" },
      { key:"system", label: fa?"گزارش سیستم":"System Report" },
    ] : []),
  ];

  /* مرتب‌سازی کاربران بر اساس نرخ تکمیل */
  const sortedUsers = (data) => [...(data?.users || [])].sort((a,b) =>
    b.performance.done_rate - a.performance.done_rate
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">{fa?"گزارش‌ها":"Reports"}</h2>
        <span className="page-count">
          {fa ? MONTHS_FA[today.jm-1] : new Date().toLocaleString("en",{month:"long"})}
        </span>
      </div>

      {/* tabs */}
      {tabs.length > 1 && (
        <div className="tabs-row" style={{ marginBottom:16 }}>
          {tabs.map(tb => (
            <button key={tb.key}
              className={`tab-btn ${activeTab === tb.key ? "active" : ""}`}
              onClick={() => setActiveTab(tb.key)}>
              {tb.label}
            </button>
          ))}
        </div>
      )}

      {/* ══ گزارش شخصی ══ */}
      {activeTab === "personal" && myPerf && (
        <>
          {/* هشدارها */}
          {alerts.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
              {alerts.map((a, i) => {
                const colors = { red:"var(--red)", amber:"var(--amber)" };
                const bgs    = { red:"#e0606010", amber:"#d4a01710" };
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                    background:bgs[a.type], border:`0.5px solid ${colors[a.type]}33`, borderRadius:"var(--radius-sm)" }}>
                    <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:colors[a.type], fill:"none", strokeWidth:2, flexShrink:0 }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span style={{ fontSize:12, color:colors[a.type] }}>{a.msg}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* KPI شخصی */}
          <div className="kpi-grid" style={{ marginBottom:14 }}>
            <KPI icon={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}
              value={myPerf.done_tasks} label={fa?"انجام شده":"Done"} color="var(--accent)"
              trend={`${fa?toFarsiNum(myPerf.done_rate):myPerf.done_rate}%`} trendType="up" />
            <KPI icon={<><line x1="12" y1="2" x2="12" y2="6"/><path d="M17.2 7.2A6 6 0 1 1 6 12"/></>}
              value={myPerf.pending_tasks} label={fa?"باقیمانده":"Pending"} color="var(--amber)"
              trend={myPerf.overdue_tasks > 0 ? `${myPerf.overdue_tasks} ${fa?"عقب":"late"}` : undefined} trendType="down" />
            <KPI icon={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
              value={thisMonthEvents.length} label={fa?"رویداد این ماه":"Events"} color="var(--blue)" />
            <KPI icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
              value={myContacts.length} label={fa?"مخاطبین":"Contacts"} color="var(--purple)" />
          </div>

          {/* نرخ تکمیل */}
          <div className="panel" style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"نرخ تکمیل وظایف":"Task completion"}</div>
            {[
              { label:fa?"کل":"Total", rate:myPerf.done_rate, color:"var(--accent)" },
              { label:fa?"فوری":"Urgent", rate:myPerf.urgent_rate, color:"var(--red)" },
            ].map(({ label, rate, color }) => (
              <div key={label} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:"var(--text2)" }}>{label}</span>
                  <span style={{ fontSize:12, fontFamily:"Syne,sans-serif", fontWeight:700, color }}>
                    {fa?toFarsiNum(rate):rate}%
                  </span>
                </div>
                <Bar value={rate} max={100} color={color} height={5} />
              </div>
            ))}
          </div>

          {/* مخاطبین به تفکیک بخش */}
          {catStats.length > 0 && (
            <div className="panel" style={{ marginBottom:14 }}>
              <div className="panel-label">{fa?"مخاطبین به تفکیک بخش":"Contacts by dept"}</div>
              {catStats.map(({ cat, count }) => (
                <div key={cat} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <div style={{ width:110, fontSize:12, color:"var(--text2)", textAlign:"right",
                    flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cat}</div>
                  <Bar value={count} max={catStats[0].count} color={CATEGORY_COLORS[cat]?.accent||"var(--accent)"} />
                  <div style={{ width:24, fontSize:12, fontFamily:"Syne,sans-serif", fontWeight:700,
                    color:CATEGORY_COLORS[cat]?.accent||"var(--accent)", textAlign:"center", flexShrink:0 }}>{count}</div>
                </div>
              ))}
            </div>
          )}

          {/* سطح دسترسی مخاطبین */}
          {myContacts.length > 0 && (
            <div className="panel" style={{ marginBottom:14 }}>
              <div className="panel-label">{fa?"سطح دسترسی مخاطبین":"Contact visibility"}</div>
              {[1,2,3,4].map((v) => {
                const count = myContacts.filter(c => c.visibility === v).length;
                const label = fa
                  ? {1:"محرمانه",2:"نیمه محرمانه",3:"عمومی شرکت",4:"همه"}[v]
                  : {1:"Confidential",2:"Semi-conf.",3:"Company",4:"Everyone"}[v];
                const color = ["#e06060","#d4a017","#4ab8e0","#00d98b"][v-1];
                return (
                  <div key={v} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }}/>
                    <div style={{ width:110, fontSize:12, color:"var(--text2)", flexShrink:0 }}>{label}</div>
                    <Bar value={count} max={myContacts.length} color={color} />
                    <div style={{ width:24, fontSize:12, fontFamily:"Syne,sans-serif", fontWeight:700,
                      color, textAlign:"center", flexShrink:0 }}>{count}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* توزیع رویدادها در روزهای هفته */}
          {myEvents.length > 0 && (
            <div className="panel" style={{ marginBottom:14 }}>
              <div className="panel-label">{fa?"توزیع رویدادها در روزهای هفته":"Events by day of week"}</div>
              <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:60 }}>
                {[0,1,2,3,4,5,6].map((day) => {
                  const count = myEvents.filter(e => {
                    if (!e.date) return false;
                    try {
                      const parts = e.date.split("/").map(s =>
                        parseInt(String(s).replace(/[۰-۹]/g, c => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)))
                      );
                      const g = jalaali.toGregorian(parts[0], parts[1], parts[2]);
                      return new Date(g.gy, g.gm-1, g.gd).getDay() === (day + 6) % 7;
                    } catch { return false; }
                  }).length;
                  const maxCount = Math.max(
                    ...[0,1,2,3,4,5,6].map(d => myEvents.filter(e => {
                      if (!e.date) return false;
                      try {
                        const parts = e.date.split("/").map(s =>
                          parseInt(String(s).replace(/[۰-۹]/g, c => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)))
                        );
                        const g = jalaali.toGregorian(parts[0], parts[1], parts[2]);
                        return new Date(g.gy, g.gm-1, g.gd).getDay() === (d + 6) % 7;
                      } catch { return false; }
                    }).length),
                    1
                  );
                  const h = count > 0 ? Math.max((count/maxCount)*44, 4) : 4;
                  return (
                    <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                      <div style={{ fontSize:9, color:"var(--text3)" }}>
                        {count > 0 ? (fa ? toFarsiNum(count) : count) : ""}
                      </div>
                      <div style={{ width:"100%", height:h,
                        background: count > 0 ? "var(--blue)" : "var(--bg4)",
                        borderRadius:2, transition:"height .4s ease" }}/>
                      <div style={{ fontSize:9, color:"var(--text3)" }}>
                        {DAYS_FA[day]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ گزارش تیم ══ */}
      {activeTab === "team" && (
        <>
          {/* خلاصه تیم */}
          {(userRole === 1 ? allData : teamData)?.users && (
            <>
              <div className="kpi-grid" style={{ marginBottom:14, gridTemplateColumns:"repeat(3,1fr)" }}>
                <KPI icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                  value={(userRole===1?allData:teamData).users.length}
                  label={fa?"تعداد اعضا":"Members"} color="var(--blue)" />
                <KPI icon={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}
                  value={Math.round((userRole===1?allData:teamData).users.reduce((s,u)=>s+u.performance.done_rate,0)/Math.max((userRole===1?allData:teamData).users.length,1))}
                  label={fa?"میانگین تکمیل":"Avg completion"} color="var(--accent)"
                  trend="%" trendType="up" />
                <KPI icon={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
                  value={(userRole===1?allData:teamData).users.reduce((s,u)=>s+u.performance.overdue_tasks,0)}
                  label={fa?"کل وظایف عقب‌افتاده":"Total overdue"} color="var(--red)" />
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {sortedUsers(userRole===1?allData:teamData).map((u) => (
                  <UserPerfCard key={u.id} user={u} lang={lang}
                    expanded={!!expanded[u.id]}
                    onToggle={() => setExpanded(p => ({ ...p, [u.id]: !p[u.id] }))} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ══ گزارش سیستم — فقط مدیر ارشد ══ */}
      {activeTab === "system" && userRole === 1 && allData?.system && (
        <>
          <div className="kpi-grid" style={{ marginBottom:14 }}>
            <KPI icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
              value={allData.system.total_contacts} label={fa?"کل مخاطبین":"Total contacts"} color="var(--accent)" />
            <KPI icon={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}
              value={allData.system.done_tasks} label={fa?"وظایف انجام‌شده":"Done tasks"} color="var(--accent)"
              trend={`${Math.round((allData.system.done_tasks/Math.max(allData.system.total_tasks,1))*100)}%`} trendType="up" />
            <KPI icon={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}
              value={allData.system.pending_tasks} label={fa?"وظایف باقیمانده":"Pending"} color="var(--amber)"
              trend={allData.system.urgent_tasks > 0 ? `${allData.system.urgent_tasks} ${fa?"فوری":"urgent"}` : undefined} trendType="down" />
            <KPI icon={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
              value={allData.system.total_events} label={fa?"کل رویدادها":"Total events"} color="var(--blue)" />
          </div>

          {/* نرخ تکمیل کل سیستم */}
          <div className="panel" style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"عملکرد کل سیستم":"System performance"}</div>
            <div style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:"var(--text2)" }}>{fa?"نرخ تکمیل وظایف":"Task completion rate"}</span>
                <span style={{ fontSize:12, fontFamily:"Syne,sans-serif", fontWeight:700, color:"var(--accent)" }}>
                  {Math.round((allData.system.done_tasks/Math.max(allData.system.total_tasks,1))*100)}%
                </span>
              </div>
              <Bar value={allData.system.done_tasks} max={Math.max(allData.system.total_tasks,1)} color="var(--accent)" height={6} />
            </div>
          </div>

          {/* رتبه‌بندی کاربران */}
          <div className="panel-label" style={{ marginBottom:8 }}>
            {fa?"رتبه‌بندی عملکرد اعضا":"Member performance ranking"}
          </div>
          {sortedUsers(allData).map((u, i) => (
            <UserPerfCard key={u.id} user={u} lang={lang}
              expanded={!!expanded[u.id]}
              onToggle={() => setExpanded(p => ({ ...p, [u.id]: !p[u.id] }))} />
          ))}
        </>
      )}
    </div>
  );
}
