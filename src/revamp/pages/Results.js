import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuRotateCcw, LuCircleCheck, LuChevronRight, LuCalendar, LuClock, LuTrash2, LuBadgeCheck, LuChartLine, LuPlay } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, prefetch, setQueryData, useQuery } from "../lib/query";
import { cx, coverFor, formatDate, num } from "../lib/format";
import { Badge, Button, Card, Dialog, EmptyState, ErrorState, PageHeader, SearchField, SegmentTabs, Skeleton, Spinner, StatTile } from "../ui";
import { Page } from "../layout/AppShell";
import { ReviewItem } from "./Quiz";

const B = "/l2dashboard";

export default function Results() {
  const { data, error, isLoading, refetch } = useQuery(keys.results(), api.results);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [params] = useSearchParams();
  const openId = params.get("open");
  useEffect(() => {
    const target = openId && data?.results.find((r) => r.id === openId);
    if (target) setOpen(target);
  }, [openId, data]);
  const [limit, setLimit] = useState(30);

  const list = useMemo(
    () => (data?.results || []).filter((r) => (tab === "full" ? r.total > 0 && r.correct === r.total : true)).filter((r) => !q || r.subtopic.toLowerCase().includes(q.toLowerCase())),
    [data, tab, q]
  );

  const trash = async (r) => {
    setQueryData(keys.results(), (d) => d && { ...d, results: d.results.filter((x) => x.id !== r.id), stats: { ...d.stats, attempts: d.stats.attempts - 1 } });
    try {
      await api.trashResult(r.id);
      invalidate(keys.trash(), keys.dashboard());
      toast.success("Result moved to trash.");
    } catch (e) {
      toast.error(e.message);
      invalidate(keys.results());
    }
  };

  return (
    <Page>
      <PageHeader
        title="Results"
        description="Track every quiz you've taken, review your answers and retake topics to improve your score."
        aside={
          data && (
            <div className="rounded-xl bg-white px-6 py-3 text-center text-ts-ink shadow-lift">
              <p className="text-[34px] font-extrabold leading-none">{num(data.stats.totalScore)}</p>
              <p className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-ts-muted">Total points</p>
            </div>
          )
        }
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SegmentTabs
          value={tab}
          onChange={(v) => { setTab(v); setLimit(30); }}
          items={[
            { value: "all", label: `All results`, icon: LuRotateCcw, count: data?.stats.attempts },
            { value: "full", label: `Full marks`, icon: LuCircleCheck, count: data?.stats.fullMarks },
          ]}
        />
        <SearchField value={q} onChange={(v) => { setQ(v); setLimit(30); }} placeholder="Search by topic…" className="flex-1" />
        {data && <p className="text-xs text-ts-muted">Average <span className="font-bold text-ts-ink">{data.stats.averagePercent}%</span></p>}
      </div>

      <div className="mt-5 space-y-3">
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[132px] rounded-xl" />)
        ) : !list.length ? (
          <EmptyState icon={LuChartLine} title={data.results.length ? "Nothing matches" : "No results yet"} description={data.results.length ? "Try another search or tab." : "Finish a quiz from any roadmap and it shows up here."} />
        ) : (
          <>
            {list.slice(0, limit).map((r) => <ResultRow key={r.id} r={r} onReview={() => setOpen(r)} onTrash={() => trash(r)} />)}
            {list.length > limit && (
              <div className="pt-2 text-center">
                <Button variant="secondary" onClick={() => setLimit(limit + 30)}>Show more ({list.length - limit} older)</Button>
              </div>
            )}
          </>
        )}
      </div>

      <BreakdownDialog result={open} onClose={() => setOpen(null)} />
    </Page>
  );
}

function ResultRow({ r, onReview, onTrash }) {
  const navigate = useNavigate();
  const tone = r.percent >= 80 ? "green" : r.percent >= 40 ? "amber" : "red";
  return (
    <Card className="p-4 transition-shadow hover:shadow-lift" onMouseEnter={() => prefetch(keys.result(r.id), () => api.result(r.id))}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="hidden h-16 w-16 shrink-0 rounded-lg sm:block" style={coverFor(r.subtopic)} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-ts-faint">{r.source === "challenge" ? "Peer challenge" : "Quiz topic"}</span>
              <Badge tone={tone}>{r.percent}%</Badge>
            </div>
            <h3 className="mt-0.5 truncate text-[15px] font-bold text-ts-ink" title={r.subtopic}>{r.subtopic}</h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[11px] text-ts-muted">
              <span className="inline-flex items-center gap-1"><LuCalendar aria-hidden /> {formatDate(r.createdAt, { day: "numeric", month: "short", year: "numeric" })}</span>
              {r.timeTaken && <span className="inline-flex items-center gap-1"><LuClock aria-hidden /> {r.timeTaken}</span>}
            </p>
            <div className="mt-2.5 grid max-w-md grid-cols-4 gap-3">
              <StatTile label="Questions" value={`${r.total} Qs`} />
              <StatTile label="Time taken" value={r.timeTaken || "—"} />
              <StatTile label="Points" value={`+${r.pointsEarned} pts`} tone="green" />
              <StatTile label="Status" value={<span className="inline-flex items-center gap-1 text-emerald-600"><LuBadgeCheck aria-hidden /> Verified</span>} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 md:flex-col md:items-end">
          <div className="flex gap-2">
            <div className={cx("w-[72px] rounded-lg border px-2 py-1.5 text-center", tone === "green" ? "border-emerald-200 bg-emerald-50" : tone === "amber" ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50")}>
              <p className="text-[8.5px] font-bold uppercase tracking-wider text-ts-muted">Correct</p>
              <p className={cx("text-lg font-extrabold", tone === "green" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : "text-red-600")}>{r.correct}/{r.total}</p>
            </div>
            <div className="w-[72px] rounded-lg bg-ts-deep px-2 py-1.5 text-center text-white">
              <p className="text-[8.5px] font-bold uppercase tracking-wider text-white/70">Points</p>
              <p className="text-lg font-extrabold">{r.pointsEarned}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="xs" iconRight={LuChevronRight} onClick={onReview}>Review Answers</Button>
            <Button size="xs" icon={LuPlay} onClick={() => navigate(`${B}/quiz/${encodeURIComponent(r.subtopic)}`)}>Retake Quiz</Button>
            <button type="button" onClick={onTrash} className="flex h-7 w-7 items-center justify-center rounded-lg text-ts-faint hover:bg-red-50 hover:text-red-500" aria-label="Move result to trash"><LuTrash2 aria-hidden /></button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function BreakdownDialog({ result, onClose }) {
  const navigate = useNavigate();
  const detail = useQuery(result ? keys.result(result.id) : null, () => api.result(result.id), { staleMs: 600_000 });
  const d = detail.data;
  return (
    <Dialog
      open={Boolean(result)}
      onClose={onClose}
      size="lg"
      tone="navy"
      eyebrow="Quiz breakdown"
      title={result?.subtopic}
      description={result && `Score ${result.correct}/${result.total} · ${result.percent}% · Time ${result.timeTaken || "—"} · ${formatDate(result.createdAt, { day: "numeric", month: "short", year: "numeric" })}`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" icon={LuPlay} onClick={() => navigate(`${B}/quiz/${encodeURIComponent(result.subtopic)}`)}>Retake Quiz</Button>
        </>
      }
    >
      {detail.isLoading ? (
        <div className="flex justify-center py-10"><Spinner className="text-2xl" /></div>
      ) : detail.error ? (
        <p className="text-sm text-red-600">{detail.error.message}</p>
      ) : (
        <div className="space-y-3">
          {(d?.answers || []).slice(0, 50).map((a) => <ReviewItem key={a.index} row={{ ...a, i: a.index - 1 }} />)}
          {d?.answers?.length > 50 && <p className="text-center text-xs text-ts-muted">Showing the first 50 of {d.answers.length} questions.</p>}
        </div>
      )}
    </Dialog>
  );
}
