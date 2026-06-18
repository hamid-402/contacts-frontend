import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API, getUserProfile } from "../components/shared";
import { useSettings } from "../context/SettingsContext";

/* ── آیکون‌ها ── */
const IconPlus   = () => <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit   = () => <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>;
const IconTrash  = () => <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconPhone  = () => <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail   = () => <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconWeb    = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconMap    = () => <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconUser   = () => <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconSearch = () => <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconClose  = () => <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevron= () => <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>;

const svgStyle = { width:14, height:14, stroke:"currentColor", fill:"none", strokeWidth:2 };

/* ── ثابت‌ها ── */
const ORG_TYPES = [
  { value:"bank",     fa:"بانک",           en:"Bank" },
  { value:"insurance",fa:"بیمه",           en:"Insurance" },
  { value:"government",fa:"اداره دولتی",   en:"Government" },
  { value:"private",  fa:"شرکت خصوصی",    en:"Private Company" },
  { value:"university",fa:"دانشگاه",       en:"University" },
  { value:"other",    fa:"سایر",           en:"Other" },
];

const ORG_STATUS = [
  { value:"active",      fa:"فعال",             en:"Active",       color:"var(--accent)" },
  { value:"inactive",    fa:"غیرفعال",          en:"Inactive",     color:"var(--red)" },
  { value:"negotiating", fa:"در دست مذاکره",   en:"Negotiating",  color:"var(--amber)" },
];

const PHONE_TYPES = ["مرکزی","پشتیبانی","فاکس","مستقیم","سایر"];
const EMAIL_TYPES = ["عمومی","مدیر","پشتیبانی","سایر"];

/* ══ فرم سازمان ══ */
function OrgForm({ initial, onSave, onClose, userRole, lang }) {
  const fa = lang === "fa";
  const empty = {
    name:"", type:"other", status:"active", national_id:"",
    website:"", address:"", note:"", visibility:4,
    phones:[{ number:"", type:"مرکزی" }],
    emails:[{ address:"", type:"عمومی" }],
    main_contact:{ name:"", role:"", phone:"" },
  };

  const [form, setForm] = useState(initial || empty);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* phone helpers */
  const addPhone   = () => setForm(p => ({ ...p, phones: [...p.phones, { number:"", type:"مرکزی" }] }));
  const removePhone= (i) => setForm(p => ({ ...p, phones: p.phones.filter((_,j) => j !== i) }));
  const setPhone   = (i, k, v) => setForm(p => ({ ...p, phones: p.phones.map((ph,j) => j===i ? {...ph,[k]:v} : ph) }));

  /* email helpers */
  const addEmail   = () => setForm(p => ({ ...p, emails: [...p.emails, { address:"", type:"عمومی" }] }));
  const removeEmail= (i) => setForm(p => ({ ...p, emails: p.emails.filter((_,j) => j !== i) }));
  const setEmail   = (i, k, v) => setForm(p => ({ ...p, emails: p.emails.map((em,j) => j===i ? {...em,[k]:v} : em) }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError(fa?"نام سازمان الزامی است":"Name is required"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...form,
        phones: form.phones.filter(p => p.number.trim()),
        emails: form.emails.filter(e => e.address.trim()),
      });
      onClose();
    } catch (err) {
      setError(err.message || "خطا");
    }
    setSaving(false);
  };

  const inputCls = "app-input";

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width:480, maxHeight:"90vh", overflowY:"auto" }}>
        <h3 className="modal-title">{initial ? (fa?"ویرایش سازمان":"Edit Organization") : (fa?"افزودن سازمان":"Add Organization")}</h3>

        {error && <div className="auth-error" style={{ marginBottom:12 }}>{error}</div>}

        {/* اطلاعات پایه */}
        <div className="panel-label">{fa?"اطلاعات پایه":"Basic info"}</div>

        <div className="input-wrap">
          <span className="input-icon"><IconUser /></span>
          <input className={inputCls} placeholder={fa?"نام سازمان *":"Organization name *"}
            value={form.name} onChange={e => set("name", e.target.value)} />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
          <select className={inputCls} style={{ paddingLeft:12 }} value={form.type} onChange={e => set("type", e.target.value)}>
            {ORG_TYPES.map(t => <option key={t.value} value={t.value}>{fa?t.fa:t.en}</option>)}
          </select>
          <select className={inputCls} style={{ paddingLeft:12 }} value={form.status} onChange={e => set("status", e.target.value)}>
            {ORG_STATUS.map(s => <option key={s.value} value={s.value}>{fa?s.fa:s.en}</option>)}
          </select>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
          <input className={inputCls} style={{ paddingLeft:12 }} placeholder={fa?"شناسه ملی / کد اقتصادی":"National ID"}
            value={form.national_id} onChange={e => set("national_id", e.target.value)} dir="ltr" />
          <input className={inputCls} style={{ paddingLeft:12 }} placeholder={fa?"وب‌سایت":"Website"}
            value={form.website} onChange={e => set("website", e.target.value)} dir="ltr" />
        </div>

        {/* تلفن‌ها */}
        <div className="panel-label" style={{ marginTop:8 }}>{fa?"تلفن‌ها":"Phone numbers"}</div>
        {form.phones.map((ph, i) => (
          <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
            <input className={inputCls} style={{ flex:2, paddingLeft:12 }} placeholder={fa?"شماره تلفن":"Phone number"}
              value={ph.number} onChange={e => setPhone(i,"number",e.target.value)} dir="ltr" />
            <select className={inputCls} style={{ flex:1, paddingLeft:12 }} value={ph.type}
              onChange={e => setPhone(i,"type",e.target.value)}>
              {PHONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {form.phones.length > 1 && (
              <button onClick={() => removePhone(i)} style={{ width:36, height:44, borderRadius:"var(--radius-sm)",
                border:"0.5px solid var(--red-border)", background:"var(--red-bg)", cursor:"pointer", display:"flex",
                alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg viewBox="0 0 24 24" style={{ ...svgStyle, stroke:"var(--red)" }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        ))}
        <button onClick={addPhone} style={{ fontSize:11, color:"var(--accent)", background:"transparent",
          border:"0.5px solid #00d98b22", borderRadius:"var(--radius-sm)", padding:"5px 12px",
          cursor:"pointer", marginBottom:10 }}>
          + {fa?"افزودن شماره":"Add phone"}
        </button>

        {/* ایمیل‌ها */}
        <div className="panel-label">{fa?"ایمیل‌ها":"Emails"}</div>
        {form.emails.map((em, i) => (
          <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
            <input className={inputCls} style={{ flex:2, paddingLeft:12 }} placeholder={fa?"آدرس ایمیل":"Email address"}
              value={em.address} onChange={e => setEmail(i,"address",e.target.value)} dir="ltr" />
            <select className={inputCls} style={{ flex:1, paddingLeft:12 }} value={em.type}
              onChange={e => setEmail(i,"type",e.target.value)}>
              {EMAIL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {form.emails.length > 1 && (
              <button onClick={() => removeEmail(i)} style={{ width:36, height:44, borderRadius:"var(--radius-sm)",
                border:"0.5px solid var(--red-border)", background:"var(--red-bg)", cursor:"pointer", display:"flex",
                alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg viewBox="0 0 24 24" style={{ ...svgStyle, stroke:"var(--red)" }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        ))}
        <button onClick={addEmail} style={{ fontSize:11, color:"var(--accent)", background:"transparent",
          border:"0.5px solid #00d98b22", borderRadius:"var(--radius-sm)", padding:"5px 12px",
          cursor:"pointer", marginBottom:10 }}>
          + {fa?"افزودن ایمیل":"Add email"}
        </button>

        {/* مخاطب اصلی */}
        <div className="panel-label">{fa?"مخاطب اصلی":"Main contact"}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
          <input className={inputCls} style={{ paddingLeft:12 }} placeholder={fa?"نام مخاطب":"Contact name"}
            value={form.main_contact.name} onChange={e => set("main_contact",{...form.main_contact,name:e.target.value})} />
          <input className={inputCls} style={{ paddingLeft:12 }} placeholder={fa?"سمت":"Position"}
            value={form.main_contact.role} onChange={e => set("main_contact",{...form.main_contact,role:e.target.value})} />
        </div>
        <input className={inputCls} style={{ paddingLeft:12, marginBottom:10 }} placeholder={fa?"شماره مستقیم":"Direct phone"}
          value={form.main_contact.phone} onChange={e => set("main_contact",{...form.main_contact,phone:e.target.value})} dir="ltr" />

        {/* آدرس */}
        <div className="panel-label">{fa?"آدرس":"Address"}</div>
        <textarea className={inputCls} placeholder={fa?"آدرس کامل":"Full address"}
          value={form.address} onChange={e => set("address", e.target.value)}
          style={{ minHeight:60, resize:"vertical", paddingLeft:12 }} />

        {/* یادداشت */}
        <div className="panel-label" style={{ marginTop:8 }}>{fa?"یادداشت":"Note"}</div>
        <textarea className={inputCls} placeholder={fa?"یادداشت درباره این سازمان...":"Notes about this organization..."}
          value={form.note} onChange={e => set("note", e.target.value)}
          style={{ minHeight:60, resize:"vertical", paddingLeft:12 }} />

        {/* visibility — فقط مدیر ارشد */}
        {userRole === 1 && (
          <>
            <div className="panel-label" style={{ marginTop:8 }}>{fa?"سطح دسترسی":"Visibility"}</div>
            <select className={inputCls} style={{ paddingLeft:12, marginBottom:0 }}
              value={form.visibility} onChange={e => set("visibility", Number(e.target.value))}>
              <option value={1}>{fa?"محرمانه":"Confidential"}</option>
              <option value={2}>{fa?"نیمه محرمانه":"Semi-confidential"}</option>
              <option value={3}>{fa?"عمومی شرکت":"Company-wide"}</option>
              <option value={4}>{fa?"همه":"Everyone"}</option>
            </select>
          </>
        )}

        <div className="modal-btns" style={{ marginTop:16 }}>
          <button className="btn-cancel" onClick={onClose}>{fa?"انصراف":"Cancel"}</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? (fa?"در حال ذخیره...":"Saving...") : (fa?"ذخیره":"Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ کارت سازمان ══ */
function OrgCard({ org, onEdit, onDelete, onView, userRole, lang }) {
  const fa = lang === "fa";
  const status = ORG_STATUS.find(s => s.value === org.status) || ORG_STATUS[0];
  const type   = ORG_TYPES.find(t => t.value === org.type) || ORG_TYPES[5];
  const phones = Array.isArray(org.phones) ? org.phones : (org.phones ? JSON.parse(org.phones) : []);
  const emails = Array.isArray(org.emails) ? org.emails : (org.emails ? JSON.parse(org.emails) : []);
  const mc     = typeof org.main_contact === "object" ? org.main_contact : (org.main_contact ? JSON.parse(org.main_contact) : {});

  return (
    <div className="panel" style={{ marginBottom:8, cursor:"pointer" }} onClick={() => onView(org)}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        {/* آیکون */}
        <div style={{ width:40, height:40, borderRadius:10, background:"var(--accent-bg)",
          border:"0.5px solid #00d98b22", display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0 }}>
          <svg viewBox="0 0 24 24" style={{ width:18, height:18, stroke:"var(--accent)", fill:"none", strokeWidth:1.8 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--text1)" }}>{org.name}</div>
            <span className="cat-badge">{fa ? type.fa : type.en}</span>
            <span className="cat-badge" style={{ color:status.color, borderColor:`${status.color}33` }}>
              {fa ? status.fa : status.en}
            </span>
          </div>

          {/* تلفن اول */}
          {phones[0] && (
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5, fontSize:12, color:"var(--text3)" }}>
              <svg viewBox="0 0 24 24" style={{ width:11, height:11, stroke:"var(--text3)", fill:"none", strokeWidth:2 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span dir="ltr">{phones[0].number}</span>
              <span style={{ color:"var(--text4)" }}>({phones[0].type})</span>
              {phones.length > 1 && <span style={{ color:"var(--accent)", fontSize:10 }}>+{phones.length-1}</span>}
            </div>
          )}

          {/* مخاطب اصلی */}
          {mc?.name && (
            <div style={{ fontSize:11, color:"var(--text3)", marginTop:3 }}>
              {mc.name}{mc.role ? ` — ${mc.role}` : ""}
            </div>
          )}
        </div>

        {/* دکمه‌ها */}
        <div className="actions" onClick={e => e.stopPropagation()}>
          {(userRole === 1 || userRole === 2) && (
            <button className="btn-icon btn-edit" onClick={() => onEdit(org)}><IconEdit /></button>
          )}
          {userRole === 1 && (
            <button className="btn-icon btn-del" onClick={() => onDelete(org.id)}><IconTrash /></button>
          )}
        </div>
        <div style={{ color:"var(--text4)", flexShrink:0 }}><IconChevron /></div>
      </div>
    </div>
  );
}

/* ══ جزئیات سازمان ══ */
function OrgDetail({ org, onClose, lang }) {
  const fa = lang === "fa";
  const phones = Array.isArray(org.phones) ? org.phones : (org.phones ? JSON.parse(org.phones) : []);
  const emails = Array.isArray(org.emails) ? org.emails : (org.emails ? JSON.parse(org.emails) : []);
  const mc     = typeof org.main_contact === "object" ? org.main_contact : (org.main_contact ? JSON.parse(org.main_contact) : {});
  const contacts = Array.isArray(org.contacts) ? org.contacts.filter(Boolean) : [];
  const status = ORG_STATUS.find(s => s.value === org.status) || ORG_STATUS[0];
  const type   = ORG_TYPES.find(t => t.value === org.type) || ORG_TYPES[5];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width:480, maxHeight:"90vh", overflowY:"auto" }}>
        {/* هدر */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"var(--accent-bg)",
            border:"0.5px solid #00d98b22", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" style={{ width:22, height:22, stroke:"var(--accent)", fill:"none", strokeWidth:1.8 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:"var(--text1)", fontFamily:"Syne,sans-serif" }}>{org.name}</div>
            <div style={{ display:"flex", gap:6, marginTop:4 }}>
              <span className="cat-badge">{fa?type.fa:type.en}</span>
              <span className="cat-badge" style={{ color:status.color, borderColor:`${status.color}33` }}>{fa?status.fa:status.en}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><IconClose /></button>
        </div>

        {/* تلفن‌ها */}
        {phones.length > 0 && (
          <div style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"تلفن‌ها":"Phone numbers"}</div>
            {phones.map((ph, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6,
                padding:"8px 12px", background:"var(--bg4)", borderRadius:"var(--radius-sm)" }}>
                <svg viewBox="0 0 24 24" style={{ ...svgStyle, stroke:"var(--accent)", width:13, height:13 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span style={{ fontSize:13, color:"var(--text1)", flex:1 }} dir="ltr">{ph.number}</span>
                <span className="cat-badge" style={{ fontSize:10 }}>{ph.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* ایمیل‌ها */}
        {emails.length > 0 && (
          <div style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"ایمیل‌ها":"Emails"}</div>
            {emails.map((em, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6,
                padding:"8px 12px", background:"var(--bg4)", borderRadius:"var(--radius-sm)" }}>
                <svg viewBox="0 0 24 24" style={{ ...svgStyle, stroke:"var(--blue)", width:13, height:13 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span style={{ fontSize:13, color:"var(--text1)", flex:1 }} dir="ltr">{em.address}</span>
                <span className="cat-badge" style={{ fontSize:10 }}>{em.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* مخاطب اصلی */}
        {mc?.name && (
          <div style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"مخاطب اصلی":"Main contact"}</div>
            <div style={{ padding:"10px 12px", background:"var(--bg4)", borderRadius:"var(--radius-sm)" }}>
              <div style={{ fontSize:13, fontWeight:500, color:"var(--text1)" }}>{mc.name}</div>
              {mc.role  && <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{mc.role}</div>}
              {mc.phone && <div style={{ fontSize:12, color:"var(--accent)", marginTop:4 }} dir="ltr">{mc.phone}</div>}
            </div>
          </div>
        )}

        {/* وب‌سایت */}
        {org.website && (
          <div style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"وب‌سایت":"Website"}</div>
            <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize:13, color:"var(--accent)", textDecoration:"none" }} dir="ltr">
              {org.website}
            </a>
          </div>
        )}

        {/* آدرس */}
        {org.address && (
          <div style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"آدرس":"Address"}</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{org.address}</div>
          </div>
        )}

        {/* شناسه ملی */}
        {org.national_id && (
          <div style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"شناسه ملی":"National ID"}</div>
            <div style={{ fontSize:13, color:"var(--text2)" }} dir="ltr">{org.national_id}</div>
          </div>
        )}

        {/* یادداشت */}
        {org.note && (
          <div style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"یادداشت":"Note"}</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7,
              padding:"10px 12px", background:"var(--bg4)", borderRadius:"var(--radius-sm)" }}>
              {org.note}
            </div>
          </div>
        )}

        {/* مخاطبین مرتبط */}
        {contacts.length > 0 && (
          <div style={{ marginBottom:14 }}>
            <div className="panel-label">{fa?"مخاطبین مرتبط":"Related contacts"} ({contacts.length})</div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {contacts.map(c => (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:8,
                  padding:"7px 10px", background:"var(--bg4)", borderRadius:"var(--radius-sm)" }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:"var(--accent-bg)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, color:"var(--accent)", fontFamily:"Syne,sans-serif" }}>
                    {(c.name||"?")[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, color:"var(--text1)" }}>{c.name}</div>
                    <div style={{ fontSize:11, color:"var(--text3)" }} dir="ltr">{c.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ صفحه اصلی سازمان‌ها ══ */
export default function Organizations() {
  const { lang } = useSettings();
  const fa = lang === "fa";

  const [orgs,      setOrgs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [userId,    setUserId]    = useState(null);
  const [userRole,  setUserRole]  = useState(4);
  const [search,    setSearch]    = useState("");
  const [typeFilter,setTypeFilter]= useState("all");
  const [showForm,  setShowForm]  = useState(false);
  const [editTarget,setEditTarget]= useState(null);
  const [viewTarget,setViewTarget]= useState(null);

  useEffect(() => {
    getUserProfile().then(async (u) => {
      if (!u) return;
      setUserId(u.id);
      setUserRole(u.role || 4);
      await fetchOrgs(u.id);
    });
  }, []);

  const fetchOrgs = async (uid) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/organizations?user_id=${uid}`);
      const data = await res.json();
      setOrgs(Array.isArray(data) ? data : []);
    } catch { setOrgs([]); }
    setLoading(false);
  };

  const handleSave = async (data) => {
    if (editTarget) {
      await fetch(`${API}/organizations/${editTarget.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...data, user_id: userId }),
      });
    } else {
      await fetch(`${API}/organizations`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...data, user_id: userId }),
      });
    }
    setEditTarget(null);
    await fetchOrgs(userId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(fa?"آیا از حذف این سازمان اطمینان دارید؟":"Are you sure?")) return;
    await fetch(`${API}/organizations/${id}`, {
      method:"DELETE", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ user_id: userId }),
    });
    await fetchOrgs(userId);
  };

  const handleView = async (org) => {
    try {
      const res  = await fetch(`${API}/organizations/${org.id}?user_id=${userId}`);
      const data = await res.json();
      setViewTarget(data);
    } catch { setViewTarget(org); }
  };

  /* فیلتر */
  const filtered = orgs.filter(o => {
    const matchSearch = !search || o.name.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "all" || o.type === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;

  return (
    <div className="page">
      {/* هدر */}
      <div className="page-header">
        <h2 className="page-title">{fa?"سازمان‌ها":"Organizations"}</h2>
        <span className="page-count">{orgs.length}</span>
        <div className="page-spacer"/>
        {(userRole === 1 || userRole === 2) && (
          <button className="btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
            <IconPlus />{fa?"افزودن":"Add"}
          </button>
        )}
      </div>

      {/* جستجو و فیلتر */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <div className="input-wrap" style={{ flex:1, marginBottom:0 }}>
          <span className="input-icon"><IconSearch /></span>
          <input className="app-input" placeholder={fa?"جستجوی سازمان...":"Search organizations..."}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* tabs نوع */}
      <div className="tabs-row" style={{ marginBottom:14 }}>
        <button className={`tab-btn ${typeFilter==="all"?"active":""}`} onClick={() => setTypeFilter("all")}>
          {fa?"همه":"All"}
        </button>
        {ORG_TYPES.map(t => (
          <button key={t.value} className={`tab-btn ${typeFilter===t.value?"active":""}`}
            onClick={() => setTypeFilter(t.value)}>
            {fa?t.fa:t.en}
          </button>
        ))}
      </div>

      {/* لیست */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <p>{fa?"سازمانی یافت نشد":"No organizations found"}</p>
        </div>
      ) : (
        filtered.map(org => (
          <OrgCard key={org.id} org={org} userRole={userRole} lang={lang}
            onEdit={(o) => { setEditTarget(o); setShowForm(true); }}
            onDelete={handleDelete}
            onView={handleView} />
        ))
      )}

      {/* فرم افزودن/ویرایش */}
      {showForm && (
        <OrgForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          userRole={userRole}
          lang={lang}
        />
      )}

      {/* جزئیات */}
      {viewTarget && (
        <OrgDetail org={viewTarget} onClose={() => setViewTarget(null)} lang={lang} />
      )}
    </div>
  );
}
