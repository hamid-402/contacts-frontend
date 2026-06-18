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

function Bar({ value, max, color, height=6 }) {
  const pct = max > 0 ? Math.min((value/max)*100, 100) : 0;
  return (
    <div style={{ flex:1, height, background:"var(--bg4)", borderRadius:height/2, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:height/2, transition:"width .5s ease" }}/>
    </div>
  );
}

function KPI({ icon, value, label, trend, trendType, color="var(--accent)" }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background:`${color}14` }}>
          <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:color, fill:"none", strokeWidth:2 }}>{icon}</svg>
        </div>
        {trend !== undefined && <span className={`kpi-trend ${trendType||"flat"}`}>{trend}</span>}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function Alert({ type, msg }) {
  const colors = { red:"var(--red)", amber:"var(--amber)", blue:"var(--blue)", green:"var(--accent)" };
  const bgs    = { red:"#e0606010", amber:"#d4a01710", blue:"#4ab8e010", green:"#00d98b10" };
  const c = colors[type] || colors.amber;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
      background:bgs[type]||bgs.amber, border:`0.5px solid ${c}33`, borderRadius:"var(--radius-sm)", marginBottom:6 }}>
      <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:c, fill:"none", strokeWidth:2, flexShrink:0 }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span style={{ fontSize:12, color:c }}>{msg}</span>
    </div>
  );
}

function UserPerfCard({ user, lang, expanded, onToggle }) {
  const fa = lang === "fa";
  const p  = user.performance;
  const roleColors = { 1:"var(--red)", 2:"var(--blue)", 3:"var(--accent)", 4:"var(--purple)" };
  const roleLabels = { 1:fa?"مدیر ارشد":"Senior", 2:fa?"مدیر":"Manager", 3:fa?"کارمند":"Employee", 4:fa?"کاربر":"User" };
  const color      = roleColors[user.role];
  const perfColor  = p.done_rate >= 70 ? "var(--accent)" : p.done_rate >= 40 ? "var(--amber)" : "var(--red)";

  return (
    <div className="panel" style={{ marginBottom:6, cursor:"pointer" }} onClick={onToggle}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
          background:`${color}18`, border:`0.5px solid ${color}33`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:12, color }}>
          {(user.full_name||"?").trim().split(" ").map(p=>p[0]||"").join("").substring(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"var(--text1)",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {user.full_name || user.email}
            {p.overdue_tasks > 0 && (
              <span style={{ marginRight:6, fontSize:9, background:"var(--red)", color:"#fff",
                padding:"1px 5px", borderRadius:5, fontWeight:700 }}>
                {p.overdue_tasks} {fa?"عقب":"late"}
              </span>
            )}
          </div>
          <div style={{ fontSize:10, color:"var(--text3)", display:"flex", gap:6, marginTop:2, flexWrap:"wrap" }}>
            {user.username && <span style={{ color:"var(--accent)" }}>@{user.username}</span>}
            <span className="cat-badge" style={{ color, borderColor:`${color}33`, fontSize:9 }}>{roleLabels[user.role]}</span>
            {user.department && <span className="cat-badge" style={{ fontSize:9 }}>{user.department}</span>}
          </div>
        </div>
        <div style={{ textAlign:"center", flexShrink:0 }}>
          <div style={{ fontSize:16, fontFamily:"Syne,sans-serif", fontWeight:800, color:perfColor }}>
            {fa?toFarsiNum(p.done_rate):p.done_rate}%
          </div>
          <div style={{ fontSize:9, color:"var(--text3)" }}>{fa?"تکمیل":"done"}</div>
        </div>
        <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:"var(--text3)", fill:"none",
          strokeWidth:2, flexShrink:0, transform:expanded?"rotate(90deg)":"rotate(0)", transition:"transform .2s" }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
        <Bar value={p.done_rate} max={100} color={perfColor} height={4} />
      </div>

      {expanded && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:"0.5px solid var(--border)" }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:10 }}>
            {[
              { label:fa?"کل":"Total",    value:p.total_tasks,   color:"var(--text2)" },
              { label:fa?"انجام شده":"Done", value:p.done_tasks, color:"var(--accent)" },
              { label:fa?"باقیمانده":"Pending", value:p.pending_tasks, color:"var(--amber)" },
              { label:fa?"عقب افتاده":"Overdue", value:p.overdue_tasks, color:"var(--red)" },
              { label:fa?"فوری":"Urgent", value:p.urgent_tasks,  color:"var(--red)" },
              { label:fa?"رویدادها":"Events", value:p.total_events, color:"var(--blue)" },
            ].map(({ label, value, color:c }) => (
              <div key={label} style={{ background:"var(--bg4)", borderRadius:"var(--radius-sm)", padding:"8px", textAlign:"center" }}>
                <div style={{ fontSize:16, fontFamily:"Syne,sans-serif", fontWeight:800, color:c }}>
                  {fa?toFarsiNum(value):value}
                </div>
                <div style={{ fontSize:9, color:"var(--text3)", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
          {p.urgent_tasks > 0 && (
            <div style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:"var(--text2)" }}>{fa?"نرخ تکمیل فوری":"Urgent completion"}</span>
                <span style={{ fontSize:11, fontFamily:"Syne,sans-serif", fontWeight:700, color:"var(--red)" }}>
                  {fa?toFarsiNum(p.urgent_rate):p.urgent_rate}%
                </span>
              </div>
              <Bar value={p.urgent_rate} max={100} color="var(--red)" height={4} />
            </div>
          )}
          {p.last_activity && (
            <div style={{ fontSize:11, color:"var(--text3)" }}>
              {fa?"آخرین فعالیت:":"Last activity:"}{" "}
              <span style={{ color:"var(--text2)" }}>
                {new Date(p.last_activity).toLocaleDateString(fa?"fa-IR":"en-US")}
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

  const [userRole,  setUserRole]  = useState(null);
  const [userId,    setUserId]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [expanded,  setExpanded]  = useState({});
  const [memberFilter, setMemberFilter] = useState("all");
  const [memberSort,   setMemberSort]   = useState("rate");
  const [selectedDept, setSelectedDept] = useState(null);

  const [myPerf,     setMyPerf]     = useState(null);
  const [myContacts, setMyContacts] = useState([]);
  const [myEvents,   setMyEvents]   = useState([]);
  const [allData,    setAllData]    = useState(null);
  const [teamData,   setTeamData]   = useState(null);
  const [deptData,   setDeptData]   = useState(null);

  const today = todayJalaali();

  useEffect(() => {
    getUserProfile().then(async (u) => {
      if (!u) return;
      setUserRole(u.role || 4);
      setUserId(u.id);
      try {
        const [perf, contacts, events] = await Promise.all([
          fetch(`${API}/reports/me?user_id=${u.id}`).then(r=>r.json()),
          fetch(`${API}/contacts?user_id=${u.id}`).then(r=>r.json()),
          fetch(`${API}/events?user_id=${u.id}`).then(r=>r.json()),
        ]);
        setMyPerf(perf);
        setMyContacts(Array.isArray(contacts)?contacts:[]);
        setMyEvents(Array.isArray(events)?events:[]);

        if (u.role === 1) {
          const [all, depts] = await Promise.all([
            fetch(`${API}/reports/all?user_id=${u.id}`).then(r=>r.json()),
            fetch(`${API}/reports/departments?user_id=${u.id}`).then(r=>r.json()),
          ]);
          setAllData(all);
          setDeptData(depts);
        } else if (u.role === 2) {
          const team = await fetch(`${API}/reports/team?user_id=${u.id}`).then(r=>r.json());
          setTeamData(team);
        }
      } catch {}
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;

  /* ── محاسبات شخصی ── */
  const catStats = CATEGORIES
    .map(cat => ({ cat, count: myContacts.filter(c=>c.category===cat).length }))
    .filter(c=>c.count>0).sort((a,b)=>b.count-a.count);

  const thisMonthStr    = `${toFarsiNum(today.jy)}/${toFarsiNum(String(today.jm).padStart(2,"0"))}`;
  const lastMonthJm     = today.jm===1?12:today.jm-1;
  const lastMonthJy     = today.jm===1?today.jy-1:today.jy;
  const lastMonthStr    = `${toFarsiNum(lastMonthJy)}/${toFarsiNum(String(lastMonthJm).padStart(2,"0"))}`;
  const thisMonthEvents = myEvents.filter(e=>e.date?.startsWith(thisMonthStr));
  const lastMonthEvents = myEvents.filter(e=>e.date?.startsWith(lastMonthStr));
  const eventGrowth     = lastMonthEvents.length>0
    ? Math.round(((thisMonthEvents.length-lastMonthEvents.length)/lastMonthEvents.length)*100)
    : thisMonthEvents.length>0?100:0;

  const eventTypeCount = ["meeting","call","reminder","other"].map(type=>({
    type, count:thisMonthEvents.filter(e=>e.type===type).length,
    label:fa?{meeting:"جلسه",call:"تماس",reminder:"یادآوری",other:"سایر"}[type]
             :{meeting:"Meeting",call:"Call",reminder:"Reminder",other:"Other"}[type],
    color:{meeting:"#4ab8e0",call:"#00d98b",reminder:"#d4a017",other:"#9b7de8"}[type],
  }));

  /* هشدارهای شخصی */
  const personalAlerts = [];
  if (myPerf?.overdue_tasks>0) personalAlerts.push({ type:"red",   msg:fa?`${myPerf.overdue_tasks} وظیفه سررسید گذشته دارید`:`${myPerf.overdue_tasks} overdue tasks` });
  if (myPerf?.urgent_tasks>0)  personalAlerts.push({ type:"amber", msg:fa?`${myPerf.urgent_tasks} وظیفه فوری باقیمانده`:`${myPerf.urgent_tasks} urgent tasks pending` });
  if (thisMonthEvents.length===0) personalAlerts.push({ type:"blue", msg:fa?"هیچ رویدادی برای این ماه ثبت نشده":"No events this month" });

  /* ── بخش‌ها — از API ── */
  const allUsers  = allData?.users || [];
  const deptStats = (deptData?.departments || [])
    .filter(d => d.hasData)
    .map(dept => {
      /* عملکرد اعضا رو از allData بگیر */
      const membersWithPerf = dept.members.map(m => {
        const fullUser = allUsers.find(u => u.id === m.id);
        return fullUser || m;
      });
      const avgRate = membersWithPerf.length > 0
        ? Math.round(membersWithPerf.reduce((s,u) => s + (u.performance?.done_rate||0), 0) / membersWithPerf.length)
        : 0;
      const overdueTasks = membersWithPerf.reduce((s,u) => s + (u.performance?.overdue_tasks||0), 0);
      return { ...dept, members: membersWithPerf, avgRate, overdueTasks };
    })
    .sort((a,b) => b.avgRate - a.avgRate);

  /* ── اعضا با فیلتر ── */
  const sourceUsers = userRole===1 ? allUsers : (teamData?.users||[]);
  const depts = [...new Set(sourceUsers.map(u=>u.department).filter(Boolean))];
  const filteredMembers = sourceUsers
    .filter(u => memberFilter==="all" || u.department===memberFilter || u.role===Number(memberFilter))
    .sort((a,b) => {
      if (memberSort==="rate")    return b.performance.done_rate - a.performance.done_rate;
      if (memberSort==="overdue") return b.performance.overdue_tasks - a.performance.overdue_tasks;
      if (memberSort==="tasks")   return b.performance.total_tasks - a.performance.total_tasks;
      return 0;
    });

  /* ── سیستم ── */
  const sys = allData?.system;
  const sysAlerts = [];
  if (sys?.urgent_tasks>0) sysAlerts.push({ type:"red",   msg:fa?`${sys.urgent_tasks} وظیفه فوری در کل سیستم`:`${sys.urgent_tasks} urgent tasks system-wide` });
  const topPerformers  = [...allUsers].sort((a,b)=>b.performance.done_rate-a.performance.done_rate).slice(0,3);
  const latePerformers = [...allUsers].filter(u=>u.performance.overdue_tasks>0).sort((a,b)=>b.performance.overdue_tasks-a.performance.overdue_tasks).slice(0,3);

  /* tabs */
  const tabs = [
    { key:"personal",  label:fa?"گزارش من":"My Report" },
    ...(userRole===1?[{ key:"executive", label:fa?"داشبورد مدیریتی":"Executive" }]:[]),
    ...(userRole<=2?[{ key:"members",   label:fa?"اعضا":"Members" }]:[]),
    ...(userRole===1?[{ key:"depts",    label:fa?"بخش‌ها":"Departments" }]:[]),
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">{fa?"گزارش‌ها":"Reports"}</h2>
        <span className="page-count">{fa?MONTHS_FA[today.jm-1]:new Date().toLocaleString("en",{month:"long"})}</span>
      </div>

      <div className="tabs-row" style={{ marginBottom:16, flexWrap:"wrap" }}>
        {tabs.map(tb=>(
          <button key={tb.key} className={`tab-btn ${activeTab===tb.key?"active":""}`}
            onClick={()=>setActiveTab(tb.key)}>{tb.label}</button>
        ))}
      </div>

      {/* ══ گزارش شخصی ══ */}
      {activeTab==="personal" && myPerf && (
        <>
          {/* خلاصه اجرایی */}
          <div className="panel" style={{ marginBottom:14, borderColor:"#00d98b22" }}>
            <div className="panel-label" style={{ color:"var(--accent)" }}>{fa?"خلاصه اجرایی":"Executive Summary"}</div>
            <div style={{ fontSize:13, color:"var(--text1)", lineHeight:1.9 }}>
              {fa?<>
                شما <span style={{color:"var(--accent)",fontWeight:600}}>{myContacts.length}</span> مخاطب،{" "}
                <span style={{color:"var(--amber)",fontWeight:600}}>{myPerf.pending_tasks}</span> وظیفه باقیمانده و{" "}
                <span style={{color:"var(--blue)",fontWeight:600}}>{thisMonthEvents.length}</span> رویداد این ماه دارید.
                {myPerf.done_rate>0&&<> نرخ تکمیل وظایف <span style={{color:"var(--accent)",fontWeight:600}}>{toFarsiNum(myPerf.done_rate)}٪</span> است.</>}
                {eventGrowth!==0&&<> رویدادهای این ماه <span style={{color:eventGrowth>0?"var(--accent)":"var(--red)",fontWeight:600}}>
                  {eventGrowth>0?"+":""}{toFarsiNum(eventGrowth)}٪
                </span> نسبت به ماه قبل.</>}
              </>:<>
                You have <span style={{color:"var(--accent)",fontWeight:600}}>{myContacts.length}</span> contacts,{" "}
                <span style={{color:"var(--amber)",fontWeight:600}}>{myPerf.pending_tasks}</span> pending tasks and{" "}
                <span style={{color:"var(--blue)",fontWeight:600}}>{thisMonthEvents.length}</span> events this month.
                {myPerf.done_rate>0&&<> Completion rate: <span style={{color:"var(--accent)",fontWeight:600}}>{myPerf.done_rate}%</span>.</>}
              </>}
            </div>
          </div>

          {/* هشدارها */}
          {personalAlerts.map((a,i)=><Alert key={i} {...a}/>)}

          {/* KPI */}
          <div className="kpi-grid" style={{ marginBottom:14 }}>
            <KPI icon={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}
              value={myPerf.done_tasks} label={fa?"انجام شده":"Done"} color="var(--accent)"
              trend={`${fa?toFarsiNum(myPerf.done_rate):myPerf.done_rate}%`} trendType="up"/>
            <KPI icon={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}
              value={myPerf.pending_tasks} label={fa?"باقیمانده":"Pending"} color="var(--amber)"
              trend={myPerf.overdue_tasks>0?`${myPerf.overdue_tasks} ${fa?"عقب":"late"}`:undefined} trendType="down"/>
            <KPI icon={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
              value={thisMonthEvents.length} label={fa?"رویداد این ماه":"Events"} color="var(--blue)"
              trend={eventGrowth!==0?`${eventGrowth>0?"+":""}${fa?toFarsiNum(eventGrowth):eventGrowth}%`:undefined}
              trendType={eventGrowth>=0?"up":"down"}/>
            <KPI icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
              value={myContacts.length} label={fa?"مخاطبین":"Contacts"} color="var(--purple)"/>
          </div>

          {/* نرخ تکمیل */}
          <div className="panel" style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"نرخ تکمیل وظایف":"Task completion"}</div>
            {[
              { label:fa?"کل":"Total",   rate:myPerf.done_rate,   color:"var(--accent)" },
              { label:fa?"فوری":"Urgent", rate:myPerf.urgent_rate, color:"var(--red)" },
            ].map(({label,rate,color})=>(
              <div key={label} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:"var(--text2)" }}>{label}</span>
                  <span style={{ fontSize:12, fontFamily:"Syne,sans-serif", fontWeight:700, color }}>
                    {fa?toFarsiNum(rate):rate}%
                  </span>
                </div>
                <Bar value={rate} max={100} color={color} height={5}/>
              </div>
            ))}
          </div>

          {/* مخاطبین به تفکیک بخش */}
          {catStats.length>0&&(
            <div className="panel" style={{ marginBottom:14 }}>
              <div className="panel-label">{fa?"مخاطبین به تفکیک بخش":"Contacts by dept"}</div>
              {catStats.map(({cat,count})=>(
                <div key={cat} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <div style={{ width:110, fontSize:12, color:"var(--text2)", textAlign:"right",
                    flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cat}</div>
                  <Bar value={count} max={catStats[0].count} color={CATEGORY_COLORS[cat]?.accent||"var(--accent)"}/>
                  <div style={{ width:24, fontSize:12, fontFamily:"Syne,sans-serif", fontWeight:700,
                    color:CATEGORY_COLORS[cat]?.accent||"var(--accent)", textAlign:"center", flexShrink:0 }}>{count}</div>
                </div>
              ))}
            </div>
          )}

          {/* سطح دسترسی مخاطبین */}
          {myContacts.length>0&&(
            <div className="panel" style={{ marginBottom:14 }}>
              <div className="panel-label">{fa?"سطح دسترسی مخاطبین":"Contact visibility"}</div>
              {[1,2,3,4].map(v=>{
                const count=myContacts.filter(c=>c.visibility===v).length;
                const label=fa?{1:"محرمانه",2:"نیمه محرمانه",3:"عمومی شرکت",4:"همه"}[v]
                               :{1:"Confidential",2:"Semi-conf.",3:"Company",4:"Everyone"}[v];
                const color=["#e06060","#d4a017","#4ab8e0","#00d98b"][v-1];
                return(
                  <div key={v} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }}/>
                    <div style={{ width:110, fontSize:12, color:"var(--text2)", flexShrink:0 }}>{label}</div>
                    <Bar value={count} max={myContacts.length} color={color}/>
                    <div style={{ width:24, fontSize:12, fontFamily:"Syne,sans-serif", fontWeight:700, color, textAlign:"center", flexShrink:0 }}>{count}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* توزیع رویدادها در روزهای هفته */}
          {myEvents.length>0&&(
            <div className="panel" style={{ marginBottom:14 }}>
              <div className="panel-label">{fa?"توزیع رویدادها در روزهای هفته":"Events by day of week"}</div>
              <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:60 }}>
                {[0,1,2,3,4,5,6].map(day=>{
                  const count=myEvents.filter(e=>{
                    if(!e.date) return false;
                    try{
                      const parts=e.date.split("/").map(s=>parseInt(String(s).replace(/[۰-۹]/g,c=>"۰۱۲۳۴۵۶۷۸۹".indexOf(c))));
                      const g=jalaali.toGregorian(parts[0],parts[1],parts[2]);
                      return new Date(g.gy,g.gm-1,g.gd).getDay()===(day+6)%7;
                    }catch{return false;}
                  }).length;
                  const maxC=Math.max(...[0,1,2,3,4,5,6].map(d=>myEvents.filter(e=>{
                    if(!e.date)return false;
                    try{const p=e.date.split("/").map(s=>parseInt(String(s).replace(/[۰-۹]/g,c=>"۰۱۲۳۴۵۶۷۸۹".indexOf(c))));const g=jalaali.toGregorian(p[0],p[1],p[2]);return new Date(g.gy,g.gm-1,g.gd).getDay()===(d+6)%7;}catch{return false;}
                  }).length),1);
                  const h=count>0?Math.max((count/maxC)*44,4):4;
                  return(
                    <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                      <div style={{ fontSize:9, color:"var(--text3)" }}>{count>0?(fa?toFarsiNum(count):count):""}</div>
                      <div style={{ width:"100%", height:h, background:count>0?"var(--blue)":"var(--bg4)", borderRadius:2, transition:"height .4s ease" }}/>
                      <div style={{ fontSize:9, color:"var(--text3)" }}>{DAYS_FA[day]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* رویدادهای این ماه */}
          <div className="panel">
            <div className="panel-label">{fa?`رویدادهای ${MONTHS_FA[today.jm-1]}`:"This month's events"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:thisMonthEvents.length>0?12:0 }}>
              {eventTypeCount.map(({type,count,label,color})=>(
                <div key={type} style={{ background:"var(--bg4)", borderRadius:"var(--radius-sm)", padding:"10px 6px", textAlign:"center" }}>
                  <div style={{ fontSize:18, fontFamily:"Syne,sans-serif", fontWeight:800, color }}>{fa?toFarsiNum(count):count}</div>
                  <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
            {thisMonthEvents.slice(0,5).map(ev=>{
              const color={meeting:"#4ab8e0",call:"#00d98b",reminder:"#d4a017",other:"#9b7de8"}[ev.type];
              return(
                <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
                  background:"var(--bg4)", borderRadius:"var(--radius-sm)", marginBottom:4 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:color, flexShrink:0 }}/>
                  <div style={{ flex:1, fontSize:12, color:"var(--text2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.title}</div>
                  <div style={{ fontSize:10, color:"var(--text3)", flexShrink:0 }}>{ev.start_time?ev.start_time.slice(0,5):ev.date}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══ داشبورد مدیریتی ══ */}
      {activeTab==="executive" && userRole===1 && (
        <>
          {sysAlerts.map((a,i)=><Alert key={i} {...a}/>)}

          {/* KPI سیستم */}
          {sys&&(
            <div className="kpi-grid" style={{ marginBottom:14 }}>
              <KPI icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                value={allUsers.length} label={fa?"کل کاربران":"Total users"} color="var(--blue)"/>
              <KPI icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>}
                value={sys.total_contacts} label={fa?"کل مخاطبین":"Contacts"} color="var(--accent)"/>
              <KPI icon={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}
                value={sys.done_tasks} label={fa?"وظایف انجام شده":"Done tasks"} color="var(--accent)"
                trend={`${Math.round((sys.done_tasks/Math.max(sys.total_tasks,1))*100)}%`} trendType="up"/>
              <KPI icon={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></>}
                value={sys.urgent_tasks} label={fa?"وظایف فوری":"Urgent"} color="var(--red)"/>
            </div>
          )}

          {/* بهترین عملکردها */}
          {topPerformers.length>0&&(
            <div className="panel" style={{ marginBottom:14 }}>
              <div className="panel-label" style={{ color:"var(--accent)" }}>
                🏆 {fa?"بهترین عملکرد این دوره":"Top performers"}
              </div>
              {topPerformers.map((u,i)=>{
                const colors=["var(--amber)","var(--text3)","#cd7f32"];
                const perfColor=u.performance.done_rate>=70?"var(--accent)":u.performance.done_rate>=40?"var(--amber)":"var(--red)";
                return(
                  <div key={u.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px",
                    background:"var(--bg4)", borderRadius:"var(--radius-sm)", marginBottom:6 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:`${colors[i]}22`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:800, color:colors[i], flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:"var(--text1)" }}>{u.full_name}</div>
                      <div style={{ fontSize:10, color:"var(--text3)" }}>{u.department||""}</div>
                    </div>
                    <div style={{ fontSize:16, fontFamily:"Syne,sans-serif", fontWeight:800, color:perfColor }}>
                      {fa?toFarsiNum(u.performance.done_rate):u.performance.done_rate}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* وظایف عقب افتاده */}
          {latePerformers.length>0&&(
            <div className="panel" style={{ marginBottom:14 }}>
              <div className="panel-label" style={{ color:"var(--red)" }}>
                ⚠️ {fa?"وظایف عقب افتاده":"Overdue alerts"}
              </div>
              {latePerformers.map(u=>(
                <div key={u.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px",
                  background:"#e0606008", border:"0.5px solid #e0606022", borderRadius:"var(--radius-sm)", marginBottom:6 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--red)", flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:"var(--text1)" }}>{u.full_name}</div>
                    <div style={{ fontSize:10, color:"var(--text3)" }}>{u.department||""}</div>
                  </div>
                  <div style={{ fontSize:13, fontFamily:"Syne,sans-serif", fontWeight:700, color:"var(--red)" }}>
                    {u.performance.overdue_tasks} {fa?"مورد":"late"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* میانگین عملکرد کل */}
          {sys&&(
            <div className="panel">
              <div className="panel-label">{fa?"عملکرد کل سیستم":"System performance"}</div>
              <div style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:"var(--text2)" }}>{fa?"نرخ تکمیل کل":"Total completion"}</span>
                  <span style={{ fontSize:12, fontFamily:"Syne,sans-serif", fontWeight:700, color:"var(--accent)" }}>
                    {Math.round((sys.done_tasks/Math.max(sys.total_tasks,1))*100)}%
                  </span>
                </div>
                <Bar value={sys.done_tasks} max={Math.max(sys.total_tasks,1)} color="var(--accent)" height={6}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginTop:12 }}>
                {[
                  { label:fa?"مدیر ارشد":"Senior", count:allUsers.filter(u=>u.role===1).length, color:"var(--red)" },
                  { label:fa?"مدیر":"Manager",      count:allUsers.filter(u=>u.role===2).length, color:"var(--blue)" },
                  { label:fa?"کارمند":"Employee",   count:allUsers.filter(u=>u.role>=3).length,  color:"var(--accent)" },
                ].map(({label,count,color})=>(
                  <div key={label} style={{ background:"var(--bg4)", borderRadius:"var(--radius-sm)", padding:"10px", textAlign:"center" }}>
                    <div style={{ fontSize:20, fontFamily:"Syne,sans-serif", fontWeight:800, color }}>{fa?toFarsiNum(count):count}</div>
                    <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ اعضا ══ */}
      {activeTab==="members" && (
        <>
          {/* فیلتر و مرتب‌سازی */}
          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
            <select className="app-input" style={{ flex:1, maxWidth:200, paddingLeft:12 }}
              value={memberFilter} onChange={e=>setMemberFilter(e.target.value)}>
              <option value="all">{fa?"همه بخش‌ها":"All departments"}</option>
              {depts.map(d=><option key={d} value={d}>{d}</option>)}
              <option value="2">{fa?"مدیران":"Managers"}</option>
              <option value="3">{fa?"کارمندان":"Employees"}</option>
            </select>
            <select className="app-input" style={{ flex:1, maxWidth:200, paddingLeft:12 }}
              value={memberSort} onChange={e=>setMemberSort(e.target.value)}>
              <option value="rate">{fa?"بهترین عملکرد":"Best performance"}</option>
              <option value="overdue">{fa?"بیشترین تاخیر":"Most overdue"}</option>
              <option value="tasks">{fa?"بیشترین وظیفه":"Most tasks"}</option>
            </select>
          </div>

          {/* خلاصه */}
          <div className="kpi-grid" style={{ gridTemplateColumns:"repeat(3,1fr)", marginBottom:14 }}>
            <KPI icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
              value={filteredMembers.length} label={fa?"تعداد اعضا":"Members"} color="var(--blue)"/>
            <KPI icon={<><path d="M9 11l3 3L22 4"/></>}
              value={filteredMembers.length>0?Math.round(filteredMembers.reduce((s,u)=>s+u.performance.done_rate,0)/filteredMembers.length):0}
              label={fa?"میانگین تکمیل":"Avg completion"} color="var(--accent)" trend="%" trendType="up"/>
            <KPI icon={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></>}
              value={filteredMembers.reduce((s,u)=>s+u.performance.overdue_tasks,0)}
              label={fa?"کل تاخیرها":"Total overdue"} color="var(--red)"/>
          </div>

          {filteredMembers.length===0?(
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <p>{fa?"عضوی یافت نشد":"No members found"}</p>
            </div>
          ):(
            filteredMembers.map(u=>(
              <UserPerfCard key={u.id} user={u} lang={lang}
                expanded={!!expanded[u.id]}
                onToggle={()=>setExpanded(p=>({...p,[u.id]:!p[u.id]}))}/>
            ))
          )}

          {/* رتبه‌بندی کامل — فقط وقتی فیلتر "همه" هست */}
          {memberFilter==="all" && userRole===1 && allUsers.length>0 && (
            <div className="panel" style={{ marginTop:14 }}>
              <div className="panel-label">{fa?"رتبه‌بندی کامل عملکرد":"Full performance ranking"}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {[...allUsers]
                  .sort((a,b)=>b.performance.done_rate-a.performance.done_rate)
                  .map((u,i)=>{
                    const perfColor=u.performance.done_rate>=70?"var(--accent)":u.performance.done_rate>=40?"var(--amber)":"var(--red)";
                    const medalColors=["var(--amber)","var(--text3)","#cd7f32"];
                    return(
                      <div key={u.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                        background:"var(--bg4)", borderRadius:"var(--radius-sm)" }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                          background: i<3?`${medalColors[i]}22`:"var(--bg3)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:11, fontWeight:800, color:i<3?medalColors[i]:"var(--text3)" }}>
                          {i+1}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:500, color:"var(--text1)",
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {u.full_name}
                          </div>
                          <div style={{ fontSize:10, color:"var(--text3)" }}>{u.department||""}</div>
                        </div>
                        {u.performance.overdue_tasks>0&&(
                          <span style={{ fontSize:9, background:"var(--red)", color:"#fff",
                            padding:"1px 5px", borderRadius:5, fontWeight:700, flexShrink:0 }}>
                            {u.performance.overdue_tasks} {fa?"تاخیر":"late"}
                          </span>
                        )}
                        <div style={{ fontSize:14, fontFamily:"Syne,sans-serif", fontWeight:800,
                          color:perfColor, flexShrink:0, minWidth:38, textAlign:"center" }}>
                          {fa?toFarsiNum(u.performance.done_rate):u.performance.done_rate}%
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ بخش‌ها ══ */}
      {activeTab==="depts" && userRole===1 && (
        <>
          {selectedDept ? (
            <>
              <button onClick={()=>setSelectedDept(null)} style={{ display:"flex", alignItems:"center", gap:6,
                background:"transparent", border:"none", color:"var(--accent)", cursor:"pointer", fontSize:13,
                fontFamily:"DM Sans,sans-serif", marginBottom:16 }}>
                <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:"currentColor", fill:"none", strokeWidth:2 }}>
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                {fa?"بازگشت به بخش‌ها":"Back to departments"}
              </button>

              {/* هدر بخش */}
              <div className="panel" style={{ marginBottom:14 }}>
                <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:16, color:"var(--text1)", marginBottom:10 }}>
                  {selectedDept.name}
                </h3>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:10 }}>
                  {[
                    { label:fa?"اعضا":"Members",       value:selectedDept.memberCount,  color:"var(--blue)" },
                    { label:fa?"مخاطبین":"Contacts",   value:selectedDept.contactCount, color:"var(--accent)" },
                    { label:fa?"تکمیل":"Completion",   value:`${selectedDept.avgRate}%`,color:"var(--accent)" },
                    { label:fa?"تاخیر":"Overdue",      value:selectedDept.overdueTasks, color:"var(--red)" },
                  ].map(({label,value,color})=>(
                    <div key={label} style={{ background:"var(--bg4)", borderRadius:"var(--radius-sm)", padding:"10px", textAlign:"center" }}>
                      <div style={{ fontSize:18, fontFamily:"Syne,sans-serif", fontWeight:800, color }}>{value}</div>
                      <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                {selectedDept.manager && (
                  <div style={{ fontSize:12, color:"var(--text3)", display:"flex", alignItems:"center", gap:6 }}>
                    <svg viewBox="0 0 24 24" style={{ width:12, height:12, stroke:"var(--text3)", fill:"none", strokeWidth:2 }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    {fa?"مدیر بخش:":"Manager:"}{" "}
                    <span style={{ color:"var(--text1)", fontWeight:500 }}>{selectedDept.manager.full_name}</span>
                  </div>
                )}
              </div>

              {/* اعضا */}
              {selectedDept.members.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div className="section-title" style={{ marginBottom:8 }}>{fa?"اعضای بخش":"Department members"}</div>
                  {selectedDept.members.map(u=>(
                    <UserPerfCard key={u.id} user={u} lang={lang}
                      expanded={!!expanded[u.id]}
                      onToggle={()=>setExpanded(p=>({...p,[u.id]:!p[u.id]}))}/>
                  ))}
                </div>
              )}

              {/* مخاطبین */}
              {selectedDept.contacts.length > 0 && (
                <div>
                  <div className="section-title" style={{ marginBottom:8 }}>{fa?"مخاطبین بخش":"Department contacts"}</div>
                  <div className="contact-list">
                    {selectedDept.contacts.map(c=>(
                      <div key={c.id} className="contact-item" style={{ cursor:"default" }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:"var(--accent-bg)",
                          border:"0.5px solid #00d98b22", display:"flex", alignItems:"center",
                          justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:700,
                          fontSize:12, color:"var(--accent)", flexShrink:0 }}>
                          {(c.name||"?")[0]}
                        </div>
                        <div className="contact-info">
                          <div className="contact-name">{c.name}</div>
                          <div className="contact-phone" dir="ltr">{c.phone}</div>
                        </div>
                        <span className="vis-badge vis-4" style={{ fontSize:9 }}>
                          {["","محرمانه","نیمه محرمانه","عمومی","همه"][c.visibility]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDept.members.length===0 && selectedDept.contacts.length===0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  </div>
                  <p>{fa?"این بخش خالی است":"This department is empty"}</p>
                </div>
              )}
            </>
          ):(
            <>
              <div style={{ fontSize:12, color:"var(--text3)", marginBottom:12 }}>
                {fa?"کلیک روی هر بخش برای مشاهده اعضا و مخاطبین":"Click a department to see members and contacts"}
              </div>
              {deptStats.length===0?(
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  </div>
                  <p>{fa?"هیچ بخشی داده ندارد — ابتدا از Admin بخش کاربران را تعیین کنید":"No department data — assign departments in Admin first"}</p>
                </div>
              ):(
                deptStats.map(dept=>{
                  const perfColor=dept.avgRate>=70?"var(--accent)":dept.avgRate>=40?"var(--amber)":"var(--red)";
                  return(
                    <div key={dept.name} className="panel" style={{ marginBottom:8, cursor:"pointer" }}
                      onClick={()=>setSelectedDept(dept)}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:42, height:42, borderRadius:10, background:"var(--accent-bg)",
                          border:"0.5px solid #00d98b22", display:"flex", alignItems:"center", justifyContent:"center",
                          fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"var(--accent)", flexShrink:0 }}>
                          {dept.name[0]}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:600, color:"var(--text1)" }}>{dept.name}</div>
                          <div style={{ fontSize:11, color:"var(--text3)", marginTop:3, display:"flex", gap:10 }}>
                            <span>{dept.memberCount} {fa?"نفر":"members"}</span>
                            <span>{dept.contactCount} {fa?"مخاطب":"contacts"}</span>
                            {dept.manager&&<span>{fa?"مدیر:":"Mgr:"} {dept.manager.full_name}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign:"center", flexShrink:0, minWidth:48 }}>
                          <div style={{ fontSize:18, fontFamily:"Syne,sans-serif", fontWeight:800, color:dept.memberCount>0?perfColor:"var(--text4)" }}>
                            {dept.memberCount>0?(fa?toFarsiNum(dept.avgRate):dept.avgRate)+"%":"—"}
                          </div>
                          <div style={{ fontSize:9, color:"var(--text3)" }}>{fa?"تکمیل":"completion"}</div>
                        </div>
                        {dept.overdueTasks>0&&(
                          <span style={{ fontSize:10, background:"var(--red)", color:"#fff",
                            padding:"2px 7px", borderRadius:8, fontWeight:700, flexShrink:0 }}>
                            {dept.overdueTasks} {fa?"تاخیر":"late"}
                          </span>
                        )}
                        <svg viewBox="0 0 24 24" style={{ width:14, height:14, stroke:"var(--text3)", fill:"none", strokeWidth:2, flexShrink:0 }}>
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                      {dept.memberCount>0&&(
                        <div style={{ marginTop:8 }}>
                          <Bar value={dept.avgRate} max={100} color={perfColor} height={4}/>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
