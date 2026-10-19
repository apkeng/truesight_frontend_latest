import React from "react";
import { LuExternalLink } from "react-icons/lu";
import { coverFor, cx, formatDayMonth, formatTime } from "../lib/format";
import { Button } from "../ui";
import { eventRegistrationUrl } from "../../utils/eventLinks";

export const speakerList = (speakers = []) =>
  speakers
    .map((s) => (typeof s === "string" ? { name: s } : s && { name: s.name || s.fullName, title: s.title || s.role || s.designation, affiliation: s.affiliation || s.organization || s.company }))
    .filter((s) => s && s.name);

export const timeRange = (e) => {
  const a = formatTime(e.dateTimeStart);
  const b = formatTime(e.dateTimeEnd);
  return a ? (b ? `${a} – ${b}` : a) : "Time TBA";
};

export const modeLabel = (e) => (e.eventType === "online" ? "Online / Live" : e.eventType === "hybrid" ? "Hybrid" : "In-person");

/** Event artwork with category, mode and date chips (Card / Event). */
export function EventCover({ event, className, tall }) {
  const dm = formatDayMonth(event.dateTimeStart);
  return (
    <div className={cx("relative overflow-hidden", tall ? "h-56" : "h-40", className)} style={event.imageUrl ? undefined : coverFor(event.id)}>
      {event.imageUrl ? (
        <img src={event.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 160" preserveAspectRatio="none">
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M0 ${30 + i * 18} C 120 ${10 + i * 22}, 260 ${70 + i * 9}, 400 ${20 + i * 20}`} stroke="white" strokeWidth="0.8" fill="none" />
          ))}
        </svg>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
      {event.category && <span className="absolute left-3 top-3 max-w-[60%] truncate rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">{event.category}</span>}
      <span className={cx("absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-white", event.eventType === "online" ? "bg-sky-600" : "bg-emerald-600")}>
        <span className="h-1.5 w-1.5 rounded-full bg-white" /> {modeLabel(event)}
      </span>
      {dm && (
        <span className="absolute bottom-3 left-3 flex flex-col items-center rounded-md bg-white px-2 py-1 leading-none shadow">
          <span className="text-[8px] font-bold text-red-500">{dm.month}</span>
          <span className="text-base font-extrabold text-ts-ink">{dm.day}</span>
        </span>
      )}
    </div>
  );
}

/** Registration happens on the organiser's site - this just links out to it. */
export function RegisterLink({ event, size = "sm", block }) {
  const url = eventRegistrationUrl(event);
  if (!url) return null;
  return (
    <Button size={size} block={block} iconRight={LuExternalLink} href={url} target="_blank" rel="noopener noreferrer">
      Register on official site
    </Button>
  );
}
