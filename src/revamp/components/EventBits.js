import React, { useState } from "react";
import { toast } from "react-toastify";
import { LuCircleCheck, LuChevronRight } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, setQueryData } from "../lib/query";
import { coverFor, cx, formatDayMonth, formatTime, num } from "../lib/format";
import { Button, ConfirmDialog } from "../ui";

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

/** Event artwork with category, mode, date and points chips (Card / Event). */
export function EventCover({ event, className, tall }) {
  const dm = formatDayMonth(event.dateTimeStart);
  const points = event.rewardPoints ? `+${num(event.rewardPoints)} pts` : event.costInPoints ? `${num(event.costInPoints)} pts` : "Free";
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
      <span className="absolute bottom-3 right-3 rounded-full bg-ts-yellow px-2 py-0.5 text-[10px] font-extrabold text-ts-ink shadow">{points}</span>
    </div>
  );
}

/** Register Now / Registered (TS-1234) with points confirmation. */
export function RsvpButton({ event, size = "sm", block, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const closed = event.dateTimeStart && new Date(event.dateTimeStart) < new Date();
  const full = event.capacity && event.registeredCount >= event.capacity;

  const register = async () => {
    setBusy(true);
    try {
      await api.rsvp(event.id);
      setQueryData(keys.events(), (d) => d && { ...d, events: d.events.map((e) => (e.id === event.id ? { ...e, isRegistered: true, registeredCount: e.registeredCount + 1 } : e)), counts: { ...d.counts, mine: d.counts.mine + 1 } });
      invalidate(keys.events(), keys.bootstrap(), keys.dashboard());
      toast.success(`You're registered for ${event.title}.`);
      onChanged?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  if (event.isRegistered) {
    return (
      <span className={cx("inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11.5px] font-bold text-emerald-700", size === "lg" ? "h-11" : "h-8", block && "w-full justify-center")}>
        <LuCircleCheck aria-hidden /> Registered {event.registrationCode && `(${event.registrationCode})`}
      </span>
    );
  }
  return (
    <>
      <Button size={size} block={block} iconRight={LuChevronRight} loading={busy} disabled={closed || full} onClick={() => (event.costInPoints > 0 ? setConfirm(true) : register())}>
        {closed ? "Registration closed" : full ? "Fully booked" : "Register Now"}
      </Button>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={register}
        loading={busy}
        tone="navy"
        title="Use points to register?"
        description={`Registering for “${event.title}” uses ${num(event.costInPoints)} points. Cancel before it starts and they're refunded.`}
        confirmLabel={`Register · ${num(event.costInPoints)} pts`}
      />
    </>
  );
}
