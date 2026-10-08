import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LuArrowLeft,
  LuPlay,
  LuRotateCcw,
  LuChevronDown,
  LuChevronUp,
  LuLightbulb,
  LuBox,
  LuCircleCheck,
  LuSwords,
  LuWandSparkles,
  LuBookOpenText,
  LuTrash2,
  LuShieldCheck,
  LuExternalLink,
} from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { cx, formatDate, levelLabel } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, ErrorState, ProgressBar, Skeleton } from "../ui";
import { Page } from "../layout/AppShell";
import { generateSubtopics, updateProject, updateStudyPlan } from "../../utils/apiServices";
import { NewChallengeDialog } from "../components/NewChallengeDialog";

const B = "/l2dashboard";

const topicName = (t, i) => t.topic || t.name || t.title || t.description?.split(".")[0] || `Module ${i + 1}`;
const subName = (s) => s.subtopic || s.name || s.title || "Subtopic";

export default function ProjectRoadmap() {
  const { kind, id } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading, refetch } = useQuery(keys.project(kind, id), () => api.project(kind, id));
  const [moduleIndex, setModuleIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [challengeTopic, setChallengeTopic] = useState(null);
  const [confirmTrash, setConfirmTrash] = useState(false);

  const project = data?.project;
  const history = useMemo(() => data?.history || {}, [data]);
  const topics = useMemo(() => project?.topics || [], [project]);
  const current = topics[moduleIndex];

  const nextSubtopic = useMemo(() => {
    for (const t of topics) for (const s of t.subtopics || []) if (!history[subName(s)]) return subName(s);
    return null;
  }, [topics, history]);

  const quizUrl = (sub) => `${B}/quiz/${encodeURIComponent(sub)}?projectTopic=${encodeURIComponent(project.topic || project.title)}&from=${kind}/${id}`;

  const generateMore = async () => {
    setGenerating(true);
    try {
      const name = topicName(current, moduleIndex);
      const extra = await generateSubtopics(name, current.subtopics || []);
      if (!Array.isArray(extra) || !extra.length) throw new Error("No new subtopics came back - try again.");
      const updatedTopics = topics.map((t, i) => (i === moduleIndex ? { ...t, subtopics: [...(t.subtopics || []), ...extra] } : t));
      await (kind === "educator" ? updateStudyPlan(id, { topics: updatedTopics }) : updateProject(id, { topics: updatedTopics }));
      setQueryData(keys.project(kind, id), (d) => d && { ...d, project: { ...d.project, topics: updatedTopics, subtopics: d.project.subtopics + extra.length } });
      invalidate(keys.projects(), keys.dashboard());
      toast.success(`Added ${extra.length} subtopics.`);
    } catch (e) {
      toast.error(e.message || "Couldn't generate more subtopics right now.");
    } finally {
      setGenerating(false);
    }
  };

  const trash = async () => {
    try {
      await api.trashProject(id);
      invalidate(keys.projects(), keys.dashboard(), keys.trash());
      toast.success("Moved to trash.");
      navigate(`${B}/projects`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (error && !data) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;

  return (
    <Page wide>
      <Link to={`${B}/projects`} className="inline-flex items-center gap-1.5 rounded-full border border-ts-border bg-white px-3 py-1.5 text-xs font-semibold text-ts-ink shadow-card hover:border-ts-field">
        <LuArrowLeft aria-hidden /> Back to Projects
      </Link>

      {isLoading ? (
        <div className="mt-4 space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <div className="grid gap-4 lg:grid-cols-[340px_1fr]"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
        </div>
      ) : (
        <>
          {/* Header / Project */}
          <header className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2A3B78] via-[#243367] to-[#1B2757] p-6 text-white shadow-lift sm:p-7">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={project.kind === "self" ? "green" : "blue"} caps>{project.kind === "self" ? "Self-directed research" : `Educator assigned${project.ownerName ? ` • ${project.ownerName}` : ""}`}</Badge>
                  <Badge caps className="border-white/20 bg-white/10 text-white">{levelLabel(project.levelOfLearning)}</Badge>
                </div>
                <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight">{project.title}</h1>
                {project.introduction && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/80">{project.introduction}</p>}
                <p className="mt-3 text-xs text-white/60">Updated {formatDate(project.updatedAt)} · {project.modules} modules · {project.subtopics} subtopics</p>
                {project.generation && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 ring-1 ring-emerald-300/30">
                    <LuShieldCheck aria-hidden /> Researched & fact-checked
                    {project.generation.averageFinalScore != null && ` · accuracy ${project.generation.averageFinalScore}/100`}
                    {project.generation.sources.length > 0 && ` · ${project.generation.sources.length} sources`}
                  </p>
                )}
              </div>
              <div className="w-full shrink-0 rounded-xl bg-white/10 p-4 ring-1 ring-white/15 lg:w-72">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-white/75">Roadmap progress</span>
                  <span className="text-2xl font-extrabold">{project.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-ts-yellow" style={{ width: `${project.progress}%` }} /></div>
                <p className="mt-1.5 text-[11px] text-white/60">{project.completedSubtopics} of {project.subtopics} subtopics quizzed</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" block disabled={!nextSubtopic} icon={LuPlay} onClick={() => navigate(quizUrl(nextSubtopic))}>{nextSubtopic ? "Next quiz" : "All done"}</Button>
                  {project.kind === "self" && project.canEdit && (
                    <button type="button" onClick={() => setConfirmTrash(true)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20" aria-label="Move project to trash"><LuTrash2 aria-hidden /></button>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
            {/* Roadmap / Module Item list */}
            <nav aria-label="Modules" className="space-y-2">
              {topics.map((t, i) => {
                const subs = t.subtopics || [];
                const done = subs.filter((s) => history[subName(s)]).length;
                const pct = subs.length ? Math.round((done / subs.length) * 100) : 0;
                const active = i === moduleIndex;
                return (
                  <button
                    key={t.id || i}
                    type="button"
                    onClick={() => setModuleIndex(i)}
                    className={cx("w-full rounded-xl border p-3.5 text-left transition-colors", active ? "border-ts-navy bg-white shadow-lift ring-1 ring-ts-navy/20" : "border-ts-border bg-white hover:border-ts-field")}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold", active ? "bg-ts-navy text-white" : pct === 100 ? "bg-emerald-50 text-emerald-600" : "bg-ts-subtle text-ts-muted")}>
                        {pct === 100 ? <LuCircleCheck aria-hidden /> : String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-bold leading-snug text-ts-ink">{topicName(t, i)}</span>
                        <span className="mt-0.5 block text-[11px] text-ts-muted">{subs.length} subtopics · {done} quizzed</span>
                        <ProgressBar value={pct} className="mt-2 h-1" tone={pct === 100 ? "green" : "navy"} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Roadmap / Subtopic + Study Note */}
            <section aria-label="Subtopics" className="min-w-0">
              {current ? (
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ts-faint">Module {moduleIndex + 1}</p>
                      <h2 className="text-lg font-bold text-ts-ink">{topicName(current, moduleIndex)}</h2>
                      {current.description && <p className="mt-1 text-[13px] leading-relaxed text-ts-muted">{current.description}</p>}
                    </div>
                    {project.canEdit && (
                      <Button variant="secondary" size="sm" icon={LuWandSparkles} loading={generating} onClick={generateMore}>More subtopics</Button>
                    )}
                  </div>
                  <div className="mt-4 space-y-3">
                    {(current.subtopics || []).map((s, i) => (
                      <Subtopic key={s.id || i} sub={s} index={i} history={history[subName(s)]} quizUrl={quizUrl(subName(s))} onChallenge={() => setChallengeTopic({ topic: subName(s), domain: project.title })} />
                    ))}
                    {!(current.subtopics || []).length && <p className="py-6 text-center text-sm text-ts-muted">No subtopics in this module yet.</p>}
                  </div>
                </Card>
              ) : (
                <Card className="p-10 text-center text-sm text-ts-muted">This roadmap has no modules yet.</Card>
              )}
            </section>
          </div>

          {project.generation?.sources?.length > 0 && (
            <Card className="mt-5 p-5">
              <h2 className="flex items-center gap-2 text-[14px] font-bold text-ts-ink"><LuShieldCheck aria-hidden className="text-emerald-600" /> Sources used to research this roadmap</h2>
              <p className="mt-0.5 text-xs text-ts-muted">Every module was fact-checked against these references; flagged facts were re-verified with a web search before being corrected.</p>
              <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {project.generation.sources.map((src) => (
                  <li key={src.uri} className="min-w-0">
                    <a href={src.uri} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 text-[12.5px] text-ts-blue hover:underline">
                      <LuExternalLink aria-hidden className="shrink-0" /> <span className="truncate">{src.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      <NewChallengeDialog open={Boolean(challengeTopic)} onClose={() => setChallengeTopic(null)} preset={challengeTopic} />
      <ConfirmDialog
        open={confirmTrash}
        onClose={() => setConfirmTrash(false)}
        onConfirm={trash}
        title="Move to trash?"
        description="This roadmap will stay in Trash for 30 days before it's permanently deleted."
        confirmLabel="Move to trash"
      />
    </Page>
  );
}

function Subtopic({ sub, index, history, quizUrl, onChallenge }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const concepts = sub.keyConcepts || [];
  return (
    <div className={cx("rounded-xl border transition-colors", open ? "border-ts-field bg-ts-subtle/50" : "border-ts-border bg-white")}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <button type="button" onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
          <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg border border-ts-border bg-white text-ts-muted">
            <span className="text-[7px] font-bold uppercase leading-none">ST</span>
            <span className="text-sm font-extrabold leading-none text-ts-ink">{index + 1}</span>
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-bold text-ts-ink">{subName(sub)}</span>
              {history && <Badge tone={history.best === 100 ? "green" : "blue"} icon={LuCircleCheck}>{history.best === 100 ? "Mastered" : `Best ${history.best}%`}</Badge>}
            </span>
            {!open && sub.description && <span className="mt-0.5 block truncate text-xs text-ts-muted">{sub.description}</span>}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" iconRight={open ? LuChevronUp : LuChevronDown} onClick={() => setOpen(!open)}>
            {open ? "COLLAPSE" : "EXPLORE"}
          </Button>
          <Button variant="ghost" size="sm" icon={LuSwords} onClick={onChallenge} title="Challenge a peer on this topic" aria-label="Challenge a peer on this topic" />
          <Button size="sm" icon={history ? LuRotateCcw : LuPlay} onClick={() => navigate(quizUrl)}>{history ? "Retake Quiz" : "Start Quiz"}</Button>
        </div>
      </div>
      {open && (
        <div className="space-y-4 border-t border-ts-border px-4 pb-5 pt-4">
          {sub.description && <p className="text-[13.5px] leading-relaxed text-ts-body">{sub.description}</p>}
          {concepts.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ts-faint"><LuBookOpenText aria-hidden /> Study notes</p>
              <div className="space-y-3">
                {concepts.map((c, i) => (
                  <article key={c.id || i} className="rounded-xl border border-ts-border bg-white p-4">
                    <h4 className="flex items-center gap-2 text-[14px] font-bold text-ts-ink"><LuBox aria-hidden className="text-ts-navy" /> {c.keyConcept}</h4>
                    <div className="mt-2 grid gap-4 lg:grid-cols-[1fr_240px]">
                      <div className="space-y-2 text-[13px] leading-relaxed text-ts-body">
                        <p>{c.description}</p>
                        {c.example && <p className="rounded-lg bg-ts-subtle p-3 text-[12.5px]"><span className="font-semibold text-ts-ink">Example: </span>{c.example}</p>}
                      </div>
                      {c.mnemonic && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700"><LuLightbulb aria-hidden /> Memory anchor</p>
                          <p className="mt-1.5 text-[12.5px] font-semibold italic text-ts-ink">“{c.mnemonic}”</p>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
          {history?.last && <p className="text-[11px] text-ts-muted">{history.attempts} attempt{history.attempts > 1 ? "s" : ""} · last scored {history.last.percent}% on {formatDate(history.last.createdAt)}</p>}
        </div>
      )}
    </div>
  );
}
