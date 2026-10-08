import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LuPlus,
  LuBook,
  LuClock,
  LuUserCheck,
  LuZap,
  LuCircleCheck,
  LuCircleX,
  LuBadgeCheck,
  LuPlay,
  LuChevronRight,
  LuCheck,
  LuStar,
  LuUsers,
  LuTrophy,
  LuTimer,
} from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { cx, countdown } from "../lib/format";
import { Avatar, Badge, Button, Card, Dialog, EmptyState, ErrorState, PageHeader, SegmentTabs, Skeleton, Spinner } from "../ui";
import { Page } from "../layout/AppShell";
import { useHighlight } from "../lib/useHighlight";
import { NewChallengeDialog } from "../components/NewChallengeDialog";

const B = "/l2dashboard";

const STATE_BADGE = {
  awaiting_peer: { tone: "amber", icon: LuClock, label: "Awaiting peer" },
  invite_received: { tone: "blue", icon: LuUserCheck, label: "Invite received" },
  active: { tone: "green", icon: LuZap, label: "Active" },
  awaiting_peer_result: { tone: "amber", icon: LuTimer, label: "Peer playing" },
  completed: { tone: "green", icon: LuCheck, label: "Completed" },
  expired: { tone: "neutral", icon: LuCircleX, label: "Expired" },
  cancelled: { tone: "neutral", icon: LuCircleX, label: "Cancelled" },
  declined: { tone: "neutral", icon: LuCircleX, label: "Declined" },
};

export default function Challenges() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "requests" ? "requests" : "mine";
  const { data, error, isLoading, refetch } = useQuery(keys.challenges(), api.challenges, { staleMs: 15_000 });
  const [dialog, setDialog] = useState(null); // { preset } | null
  const [compareId, setCompareId] = useState(params.get("compare"));
  const highlight = params.get("highlight") || params.get("compare");
  const [, tick] = useState(0);

  // Keep the "expires in" countdowns moving.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  // A notification link may point at a challenge on the other tab.
  useEffect(() => {
    const target = data?.challenges.find((c) => c.id === highlight);
    if (!target) return;
    const want = target.state === "invite_received" ? "requests" : "mine";
    if (want !== tab) setParams((p) => { if (want === "requests") p.set("tab", "requests"); else p.delete("tab"); return p; }, { replace: true });
    // only when the target or data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, highlight]);

  const list = useMemo(
    () => (data?.challenges || []).filter((c) => (tab === "requests" ? c.state === "invite_received" : c.state !== "invite_received")),
    [data, tab]
  );

  return (
    <Page>
      <PageHeader
        title="Show what you know"
        description="Challenge your friends to a quick quiz and see who knows more. Earn points and climb the leaderboard."
        action={<Button icon={LuPlus} onClick={() => setDialog({ preset: null })}>New Challenge</Button>}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <SegmentTabs
          value={tab}
          onChange={(v) => setParams(v === "requests" ? { tab: "requests" } : {}, { replace: true })}
          items={[
            { value: "mine", label: "My Challenges", icon: LuStar, count: data?.counts.mine },
            { value: "requests", label: "Requests", icon: LuUsers, count: data?.counts.requests, countTone: data?.counts.requests ? "red" : undefined },
          ]}
        />
        {data && <Stats challenges={data.challenges} />}
      </div>

      <div className="mt-5">
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[230px] rounded-xl" />)}</div>
        ) : !list.length ? (
          <EmptyState
            icon={LuTrophy}
            title={tab === "requests" ? "No challenge requests" : "No challenges yet"}
            description={tab === "requests" ? "When a peer challenges you, it shows up here for 24 hours." : "Pick a topic from one of your roadmaps and invite a verified peer."}
            action={tab === "mine" && <Button icon={LuPlus} onClick={() => setDialog({ preset: null })}>New Challenge</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((c) => (
              <ChallengeCard key={c.id} c={c} highlight={highlight === c.id} onRechallenge={() => setDialog({ preset: { topic: c.topic, domain: c.domain, peer: c.peer } })} onCompare={() => setCompareId(c.id)} />
            ))}
          </div>
        )}
      </div>

      <NewChallengeDialog open={Boolean(dialog)} preset={dialog?.preset} onClose={() => setDialog(null)} />
      <CompareDialog id={compareId} onClose={() => setCompareId(null)} />
    </Page>
  );
}

const Stats = ({ challenges }) => {
  const done = challenges.filter((c) => c.status === "completed");
  const wins = done.filter((c) => c.outcome === "victory").length;
  return (
    <p className="text-xs text-ts-muted">
      <span className="font-bold text-ts-ink">{done.length}</span> completed · <span className="font-bold text-emerald-600">{wins}</span> won
    </p>
  );
};

function ChallengeCard({ c, highlight, onRechallenge, onCompare }) {
  const navigate = useNavigate();
  const cardRef = useHighlight(highlight);
  const [busy, setBusy] = useState(null);
  const badge = STATE_BADGE[c.state] || STATE_BADGE.expired;

  const act = async (kind, fn, patch, message) => {
    setBusy(kind);
    try {
      await fn(c.id);
      // Optimistic patch; the invalidate below refetches the real counts.
      setQueryData(keys.challenges(), (d) => d && { ...d, challenges: d.challenges.map((x) => (x.id === c.id ? { ...x, ...patch } : x)) });
      invalidate(keys.challenges(), keys.bootstrap(), keys.dashboard());
      if (message) toast.success(message);
      return true;
    } catch (e) {
      toast.error(e.message);
      invalidate(keys.challenges());
      return false;
    } finally {
      setBusy(null);
    }
  };

  const play = () => navigate(`${B}/quiz/${encodeURIComponent(c.topic)}?challengeId=${c.id}`);
  const accept = async () => {
    if (await act("accept", api.acceptChallenge, { status: "accepted", state: "active" }, "Challenge accepted - good luck!")) play();
  };

  const expiresLabel = c.status === "completed" ? "Completed" : c.state === "expired" ? "Expired" : countdown(c.expiresAt);
  const peerRole = c.role === "challenger" ? "Invited peer" : "Challenger";

  return (
    <Card ref={cardRef} className={cx("flex flex-col p-4 transition-shadow", highlight && "ring-2 ring-ts-yellow")}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md border border-ts-border bg-ts-subtle px-2 py-1 text-[10.5px] font-semibold text-ts-body">
          <LuBook aria-hidden className="shrink-0" /> <span className="truncate">{c.domain || "Peer quiz"}</span>
        </span>
        <Badge tone={badge.tone} icon={badge.icon} caps>{badge.label}</Badge>
      </div>
      <h3 className="mt-2.5 text-[16px] font-bold leading-snug text-ts-ink">{c.topic}</h3>

      <div className="mt-3 flex items-center gap-3 rounded-lg bg-ts-subtle px-3 py-2.5">
        <Avatar name={c.peer.name} src={c.peer.photoURL} size={32} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[13px] font-bold text-ts-ink">
            <span className="truncate">{c.peer.name}</span>
            <span className={cx("rounded px-1 py-px text-[8.5px] font-bold uppercase tracking-wide", c.role === "challenger" ? "bg-slate-200 text-slate-600" : "bg-indigo-100 text-indigo-700")}>{peerRole}</span>
          </p>
          <p className="truncate text-[11px] text-ts-muted">{[c.peer.educationLevel, c.peer.instituteName].filter(Boolean).join(" · ") || "Truesight learner"}</p>
        </div>
        {c.outcome ? (
          <span className="text-right">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-ts-faint">Outcome</span>
            <span className={cx("text-[13px] font-bold", c.outcome === "victory" ? "text-emerald-600" : c.outcome === "tie" ? "text-ts-blue" : "text-red-500")}>{c.outcome === "victory" ? "Victory" : c.outcome === "tie" ? "Tie" : "Defeat"}</span>
          </span>
        ) : (
          c.peer.verified !== false && <Badge tone="blue" icon={LuBadgeCheck}>Verified</Badge>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <InfoBox label="Engagement mode" value="Any time (Async)" icon={LuPlay} />
        <InfoBox label="Expires in" value={expiresLabel} icon={LuClock} tone={c.state === "expired" ? "red" : c.status === "completed" ? null : "blue"} />
      </div>

      <div className="mt-3 flex min-h-[34px] items-center justify-between gap-2 border-t border-ts-border pt-3">
        {c.state === "awaiting_peer" && (
          <>
            <span className="flex items-center gap-1.5 text-[11.5px] text-ts-muted"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Awaiting peer response</span>
            <Button variant="secondary" size="xs" loading={busy === "cancel"} onClick={() => act("cancel", api.cancelChallenge, { status: "cancelled", state: "cancelled" }, "Invite cancelled.")}>Cancel Invite</Button>
          </>
        )}
        {c.state === "invite_received" && (
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" size="sm" loading={busy === "decline"} onClick={() => act("decline", api.declineChallenge, { status: "declined", state: "declined" }, "Challenge declined.")}>Decline</Button>
            <Button size="sm" icon={LuCheck} loading={busy === "accept"} onClick={accept}>Accept Challenge</Button>
          </div>
        )}
        {c.state === "active" && <Button block icon={LuPlay} onClick={play}>Start Quiz Now</Button>}
        {c.state === "awaiting_peer_result" && (
          <span className="text-[11.5px] text-ts-muted">You scored <span className="font-bold text-ts-ink">{c.myResult?.score}/{c.myResult?.total || c.questionCount}</span> · waiting for {c.peer.name} to play</span>
        )}
        {c.status === "completed" && (
          <>
            <span className="text-[11.5px] text-ts-muted">Your Score: <span className="font-bold text-emerald-600">{c.myResult?.score ?? 0} pts ({c.myResult?.score ?? 0}/{c.myResult?.total || c.questionCount})</span></span>
            <Button variant="navy" size="xs" iconRight={LuChevronRight} onClick={onCompare}>Compare Results</Button>
          </>
        )}
        {["expired", "cancelled", "declined"].includes(c.state) && (
          <>
            <span className="text-[11.5px] text-ts-faint">{c.state === "expired" ? "Invitation expired" : c.state === "declined" || c.role === "opponent" ? "Invitation declined" : "Invitation cancelled"}</span>
            <Button variant="secondary" size="xs" onClick={onRechallenge}>Re-challenge</Button>
          </>
        )}
      </div>
    </Card>
  );
}

const InfoBox = ({ label, value, icon: Icon, tone }) => (
  <div className="rounded-lg border border-ts-border px-3 py-2">
    <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.08em] text-ts-faint"><Icon aria-hidden /> {label}</p>
    <p className={cx("mt-0.5 text-[12.5px] font-semibold", tone === "red" ? "text-red-500" : tone === "blue" ? "text-ts-blue" : "text-ts-ink")}>{value}</p>
  </div>
);

function CompareDialog({ id, onClose }) {
  const { data, error, isLoading } = useQuery(id ? keys.compare(id) : null, () => api.compare(id), { staleMs: 300_000 });
  const c = data?.challenge;
  return (
    <Dialog open={Boolean(id)} onClose={onClose} size="lg" eyebrow="Peer challenge results" title={c ? c.topic : "Compare results"} tone="navy" footer={<Button variant="navy" size="sm" onClick={onClose}>Close</Button>}>
      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner className="text-2xl" /></div>
      ) : error ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : !c ? null : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <ScoreBox label="You" score={c.myResult} total={c.questionCount} win={c.outcome === "victory"} />
            <ScoreBox label={c.peer.name} score={c.peerResult} total={c.questionCount} win={c.outcome === "defeat"} />
          </div>
          <ol className="mt-4 space-y-3">
            {data.questions.map((q) => (
              <li key={q.index} className="rounded-xl border border-ts-border p-3.5">
                <p className="text-[13px] font-semibold text-ts-ink">Q{q.index}. {q.question}</p>
                <p className="mt-1 text-[11.5px] text-emerald-700">Correct answer: {q.correctAnswer}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <AnswerChip who="You" a={q.mine} />
                  <AnswerChip who={c.peer.name} a={q.theirs} />
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </Dialog>
  );
}

const ScoreBox = ({ label, score, total, win }) => (
  <div className={cx("rounded-xl border p-3 text-center", win ? "border-emerald-200 bg-emerald-50" : "border-ts-border bg-ts-subtle")}>
    <p className="truncate text-xs font-semibold text-ts-muted">{label}</p>
    <p className="text-2xl font-extrabold text-ts-ink">{score?.score ?? "–"}<span className="text-sm text-ts-muted">/{score?.total || total}</span></p>
    {score?.timeTaken && <p className="text-[11px] text-ts-muted">in {score.timeTaken}</p>}
    {win && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Winner</p>}
  </div>
);

const AnswerChip = ({ who, a }) => (
  <p className={cx("flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px]", !a ? "bg-slate-50 text-ts-faint" : a.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700")}>
    {a ? (a.isCorrect ? <LuCircleCheck aria-hidden className="mt-0.5 shrink-0" /> : <LuCircleX aria-hidden className="mt-0.5 shrink-0" />) : null}
    <span><span className="font-semibold">{who}:</span> {a ? a.answer || "No answer" : "Not answered"}</span>
  </p>
);
