import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getEvents } from "../../utils/apiServices";
import Loading from "../../components/Loading";
import { 
  MdSearch, 
  MdCalendarToday, 
  MdLocationOn, 
  MdLaptop, 
  MdOutlineArrowBack,
  MdBookmarkAdded
} from "react-icons/md";
import logo from "../../assets/logo_blue.png";

export default function EventsExplorer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'registered'

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
    // filterEvents is recreated every render; its inputs are already listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, activeTab, events]);

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

    // Filter by tab
    if (activeTab === "registered") {
      filtered = filtered.filter(e => e.isRegistered);
    }

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

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12">
        {/* Back navigation */}
        <button
          onClick={() => {
            if (location.pathname.startsWith("/l1dashboard")) {
              navigate("/l1dashboard/dashboard");
            } else if (location.pathname.startsWith("/l2dashboard")) {
              navigate("/l2dashboard/dashboard");
            } else {
              navigate("/");
            }
          }}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors duration-300 mb-8"
        >
          <MdOutlineArrowBack className="text-sm" /> Back to Dashboard
        </button>

        {/* Page Header */}
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-none">
            Learning & Webinar <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Events Hub</span>
          </h1>
          <p className="text-slate-500 text-base font-medium max-w-xl">
            Here are some of the industry events to check out. Register for live masterclasses, Q&A panels, cohort updates, and study sprints.
          </p>
        </section>

        {/* Search and Tabs */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
          {/* Tab Selector */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                activeTab === "all"
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab("registered")}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                activeTab === "registered"
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              My RSVPs ({events.filter(e => e.isRegistered).length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <MdSearch className="text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-600/50 bg-white/60 text-slate-700 placeholder-slate-400 text-sm font-medium transition-all shadow-sm"
            />
          </div>
        </section>

        {/* Events Grid */}
        <section>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const start = new Date(event.dateTimeStart);
                const formattedDate = start.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div
                    key={event.id || event._id}
                    onClick={() => {
                      const basePath = location.pathname.startsWith("/l1dashboard") 
                        ? "/l1dashboard" 
                        : location.pathname.startsWith("/l2dashboard") 
                          ? "/l2dashboard" 
                          : "";
                      navigate(`${basePath}/events/${event.id || event._id}`);
                    }}
                    className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-indigo-100/50 hover:translate-y-[-4px] cursor-pointer transition-all duration-300 flex flex-col h-[380px] shadow-lg shadow-slate-100/50 relative"
                  >
                    {/* Event Banner */}
                    <div className="h-44 w-full relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                      {event.bannerUrl ? (
                        <img
                          src={event.bannerUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-white/20 text-7xl font-black font-sans select-none tracking-wider">
                          LIVE
                        </div>
                      )}

                      {/* Featured Tag */}
                      {event.isFeatured && (
                        <div className="absolute top-4 left-4 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-sm">
                          Featured
                        </div>
                      )}

                      {/* Points Cost */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-slate-100/50">
                        {event.costInPoints > 0 ? `${event.costInPoints} Pts` : "FREE"}
                      </div>

                      {/* Time display */}
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1.5 border border-white/10">
                        <MdCalendarToday className="text-xs" />
                        {formattedDate}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-5 flex flex-col flex-grow min-w-0">
                      <h3 className="text-lg font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-300 mb-1.5">
                        {event.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 line-clamp-2 leading-relaxed">
                        {event.subtitle || event.description}
                      </p>

                      {/* Speaker */}
                      {event.speakers && event.speakers.length > 0 && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                            {event.speakers[0].avatarUrl ? (
                              <img src={event.speakers[0].avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] bg-indigo-50 text-indigo-500 font-bold">
                                {event.speakers[0].name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 truncate">
                            Speaker: {event.speakers[0].name}
                          </span>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          {event.eventType === "online" ? (
                            <>
                              <MdLaptop className="text-xs" /> Online
                            </>
                          ) : (
                            <>
                              <MdLocationOn className="text-xs" /> In-Person
                            </>
                          )}
                        </span>
                        {event.isRegistered ? (
                          <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <MdBookmarkAdded className="text-xs" /> Registered
                          </span>
                        ) : (
                          <span className="font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm active:scale-95">
                            Details & Join
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center shadow-lg shadow-slate-100/50">
              <span className="text-5xl">📅</span>
              <h3 className="text-lg font-black text-slate-800 mt-4 mb-2">No Events Found</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed font-semibold">
                We couldn't find any upcoming events matching this filter. Check back later or search for different topics.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-slate-100 px-8 py-12 bg-white mt-16">
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
