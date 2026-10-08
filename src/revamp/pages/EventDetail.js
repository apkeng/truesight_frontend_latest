import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuArrowLeft, LuMapPin, LuClock, LuCalendarPlus, LuUsers, LuVideo, LuTicket, LuCircleX } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, useQuery } from "../lib/query";
import { downloadIcs, formatDate, num } from "../lib/format";
import { Avatar, Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Skeleton } from "../ui";
import { Page } from "../layout/AppShell";
import { EventCover, RsvpButton, modeLabel, speakerList, timeRange } from "../components/EventBits";

const B = "/l2dashboard";

export default function EventDetail() {
  const { id } = useParams();
  // Reads from the cached events list - usually instant when coming from /events.
  const { data, error, isLoading, refetch } = useQuery(keys.events(), api.events);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const event = data?.events.find((e) => e.id === id);

  const cancel = async () => {
    setCancelling(true);
    try {
      await api.cancelRsvp(id);
      invalidate(keys.events(), keys.bootstrap(), keys.dashboard());
      await refetch();
      toast.success("RSVP cancelled - any points used were refunded.");
      setCancelOpen(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setCancelling(false);
    }
  };

  if (error && !data) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;
  if (isLoading) return <Page><Skeleton className="h-64 rounded-2xl" /><Skeleton className="mt-5 h-72" /></Page>;
  if (!event) return <Page><EmptyState title="Event not found" description="It may have been unpublished." action={<Button to={`${B}/events`} variant="secondary" size="sm">All events</Button>} /></Page>;

  const speakers = speakerList(event.speakers);
  const started = event.dateTimeStart && new Date(event.dateTimeStart) < new Date();
  return (
    <Page>
      <Link to={`${B}/events`} className="inline-flex items-center gap-1.5 rounded-full border border-ts-border bg-white px-3 py-1.5 text-xs font-semibold text-ts-ink shadow-card hover:border-ts-field">
        <LuArrowLeft aria-hidden /> All Events
      </Link>
      <div className="mt-4 overflow-hidden rounded-2xl border border-ts-border bg-white shadow-card">
        <EventCover event={event} tall />
        <div className="p-6">
          {event.subtitle && <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ts-blue">{event.subtitle}</p>}
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-ts-ink">{event.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ts-body">
            <span className="inline-flex items-center gap-1.5"><LuClock aria-hidden className="text-ts-muted" /> {formatDate(event.dateTimeStart, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {timeRange(event)}</span>
            <span className="inline-flex items-center gap-1.5">{event.eventType === "online" ? <LuVideo aria-hidden className="text-ts-muted" /> : <LuMapPin aria-hidden className="text-ts-muted" />} {event.location || modeLabel(event)}</span>
            <span className="inline-flex items-center gap-1.5"><LuUsers aria-hidden className="text-ts-muted" /> {num(event.registeredCount)} registered{event.capacity ? ` of ${num(event.capacity)}` : ""}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="text-[15px] font-bold text-ts-ink">About this event</h2>
            <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-ts-body">{event.description || "Details coming soon."}</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-[15px] font-bold text-ts-ink">Agenda</h2>
            {event.agenda.length ? (
              <ol className="mt-3 space-y-3 border-l-2 border-ts-border pl-4">
                {event.agenda.map((a, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-ts-navy ring-4 ring-white" />
                    <p className="text-[11px] font-bold text-ts-blue">{a.time || a.startTime || `Session ${i + 1}`}</p>
                    <p className="text-[13.5px] font-semibold text-ts-ink">{a.title || a.name || a}</p>
                    {a.speaker && <p className="text-xs text-ts-muted">{a.speaker}</p>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-[13px] text-ts-muted">The organisers haven't published a detailed agenda yet - registered students get updates by email.</p>
            )}
          </Card>
          {speakers.length > 0 && (
            <Card className="p-6">
              <h2 className="text-[15px] font-bold text-ts-ink">Speakers</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {speakers.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 rounded-lg bg-ts-subtle p-3">
                    <Avatar name={s.name} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-ts-ink">{s.name}</p>
                      <p className="truncate text-[11px] text-ts-muted">{[s.title, s.affiliation].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <aside>
          <Card className="space-y-4 p-5 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ts-faint">Student pass</span>
              <Badge tone={event.costInPoints ? "amber" : "green"}>{event.costInPoints ? `${num(event.costInPoints)} pts` : "Free"}</Badge>
            </div>
            {event.isRegistered ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <LuTicket aria-hidden className="mx-auto text-2xl text-emerald-600" />
                <p className="mt-1 text-xs font-semibold text-emerald-700">You're registered</p>
                <p className="mt-1 font-mono text-xl font-bold tracking-wider text-emerald-900">{event.registrationCode}</p>
                <p className="mt-1 text-[11px] text-emerald-800/70">Show this code at the venue</p>
              </div>
            ) : (
              <RsvpButton event={event} size="lg" block onChanged={refetch} />
            )}
            {event.isRegistered && event.onlineLink && (
              <Button variant="navy" block icon={LuVideo} href={event.onlineLink} target="_blank" rel="noreferrer">Join online</Button>
            )}
            <Button variant="secondary" block icon={LuCalendarPlus} disabled={!event.dateTimeStart} onClick={() => downloadIcs(event)}>Add to calendar</Button>
            {event.isRegistered && !started && (
              <Button variant="danger" block icon={LuCircleX} onClick={() => setCancelOpen(true)}>Cancel RSVP</Button>
            )}
            {event.registrationDeadline && <p className="text-center text-[11px] text-ts-muted">Registration closes {formatDate(event.registrationDeadline, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>}
          </Card>
        </aside>
      </div>
      <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={cancel} loading={cancelling} title="Cancel your RSVP?" description="Your seat is released and any points used are refunded." confirmLabel="Cancel RSVP" />
    </Page>
  );
}
