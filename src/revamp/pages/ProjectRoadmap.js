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

  LuTrash2,
  LuShieldCheck,
  LuExternalLink,
  LuCog,
  LuFileText,
  LuGem,
} from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { cx, formatDate, levelLabel } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, ErrorState, Skeleton } from "../ui";
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
          {/* Header / Project (Figma 08, roadmap variant) */}
          <header className="relative mt-4 overflow-hidden rounded-2xl bg-ts-navy px-6 py-5 text-white shadow-lift sm:px-7">
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <span className="inline-block rounded bg-white/15 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-white">
                  {levelLabel(project.levelOfLearning)} · {project.kind === "self" ? "Private repository" : `Assigned${project.ownerName ? ` by ${project.ownerName}` : ""}`}
                </span>
                <h1 className="mt-2 text-[24px] font-extrabold leading-tight tracking-tight">{project.title}</h1>
                {project.introduction && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/80">{project.introduction}</p>}
                {project.generation && (
                  <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 ring-1 ring-emerald-300/30">
                    <LuShieldCheck aria-hidden /> Researched & fact-checked
                    {project.generation.averageFinalScore != null && ` · accuracy ${project.generation.averageFinalScore}/100`}
                    {project.generation.sources.length > 0 && ` · ${project.generation.sources.length} sources`}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                <div className="min-w-[84px] rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center">
                  <p className="text-xl font-extrabold leading-none">{project.modules}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/70">Modules</p>
                </div>
                <div className="min-w-[84px] rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center">
                  <p className="text-xl font-extrabold leading-none">{project.progress}%</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/70">Completed</p>
                </div>
                <Button pill size="sm" disabled={!nextSubtopic} icon={LuPlay} onClick={() => navigate(quizUrl(nextSubtopic))}>{nextSubtopic ? "Next quiz" : "All done"}</Button>
                {project.kind === "self" && project.canEdit && (
                  <button type="button" onClick={() => setConfirmTrash(true)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20" aria-label="Move project to trash"><LuTrash2 aria-hidden /></button>
                )}
              </div>
            </div>
          </header>

          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[300px_1fr]">
            {/* Knowledge stack (Roadmap / Module Item) */}
            <Card as="nav" aria-label="Modules" className="p-3 lg:sticky lg:top-6">
              <div className="mb-2 flex items-center justify-between border-b border-ts-border px-1 pb-2.5 pt-1">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ts-blue">Knowledge stack</span>
                <span className="rounded-full bg-ts-wash px-2 py-0.5 text-[10.5px] font-semibold text-ts-blue">{topics.length} Modules</span>
              </div>
              <div className="space-y-2">
                {topics.map((t, i) => {
                  const subs = t.subtopics || [];
                  const done = subs.filter((s) => history[subName(s)]).length;
                  const active = i === moduleIndex;
                  const complete = subs.length > 0 && done === subs.length;
                  return (
                    <button
                      key={t.id || i}
                      type="button"
                      onClick={() => setModuleIndex(i)}
                      aria-current={active}
                      className={cx("flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors", active ? "border-blue-400 bg-ts-wash" : "border-ts-border bg-white hover:border-ts-field")}
                    >
                      <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-extrabold", active ? "bg-blue-500 text-white" : complete ? "bg-emerald-50 text-emerald-600" : "bg-ts-subtle text-ts-body")}>
                        {complete && !active ? <LuCircleCheck aria-hidden /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cx("block text-[13px] font-semibold leading-snug", active ? "text-ts-deep" : "text-ts-ink")}>{topicName(t, i)}</span>
                        <span className={cx("mt-0.5 block text-[11px]", active ? "text-ts-blue" : "text-ts-muted")}>
                          {subs.length} subtopics{done ? ` · ${done} quizzed` : ""}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Module panel (Roadmap / Subtopic + Study Note) */}
            <section aria-label="Subtopics" className="min-w-0">
              {current ? (
                <Card className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ts-border pb-4">
                    <div className="min-w-0">
                      <h2 className="text-[20px] font-extrabold leading-snug text-ts-ink">{topicName(current, moduleIndex)}</h2>
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

// Rough reading time: ~6 minutes per key concept, never under 8.
const minutesFor = (sub) => Math.max(8, (sub.keyConcepts || []).length * 6);

const CONCEPT_ICONS = [LuBox, LuCog, LuFileText, LuLightbulb];

function Subtopic({ sub, index, history, quizUrl, onChallenge }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const concepts = sub.keyConcepts || [];
  const st = String(index + 1).padStart(2, "0");
  return (
    <div className={cx("rounded-xl border bg-white transition-colors", open ? "border-ts-deep shadow-card" : "border-ts-border")}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <button type="button" onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
          <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg border border-ts-border bg-ts-subtle text-ts-muted">
            <span className="text-[7px] font-bold uppercase leading-none">ST</span>
            <span className="mt-0.5 text-[13px] font-extrabold leading-none text-ts-ink">{st}</span>
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[14.5px] font-bold text-ts-ink">{subName(sub)}</span>
              {history && <Badge tone={history.best === 100 ? "green" : "blue"} icon={LuCircleCheck}>{history.best === 100 ? "Mastered" : `Best ${history.best}%`}</Badge>}
            </span>
            <span className="mt-0.5 block text-[11px] uppercase tracking-[0.04em] text-ts-muted">
              {minutesFor(sub)} mins · {concepts.length} key concepts
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" icon={open ? LuChevronUp : LuChevronDown} onClick={() => setOpen(!open)}>
            {open ? "COLLAPSE" : "EXPLORE"}
          </Button>
          <Button variant="ghost" size="sm" icon={LuSwords} onClick={onChallenge} title="Challenge a peer on this topic" aria-label="Challenge a peer on this topic" />
          <Button size="sm" icon={history ? LuRotateCcw : LuPlay} onClick={() => navigate(quizUrl)}>{history ? "Retake Quiz" : "Start Quiz"}</Button>
        </div>
      </div>
      {open && (
        <div className="space-y-3 border-t border-ts-border px-4 pb-4 pt-4">
          {sub.description && (
            <div className="rounded-lg border border-ts-border bg-ts-subtle px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-ts-deep">Context &amp; mandate</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ts-body">{sub.description}</p>
            </div>
          )}
          {concepts.map((c, i) => {
            const Icon = CONCEPT_ICONS[i % CONCEPT_ICONS.length];
            return (
              <article key={c.id || i} className="flex gap-3 rounded-lg border border-ts-border px-4 py-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ts-wash text-ts-navy"><Icon aria-hidden /></span>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-ts-ink">{c.keyConcept}</h4>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ts-body">{c.description}</p>
                  {c.example && <p className="mt-1.5 text-[12px] leading-relaxed text-ts-muted"><span className="font-semibold text-ts-ink">Example: </span>{c.example}</p>}
                  {c.mnemonic && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                      <LuGem aria-hidden className="shrink-0" /> Memory Anchor: “{c.mnemonic}”
                    </span>
                  )}
                </div>
              </article>
            );
          })}
          {history?.last && <p className="text-[11px] text-ts-muted">{history.attempts} attempt{history.attempts > 1 ? "s" : ""} · last scored {history.last.percent}% on {formatDate(history.last.createdAt)}</p>}
        </div>
      )}
    </div>
  );
}
