import { supabase } from "../supabase";

export const API = "https://contacts-backend-zcb2.onrender.com";

export const todayKey = new Date().toDateString();

export const initials = (name) =>
  name.trim().split(" ").map((w) => w[0] || "").join("").substring(0, 2).toUpperCase() || "?";

const COLORS = [
  ["#0d2a1e", "#00d98b"],
  ["#1a1030", "#7c6fcd"],
  ["#2a1010", "#e06060"],
  ["#0a1e2a", "#4ab8e0"],
  ["#1e1a08", "#d4a017"],
  ["#1a0a2a", "#c06fcd"],
  ["#0a2a1a", "#4ae0a0"],
];

export function Avatar({ name, size = 42 }) {
  const idx = (name.charCodeAt(0) || 0) % COLORS.length;
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
      {initials(name)}
    </div>
  );
}

export const CATEGORIES = ["Family", "Work", "Friends", "Other"];

export const CATEGORY_COLORS = {
  Family:  { bg: "#1a0a0a", accent: "#e06060" },
  Work:    { bg: "#0a1e2a", accent: "#4ab8e0" },
  Friends: { bg: "#0d2a1e", accent: "#00d98b" },
  Other:   { bg: "#1a1030", accent: "#7c6fcd" },
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user || null;
};

export const getUserProfile = async () => {
  const user = await getUser();
  if (!user) return null;
  const res = await fetch(`${API}/profile/${user.id}`);
  const profile = await res.json();
  return { ...user, ...profile };
};