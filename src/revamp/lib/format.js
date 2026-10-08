export const cx = (...parts) => parts.flat().filter(Boolean).join(" ");

const DAY = 86400000;

export const toDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value, opts = { day: "2-digit", month: "2-digit", year: "numeric" }) => {
  const d = toDate(value);
  return d ? d.toLocaleDateString("en-GB", opts) : "—";
};

export const formatTime = (value) => {
  const d = toDate(value);
  return d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
};

export const formatDayMonth = (value) => {
  const d = toDate(value);
  return d ? { day: String(d.getDate()).padStart(2, "0"), month: d.toLocaleString("en-US", { month: "short" }).toUpperCase() } : null;
};

export const timeAgo = (value) => {
  const d = toDate(value);
  if (!d) return "";
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)} days ago`;
  return formatDate(d, { day: "numeric", month: "short", year: "numeric" });
};

/** "23h 13m", "2d 4h", "Expired" */
export const countdown = (value, now = Date.now()) => {
  const d = toDate(value);
  if (!d) return "—";
  const ms = d.getTime() - now;
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

export const pts = (n) => `${Number(n || 0).toLocaleString("en-IN")} pts`;
export const num = (n) => Number(n || 0).toLocaleString("en-IN");

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "S";

const hash = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

// Deterministic covers for projects/events that have no artwork of their own.
const COVERS = [
  ["#0B3A6F", "#1E5AA8", "#7FB3FF"],
  ["#243367", "#4C5FD5", "#B4C2FF"],
  ["#0F3D3E", "#14746F", "#88E1C4"],
  ["#3B1F5C", "#6D3FB0", "#D2B6FF"],
  ["#5A2A0C", "#B4561B", "#FFC48A"],
  ["#13293D", "#2A6F97", "#A9D6E5"],
];
export const coverFor = (seed) => {
  const [a, b, c] = COVERS[hash(seed) % COVERS.length];
  const angle = 120 + (hash(seed + "x") % 80);
  return {
    background: `radial-gradient(circle at 78% 22%, ${c}55 0, transparent 38%), linear-gradient(${angle}deg, ${a}, ${b})`,
  };
};

/** Resize an image File to a square-ish JPEG data URL (avatars). */
export const fileToAvatarDataUrl = (file, size = 256, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = size / Math.min(img.width, img.height);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file isn't an image we can read."));
    };
    img.src = url;
  });

/** Download an .ics so an event lands in any calendar app (no API needed). */
export const downloadIcs = (event) => {
  const stamp = (v) => toDate(v)?.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "") || "";
  const start = stamp(event.dateTimeStart);
  const end = stamp(event.dateTimeEnd || new Date(toDate(event.dateTimeStart).getTime() + 3600000));
  const esc = (s = "") => String(s).replace(/[,;\\]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TrueSights//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@truesight.community`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${esc(event.title)}`,
    `DESCRIPTION:${esc(event.description || "")}${event.registrationCode ? esc(`\nRegistration: ${event.registrationCode}`) : ""}`,
    `LOCATION:${esc(event.location || (event.eventType === "online" ? "Online" : ""))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(event.title || "event").replace(/[^\w-]+/g, "-").slice(0, 60)}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

export const levelLabel = (level) => (level || "").replace(/student/i, "").trim() || "General";
