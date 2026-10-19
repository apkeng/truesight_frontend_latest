import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getEvents } from "../../utils/apiServices";
import Loading from "../../components/Loading";
import { 
  MdSearch, 
  MdCalendarToday, 
  MdLocationOn, 
  MdLaptop, 
  MdOutlineArrowBack
} from "react-icons/md";
import logo from "../../assets/logo_colour_on_shell.png";
import { EmptyState, PageBanner, PageShell } from "../../components/ui";

export default function EventsExplorer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
    // filterEvents is recreated every render; its inputs are already listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by search
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(term) ||
          event.subtitle?.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term) ||
          event.speakers?.some(s => s.name?.toLowerCase().includes(term))
      );
    }

    setFilteredEvents(filtered);
  };

  if (loading) {
    return <Loading message="Loading events registry..." fullScreen={true} />;
  }

  const isEmbedded =
    location.pathname.startsWith("/l1dashboard") ||
    location.pathname.startsWith("/l2dashboard");

  const dashboardPath = location.pathname.startsWith("/l1dashboard")
    ? "/l1dashboard"
    : location.pathname.startsWith("/l2dashboard")
    ? "/l2dashboard"
    : "";

  const content = (
    <PageShell>
      <button
        onClick={() => navigate(dashboardPath ? `${dashboardPath}/dashboard` : "/")}
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-navy"
      >
        <MdOutlineArrowBack className="text-sm" /> Back to dashboard
      </button>

      <PageBanner
        title="Events"
        subtitle="Industry expos, conferences and trade shows. Registration is handled by each organiser on their official site."
        stat={{ value: events.length, label: "Listed" }}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">

        <div className="relative w-full lg:w-80">
          <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-ink-muted" />
          <input
            type="text"
            placeholder="Search events"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full border border-line bg-white pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-navy"
          />
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => {
            const start = new Date(event.dateTimeStart);
            const formattedDate = start.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={event.id || event._id}
                onClick={() => navigate(`${dashboardPath}/events/${event.id || event._id}`)}
                className="group flex h-[22rem] cursor-pointer flex-col border border-line bg-white transition-colors hover:border-navy/40"
              >
                <div className="relative flex h-40 w-full flex-shrink-0 items-center justify-center overflow-hidden bg-navy">
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="select-none font-display text-5xl font-bold tracking-widest text-white/15">
                      LIVE
                    </div>
                  )}

                  {event.isFeatured && (
                    <div className="absolute left-3 top-3 bg-amber-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                      Featured
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-ink/80 px-2 py-1 text-[10px] font-semibold text-white">
                    <MdCalendarToday className="text-xs" />
                    {formattedDate}
                  </div>
                </div>

                <div className="flex min-w-0 flex-grow flex-col p-5">
                  <h3 className="line-clamp-1 font-display text-base font-bold text-ink">
                    {event.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                    {event.subtitle || event.description}
                  </p>

                  {event.speakers && event.speakers.length > 0 && (
                    <p className="mt-3 truncate text-[11px] text-ink-muted">
                      Speaker: {event.speakers[0].name}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-line-soft pt-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      {event.eventType === "online" ? (
                        <>
                          <MdLaptop className="text-xs" /> Online
                        </>
                      ) : (
                        <>
                          <MdLocationOn className="text-xs" /> In-person
                        </>
                      )}
                    </span>
                    <span className="border border-navy/30 bg-navy-wash px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                      View details
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No events found"
          description="Nothing matches this filter right now. Check back later or try a different search."
        />
      )}
    </PageShell>
  );

  if (isEmbedded) return content;

  return (
    <div className="app-shell flex min-h-screen flex-col bg-cream text-ink">
      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{content}</main>

      <footer className="border-t border-line bg-white px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 opacity-40">
            <img src={logo} alt="" className="h-6" />
            <span className="text-sm font-semibold tracking-tight">TRUESIGHT</span>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            © 2026 Truesight Student Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
