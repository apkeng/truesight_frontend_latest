import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuPlus, LuCalendar, LuTrash2, LuSlidersHorizontal, LuArrowDownWideNarrow, LuFolderOpen, LuChevronDown, LuSparkles, LuCircleAlert, LuRotateCcw, LuX } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, prefetch, setQueryData, useQuery } from "../lib/query";
import { cx, coverFor, formatDate, levelLabel } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, ProgressBar, SearchField, Skeleton, ViewToggle } from "../ui";
import { Page } from "../layout/AppShell";
import { NewProjectDialog, LEVELS } from "../components/NewProjectDialog";
import { useNotifications } from "../components/Notifications";

const B = "/l2dashboard";
const VIEW_KEY = "ts-projects-view";
const SORTS = {
  newest: { label: "Newest first", fn: (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0) },
  oldest: { label: "Oldest first", fn: (a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0) },
  az: { label: "A – Z", fn: (a, b) => a.title.localeCompare(b.title) },
  progress: { label: "Most progress", fn: (a, b) => b.progress - a.progress },
};

const readView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) || "list";
  } catch {
    return "list";
  }
};

export default function Projects() {
  const [params, setParams] = useSearchParams();
  const { data, error, isLoading, refetch } = useQuery(keys.projects(), api.projects);
  const [tab, setTab] = useState(params.get("tab") || "all");
  const [q, setQ] = useState("");
  const [view, setView] = useState(readView);
  const [sort, setSort] = useState("newest");
  const [levels, setLevels] = useState([]);
  const [status, setStatus] = useState("any");
  const [filtersOpen, setFiltersOpen] = useState(false);
  // null | { topic, level } - also opened by ?new=1&topic=&level= (e.g. a "Try again" notification link)
  const [creating, setCreating] = useState(params.get("new") === "1" ? { topic: params.get("topic") || "", level: params.get("level") || "" } : null);
  const [toTrash, setToTrash] = useState(null);
  const [trashing, setTrashing] = useState(false);
  const [limit, setLimit] = useState(30);

  const { jobs, refreshJobs } = useNotifications();
  const visibleJobs = jobs.filter((j) => j.status === "pending" || j.status === "failed");

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // ignore
    }
  }, [view]);

  const dismissJob = async (job) => {
    setQueryData(keys.projectJobs(), (d) => (d || []).filter((j) => j.id !== job.id));
    api.dismissJob(job.id).catch(() => refreshJobs());
  };

  const activeFilters = levels.length + (status !== "any" ? 1 : 0);
  const list = useMemo(() => {
    if (!data) return [];
    return data.projects
      .filter((p) => tab === "all" || p.kind === tab)
      .filter((p) => !q || `${p.title} ${p.topic || ""}`.toLowerCase().includes(q.toLowerCase()))
      .filter((p) => !levels.length || levels.includes(levelLabel(p.levelOfLearning).replace("Post Graduate", "Postgraduate")))
      .filter((p) => status === "any" || (status === "new" ? p.progress === 0 : status === "done" ? p.progress === 100 : p.progress > 0 && p.progress < 100))
      .sort(SORTS[sort].fn);
  }, [data, tab, q, levels, status, sort]);

  const confirmTrash = async () => {
    setTrashing(true);
    try {
      await api.trashProject(toTrash.id);
      setQueryData(keys.projects(), (d) => d && { ...d, projects: d.projects.filter((p) => p.id !== toTrash.id), counts: { ...d.counts, all: d.counts.all - 1, self: d.counts.self - 1 } });
      invalidate(keys.dashboard(), keys.trash());
      toast.success(`Moved "${toTrash.title}" to trash.`);
      setToTrash(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setTrashing(false);
    }
  };

  const counts = data?.counts || {};
  const tabs = [
    { value: "all", label: "All Roadmaps", count: counts.all },
    { value: "educator", label: "Educator Assigned", count: counts.educator },
    { value: "self", label: "Self-Directed Research", count: counts.self },
  ];

  return (
    <Page wide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ts-ink">Project Roadmaps</h1>
          <p className="mt-1 text-sm text-ts-muted">Build structured study plans, or explore the roadmaps your educators have assigned.</p>
        </div>
        <Button icon={LuPlus} onClick={() => setCreating({})}>New project</Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-ts-border bg-white p-1 shadow-card no-scrollbar" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              type="button"
              onClick={() => {
                setTab(t.value);
                setParams((p) => { p.set("tab", t.value); return p; }, { replace: true });
              }}
              className={cx("inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold", tab === t.value ? "bg-ts-navy text-white" : "text-ts-muted hover:text-ts-ink")}
            >
              {t.label}
              {t.count !== undefined && <span className={cx("rounded-full px-1.5 text-[10px] leading-[18px]", tab === t.value ? "bg-white/20" : "bg-slate-100")}>{t.count}</span>}
            </button>
          ))}
        </div>
        <SearchField value={q} onChange={setQ} placeholder="Search roadmaps by title or topic…" className="min-w-[200px] flex-1" />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="secondary" size="md" icon={LuSlidersHorizontal} onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
              Filters {activeFilters > 0 && <Badge tone="blue">{activeFilters} active</Badge>}
            </Button>
            {filtersOpen && <FiltersPopover levels={levels} setLevels={setLevels} status={status} setStatus={setStatus} onClose={() => setFiltersOpen(false)} />}
          </div>
          <label className="relative inline-flex h-9 items-center gap-2 rounded-lg border border-ts-border bg-white pl-3 pr-8 text-sm font-semibold text-ts-ink shadow-card">
            <LuArrowDownWideNarrow aria-hidden className="text-ts-muted" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-transparent outline-none" aria-label="Sort roadmaps">
              {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
            </select>
            <LuChevronDown aria-hidden className="pointer-events-none absolute right-2.5 text-ts-muted" />
          </label>
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {visibleJobs.length > 0 && (
        <div className="mt-5 space-y-2">
          {visibleJobs.map((j) => <JobRow key={j.id} job={j} onRetry={() => { dismissJob(j); setCreating({ topic: j.topic, level: j.levelOfLearning }); }} onDismiss={() => dismissJob(j)} />)}
        </div>
      )}

      <div className="mt-5">
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[100px] rounded-xl" />)}</div>
        ) : !list.length ? (
          <EmptyState
            icon={LuFolderOpen}
            title={data.projects.length ? "No roadmaps match these filters" : "No roadmaps yet"}
            description={data.projects.length ? "Try clearing filters or searching for something else." : "Create your first self-directed roadmap - AI builds the modules, notes and quizzes."}
            action={!data.projects.length && <Button icon={LuPlus} onClick={() => setCreating({})}>New project</Button>}
          />
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {list.slice(0, limit).map((p) => <ProjectCard key={`${p.kind}-${p.id}`} project={p} onTrash={setToTrash} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {list.slice(0, limit).map((p) => <ProjectRow key={`${p.kind}-${p.id}`} project={p} onTrash={setToTrash} />)}
          </div>
        )}
        {list.length > limit && (
          <div className="mt-5 text-center">
            <Button variant="secondary" onClick={() => setLimit(limit + 30)}>Show more ({list.length - limit} left)</Button>
          </div>
        )}
      </div>

      <NewProjectDialog
        open={Boolean(creating)}
        initialTopic={creating?.topic || ""}
        initialLevel={creating?.level || ""}
        onClose={() => {
          setCreating(null);
          if (params.get("new")) setParams((p) => { p.delete("new"); p.delete("topic"); p.delete("level"); return p; }, { replace: true });
        }}
      />
      <ConfirmDialog
        open={Boolean(toTrash)}
        onClose={() => setToTrash(null)}
        onConfirm={confirmTrash}
        loading={trashing}
        title="Move to trash?"
        description={`"${toTrash?.title}" will be kept in Trash for 30 days, then deleted permanently. You can restore it any time before then.`}
        confirmLabel="Move to trash"
      />
    </Page>
  );
}

function FiltersPopover({ levels, setLevels, status, setStatus, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden />
      <div className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-ts-border bg-white p-4 shadow-pop">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ts-faint">Level of learning</p>
        <div className="mt-2 space-y-1.5">
          {LEVELS.map((l) => (
            <label key={l} className="flex items-center gap-2 text-sm text-ts-body">
              <input type="checkbox" className="accent-[#0B3A6F]" checked={levels.includes(l)} onChange={(e) => setLevels((v) => (e.target.checked ? [...v, l] : v.filter((x) => x !== l)))} />
              {l}
            </label>
          ))}
        </div>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ts-faint">Progress</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {[["any", "Any"], ["new", "Not started"], ["active", "In progress"], ["done", "Completed"]].map(([v, label]) => (
            <button key={v} type="button" onClick={() => setStatus(v)} className={cx("rounded-lg border px-2 py-1.5 text-xs font-semibold", status === v ? "border-ts-deep bg-ts-deep text-white" : "border-ts-border text-ts-body hover:border-ts-field")}>{label}</button>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <button type="button" className="text-xs font-semibold text-ts-muted hover:text-ts-ink" onClick={() => { setLevels([]); setStatus("any"); }}>Clear all</button>
          <Button size="xs" variant="navy" onClick={onClose}>Done</Button>
        </div>
      </div>
    </>
  );
}

const KindTag = ({ project }) =>
  project.kind === "self" ? (
    <Badge tone="green" caps>Self-directed research</Badge>
  ) : (
    <Badge tone="blue" caps>Educator assigned{project.ownerName ? ` • ${project.ownerName}` : ""}</Badge>
  );

const warmProject = (p) => prefetch(keys.project(p.kind, p.id), () => api.project(p.kind, p.id));

function ProjectRow({ project: p, onTrash }) {
  const to = `${B}/projects/${p.kind}/${p.id}`;
  return (
    <Card className="flex items-center gap-4 p-3 pr-4 transition-shadow hover:shadow-lift" onMouseEnter={() => warmProject(p)}>
      <Link to={to} className="h-14 w-[84px] shrink-0 overflow-hidden rounded-lg" style={coverFor(p.id)} aria-hidden tabIndex={-1}>
        <BookArt seed={p.title} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={to} className="block truncate text-[14px] font-bold text-ts-ink hover:text-ts-navy">{p.title}</Link>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ts-muted"><LuCalendar aria-hidden /> {formatDate(p.updatedAt || p.createdAt)}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <KindTag project={p} />
          <Badge caps>{levelLabel(p.levelOfLearning)}</Badge>
          <span className="text-[11px] text-ts-muted">{p.modules} Modules</span>
          {p.progress > 0 && <span className="text-[11px] font-semibold text-ts-navy">· {p.progress}% done</span>}
        </div>
      </div>
      <Button pill size="sm" to={to} variant="primary" className="hidden sm:inline-flex">{p.kind === "self" ? "Resume building" : "Explore roadmap"}</Button>
      {p.kind === "self" && (
        <button type="button" onClick={() => onTrash(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ts-faint hover:bg-red-50 hover:text-red-500" aria-label={`Move ${p.title} to trash`}>
          <LuTrash2 aria-hidden />
        </button>
      )}
    </Card>
  );
}

function ProjectCard({ project: p, onTrash }) {
  const to = `${B}/projects/${p.kind}/${p.id}`;
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lift" onMouseEnter={() => warmProject(p)}>
      <Link to={to} className="relative block h-36" style={coverFor(p.id)} tabIndex={-1} aria-hidden>
        <BookArt seed={p.title} large />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap gap-1.5"><KindTag project={p} /></div>
        <Link to={to} className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug text-ts-ink hover:text-ts-navy">{p.title}</Link>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-ts-muted"><LuCalendar aria-hidden /> {formatDate(p.updatedAt || p.createdAt)} · {levelLabel(p.levelOfLearning)} · {p.modules} Modules</p>
        <div className="mt-auto pt-4">
          <div className="mb-1 flex justify-between text-[11px]"><span className="text-ts-muted">{p.completedSubtopics}/{p.subtopics} subtopics</span><span className="font-bold text-ts-ink">{p.progress}%</span></div>
          <ProgressBar value={p.progress} />
          <div className="mt-3 flex items-center gap-2">
            <Button pill size="sm" block to={to}>{p.kind === "self" ? "Resume building" : "Explore roadmap"}</Button>
            {p.kind === "self" && (
              <button type="button" onClick={() => onTrash(p)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ts-faint hover:bg-red-50 hover:text-red-500" aria-label={`Move ${p.title} to trash`}>
                <LuTrash2 aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Book-cover illustration drawn in CSS so lists don't wait on image downloads. */
const BookArt = ({ seed, large }) => (
  <span className="flex h-full w-full items-center justify-center">
    <span className={cx("relative rounded-sm bg-white/15 shadow-[4px_6px_12px_rgba(0,0,0,0.35)] ring-1 ring-white/25", large ? "h-24 w-[70px]" : "h-11 w-8")}>
      <span className="absolute inset-y-0 left-0 w-1 rounded-l-sm bg-black/25" />
      <span className={cx("absolute left-2 right-1.5 rounded-sm bg-white/60", large ? "top-4 h-1.5" : "top-2 h-0.5")} />
      <span className={cx("absolute left-2 right-3 rounded-sm bg-white/40", large ? "top-7 h-1" : "top-3.5 h-0.5")} />
      {large && <span className="absolute bottom-2 left-2 text-[8px] font-bold uppercase tracking-wider text-white/80">{seed.split(/\s+/)[0].slice(0, 10)}</span>}
    </span>
  </span>
);

/** Placeholder for a roadmap still being generated (or one that failed). */
function JobRow({ job, onRetry, onDismiss }) {
  const failed = job.status === "failed";
  return (
    <Card className={cx("flex items-center gap-4 p-3 pr-4", failed ? "border-red-200 bg-red-50/40" : "border-dashed border-ts-blue/40 bg-ts-wash/40")}>
      <span className={cx("flex h-14 w-[84px] shrink-0 items-center justify-center rounded-lg", failed ? "bg-red-100 text-red-500" : "bg-white text-ts-navy")}>
        {failed ? <LuCircleAlert aria-hidden className="text-xl" /> : <LuSparkles aria-hidden className="animate-pulse text-xl" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-ts-ink">{job.topic}</p>
        <p className="mt-0.5 text-[11.5px] text-ts-muted">
          {failed ? job.error || "Generation failed." : `Generating your ${job.levelOfLearning.toLowerCase()} roadmap… we'll notify you when it's ready.`}
        </p>
        {!failed && <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-1/3 animate-pulse rounded-full bg-ts-navy" /></div>}
      </div>
      {failed && (
        <>
          <Button size="sm" variant="secondary" icon={LuRotateCcw} onClick={onRetry}>Try again</Button>
          <button type="button" onClick={onDismiss} className="flex h-8 w-8 items-center justify-center rounded-lg text-ts-faint hover:bg-white hover:text-ts-ink" aria-label="Dismiss"><LuX aria-hidden /></button>
        </>
      )}
    </Card>
  );
}
