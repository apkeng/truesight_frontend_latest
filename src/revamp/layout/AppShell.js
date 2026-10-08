import React, { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LuPanelLeftClose, LuPanelLeftOpen, LuLogOut, LuMenu, LuX } from "react-icons/lu";
import { useAuth } from "../../contexts/AuthContext";
import { api, keys } from "../lib/api";
import { clearQueryCache, useQuery } from "../lib/query";
import { cx } from "../lib/format";
import { Avatar, Skeleton } from "../ui";
import { NAV, BASE, warm, activeNavId } from "../routes";
import mark from "../assets/mark-colour-96.png";

const COLLAPSE_KEY = "ts-sidebar-collapsed";

const ShellContext = createContext(null);

/** Shell data (profile + nav badges) and the sidebar slot for the assistant. */
export const useShell = () => useContext(ShellContext);

/**
 * Lets a page replace the sidebar's navigation with its own content (the
 * Ask a Textbook screen shows conversations there, per the Figma "Sidebar ·
 * AI assistant" variant). Renders nothing in place.
 */
export function SidebarSlot({ children }) {
  const shell = useShell();
  const { setSlotActive } = shell;
  useEffect(() => {
    setSlotActive(true);
    return () => setSlotActive(false);
  }, [setSlotActive]);
  return shell.slotNode ? createPortal(children, shell.slotNode) : null;
}

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
};

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [slotNode, setSlotNode] = useState(null);
  const [slotActive, setSlotActive] = useState(false);
  const boot = useQuery(keys.bootstrap(), api.bootstrap, { staleMs: 20_000 });

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        // ignore
      }
      return !c;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    clearQueryCache();
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }, [logout, navigate]);

  const ctx = useMemo(
    () => ({ profile: boot.data?.profile, badges: boot.data?.badges || {}, refreshShell: boot.refetch, slotNode, setSlotActive }),
    [boot.data, boot.refetch, slotNode]
  );

  const active = activeNavId(location.pathname);
  const assistantMode = slotActive;
  // The assistant sidebar has its own layout and is always shown expanded.
  const narrow = collapsed && !assistantMode;
  const width = narrow ? "lg:w-[76px]" : "lg:w-[248px]";

  return (
    <ShellContext.Provider value={ctx}>
      <div className="ts-app min-h-screen bg-ts-canvas text-ts-ink antialiased">
        {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden />}

        <aside
          className={cx(
            "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r transition-[transform,width] duration-200 lg:translate-x-0",
            width,
            assistantMode ? "border-transparent bg-ts-navy text-white" : "border-ts-border bg-white",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          aria-label="Main navigation"
        >
          {/* Assistant variant fills this node via <SidebarSlot>. */}
          <div ref={setSlotNode} className={cx("flex min-h-0 flex-1 flex-col", !assistantMode && "hidden")} />

          {!assistantMode && (
            <>
              <div className={cx("flex h-16 items-center gap-2 px-4", collapsed && "lg:justify-center lg:px-0")}>
                <Link to={`${BASE}/dashboard`} className="flex min-w-0 items-center gap-2" onMouseEnter={() => warm(NAV[0])}>
                  <img src={mark} alt="" width={28} height={28} className="h-7 w-7" />
                  <span className={cx("text-[17px] font-bold tracking-tight text-ts-navy", collapsed && "lg:hidden")}>Truesight</span>
                </Link>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className={cx("ml-auto hidden h-8 w-8 items-center justify-center rounded-lg text-ts-faint hover:bg-slate-100 hover:text-ts-ink lg:flex", collapsed && "lg:hidden")}
                  aria-label="Collapse sidebar"
                >
                  <LuPanelLeftClose aria-hidden />
                </button>
                <button type="button" onClick={() => setMobileOpen(false)} className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-ts-muted lg:hidden" aria-label="Close menu">
                  <LuX aria-hidden />
                </button>
              </div>
              {collapsed && (
                <button type="button" onClick={toggleCollapsed} className="mx-auto mb-2 hidden h-8 w-8 items-center justify-center rounded-lg text-ts-faint hover:bg-slate-100 hover:text-ts-ink lg:flex" aria-label="Expand sidebar">
                  <LuPanelLeftOpen aria-hidden />
                </button>
              )}

              <nav className="ts-scroll flex-1 space-y-1 overflow-y-auto px-3 py-2">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  const badge = item.id === "challenges" ? ctx.badges.challengeRequests : item.id === "rewards" ? ctx.badges.cart : 0;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      onMouseEnter={() => warm(item)}
                      onFocus={() => warm(item)}
                      title={collapsed ? item.label : undefined}
                      className={cx(
                        "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors",
                        collapsed && "lg:justify-center lg:px-0",
                        isActive ? "bg-ts-navy text-white shadow-[0_6px_16px_-8px_rgba(36,51,103,0.8)]" : "text-ts-body hover:bg-ts-subtle hover:text-ts-ink"
                      )}
                    >
                      <Icon aria-hidden className={cx("shrink-0 text-[18px]", isActive ? "text-ts-yellow" : "text-ts-faint group-hover:text-ts-navy")} />
                      <span className={cx("truncate", collapsed && "lg:sr-only")}>{item.label}</span>
                      {badge > 0 && (
                        <span className={cx("ml-auto rounded-full px-1.5 text-[10px] font-bold leading-[18px]", isActive ? "bg-ts-yellow text-ts-ink" : "bg-red-500 text-white", collapsed && "lg:absolute lg:right-1 lg:top-1 lg:ml-0")}>
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              <div className={cx("border-t border-ts-border p-3", collapsed && "lg:px-2")}>
                <Link
                  to={`${BASE}/profile`}
                  className={cx("flex items-center gap-3 rounded-lg p-2 hover:bg-ts-subtle", active === "profile" && "bg-ts-subtle", collapsed && "lg:justify-center")}
                  title="Profile & account"
                >
                  {ctx.profile ? <Avatar name={ctx.profile.name} src={ctx.profile.photoURL} size={34} /> : <Skeleton className="h-[34px] w-[34px] rounded-full" />}
                  <span className={cx("min-w-0", collapsed && "lg:hidden")}>
                    <span className="block truncate text-[13px] font-bold text-ts-ink">{ctx.profile?.name || " "}</span>
                    <span className="block text-[11px] text-ts-muted">{ctx.profile?.role === "Level-1" ? "Educator" : "Student"}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cx("mt-2 flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-ts-border text-xs font-semibold text-ts-body hover:border-ts-field hover:text-ts-ink", collapsed && "lg:mx-auto lg:w-9")}
                  title="Log out"
                >
                  <LuLogOut aria-hidden className={cx(!collapsed && "lg:hidden")} />
                  <span className={cx(collapsed && "lg:hidden")}>logout</span>
                </button>
              </div>
            </>
          )}
        </aside>

        <div className={cx("flex min-h-screen min-w-0 flex-col transition-[padding] duration-200", narrow ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
          <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ts-border bg-white/90 px-4 backdrop-blur lg:hidden">
            <button type="button" onClick={() => setMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-ts-border text-ts-ink" aria-label="Open menu">
              <LuMenu aria-hidden />
            </button>
            <img src={mark} alt="" width={24} height={24} className="h-6 w-6" />
            <span className="font-bold text-ts-navy">Truesight</span>
          </div>
          <main className="flex-1">
            <PageErrorBoundary resetKey={location.pathname}>
              <Suspense fallback={<PageFallback />}>{children}</Suspense>
            </PageErrorBoundary>
          </main>
        </div>
        <ToastContainer position="top-right" autoClose={2600} hideProgressBar newestOnTop theme="light" />
      </div>
    </ShellContext.Provider>
  );
}

export const Page = ({ children, className, wide }) => (
  <div className={cx("mx-auto w-full px-4 py-6 animate-ts-fade sm:px-6 lg:px-8 lg:py-8", wide ? "max-w-[1440px]" : "max-w-[1240px]", className)}>{children}</div>
);

const PageFallback = () => (
  <Page>
    <Skeleton className="h-36 w-full rounded-2xl" />
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-48" />
      ))}
    </div>
  </Page>
);

/**
 * Keeps one screen's render error from blanking the whole app (sidebar
 * included). Resets when the route changes. A failed lazy chunk (e.g. after a
 * deploy) is retried with a full reload.
 */
class PageErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  componentDidCatch(error) {
    console.error("[revamp] page crashed:", error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const chunk = /Loading chunk|ChunkLoadError/i.test(error.message || "");
    return (
      <Page>
        <div className="rounded-xl border border-ts-border bg-white p-10 text-center shadow-card">
          <p className="text-base font-bold text-ts-ink">{chunk ? "A new version is available" : "Something went wrong on this screen"}</p>
          <p className="mt-1 text-sm text-ts-muted">{chunk ? "Reload to get the latest version." : "The rest of the app still works - try again or pick another page."}</p>
          <button type="button" onClick={() => (chunk ? window.location.reload() : this.setState({ error: null }))} className="mt-4 h-9 rounded-lg bg-ts-yellow px-4 text-sm font-semibold text-ts-ink">
            {chunk ? "Reload" : "Try again"}
          </button>
        </div>
      </Page>
    );
  }
}
