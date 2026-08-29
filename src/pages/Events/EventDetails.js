import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getEventById, rsvpToEvent, cancelEventRsvp, getUser } from "../../utils/apiServices";
import Loading from "../../components/Loading";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import { 
  MdOutlineArrowBack, 
  MdCalendarToday, 
  MdAccessTime, 
  MdLocationOn, 
  MdLaptop, 
  MdEmojiEvents, 
  MdPeople, 
  MdCheckCircle, 
  MdCancel, 
  MdLink,
  MdInfo
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
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRsvpModal, setShowRsvpModal] = useState(false);

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
      const uid = Cookies.get("uid");
      
      const promises = [getEventById(id)];
      if (uid) {
        promises.push(getUser(uid));
      }

      const results = await Promise.allSettled(promises);

      if (results[0].status === "fulfilled") {
        setEvent(results[0].value);
      } else {
        toast.error("Failed to load event details");
        navigate(`${basePath}/events`);
        return;
      }

      if (uid && results[1] && results[1].status === "fulfilled") {
        setUserPoints(results[1].value?.userPoints || 0);
      }
    } catch (error) {
      console.error("Error loading event details:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpSubmit = async () => {
    setShowRsvpModal(false);
    try {
      setActionLoading(true);
      const res = await rsvpToEvent(id);
      
      if (res.success) {
        toast.success(res.message || "RSVP registered successfully!");
        
        // Deduct points locally for instant visual feedback
        if (event.costInPoints > 0) {
          setUserPoints(prev => Math.max(0, prev - event.costInPoints));
        }

        // Reload event to show updated fields (e.g. onlineLink, registeredCount)
        const updatedEvent = await getEventById(id);
        setEvent(updatedEvent);
      } else {
        toast.error(res.error || "Failed to complete RSVP");
      }
    } catch (error) {
      console.error("Error completing RSVP:", error);
      toast.error(error.message || "Failed to complete RSVP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRsvp = async () => {
    if (!window.confirm("Are you sure you want to cancel your RSVP? Points will be refunded if applicable.")) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await cancelEventRsvp(id);
      
      if (res.success) {
        toast.success(res.message || "RSVP cancelled successfully!");
        
        // Refund points locally for instant visual feedback
        if (event.costInPoints > 0) {
          setUserPoints(prev => prev + event.costInPoints);
        }

        // Reload details
        const updatedEvent = await getEventById(id);
        setEvent(updatedEvent);
      } else {
        toast.error(res.error || "Failed to cancel RSVP");
      }
    } catch (error) {
      console.error("Error cancelling RSVP:", error);
      toast.error(error.message || "Failed to cancel RSVP");
    } finally {
      setActionLoading(false);
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

  const isUpcoming = new Date(event.dateTimeStart) > new Date();
  const isPast = new Date(event.dateTimeEnd) < new Date();
  const isFull = event.capacity && (event.registeredCount || 0) >= event.capacity;
  
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
              {/* Point Cost & Balance Info */}
              <div className="flex items-center justify-between border border-line bg-parchment p-4">
                <div>
                  <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em]">Registration Cost</p>
                  <p className="text-2xl font-semibold text-ink">
                    {event.costInPoints > 0 ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <MdEmojiEvents className="text-amber-500" />
                        {event.costInPoints} pts
                      </span>
                    ) : "FREE"}
                  </p>
                </div>
                {event.costInPoints > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em]">Your Balance</p>
                    <p className="text-sm font-bold text-ink-muted">{userPoints} pts</p>
                  </div>
                )}
              </div>

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

                <div className="flex gap-4">
                  <div className="w-10 h-10  bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg flex-shrink-0">
                    <MdPeople />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em]">Attendance</p>
                    <p className="text-xs font-bold text-ink">
                      {event.registeredCount || 0} Registered 
                      {event.capacity ? ` / ${event.capacity} Max` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* RSVP Action Logic */}
              <div className="pt-4 border-t border-line">
                {event.isRegistered ? (
                  // Case: User is registered
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-100  p-4 text-center">
                      <MdCheckCircle className="text-emerald-500 text-3xl mx-auto mb-2" />
                      <p className="text-xs font-semibold text-emerald-800 uppercase tracking-[0.14em]">You're on the list!</p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">RSVP has been confirmed.</p>
                    </div>

                    {/* Show join link if event is online / hybrid */}
                    {event.eventType !== "in-person" && event.onlineLink && (
                      <div className="border border-navy/15 bg-navy-wash  p-4 space-y-2">
                        <p className="text-[9px] font-semibold text-navy uppercase tracking-[0.14em] flex items-center gap-1 justify-center">
                          <MdLink className="text-sm" /> Join Information
                        </p>
                        <a 
                          href={event.onlineLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full bg-navy py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark"
                        >
                          Open meeting link
                        </a>
                        <p className="text-[9px] text-center text-navy">Join link is now unlocked.</p>
                      </div>
                    )}

                    {isUpcoming && (
                      <button
                        onClick={handleCancelRsvp}
                        disabled={actionLoading}
                        className="h-11 w-full border border-red-200 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancel registration
                      </button>
                    )}
                  </div>
                ) : isPast ? (
                  // Case: Event is over
                  <div className="bg-parchment border border-line  p-4 text-center">
                    <MdCancel className="text-ink-muted text-3xl mx-auto mb-2" />
                    <p className="text-xs font-semibold text-ink-muted uppercase tracking-[0.14em]">Event Concluded</p>
                    <p className="text-[10px] text-ink-muted font-semibold mt-1">This event is in the past.</p>
                  </div>
                ) : isFull ? (
                  // Case: Event is full
                  <div className="bg-red-50 border border-red-100  p-4 text-center">
                    <MdCancel className="text-red-500 text-3xl mx-auto mb-2" />
                    <p className="text-xs font-semibold text-red-800 uppercase tracking-[0.14em]">Event is Full</p>
                    <p className="text-[10px] text-red-600 font-semibold mt-1">Registration capacity has been reached.</p>
                  </div>
                ) : (
                  // Case: Available to register
                  <button
                    onClick={() => {
                      if (event.costInPoints > 0) {
                        setShowRsvpModal(true);
                      } else {
                        handleRsvpSubmit();
                      }
                    }}
                    disabled={actionLoading}
                    className="h-12 w-full bg-navy text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark disabled:bg-navy/40"
                  >
                    {actionLoading ? "Registering..." : "Register"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showRsvpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6">
          <div className="relative w-full max-w-sm border border-line bg-white p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50  flex items-center justify-center text-amber-500 text-3xl mx-auto border border-amber-100">
                <MdEmojiEvents />
              </div>
              <h3 className="text-xl font-semibold text-ink">Confirm Points RSVP</h3>
              <p className="text-ink-muted text-xs font-semibold leading-relaxed">
                This premium event requires <strong className="text-ink">{event.costInPoints} points</strong> to attend. These points will be deducted from your balance.
              </p>
              
              <div className="bg-parchment  p-4 border border-line text-left space-y-2 text-xs font-bold text-ink-muted">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span>{userPoints} pts</span>
                </div>
                <div className="flex justify-between text-amber-700 border-t border-line pt-2 font-semibold">
                  <span>Cost to Register:</span>
                  <span>-{event.costInPoints} pts</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
                  <span>Balance After RSVP:</span>
                  <span>{userPoints - event.costInPoints} pts</span>
                </div>
              </div>

              {userPoints < event.costInPoints ? (
                <div className="flex items-center gap-1.5 p-3 bg-red-50 text-red-700 border border-red-100  text-[10px] font-bold text-left">
                  <MdInfo className="text-sm flex-shrink-0" />
                  <span>You do not have enough points. Complete quizzes/challenges to earn more.</span>
                </div>
              ) : null}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowRsvpModal(false)}
                  className="h-11 flex-1 border border-line text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRsvpSubmit}
                  disabled={userPoints < event.costInPoints}
                  className="h-11 flex-1 bg-navy text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark disabled:bg-navy/40"
                >
                  Confirm RSVP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
