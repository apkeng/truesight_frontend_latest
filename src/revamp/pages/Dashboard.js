import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LuMessagesSquare,
  LuLayoutGrid,
  LuExternalLink,
  LuSparkles,
  LuSwords,
  LuPenLine,
  LuChartColumn,
  LuFolderKanban,
  LuStar,
  LuHeart,
  LuChevronLeft,
  LuChevronRight,
  LuNetwork,
  LuFileUp,
  LuCalendarDays,
  LuMapPin,
  LuTrendingUp,
  LuTrendingDown,
  LuTrash2,
} from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, prefetch, setQueryData, useQuery } from "../lib/query";
import { cx, coverFor, formatDayMonth, formatTime, levelLabel, num } from "../lib/format";
import { Badge, Button, Card, CardTitle, ErrorState, ProgressBar, SearchField, SegmentTabs, Skeleton, ViewAll } from "../ui";
import { Page } from "../layout/AppShell";
import { Composer } from "../components/Composer";
import { DailyQuestionDialog, PuzzleDialog } from "../components/DailyPlay";
import { NewProjectDialog } from "../components/NewProjectDialog";

const B = "/l2dashboard";

export default function Dashboard() {
  const { data, error, isLoading, refetch } = useQuery(keys.dashboard(), api.dashboard);
  const [daily, setDaily] = useState(null); // 'question' | 'puzzle'

  if (error && !data) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;

  const first = data?.profile?.name?.split(" ")[0];
  return (
    <Page wide>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ts-muted">{greeting()}{first ? `, ${first}` : ""}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-ts-ink">Your learning overview</h1>
        </div>
        {data && (
          <Link to={`${B}/rewards`} className="inline-flex items-center gap-2 rounded-full border border-ts-border bg-white px-3.5 py-1.5 text-sm font-semibold text-ts-ink shadow-card hover:border-ts-field">
            <LuStar aria-hidden className="text-amber-500" /> {num(data.profile.points)} points
          </Link>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7"><AskTextBook /></div>
        <div className="grid gap-5 sm:grid-cols-2 xl:col-span-5 xl:grid-cols-1">
          {isLoading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-[132px] rounded-xl" />)
          ) : (
            <>
              <ChallengesTaken data={data} onPlay={setDaily} />
              <ContinueProject project={data.continueProject} />
              <LatestScore score={data.latestScore} />
            </>
          )}
        </div>

        <div className="xl:col-span-4">{isLoading ? <Skeleton className="h-[420px] rounded-xl" /> : <MyProjects projects={data.projects} />}</div>
        <div className="xl:col-span-4">{isLoading ? <Skeleton className="h-[420px] rounded-xl" /> : <PointsRewards rewards={data.rewards} />}</div>
        <div className="xl:col-span-4">{isLoading ? <Skeleton className="h-[420px] rounded-xl" /> : <UpcomingEvents events={data.events} />}</div>

        <div className="xl:col-span-12">{isLoading ? <Skeleton className="h-[260px] rounded-xl" /> : <SyllabusMindMap summary={data.syllabus} />}</div>
      </div>

      <DailyQuestionDialog open={daily === "question"} onClose={() => setDaily(null)} />
      <PuzzleDialog open={daily === "puzzle"} onClose={() => setDaily(null)} />
    </Page>
  );
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

// ------------------------------------------------------------ Ask Text Book

function AskTextBook() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const fileRef = useRef(null);
  return (
    <Card className="relative flex h-full min-h-[340px] flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#AFC9FE]/80 via-[#DCE7FF]/50 to-transparent" />
      <div className="relative flex items-center gap-2 px-5 pt-4">
        <LuMessagesSquare aria-hidden className="text-ts-navy" />
        <Link to={`${B}/ask-a-textbook`} className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-ts-blue shadow-sm">
          <LuLayoutGrid aria-hidden /> Full Studio
        </Link>
        <Link to={`${B}/ask-a-textbook`} className="ml-auto text-ts-muted hover:text-ts-ink" aria-label="Open Ask a Textbook">
          <LuExternalLink aria-hidden />
        </Link>
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <h2 className="flex items-center gap-2 text-xl font-bold text-ts-ink">
          <LuSparkles aria-hidden className="text-ts-navy" /> Ask Text Book
        </h2>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ts-muted">
          Upload your textbook and ask anything. Get clear, source-grounded answers and simple explanations from your book.
        </p>
      </div>
      <div className="relative px-5 pb-5">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) navigate(`${B}/ask-a-textbook`, { state: { uploadFile: file } });
          }}
        />
        <Composer
          value={prompt}
          onChange={setPrompt}
          onSubmit={(q) => navigate(`${B}/ask-a-textbook`, { state: { prompt: q } })}
          onAttach={() => fileRef.current?.click()}
          placeholder="Upload your syllabus and Ask AI"
        />
      </div>
    </Card>
  );
}

// ---------------------------------------------------------- small widgets

function ChallengesTaken({ data, onPlay }) {
  const q = data.daily.question;
  const hoursLeft = Math.max(0, Math.floor((new Date(q.closesAt).getTime() - Date.now()) / 3600000));
  return (
    <Card className="p-4">
      <CardTitle icon={LuSwords} action={<ViewAll to={`${B}/challenges`} />}>Challenges Taken</CardTitle>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-[34px] font-extrabold leading-none text-ts-ink">{num(data.challenges.taken)}</span>
        <div className="flex flex-wrap gap-2">
          <PlayChip
            title="Daily question"
            caption={q.attempted ? "Done · New one tomorrow" : `${hoursLeft}h left · Click to play`}
            done={q.attempted}
            onClick={() => onPlay("question")}
          />
          <PlayChip title="Word quest" caption="Riddle · Click to play" onClick={() => onPlay("puzzle")} />
        </div>
      </div>
      {data.challenges.requests > 0 && (
        <Link to={`${B}/challenges?tab=requests`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {data.challenges.requests} challenge request{data.challenges.requests > 1 ? "s" : ""} waiting
        </Link>
      )}
    </Card>
  );
}

const PlayChip = ({ title, caption, onClick, done }) => (
  <button type="button" onClick={onClick} className={cx("rounded-lg border px-2.5 py-1.5 text-left transition-colors", done ? "border-emerald-200 bg-emerald-50/60" : "border-ts-border bg-ts-subtle hover:border-ts-blue/40 hover:bg-ts-wash")}>
    <span className="block text-[11px] font-bold text-ts-ink">{title}</span>
    <span className="block text-[9.5px] text-ts-muted">{caption}</span>
  </button>
);

function ContinueProject({ project }) {
  const navigate = useNavigate();
  if (!project) {
    return (
      <Card className="flex flex-col justify-between p-4">
        <CardTitle icon={LuPenLine}>Continue Project</CardTitle>
        <p className="mt-2 text-xs text-ts-muted">You're all caught up. Start a new roadmap to keep going.</p>
        <Button className="mt-3" pill block to={`${B}/projects?new=1`}>New project</Button>
      </Card>
    );
  }
  const to = `${B}/projects/${project.kind}/${project.id}`;
  return (
    <Card className="p-4">
      <CardTitle icon={LuPenLine} action={<Badge>{project.kind === "self" ? "Private" : "Educator"}</Badge>}>Continue Project</CardTitle>
      <p className="mt-2 truncate text-[13px] font-bold text-ts-ink" title={project.title}>{project.title}</p>
      <div className="mt-1 flex items-center justify-between text-[11px]">
        <span className="font-medium text-ts-blue">{project.kind === "self" ? "Personal workspace" : project.ownerName || "Educator assigned"}</span>
        <span className="font-bold text-ts-ink">{project.progress}%</span>
      </div>
      <ProgressBar value={project.progress} className="mt-1.5" />
      <Button
        className="mt-3"
        pill
        block
        size="sm"
        onMouseEnter={() => prefetch(keys.project(project.kind, project.id), () => api.project(project.kind, project.id))}
        onClick={() => navigate(to)}
      >
        continue
      </Button>
    </Card>
  );
}

function LatestScore({ score }) {
  const [hover, setHover] = useState(null);
  if (!score) {
    return (
      <Card className="p-4">
        <CardTitle icon={LuChartColumn}>Latest Score</CardTitle>
        <p className="mt-2 text-xs text-ts-muted">Take a quiz from any roadmap to see your progress here.</p>
      </Card>
    );
  }
  const up = score.delta !== null && score.delta >= 0;
  const point = hover !== null ? score.series[hover] : null;
  return (
    <Card className="p-4">
      <CardTitle
        icon={LuChartColumn}
        action={
          score.delta !== null && (
            <Badge tone={up ? "blue" : "red"} icon={up ? LuTrendingUp : LuTrendingDown}>
              {Math.abs(score.delta)}% {up ? "better" : "lower"}
            </Badge>
          )
        }
      >
        Latest Score
      </CardTitle>
      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <span className="text-[34px] font-extrabold leading-none text-ts-ink">{point ? point.percent : score.percent}%</span>
          <p className="mt-1 max-w-[160px] truncate text-[11px] text-ts-muted" title={point?.label || score.subtopic}>
            {point ? point.label : score.percent >= 80 ? "Excellent work!" : score.percent >= 50 ? "Good progress" : "Keep practising"}
          </p>
        </div>
        <Sparkline series={score.series} hover={hover} onHover={setHover} />
      </div>
    </Card>
  );
}

function Sparkline({ series, hover, onHover }) {
  const W = 140;
  const H = 44;
  const pts = series.map((p, i) => [series.length === 1 ? W / 2 : (i / (series.length - 1)) * (W - 8) + 4, H - 6 - (p.percent / 100) * (H - 12)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <div className="text-right">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible" onMouseLeave={() => onHover(null)} role="img" aria-label="Recent quiz scores">
        <path d={d} fill="none" stroke="#243367" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <g key={i} onMouseEnter={() => onHover(i)}>
            <circle cx={x} cy={y} r="9" fill="transparent" />
            <circle cx={x} cy={y} r={hover === i || i === pts.length - 1 ? 3.5 : 2} fill={hover === i ? "#2563EB" : "#243367"} />
          </g>
        ))}
      </svg>
      <p className="text-[9.5px] text-ts-faint">Hover points to inspect</p>
    </div>
  );
}

// -------------------------------------------------------------- My Projects

function MyProjects({ projects }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const list = useMemo(
    () =>
      projects
        .filter((p) => tab === "all" || (tab === "private" ? p.kind === "self" : p.kind === "educator"))
        .filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 4),
    [projects, q, tab]
  );
  return (
    <Card className="flex h-full flex-col p-4">
      <CardTitle icon={LuFolderKanban} action={<ViewAll to={`${B}/projects`} onMouseEnter={() => prefetch(keys.projects(), api.projects)} />}>My Projects</CardTitle>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SearchField value={q} onChange={setQ} placeholder="Search projects..." className="min-w-[140px] flex-1" />
        <SegmentTabs
          caps={false}
          size="sm"
          value={tab}
          onChange={setTab}
          items={[
            { value: "all", label: "All" },
            { value: "private", label: "Private" },
            { value: "public", label: "Public" },
          ]}
        />
      </div>
      <ul className="mt-3 flex-1 space-y-2">
        {list.map((p) => (
          <li key={`${p.kind}-${p.id}`}>
            <Link
              to={`${B}/projects/${p.kind}/${p.id}`}
              onMouseEnter={() => prefetch(keys.project(p.kind, p.id), () => api.project(p.kind, p.id))}
              className="flex items-center gap-3 rounded-lg border border-ts-border px-3 py-2.5 transition-colors hover:border-ts-field hover:bg-ts-subtle"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-ts-ink">{p.title}</span>
                <span className="mt-1 flex items-center gap-2 text-[10.5px]">
                  <Badge tone="blue">{levelLabel(p.levelOfLearning)}</Badge>
                  <span className={p.kind === "self" ? "text-ts-muted" : "text-emerald-600"}>{p.kind === "self" ? "Private" : "Public"}</span>
                </span>
              </span>
              <span className="hidden max-w-[90px] truncate text-[10.5px] text-ts-muted sm:block">{p.ownerName || "—"}</span>
            </Link>
          </li>
        ))}
        {!list.length && <li className="py-8 text-center text-xs text-ts-muted">No projects match.</li>}
      </ul>
    </Card>
  );
}

// ----------------------------------------------------------- Points widget

function PointsRewards({ rewards }) {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const items = rewards.featured;
  const current = items[i];
  const wish = async (item) => {
    const next = !item.wished;
    setQueryData(keys.dashboard(), (d) => d && { ...d, rewards: { ...d.rewards, featured: d.rewards.featured.map((r) => (r.id === item.id ? { ...r, wished: next } : r)) } });
    try {
      await (next ? api.wish(item.id) : api.unwish(item.id));
      invalidate(keys.wishlist(), keys.bootstrap());
    } catch (e) {
      toast.error(e.message);
      invalidate(keys.dashboard());
    }
  };
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-gradient-to-br from-[#3C4F8E] via-[#2E3F7C] to-[#243367] p-5 text-white shadow-lift">
      <StarPattern />
      <div className="relative flex gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold tracking-wide"><LuSparkles aria-hidden /> POINTS</p>
          <p className="mt-1 text-[44px] font-extrabold leading-none">{num(rewards.points)}</p>
          <p className="mt-3 text-[13px] leading-snug text-white/85">Take on challenges and quizzes to earn points and unlock your favourite products</p>
          <Link to={`${B}/rewards`} className="mt-3 inline-block text-[13px] font-semibold underline-offset-2 hover:underline">View all →</Link>
        </div>
        {current && (
          <div className="w-[148px] shrink-0 rounded-xl bg-white p-2 text-ts-ink shadow-lift">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              <img src={current.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              <button type="button" onClick={() => wish(current)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow" aria-label={current.wished ? "Remove from wishlist" : "Add to wishlist"}>
                <LuHeart aria-hidden className={cx("text-xs", current.wished ? "fill-rose-500 text-rose-500" : "text-ts-muted")} />
              </button>
            </div>
            <p className="mt-1.5 truncate text-[12.5px] font-bold" title={current.name}>{current.name}</p>
            <p className="text-[10px] text-ts-muted">{num(current.pointsRequired)} PTS To unlock</p>
            <div className="mt-1.5 flex items-center justify-between">
              <button type="button" onClick={() => setI((i - 1 + items.length) % items.length)} className="text-ts-muted hover:text-ts-ink" aria-label="Previous reward"><LuChevronLeft aria-hidden /></button>
              <Button size="xs" pill className="px-4" onClick={() => navigate(`${B}/rewards/${current.id}`)}>View</Button>
              <button type="button" onClick={() => setI((i + 1) % items.length)} className="text-ts-muted hover:text-ts-ink" aria-label="Next reward"><LuChevronRight aria-hidden /></button>
            </div>
          </div>
        )}
      </div>
      {items.length > 1 && (
        <div className="relative mt-auto pt-5">
          <div className="grid grid-cols-5 gap-2">
            {items.map((r, idx) => (
              <button key={r.id} type="button" onClick={() => setI(idx)} className={cx("aspect-[4/3] overflow-hidden rounded-lg bg-white p-1 transition-shadow", idx === i ? "ring-2 ring-sky-300" : "opacity-90 hover:opacity-100")} aria-label={r.name}>
                <img src={r.imageUrl} alt="" className="h-full w-full rounded object-cover" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-1" aria-hidden>
            {items.map((r, idx) => <span key={r.id} className={cx("h-1 rounded-full transition-all", idx === i ? "w-4 bg-sky-300" : "w-1 bg-white/40")} />)}
          </div>
        </div>
      )}
    </div>
  );
}

const StarPattern = () => (
  <svg aria-hidden className="pointer-events-none absolute -bottom-10 -left-8 h-64 w-64 text-white/[0.06]" viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 0 61 39 100 50 61 61 50 100 39 61 0 50 39 39Z" />
    <rect x="35" y="35" width="30" height="30" transform="rotate(45 50 50)" fill="none" stroke="currentColor" strokeWidth="6" />
  </svg>
);

// ---------------------------------------------------------- Upcoming events

function UpcomingEvents({ events }) {
  const navigate = useNavigate();
  return (
    <Card className="flex h-full flex-col p-4">
      <CardTitle icon={LuCalendarDays} action={<ViewAll to={`${B}/events`} onMouseEnter={() => prefetch(keys.events(), api.events)} />}>Upcoming Event</CardTitle>
      <ul className="mt-3 flex-1 space-y-2.5">
        {events.map((e) => {
          const dm = formatDayMonth(e.dateTimeStart);
          return (
            <li key={e.id} className="flex gap-3 rounded-lg border border-ts-border p-2">
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg" style={e.imageUrl ? undefined : coverFor(e.id)}>
                {e.imageUrl && <img src={e.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />}
                {dm && !e.imageUrl && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-lg font-extrabold leading-none">{dm.day}</span>
                    <span className="text-[9px] font-bold tracking-wider">{dm.month}</span>
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold text-ts-ink" title={e.title}>{e.title}</p>
                {e.category && <p className="truncate text-[10.5px] text-ts-muted">{e.category}</p>}
                <p className="flex flex-wrap items-center gap-x-2 text-[10.5px] text-ts-muted">
                  <span>{dm ? `${dm.month.charAt(0) + dm.month.slice(1).toLowerCase()} ${Number(dm.day)} · ${formatTime(e.dateTimeStart)}` : "Date TBA"}</span>
                  <span className="inline-flex items-center gap-0.5"><LuMapPin aria-hidden /> {e.eventType === "online" ? "Online / Live" : "In-person"}</span>
                </p>
                <Button size="xs" pill block className="mt-1.5" onClick={() => navigate(`${B}/events/${e.id}`)}>View details</Button>
              </div>
            </li>
          );
        })}
        {!events.length && <li className="py-10 text-center text-xs text-ts-muted">No upcoming events right now.</li>}
      </ul>
    </Card>
  );
}

// -------------------------------------------------------- Syllabus mind map

function SyllabusMindMap({ summary }) {
  const syllabus = useQuery(summary ? keys.syllabus() : null, api.syllabus);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(null);
  const fileRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") return toast.error("Please choose a PDF file.");
    if (file.size > 100 * 1024 * 1024) return toast.error("That PDF is over 100 MB.");
    setBusy(true);
    try {
      const result = await api.uploadSyllabus(file);
      setQueryData(keys.syllabus(), result);
      invalidate(keys.dashboard());
      toast.success("Syllabus mapped - pick a topic to start a project.");
    } catch (e) {
      toast.error(e.message || "Couldn't read that syllabus.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await api.deleteSyllabus();
      setQueryData(keys.syllabus(), null);
      invalidate(keys.dashboard());
    } catch (e) {
      toast.error(e.message);
    }
  };

  const topics = syllabus.data?.mindmap?.topics || [];
  return (
    <Card className="p-5">
      <CardTitle icon={LuNetwork} action={summary && <Button variant="ghost" size="sm" icon={LuTrash2} onClick={remove}>Remove</Button>}>Syllabus Mind Map</CardTitle>
      <p className="mt-1 text-[13px] text-ts-muted">AI extracts topics and lets you create projects from them.</p>
      {summary && topics.length > 0 ? (
        <div className="mt-4">
          <p className="mb-3 text-xs text-ts-muted">From <span className="font-semibold text-ts-ink">{syllabus.data.filename}</span> · {topics.length} topics</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topics.slice(0, 8).map((t, idx) => (
              <div key={idx} className="rounded-xl border border-ts-border bg-ts-subtle p-3">
                <p className="text-[13px] font-bold text-ts-ink">{t.name || t.title || t.topic}</p>
                <ul className="mt-1.5 space-y-0.5">
                  {(t.subtopics || t.children || []).slice(0, 4).map((s, j) => (
                    <li key={j} className="truncate text-[11px] text-ts-muted">• {typeof s === "string" ? s : s.name || s.title}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => setCreatingTopic(t.name || t.title || t.topic || "")} className="mt-2 inline-block text-[11px] font-semibold text-ts-blue hover:underline">Create project →</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files?.[0]); }}
          disabled={busy}
          className={cx("relative mt-4 flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors", dragging ? "border-ts-blue bg-ts-wash" : "border-ts-blue/40 bg-ts-subtle hover:bg-ts-wash/60")}
        >
          <span className="absolute right-3 top-3 rounded-md border border-ts-border bg-white px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-ts-muted">MAX 100MB</span>
          <LuFileUp aria-hidden className={cx("text-2xl text-ts-navy", busy && "animate-bounce")} />
          <span className="mt-2 text-sm font-bold text-ts-ink">{busy ? "Reading your syllabus…" : "Drop your syllabus PDF here"}</span>
          <span className="mt-0.5 text-xs text-ts-muted">{busy ? "This takes up to a minute" : "or click to browse local files"}</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      <NewProjectDialog
        open={creatingTopic !== null}
        onClose={() => setCreatingTopic(null)}
        initialTopic={[creatingTopic, syllabus.data?.mindmap?.syllabusTitle].filter(Boolean).join(" - ").slice(0, 200)}
        source="syllabus"
      />
    </Card>
  );
}

