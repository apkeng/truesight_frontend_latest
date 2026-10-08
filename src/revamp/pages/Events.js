import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LuMapPin, LuCalendarPlus, LuCalendarDays, LuClock } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { useQuery } from "../lib/query";
import { downloadIcs } from "../lib/format";
import { Avatar, Button, Card, EmptyState, ErrorState, IconButton, PageHeader, SearchField, SegmentTabs, Skeleton } from "../ui";
import { Page } from "../layout/AppShell";
import { EventCover, RsvpButton, speakerList, timeRange } from "../components/EventBits";

const B = "/l2dashboard";

export default function Events() {
  const { data, error, isLoading, refetch } = useQuery(keys.events(), api.events);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [showPast, setShowPast] = useState(false);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const needle = q.toLowerCase();
    const list = (data?.events || [])
      .filter((e) => tab === "all" || e.isRegistered)
      .filter((e) => !needle || [e.title, e.subtitle, e.category, e.location, e.description, ...speakerList(e.speakers).map((s) => s.name)].filter(Boolean).join(" ").toLowerCase().includes(needle));
    const isPast = (e) => new Date(e.dateTimeEnd || e.dateTimeStart || 0).getTime() < now && (e.dateTimeEnd || e.dateTimeStart);
    return { upcoming: list.filter((e) => !isPast(e)), past: list.filter(isPast) };
  }, [data, tab, q]);

  return (
    <Page wide>
      <PageHeader
        title="Campus & Technical Events"
        description="Explore engineering symposiums, robotics hackathons, and industrial masterclasses. Register to secure student passes, earn skill points, and sync directly with your calendar."
      />

      <Card className="mt-6 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <SegmentTabs
          className="border-0 p-0 shadow-none"
          value={tab}
          onChange={setTab}
          items={[
            { value: "all", label: "All events", count: data?.counts.all },
            { value: "mine", label: "My RSVPs", count: data?.counts.mine, countTone: data?.counts.mine ? "yellow" : undefined },
          ]}
        />
        <SearchField value={q} onChange={setQ} placeholder="Search events by topic, keynote speaker, or venue…" className="flex-1 sm:ml-auto sm:max-w-md" />
      </Card>

      <div className="mt-5">
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[420px] rounded-xl" />)}</div>
        ) : !upcoming.length && !past.length ? (
          <EmptyState icon={LuCalendarDays} title={tab === "mine" ? "No RSVPs yet" : "No events match"} description={tab === "mine" ? "Register for an event and your pass shows up here." : "Try a different search."} />
        ) : (
          <>
            {upcoming.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{upcoming.map((e) => <EventCard key={e.id} event={e} />)}</div>
            ) : (
              <EmptyState icon={LuCalendarDays} title="No upcoming events" description="Check past events below, or come back soon." />
            )}
            {past.length > 0 && (
              <div className="mt-8">
                <button type="button" onClick={() => setShowPast(!showPast)} className="text-sm font-semibold text-ts-muted hover:text-ts-ink">
                  {showPast ? "Hide" : "Show"} past events ({past.length})
                </button>
                {showPast && <div className="mt-4 grid gap-5 opacity-80 md:grid-cols-2 xl:grid-cols-3">{past.map((e) => <EventCard key={e.id} event={e} />)}</div>}
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}

function EventCard({ event: e }) {
  const speakers = speakerList(e.speakers);
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <Link to={`${B}/events/${e.id}`} tabIndex={-1} aria-hidden><EventCover event={e} /></Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1 text-[11px] font-semibold text-ts-muted"><LuClock aria-hidden /> {timeRange(e)}</p>
        <Link to={`${B}/events/${e.id}`} className="mt-1 line-clamp-2 text-[15.5px] font-bold leading-snug text-ts-ink hover:text-ts-navy">{e.title}</Link>
        {e.location && <p className="mt-1.5 flex items-start gap-1 text-[11.5px] text-ts-muted"><LuMapPin aria-hidden className="mt-0.5 shrink-0" /> <span className="line-clamp-1">{e.location}</span></p>}
        {speakers.length > 0 && (
          <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-ts-subtle px-2.5 py-2">
            <Avatar name={speakers[0].name} size={26} />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold text-ts-ink">{speakers.map((s) => s.name).join(", ")}</p>
              {(speakers[0].title || speakers[0].affiliation) && <p className="truncate text-[10.5px] text-ts-muted">{[speakers[0].title, speakers[0].affiliation].filter(Boolean).join(" · ")}</p>}
            </div>
          </div>
        )}
        {e.description && <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-ts-body">{e.description}</p>}
        <div className="mt-auto flex items-center gap-2 pt-4">
          <Button variant="secondary" size="sm" to={`${B}/events/${e.id}`}>Details & Agenda</Button>
          <IconButton icon={LuCalendarPlus} label="Add to calendar" size="md" onClick={() => downloadIcs(e)} disabled={!e.dateTimeStart} className="h-8 w-8" />
          <div className="ml-auto"><RsvpButton event={e} /></div>
        </div>
      </div>
    </Card>
  );
}
