import {
  LuMap,
  LuCircleAlert,
  LuSwords,
  LuPackage,
  LuCalendarCheck,
  LuTrash2,
  LuChartLine,
  LuBell,
} from "react-icons/lu";

const B = "/l2dashboard";

/**
 * Every notification carries a `ref` to the record it's about; this turns
 * it into the in-app location of that record. Keep in sync with the `ref`
 * kinds written by truesight_backend (src/lib/notify.js).
 */
export const linkFor = (ref) => {
  if (!ref) return null;
  switch (ref.kind) {
    case "project":
      return `${B}/projects/${ref.projectKind || "self"}/${ref.id}`;
    case "project_failed": {
      const q = new URLSearchParams({ new: "1", topic: ref.topic || "", level: ref.levelOfLearning || "" });
      return `${B}/projects?${q}`;
    }
    case "challenge":
      return `${B}/challenges?${new URLSearchParams({ ...(ref.tab ? { tab: ref.tab } : {}), [ref.compare ? "compare" : "highlight"]: ref.id })}`;
    case "order":
      return `${B}/rewards/orders?highlight=${ref.id}`;
    case "event":
      return `${B}/events/${ref.id}`;
    case "trash":
      return `${B}/trash?highlight=${encodeURIComponent(`${ref.itemType}:${ref.id}`)}`;
    case "result":
      return `${B}/results?open=${ref.id}`;
    default:
      return null;
  }
};

/** Short call-to-action label for a notification's link. */
export const actionFor = (n) => {
  switch (n.ref?.kind) {
    case "project":
      return "View project";
    case "project_failed":
      return "Try again";
    case "challenge":
      return n.ref.compare ? "Compare results" : n.type === "challenge_received" ? "Respond" : "Open challenge";
    case "order":
      return "Track order";
    case "event":
      return "View event";
    case "trash":
      return "Open trash";
    case "result":
      return "View result";
    default:
      return "Open";
  }
};

export const iconFor = (n) => {
  switch (n.ref?.kind) {
    case "project":
      return LuMap;
    case "project_failed":
      return LuCircleAlert;
    case "challenge":
      return LuSwords;
    case "order":
      return LuPackage;
    case "event":
      return LuCalendarCheck;
    case "trash":
      return LuTrash2;
    case "result":
      return LuChartLine;
    default:
      return LuBell;
  }
};

export const TONE = {
  success: { dot: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
  error: { dot: "bg-red-500", icon: "bg-red-50 text-red-600", bar: "bg-red-500" },
  warning: { dot: "bg-amber-500", icon: "bg-amber-50 text-amber-600", bar: "bg-amber-500" },
  info: { dot: "bg-ts-blue", icon: "bg-ts-wash text-ts-blue", bar: "bg-ts-navy" },
};
