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
import logo from "../../assets/logo_blue.png";

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
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center p-8">
        <div className="text-center bg-white border border-slate-100 p-12 rounded-[2rem] shadow-xl max-w-sm">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-lg font-black text-slate-800 mt-4 mb-2">Event Not Found</h2>
          <p className="text-slate-400 text-sm font-semibold mb-6">The event you are looking for does not exist or has been deleted.</p>
          <button onClick={() => navigate(`${basePath}/events`)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md">
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
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <ToastContainer position="top-right" autoClose={4000} />
      
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12">
        {/* Back navigation */}
        <button
          onClick={() => navigate(`${basePath}/events`)}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors duration-300 mb-8"
        >
          <MdOutlineArrowBack className="text-sm" /> Back to Registry
        </button>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Banner Section */}
            <div className="h-72 md:h-96 w-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-xl border border-slate-100/50 relative">
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white/20 text-8xl font-black font-sans select-none tracking-widest">
                  EVENT
                </div>
              )}
              
              {event.isFeatured && (
                <div className="absolute top-6 left-6 bg-amber-500 text-white px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                  Featured Event
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {event.title}
              </h1>
              {event.subtitle && (
                <p className="text-base font-bold text-indigo-600/90 leading-relaxed">
                  {event.subtitle}
                </p>
              )}
              <hr className="border-slate-100 my-6" />
              <h3 className="text-lg font-black text-slate-800">Event Details</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Speakers Section */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-black text-slate-800">Hosted By</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex gap-4 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                        {speaker.avatarUrl ? (
                          <img src={speaker.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-indigo-50 text-indigo-500 text-xl font-bold flex items-center justify-center">
                            {speaker.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-slate-800">{speaker.name}</p>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-2">{speaker.role}</p>
                        {speaker.bio && (
                          <p className="text-xs text-slate-400 font-semibold leading-relaxed line-clamp-3">{speaker.bio}</p>
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
            <div className="backdrop-blur-xl bg-white/70 border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6 sticky top-8">
              {/* Point Cost & Balance Info */}
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Cost</p>
                  <p className="text-2xl font-black text-slate-800">
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Balance</p>
                    <p className="text-sm font-bold text-slate-600">{userPoints} pts</p>
                  </div>
                )}
              </div>

              {/* Event Logistics */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg flex-shrink-0">
                    <MdCalendarToday />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-xs font-bold text-slate-700">{formatDate(event.dateTimeStart)}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg flex-shrink-0">
                    <MdAccessTime />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                    <p className="text-xs font-bold text-slate-700">
                      {formatTime(event.dateTimeStart)} - {formatTime(event.dateTimeEnd)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg flex-shrink-0">
                    {event.eventType === "online" ? <MdLaptop /> : <MdLocationOn />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location / Format</p>
                    <p className="text-xs font-bold text-slate-700 capitalize">{event.eventType} Event</p>
                    {event.eventType !== "online" && event.location && (
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{event.location}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg flex-shrink-0">
                    <MdPeople />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</p>
                    <p className="text-xs font-bold text-slate-700">
                      {event.registeredCount || 0} Registered 
                      {event.capacity ? ` / ${event.capacity} Max` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* RSVP Action Logic */}
              <div className="pt-4 border-t border-slate-100">
                {event.isRegistered ? (
                  // Case: User is registered
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                      <MdCheckCircle className="text-emerald-500 text-3xl mx-auto mb-2" />
                      <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">You're on the list!</p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">RSVP has been confirmed.</p>
                    </div>

                    {/* Show join link if event is online / hybrid */}
                    {event.eventType !== "in-person" && event.onlineLink && (
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
                        <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-1 justify-center">
                          <MdLink className="text-sm" /> Join Information
                        </p>
                        <a 
                          href={event.onlineLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center text-xs font-black uppercase tracking-widest shadow-md transition-all active:scale-95 block"
                        >
                          Launch Meeting Link
                        </a>
                        <p className="text-[9px] text-center text-blue-500 font-semibold">Join link is now unlocked.</p>
                      </div>
                    )}

                    {isUpcoming && (
                      <button
                        onClick={handleCancelRsvp}
                        disabled={actionLoading}
                        className="w-full py-3.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        Cancel RSVP Registration
                      </button>
                    )}
                  </div>
                ) : isPast ? (
                  // Case: Event is over
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-center">
                    <MdCancel className="text-slate-400 text-3xl mx-auto mb-2" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Event Concluded</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">This event is in the past.</p>
                  </div>
                ) : isFull ? (
                  // Case: Event is full
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                    <MdCancel className="text-red-500 text-3xl mx-auto mb-2" />
                    <p className="text-xs font-black text-red-800 uppercase tracking-widest">Event is Full</p>
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
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 active:scale-95 disabled:from-slate-400 disabled:to-slate-500"
                  >
                    {actionLoading ? "Registering..." : "RSVP Registration"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showRsvpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-3xl mx-auto border border-amber-100">
                <MdEmojiEvents />
              </div>
              <h3 className="text-xl font-black text-slate-800">Confirm Points RSVP</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                This premium event requires <strong className="text-slate-800">{event.costInPoints} points</strong> to attend. These points will be deducted from your balance.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2 text-xs font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span>{userPoints} pts</span>
                </div>
                <div className="flex justify-between text-amber-700 border-t border-slate-100 pt-2 font-black">
                  <span>Cost to Register:</span>
                  <span>-{event.costInPoints} pts</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-black text-slate-800">
                  <span>Balance After RSVP:</span>
                  <span>{userPoints - event.costInPoints} pts</span>
                </div>
              </div>

              {userPoints < event.costInPoints ? (
                <div className="flex items-center gap-1.5 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-[10px] font-bold text-left">
                  <MdInfo className="text-sm flex-shrink-0" />
                  <span>You do not have enough points. Complete quizzes/challenges to earn more.</span>
                </div>
              ) : null}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowRsvpModal(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRsvpSubmit}
                  disabled={userPoints < event.costInPoints}
                  className="flex-1 py-3 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Confirm RSVP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Footer */}
      <footer className="border-t border-slate-100 px-8 py-12 bg-white mt-16 animate-fadeIn">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 grayscale opacity-30">
            <img src={logo} alt="Logo" className="h-6" />
            <span className="text-sm font-bold tracking-tight">TRUESIGHT</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">© 2026 Truesight Student Platform. All Performance Data Encrypted.</p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100"></div>
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
