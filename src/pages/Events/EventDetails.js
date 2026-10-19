import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getEventById } from "../../utils/apiServices";
import { eventRegistrationUrl } from "../../utils/eventLinks";
import Loading from "../../components/Loading";
import { toast, ToastContainer } from "react-toastify";
import { 
  MdOutlineArrowBack, 
  MdCalendarToday, 
  MdAccessTime, 
  MdLocationOn, 
  MdLaptop, 
  MdCancel, 
  MdOpenInNew
} from "react-icons/md";
import logo from "../../assets/logo_colour_on_shell.png";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = location.pathname.startsWith("/l1dashboard") 
    ? "/l1dashboard" 
    : location.pathname.startsWith("/l2dashboard") 
      ? "/l2dashboard" 
      : "";

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDetails();
    }
    // loadDetails is recreated every render; this effect must only re-run for a new event id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([getEventById(id)]);

      if (results[0].status === "fulfilled") {
        setEvent(results[0].value);
      } else {
        toast.error("Failed to load event details");
        navigate(`${basePath}/events`);
        return;
      }
    } catch (error) {
      console.error("Error loading event details:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading && !event) {
    return <Loading message="Loading event details..." fullScreen={true} />;
  }

  if (!event) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-cream p-8">
        <div className="max-w-sm border border-line bg-white p-10 text-center">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-lg font-semibold text-ink mt-4 mb-2">Event Not Found</h2>
          <p className="text-ink-muted text-sm font-semibold mb-6">The event you are looking for does not exist or has been deleted.</p>
          <button onClick={() => navigate(`${basePath}/events`)} className="px-6 py-3 bg-slate-900 text-white  text-xs font-semibold uppercase tracking-[0.14em] ">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPast = new Date(event.dateTimeEnd) < new Date();
  const registrationUrl = eventRegistrationUrl(event);
  
  return (
    <div className="app-shell flex min-h-screen flex-col bg-cream text-ink">
      <ToastContainer position="top-right" autoClose={4000} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
        {/* Back navigation */}
        <button
          onClick={() => navigate(`${basePath}/events`)}
          className="mb-8 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-navy"
        >
          <MdOutlineArrowBack className="text-sm" /> Back to events
        </button>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Banner Section */}
            <div className="relative flex h-64 w-full items-center justify-center overflow-hidden border border-line bg-navy md:h-80">
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="select-none font-display text-6xl font-bold tracking-[0.14em] text-white/15">
                  EVENT
                </div>
              )}
              
              {event.isFeatured && (
                <div className="absolute left-4 top-4 bg-amber-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                  Featured Event
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="font-display text-3xl font-bold tracking-display text-ink md:text-4xl">
                {event.title}
              </h1>
              {event.subtitle && (
                <p className="text-base font-semibold leading-relaxed text-navy">
                  {event.subtitle}
                </p>
              )}
              <hr className="my-6 border-line" />
              <h3 className="text-lg font-semibold text-ink">Event Details</h3>
              <p className="text-ink-muted font-medium text-sm leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Speakers Section */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-ink">Hosted By</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex gap-4 bg-white border border-line p-5  ">
                      <div className="w-14 h-14  overflow-hidden bg-parchment border border-line flex-shrink-0 flex items-center justify-center">
                        {speaker.avatarUrl ? (
                          <img src={speaker.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-navy-wash text-navy text-xl font-bold flex items-center justify-center">
                            {speaker.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-ink">{speaker.name}</p>
                        <p className="text-[10px] font-semibold text-navy uppercase tracking-wider mb-2">{speaker.role}</p>
                        {speaker.bio && (
                          <p className="text-xs text-ink-muted font-semibold leading-relaxed line-clamp-3">{speaker.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Registration Sidebar (Right Column) */}
          <div className="space-y-8">
            <div className="space-y-6 border border-line bg-white p-6 lg:sticky lg:top-8">
              {/* Event Logistics */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10  bg-navy-wash text-navy flex items-center justify-center text-lg flex-shrink-0">
                    <MdCalendarToday />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em]">Date</p>
                    <p className="text-xs font-bold text-ink">{formatDate(event.dateTimeStart)}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10  bg-navy-wash text-navy flex items-center justify-center text-lg flex-shrink-0">
                    <MdAccessTime />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em]">Time</p>
                    <p className="text-xs font-bold text-ink">
                      {formatTime(event.dateTimeStart)} - {formatTime(event.dateTimeEnd)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10  bg-navy-wash text-navy flex items-center justify-center text-lg flex-shrink-0">
                    {event.eventType === "online" ? <MdLaptop /> : <MdLocationOn />}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em]">Location / Format</p>
                    <p className="text-xs font-bold text-ink capitalize">{event.eventType} Event</p>
                    {event.eventType !== "online" && event.location && (
                      <p className="text-[10px] text-ink-muted font-semibold mt-0.5 leading-relaxed">{event.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Registration happens on the organiser's site */}
              <div className="pt-4 border-t border-line">
                {isPast ? (
                  <div className="bg-parchment border border-line  p-4 text-center">
                    <MdCancel className="text-ink-muted text-3xl mx-auto mb-2" />
                    <p className="text-xs font-semibold text-ink-muted uppercase tracking-[0.14em]">Event Concluded</p>
                    <p className="text-[10px] text-ink-muted font-semibold mt-1">This event is in the past.</p>
                  </div>
                ) : registrationUrl ? (
                  <div className="space-y-2">
                    <a
                      href={registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-full items-center justify-center gap-2 bg-navy text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark"
                    >
                      Register on official site <MdOpenInNew className="text-sm" />
                    </a>
                    <p className="text-[10px] text-center text-ink-muted font-semibold">Registration is handled by the organiser.</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-center text-ink-muted font-semibold">The organiser hasn't published a registration link yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="mt-12 border-t border-line bg-white px-6 py-8">
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
