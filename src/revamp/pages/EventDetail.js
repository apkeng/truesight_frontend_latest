import React from "react";
import { Link, useParams } from "react-router-dom";
import { LuArrowLeft, LuMapPin, LuClock, LuCalendarPlus, LuVideo } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { useQuery } from "../lib/query";
import { downloadIcs, formatDate } from "../lib/format";
import { Avatar, Button, Card, EmptyState, ErrorState, Skeleton } from "../ui";
import { Page } from "../layout/AppShell";
import { EventCover, RegisterLink, modeLabel, speakerList, timeRange } from "../components/EventBits";
import { eventRegistrationUrl } from "../../utils/eventLinks";

const B = "/l2dashboard";

export default function EventDetail() {
  const { id } = useParams();
  // Reads from the cached events list - usually instant when coming from /events.
  const { data, error, isLoading, refetch } = useQuery(keys.events(), api.events);
  const event = data?.events.find((e) => e.id === id);

  if (error && !data) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;
  if (isLoading) return <Page><Skeleton className="h-64 rounded-2xl" /><Skeleton className="mt-5 h-72" /></Page>;
  if (!event) return <Page><EmptyState title="Event not found" description="It may have been unpublished." action={<Button to={`${B}/events`} variant="secondary" size="sm">All events</Button>} /></Page>;

  const speakers = speakerList(event.speakers);
  const registrationUrl = eventRegistrationUrl(event);
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
              <p className="mt-2 text-[13px] text-ts-muted">The organisers haven't published a detailed agenda yet - check the official event site for the latest schedule.</p>
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-ts-faint">Registration</span>
            <p className="text-[12.5px] leading-relaxed text-ts-body">
              {registrationUrl ? "Registration is handled by the organiser. Sign up on the official event site." : "The organiser hasn't published a registration link yet."}
            </p>
            <RegisterLink event={event} size="lg" block />
            <Button variant="secondary" block icon={LuCalendarPlus} disabled={!event.dateTimeStart} onClick={() => downloadIcs(event)}>Add to calendar</Button>
            {event.registrationDeadline && <p className="text-center text-[11px] text-ts-muted">Registration closes {formatDate(event.registrationDeadline, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>}
          </Card>
        </aside>
      </div>
    </Page>
  );
}
