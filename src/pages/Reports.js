import { useState, useEffect } from "react";
import { API, getUserProfile, CATEGORIES, CATEGORY_COLORS } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import jalaali from "jalaali-js";

function toFarsiNum(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}
function todayJalaali() { return jalaali.toJalaali(new Date()); }

const MONTHS_FA = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const DAYS_FA   = ["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"];

function Bar({ value, max, color, height = 6 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ flex:1, height, background:"var(--bg4)", borderRadius:height/2, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:height/2, transition:"width .5s ease" }}/>
    </div>
  );
}

function StatRow({ label, value, max, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
      <div style={{ width:110, fontSize:12, color:"var(--text2)", textAlign:"right",
        flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {label}
      </div>
      <Bar value={value} max={max} color={color} />
      <div style={{ width:28, fontSize:12, fontFamily:"Syne,sans-serif", fontWeight:700,
        color, textAlign:"center", flexShrink:0 }}>
        {value}
      </div>
    </div>
  );
}

export default function Reports() {
  const { lang } = useSettings();
  const fa = lang === "fa";

  const [contacts, setContacts] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [events,   setEvents]   = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [userRole, setUserRole] = useState(1);
  const [userId,   setUserId]   = useState(null);

  const today = todayJalaali();

  useEffect(() => {
    getUserProfile().then(async (u) => {
      if (!u) return;
      setUserRole(u.role || 1);
      setUserId(u.id);
      try {
        const [c, t, e, us] = await Promise.all([
          fetch(`${API}/contacts?user_id=${u.id}`).then(r => r.json()),
          fetch(`${API}/tasks?user_id=${u.id}`).then(r => r.json()),
          fetch(`${API}/events?user_id=${u.id}`).then(r => r.json()),
          u.role === 1
            ? fetch(`${API}/users?user_id=${u.id}`).then(r => r.json())
            : Promise.resolve([]),
        ]);
        setContacts(Array.isArray(c) ? c : []);
        setTasks(Array.isArray(t) ? t : []);
        setEvents(Array.isArray(e) ? e : []);
        setUsers(Array.isArray(us) ? us : []);
      } catch {}
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;

  /* ══ محاسبات ══ */

  /* مخاطبین */
  const catStats = CATEGORIES
    .map((cat) => ({ cat, count: contacts.filter(c => c.category === cat).length }))
    .filter(c => c.count > 0)
    .sort((a,b) => b.count - a.count);

  const visStats = [1,2,3,4].map((v) => ({
    v, count: contacts.filter(c => c.visibility === v).length,
    label: fa ? {1:"محرمانه",2:"نیمه محرمانه",3:"عمومی شرکت",4:"همه"}[v]
               : {1:"Confidential",2:"Semi-conf.",3:"Company",4:"Everyone"}[v],
    color: ["#e06060","#d4a017","#4ab8e0","#00d98b"][v-1],
  }));

  /* وظایف */
  const pendingTasks  = tasks.filter(t => t.status === "pending");
  const doneTasks     = tasks.filter(t => t.status === "done");
  const urgentTasks   = tasks.filter(t => t.priority === 1 && t.status === "pending");
  const normalTasks   = tasks.filter(t => t.priority === 2 && t.status === "pending");
  const lowTasks      = tasks.filter(t => t.priority === 3 && t.status === "pending");
  const taskDoneRate  = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  /* وظایف overdue — سررسید گذشته و انجام نشده */
  const todayStr = `${toFarsiNum(today.jy)}/${toFarsiNum(String(today.jm).padStart(2,"0"))}/${toFarsiNum(String(today.jd).padStart(2,"0"))}`;
  const overdueTasks = pendingTasks.filter(t => t.due_date && t.due_date < todayStr);

  /* نرخ تکمیل به تفکیک اولویت */
  const urgentDoneRate = tasks.filter(t=>t.priority===1).length > 0
    ? Math.round((tasks.filter(t=>t.priority===1&&t.status==="done").length / tasks.filter(t=>t.priority===1).length)*100) : 0;
  const normalDoneRate = tasks.filter(t=>t.priority===2).length > 0
    ? Math.round((tasks.filter(t=>t.priority===2&&t.status==="done").length / tasks.filter(t=>t.priority===2).length)*100) : 0;

  /* رویدادها */
  const thisMonthStr    = `${toFarsiNum(today.jy)}/${toFarsiNum(String(today.jm).padStart(2,"0"))}`;
  const lastMonthJm     = today.jm === 1 ? 12 : today.jm - 1;
  const lastMonthJy     = today.jm === 1 ? today.jy - 1 : today.jy;
  const lastMonthStr    = `${toFarsiNum(lastMonthJy)}/${toFarsiNum(String(lastMonthJm).padStart(2,"0"))}`;
  const thisMonthEvents = events.filter(e => e.date?.startsWith(thisMonthStr));
  const lastMonthEvents = events.filter(e => e.date?.startsWith(lastMonthStr));
  const eventGrowth     = lastMonthEvents.length > 0
    ? Math.round(((thisMonthEvents.length - lastMonthEvents.length) / lastMonthEvents.length) * 100)
    : thisMonthEvents.length > 0 ? 100 : 0;

  const eventTypeCount = ["meeting","call","reminder","other"].map((type) => ({
    type,
    count: thisMonthEvents.filter(e => e.type === type).length,
    label: fa ? {meeting:"جلسه",call:"تماس",reminder:"یادآوری",other:"سایر"}[type]
               : {meeting:"Meeting",call:"Call",reminder:"Reminder",other:"Other"}[type],
    color: {meeting:"#4ab8e0",call:"#00d98b",reminder:"#d4a017",other:"#9b7de8"}[type],
  }));

  /* روز هفته با بیشترین رویداد */
  const dayCount = [0,1,2,3,4,5,6].map((d) => ({
    day: d,
    count: events.filter(e => {
      if (!e.date) return false;
      try {
        const parts = e.date.split("/").map(s => parseInt(String(s).replace(/[۰-۹]/g, c => "۰۱۲۳۴۵۶۷۸۹".indexOf(c))));
        const g = jalaali.toGregorian(parts[0], parts[1], parts[2]);
        return new Date(g.gy, g.gm-1, g.gd).getDay() === (d + 6) % 7;
      } catch { return false; }
    }).length,
  }));
  const busiestDay = dayCount.reduce((a,b) => b.count > a.count ? b : a, dayCount[0]);

  /* کاربران */
  const roleStats = [1,2,3,4].map((r) => ({
    r, count: users.filter(u => u.role === r).length,
    label: fa ? {1:"مدیر ارشد",2:"مدیر",3:"کارمند",4:"کاربر عادی"}[r]
               : {1:"Senior",2:"Manager",3:"Employee",4:"User"}[r],
    color: ["var(--red)","var(--blue)","var(--accent)","var(--purple)"][r-1],
  }));

  /* ══ هشدارها ══ */
  const alerts = [];
  if (overdueTasks.length > 0)
    alerts.push({ type:"red", msg: fa ? `${overdueTasks.length} وظیفه سررسید گذشته دارید` : `${overdueTasks.length} overdue tasks` });
  if (urgentTasks.length > 0)
    alerts.push({ type:"amber", msg: fa ? `${urgentTasks.length} وظیفه فوری باقیمانده` : `${urgentTasks.length} urgent tasks pending` });
  if (thisMonthEvents.length === 0)
    alerts.push({ type:"blue", msg: fa ? "هیچ رویدادی برای این ماه ثبت نشده" : "No events this month" });
  if (userRole === 1 && users.filter(u=>u.role===1).length > 2)
    alerts.push({ type:"purple", msg: fa ? "تعداد مدیران ارشد بیش از ۲ نفر است" : "More than 2 senior managers" });

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">{fa ? "گزارش‌ها" : "Reports"}</h2>
        <span className="page-count">{fa ? MONTHS_FA[today.jm-1] : new Date().toLocaleString("en",{month:"long"})}</span>
      </div>

      {/* ══ خلاصه اجرایی ══ */}
      <div className="panel" style={{ marginBottom:14, borderColor:"#00d98b22" }}>
        <div className="panel-label" style={{ color:"var(--accent)" }}>
          {fa ? "خلاصه اجرایی" : "Executive Summary"}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {/* وضعیت کلی */}
          <div style={{ fontSize:13, color:"var(--text1)", lineHeight:1.8 }}>
            {fa ? <>
              شما <span style={{color:"var(--accent)",fontWeight:600}}>{contacts.length}</span> مخاطب،{" "}
              <span style={{color:"var(--amber)",fontWeight:600}}>{pendingTasks.length}</span> وظیفه باقیمانده و{" "}
              <span style={{color:"var(--blue)",fontWeight:600}}>{thisMonthEvents.length}</span> رویداد این ماه دارید.
              {taskDoneRate > 0 && <> نرخ تکمیل وظایف <span style={{color:"var(--accent)",fontWeight:600}}>{toFarsiNum(taskDoneRate)}٪</span> است.</>}
              {eventGrowth !== 0 && <> رویدادهای این ماه نسبت به ماه قبل <span style={{color: eventGrowth>0 ? "var(--accent)" : "var(--red)",fontWeight:600}}>
                {eventGrowth > 0 ? "+" : ""}{toFarsiNum(eventGrowth)}٪
              </span> تغییر داشته.</>}
            </> : <>
              You have <span style={{color:"var(--accent)",fontWeight:600}}>{contacts.length}</span> contacts,{" "}
              <span style={{color:"var(--amber)",fontWeight:600}}>{pendingTasks.length}</span> pending tasks and{" "}
              <span style={{color:"var(--blue)",fontWeight:600}}>{thisMonthEvents.length}</span> events this month.
              {taskDoneRate > 0 && <> Task completion rate is <span style={{color:"var(--accent)",fontWeight:600}}>{taskDoneRate}%</span>.</>}
            </>}
          </div>
          {/* بیزی‌ترین روز */}
          {busiestDay.count > 0 && (
            <div style={{ fontSize:12, color:"var(--text3)" }}>
              {fa ? <>پربارترین روز هفته: <span style={{color:"var(--text2)",fontWeight:500}}>{DAYS_FA[busiestDay.day]}</span> ({toFarsiNum(busiestDay.count)} رویداد)</>
                  : <>Busiest day: <span style={{color:"var(--text2)",fontWeight:500}}>{["Sat","Sun","Mon","Tue","Wed","Thu","Fri"][busiestDay.day]}</span> ({busiestDay.count} events)</>}
            </div>
          )}
        </div>
      </div>

      {/* ══ هشدارها ══ */}
      {alerts.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
          {alerts.map((a, i) => {
            const colors = { red:"var(--red)", amber:"var(--amber)", blue:"var(--blue)", purple:"var(--purple)" };
            const bgs    = { red:"#e0606010", amber:"#d4a01710", blue:"#4ab8e010", purple:"#9b7de810" };
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

      {/* ══ KPI اصلی ══ */}
      <div className="kpi-grid" style={{ marginBottom:14 }}>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon ki-green">
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div className="kpi-value">{contacts.length}</div>
          <div className="kpi-label">{fa?"کل مخاطبین":"Total contacts"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon ki-amber">
              <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            {overdueTasks.length > 0 && <span className="kpi-trend down">{fa?"عقب افتاده":"overdue"}</span>}
          </div>
          <div className="kpi-value">{pendingTasks.length}</div>
          <div className="kpi-label">{fa?"وظایف باقیمانده":"Pending tasks"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon ki-blue">
              <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span className={`kpi-trend ${eventGrowth >= 0 ? "up" : "down"}`}>
              {eventGrowth > 0 ? "+" : ""}{fa ? toFarsiNum(eventGrowth) : eventGrowth}%
            </span>
          </div>
          <div className="kpi-value">{thisMonthEvents.length}</div>
          <div className="kpi-label">{fa?"رویداد این ماه":"This month"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon ki-green">
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="kpi-trend up">{fa ? toFarsiNum(taskDoneRate) : taskDoneRate}%</span>
          </div>
          <div className="kpi-value">{doneTasks.length}</div>
          <div className="kpi-label">{fa?"وظایف انجام‌شده":"Done tasks"}</div>
        </div>
      </div>

      {/* ══ مخاطبین به تفکیک بخش ══ */}
      {catStats.length > 0 && (
        <div className="panel" style={{ marginBottom:14 }}>
          <div className="panel-label">{fa?"مخاطبین به تفکیک بخش":"Contacts by department"}</div>
          {catStats.map(({ cat, count }) => (
            <StatRow key={cat} label={cat} value={count} max={catStats[0].count}
              color={CATEGORY_COLORS[cat]?.accent || "var(--accent)"} />
          ))}
        </div>
      )}

      {/* ══ دو ستون: visibility + نرخ تکمیل به اولویت ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        <div className="panel">
          <div className="panel-label">{fa?"سطح دسترسی مخاطبین":"Contact visibility"}</div>
          {visStats.map(({ v, count, label, color }) => (
            <div key={v} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }}/>
              <div style={{ flex:1, fontSize:11, color:"var(--text2)" }}>{label}</div>
              <Bar value={count} max={contacts.length || 1} color={color} />
              <div style={{ width:24, fontSize:11, fontFamily:"Syne,sans-serif", fontWeight:700, color }}>{count}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-label">{fa?"نرخ تکمیل به تفکیک اولویت":"Completion by priority"}</div>
          {[
            { label: fa?"فوری":"Urgent", rate: urgentDoneRate, count: tasks.filter(t=>t.priority===1).length, color:"var(--red)" },
            { label: fa?"معمولی":"Normal", rate: normalDoneRate, count: tasks.filter(t=>t.priority===2).length, color:"var(--amber)" },
          ].map(({ label, rate, count, color }) => (
            <div key={label} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:"var(--text2)" }}>{label} ({count})</span>
                <span style={{ fontSize:11, fontFamily:"Syne,sans-serif", fontWeight:700, color }}>
                  {fa ? toFarsiNum(rate) : rate}%
                </span>
              </div>
              <Bar value={rate} max={100} color={color} height={5} />
            </div>
          ))}
          <div style={{ marginTop:12, paddingTop:10, borderTop:"0.5px solid var(--border)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, color:"var(--text2)" }}>{fa?"کل":"Total"} ({tasks.length})</span>
              <span style={{ fontSize:11, fontFamily:"Syne,sans-serif", fontWeight:700, color:"var(--accent)" }}>
                {fa ? toFarsiNum(taskDoneRate) : taskDoneRate}%
              </span>
            </div>
            <Bar value={taskDoneRate} max={100} color="var(--accent)" height={5} />
          </div>
        </div>
      </div>

      {/* ══ وظایف باقیمانده به تفکیک اولویت ══ */}
      <div className="panel" style={{ marginBottom:14 }}>
        <div className="panel-label">{fa?"وضعیت وظایف":"Task breakdown"}</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom: overdueTasks.length > 0 ? 14 : 0 }}>
          {[
            { label:fa?"فوری":"Urgent",    count:urgentTasks.length, color:"var(--red)" },
            { label:fa?"معمولی":"Normal",   count:normalTasks.length, color:"var(--amber)" },
            { label:fa?"کم اهمیت":"Low",   count:lowTasks.length,    color:"var(--accent)" },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ background:"var(--bg4)", borderRadius:"var(--radius-sm)",
              padding:"10px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontFamily:"Syne,sans-serif", fontWeight:800, color }}>
                {fa ? toFarsiNum(count) : count}
              </div>
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* وظایف overdue */}
        {overdueTasks.length > 0 && (
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--red)", letterSpacing:"1.5px",
              textTransform:"uppercase", marginBottom:8 }}>
              {fa ? "وظایف عقب افتاده" : "Overdue tasks"}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {overdueTasks.slice(0,4).map((t) => (
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8,
                  padding:"6px 10px", background:"#e0606008", border:"0.5px solid #e0606022",
                  borderRadius:"var(--radius-sm)" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--red)", flexShrink:0 }}/>
                  <div style={{ flex:1, fontSize:12, color:"var(--text2)",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</div>
                  <div style={{ fontSize:10, color:"var(--red)", flexShrink:0 }}>{t.due_date}</div>
                </div>
              ))}
              {overdueTasks.length > 4 && (
                <div style={{ fontSize:11, color:"var(--red)", textAlign:"center", paddingTop:4 }}>
                  {fa ? `+ ${toFarsiNum(overdueTasks.length-4)} مورد دیگر` : `+ ${overdueTasks.length-4} more`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ رویدادها ══ */}
      <div className="panel" style={{ marginBottom:14 }}>
        <div className="panel-label">
          {fa ? `رویدادهای ${MONTHS_FA[today.jm-1]}` : "This month's events"}
          {lastMonthEvents.length > 0 && (
            <span style={{ marginRight:8, fontSize:10, color: eventGrowth>=0?"var(--accent)":"var(--red)",
              fontWeight:500 }}>
              {eventGrowth>0?"+":""}{fa?toFarsiNum(eventGrowth):eventGrowth}% {fa?"نسبت به ماه قبل":"vs last month"}
            </span>
          )}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:12 }}>
          {eventTypeCount.map(({ type, count, label, color }) => (
            <div key={type} style={{ background:"var(--bg4)", borderRadius:"var(--radius-sm)",
              padding:"10px 6px", textAlign:"center" }}>
              <div style={{ fontSize:18, fontFamily:"Syne,sans-serif", fontWeight:800, color }}>
                {fa ? toFarsiNum(count) : count}
              </div>
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* توزیع روزهای هفته */}
        <div className="panel-label" style={{ marginBottom:8 }}>
          {fa?"توزیع رویدادها در روزهای هفته":"Events by day of week"}
        </div>
        <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:50 }}>
          {dayCount.map(({ day, count }) => {
            const maxDay = Math.max(...dayCount.map(d=>d.count), 1);
            const h = count > 0 ? Math.max((count/maxDay)*40, 4) : 4;
            return (
              <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                <div style={{ fontSize:9, color:"var(--text3)" }}>
                  {count > 0 ? (fa ? toFarsiNum(count) : count) : ""}
                </div>
                <div style={{ width:"100%", height:h, background: count > 0 ? "var(--blue)" : "var(--bg4)",
                  borderRadius:2, transition:"height .4s ease" }}/>
                <div style={{ fontSize:9, color:"var(--text3)" }}>
                  {fa ? DAYS_FA[day][0] : ["S","S","M","T","W","T","F"][day]}
                </div>
              </div>
            );
          })}
        </div>

        {/* لیست رویدادها */}
        {thisMonthEvents.length > 0 && (
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:4 }}>
            {thisMonthEvents.slice(0,5).map((ev) => {
              const color = {meeting:"#4ab8e0",call:"#00d98b",reminder:"#d4a017",other:"#9b7de8"}[ev.type];
              return (
                <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:8,
                  padding:"7px 10px", background:"var(--bg4)", borderRadius:"var(--radius-sm)" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:color, flexShrink:0 }}/>
                  <div style={{ flex:1, fontSize:12, color:"var(--text2)",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.title}</div>
                  <div style={{ fontSize:10, color:"var(--text3)", flexShrink:0 }}>
                    {ev.start_time ? ev.start_time.slice(0,5) : ev.date}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ کاربران — فقط مدیر ارشد ══ */}
      {userRole === 1 && users.length > 0 && (
        <div className="panel">
          <div className="panel-label">{fa?"توزیع نقش‌های کاربران":"User role distribution"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:12 }}>
            {roleStats.map(({ r, count, label, color }) => (
              <div key={r} style={{ background:"var(--bg4)", borderRadius:"var(--radius-sm)",
                padding:"10px 6px", textAlign:"center" }}>
                <div style={{ fontSize:18, fontFamily:"Syne,sans-serif", fontWeight:800, color }}>
                  {fa ? toFarsiNum(count) : count}
                </div>
                <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
          {roleStats.map(({ r, count, label, color }) => count > 0 && (
            <StatRow key={r} label={label} value={count} max={users.length} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}
