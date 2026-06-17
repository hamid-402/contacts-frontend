import { supabase } from "../supabase";

export const API = "https://contacts-backend-zcb2.onrender.com";

export const todayKey = new Date().toDateString();

export const initials = (name) => {
  if (!name || !name.trim()) return "؟";
  return name.trim().split(" ").map((w) => w[0] || "").join("").substring(0, 2).toUpperCase();
};

/* ── رنگ‌های آواتار ── */
const COLORS = [
  ["#0d2a1e", "#00d98b"],
  ["#1a1030", "#7c6fcd"],
  ["#2a1010", "#e06060"],
  ["#0a1e2a", "#4ab8e0"],
  ["#1e1a08", "#d4a017"],
  ["#1a0a2a", "#c06fcd"],
  ["#0a2a1a", "#4ae0a0"],
  ["#1a1a10", "#a0c040"],
  ["#0a1a2a", "#40a0e0"],
  ["#2a0a1a", "#e040a0"],
];

export function Avatar({ name, size = 42, avatarUrl = null }) {
  /* اگه عکس پروفایل داشت نشون بده */
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: size, height: size,
          borderRadius: size * 0.28,
          objectFit: "cover",
          border: "0.5px solid var(--border2)",
          flexShrink: 0,
        }}
      />
    );
  }

  const safeName = name || "؟";
  const idx      = (safeName.charCodeAt(0) || 0) % COLORS.length;
  const [bg, fg] = COLORS[idx];

  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(135deg,${bg},${bg}cc)`,
      border: `0.5px solid ${fg}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Syne',sans-serif", fontWeight: 700,
      fontSize: size * 0.33, color: fg, flexShrink: 0,
    }}>
      {initials(safeName)}
    </div>
  );
}

/* ══════════════════════════════════════════
   دسته‌بندی‌های سازمانی
══════════════════════════════════════════ */
export const CATEGORIES = [
  "مالی گرین",
  "CRM",
  "تامین مالی",
  "دواپس",
  "مالی کسبینو",
  "دیتابیس",
  "توسعه کسب و کار",
  "فروش",
  "اداری",
  "طرح و برنامه",
  "فنی کسبینو",
  "ایزدتک",
  "مدیالب",
  "روزنامه",
  "زنیت",
  "دانشکده علامه طبرسی",
  "حراست",
];

/* رنگ برای هر دسته — چرخشی از پالت */
const CAT_PALETTE = [
  { bg: "#0d2a1e", accent: "#00d98b" },
  { bg: "#0a1e2a", accent: "#4ab8e0" },
  { bg: "#1a1030", accent: "#7c6fcd" },
  { bg: "#2a1010", accent: "#e06060" },
  { bg: "#1e1a08", accent: "#d4a017" },
  { bg: "#1a0a2a", accent: "#c06fcd" },
  { bg: "#0a2a1a", accent: "#4ae0a0" },
  { bg: "#1a1a10", accent: "#a0c040" },
  { bg: "#0a1a2a", accent: "#40a0e0" },
  { bg: "#2a0a1a", accent: "#e040a0" },
];

export const CATEGORY_COLORS = Object.fromEntries(
  CATEGORIES.map((cat, i) => [cat, CAT_PALETTE[i % CAT_PALETTE.length]])
);

/* ── Auth helpers ── */
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user || null;
};

export const getUserProfile = async () => {
  const user = await getUser();
  if (!user) return null;
  try {
    const res     = await fetch(`${API}/profile/${user.id}`);
    const profile = await res.json();
    return { ...user, ...profile };
  } catch {
    return user;
  }
};
