import React, { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuArrowLeft, LuCheck, LuShieldCheck, LuPackage, LuMap, LuBike } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { cx, formatDate, num } from "../lib/format";
import { useHighlight } from "../lib/useHighlight";
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, SegmentTabs, Skeleton } from "../ui";
import { Page, useShell } from "../layout/AppShell";
import { RewardImage } from "../components/ShopBits";

const B = "/l2dashboard";
const DONE = new Set(["delivered", "collected"]);

// The backend tracks fine-grained statuses; the Campus Dispatch Timeline
// (Figma 11) shows four stages.
const STAGES = {
  delivery: ["Confirmed", "Box Packaged", "In Transit", "Delivered"],
  pickup: ["Confirmed", "Box Packaged", "Ready for Pickup", "Collected"],
};
const STAGE_INDEX = { placed: 0, confirmed: 0, packed: 1, shipped: 2, out_for_delivery: 2, ready_for_pickup: 2, delivered: 3, collected: 3 };

const statusPill = (o) => {
  if (o.status === "cancelled") return { tone: "border-slate-200 bg-slate-50 text-slate-500", label: "Cancelled" };
  if (DONE.has(o.status)) return { tone: "border-emerald-200 bg-emerald-50 text-emerald-700", label: o.fulfilment === "pickup" ? "Collected" : "Delivered", check: true };
  if (STAGE_INDEX[o.status] === 2) return { tone: "border-blue-200 bg-ts-wash text-ts-blue", label: o.fulfilment === "pickup" ? "Ready for pickup" : "In Transit · 3–4 Days", dot: true };
  if (o.status === "packed") return { tone: "border-blue-200 bg-ts-wash text-ts-blue", label: "Box Packaged", dot: true };
  return { tone: "border-amber-200 bg-amber-50 text-amber-700", label: "Order Confirmed", dot: true };
};

export default function Orders() {
  const { state } = useLocation();
  const [params] = useSearchParams();
  const highlightId = state?.highlight || params.get("highlight");
  const { profile } = useShell();
  const { data, error, isLoading, refetch } = useQuery(keys.orders(), api.orders, { staleMs: 30_000 });
  const [tab, setTab] = useState(highlightId ? "all" : "active");
  const orders = data || [];
  const active = orders.filter((o) => !DONE.has(o.status) && o.status !== "cancelled");
  const inTransit = active.filter((o) => STAGE_INDEX[o.status] === 2).length;
  const list = tab === "active" ? active : tab === "done" ? orders.filter((o) => DONE.has(o.status)) : orders;

  return (
    <Page>
      {/* Track My Reward Orders header (Figma 11) */}
      <header className="flex flex-col gap-4 rounded-2xl bg-ts-navy px-5 py-4 text-white shadow-lift md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Link to={`${B}/rewards`} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-[13px] font-semibold text-ts-ink hover:bg-ts-subtle">
            <LuArrowLeft aria-hidden /> Back to Rewards
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold tracking-tight">Track My Reward Orders</h1>
            <p className="text-[12.5px] text-white/75">Live campus courier tracking &amp; verified dispatch timelines</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Stat value={inTransit} label="In transit" className="border-blue-300/50 bg-blue-400/15" />
          <Stat value={orders.length} label="Total orders" valueClass="text-ts-yellow" className="border-white/20 bg-white/10" />
          <span className="inline-flex flex-col items-center justify-center rounded-lg bg-white px-4 py-1.5 text-ts-ink shadow">
            <span className="text-[17px] font-extrabold leading-none">{num(profile?.points)} PTS</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ts-muted">Wallet balance</span>
          </span>
        </div>
      </header>

      <div className="mt-5">
        <SegmentTabs
          value={tab}
          onChange={setTab}
          size="sm"
          items={[
            { value: "active", label: "In progress", count: active.length },
            { value: "done", label: "Delivered", count: orders.filter((o) => DONE.has(o.status)).length },
            { value: "all", label: "All", count: orders.length },
          ]}
        />
      </div>

      <div className="mt-4 space-y-4">
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-[260px] rounded-xl" />)
        ) : !list.length ? (
          <EmptyState icon={LuPackage} title={orders.length ? "Nothing here" : "No orders yet"} description={orders.length ? "Switch tabs to see other orders." : "Redeem a reward and you can track it here."} action={!orders.length && <Button size="sm" to={`${B}/rewards`}>Browse rewards</Button>} />
        ) : (
          list.flatMap((o) => o.items.map((line, i) => <OrderLineCard key={`${o.id}-${i}`} order={o} line={line} highlight={highlightId === o.id && i === 0} />))
        )}
      </div>
    </Page>
  );
}

const Stat = ({ value, label, className, valueClass }) => (
  <span className={cx("inline-flex min-w-[84px] flex-col items-center justify-center rounded-lg border px-3 py-1.5", className)}>
    <span className={cx("text-[17px] font-extrabold leading-none", valueClass)}>{value}</span>
    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/75">{label}</span>
  </span>
);

/** Card / Order - one card per redeemed item (multi-item orders share a tracking id). */
function OrderLineCard({ order: o, line, highlight }) {
  const ref = useHighlight(highlight);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showMap, setShowMap] = useState(highlight);
  const cancelled = o.status === "cancelled";
  const pickup = o.fulfilment === "pickup";
  const stages = STAGES[pickup ? "pickup" : "delivery"];
  const reached = cancelled ? -1 : STAGE_INDEX[o.status] ?? 0;
  const done = DONE.has(o.status);
  const pill = statusPill(o);
  const cancellable = !o.legacy && ["placed", "confirmed"].includes(o.status);
  const destination = pickup ? "Campus pickup desk" : o.address || "Address on file";

  const cancel = async () => {
    setBusy(true);
    try {
      const { order } = await api.cancelOrder(o.id);
      setQueryData(keys.orders(), (d) => d && d.map((x) => (x.id === o.id ? order : x)));
      invalidate(keys.bootstrap(), keys.dashboard(), keys.rewards());
      toast.success(`Order cancelled - ${num(o.total)} points refunded.`);
      setConfirm(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card ref={ref} className={cx("p-4 sm:p-5", highlight && "border-blue-400 ring-1 ring-blue-300")}>
      <div className="flex flex-wrap items-start gap-4">
        <Link to={`${B}/rewards/${line.rewardId}`} className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ts-border bg-ts-subtle"><RewardImage src={line.imageUrl} className="object-contain" /></Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-ts-blue">
            {line.category || "Reward"}{line.option && <span className="font-medium normal-case tracking-normal text-ts-muted"> · Option: {line.option}</span>}
          </p>
          <Link to={`${B}/rewards/${line.rewardId}`} className="mt-0.5 block text-[16px] font-bold text-ts-ink hover:text-ts-navy">{line.qty > 1 ? `${line.qty} × ` : ""}{line.name}</Link>
          <p className="mt-0.5 text-[11.5px] text-ts-muted">Tracking ID: <span className="font-mono">{o.orderNumber}</span> · Order Date: {formatDate(o.createdAt, { day: "2-digit", month: "short", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-ts-border bg-ts-subtle px-2.5 py-1 text-center">
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-ts-faint">Deduction</span>
            <span className="block text-[14px] font-extrabold text-emerald-600">−{num(line.points * line.qty)} PTS</span>
          </span>
          <span className={cx("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-bold", pill.tone)}>
            {pill.dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {pill.check && <LuCheck aria-hidden />}
            {pill.label}
          </span>
        </div>
      </div>

      {/* Delivery / Timeline */}
      {!cancelled ? (
        <div className="mt-4 rounded-xl bg-ts-subtle px-4 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-ts-faint">Campus dispatch timeline</span>
            <span className={cx("text-[11.5px] font-semibold", done ? "text-emerald-600" : "text-ts-blue")}>
              {done ? (pickup ? "Collected & verified at the desk" : "Delivered & handed over with OTP") : `Estimated ${pickup ? "ready" : "arrival"}: ${pickup ? "1 to 3" : "3 to 4"} working days`}
            </span>
          </div>
          <ol className="relative mt-3 flex items-start justify-between">
            {/* Track behind the dots: grey base, green for completed legs, blue into the current stage. */}
            <span aria-hidden className="absolute left-2.5 right-2.5 top-[9px] h-[3px] rounded bg-slate-200" />
            <span
              aria-hidden
              className={cx("absolute left-2.5 top-[9px] h-[3px] rounded", done ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-500 to-ts-blue")}
              style={{ width: `calc((100% - 20px) * ${Math.max(0, reached) / (stages.length - 1)})` }}
            />
            {stages.map((label, i) => {
              const isDone = i < reached || (done && i <= reached);
              const isCurrent = i === reached && !done;
              return (
                <li key={label} className="relative flex flex-1 flex-col items-center text-center first:items-start first:text-left last:items-end last:text-right">
                  <span className={cx("relative z-10 flex h-5 w-5 items-center justify-center rounded-full", isDone ? "bg-emerald-500 text-white" : isCurrent ? "bg-ts-blue ring-4 ring-blue-200" : "border-2 border-dashed border-slate-300 bg-white")}>
                    {isDone ? <LuCheck aria-hidden className="text-[11px]" /> : isCurrent ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                  </span>
                  <span className={cx("mt-1.5 text-[11.5px]", isDone ? "font-semibold text-ts-ink" : isCurrent ? "font-semibold text-ts-blue" : "text-ts-faint")}>
                    {i === stages.length - 1 && !done && o.estimatedDelivery ? `Expected ${formatDate(o.estimatedDelivery, { day: "numeric", month: "short" })}` : isCurrent && i === 2 && !pickup ? "In Transit (3–4 Days)" : label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-ts-subtle px-4 py-3 text-xs text-ts-muted">This order was cancelled and its points were refunded.</p>
      )}

      {showMap && !cancelled && !done && <RouteMap stage={reached} pickup={pickup} destination={destination} />}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
        <span className="text-ts-muted">Recipient Destination: <span className="text-ts-body">{destination}</span></span>
        <div className="flex flex-wrap items-center gap-2">
          {!cancelled && (
            <span className={cx("inline-flex items-center gap-1 font-semibold", done ? "text-emerald-600" : "text-ts-blue")}>
              <LuShieldCheck aria-hidden /> {done ? "Completed · Verified Handover" : `In Progress · Handover in ${pickup ? "1–3" : "3–4"} Days`}
            </span>
          )}
          {!cancelled && !done && (
            <Button variant="ghost" size="xs" icon={LuMap} onClick={() => setShowMap(!showMap)}>{showMap ? "Hide route" : "View route"}</Button>
          )}
          {cancellable && <Button variant="danger" size="xs" onClick={() => setConfirm(true)}>Cancel order</Button>}
        </div>
      </div>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={cancel} loading={busy} title="Cancel this order?" description={`${num(o.total)} points will be refunded to your balance right away.`} confirmLabel="Cancel order" />
    </Card>
  );
}

/**
 * Delivery / Route Map (Figma 11): schematic campus grid from the Truesights
 * hub to the destination; the courier marker advances with the order stage.
 */
const BLOCKS = [
  ["Central Library", 0, 0], ["Science & Research", 1, 0], ["Academic Complex", 2, 0], ["Sports Arena", 3, 0],
  ["Innovation Lab", 0, 1], ["Tech Quad & Incubator", 1, 1], ["Central Green Commons", 2, 1], ["Student Union", 3, 1],
  ["Truesights Hub", 0, 2], ["Regional Sorting", 1, 2], ["Campus Commons", 2, 2], ["DEST", 3, 2],
];
const W = 820;
const H = 280;
const cellW = W / 4;
const cellH = H / 3;
// Street path along the grid gaps: hub -> first avenue -> top boulevard -> last avenue -> destination.
const ROUTE = [[100, 177], [205, 177], [205, 84], [615, 84], [615, 177], [718, 177]];

const pointAt = (t) => {
  const segs = ROUTE.slice(1).map((p, i) => ({ a: ROUTE[i], b: p, len: Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]) }));
  let d = segs.reduce((n, s) => n + s.len, 0) * t;
  for (const s of segs) {
    if (d <= s.len) return [s.a[0] + ((s.b[0] - s.a[0]) * d) / s.len, s.a[1] + ((s.b[1] - s.a[1]) * d) / s.len];
    d -= s.len;
  }
  return ROUTE[ROUTE.length - 1];
};

function RouteMap({ stage, pickup, destination }) {
  const t = [0.08, 0.3, 0.68, 1][Math.max(0, stage)];
  const [x, y] = pointAt(t);
  const path = ROUTE.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-ts-border bg-[#F1F5F9]">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Courier route to ${destination}`}>
        {BLOCKS.map(([label, cx_, cy]) => {
          const dest = label === "DEST";
          const hub = label === "Truesights Hub";
          const green = label === "Central Green Commons";
          return (
            <g key={label}>
              <rect x={cx_ * cellW + 14} y={cy * cellH + 12} width={cellW - 28} height={cellH - 30} rx="7" fill={green ? "#ECFDF5" : "#FFFFFF"} stroke={dest ? "#60A5FA" : hub ? "#0B3A6F" : green ? "#86EFAC" : "#CBD5E1"} strokeWidth={dest || hub ? 1.6 : 1} />
              <text x={cx_ * cellW + cellW / 2} y={cy * cellH + cellH / 2 - (dest || hub ? 6 : 2)} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={dest ? "#1D4ED8" : green ? "#047857" : "#1E293B"} style={{ textTransform: "uppercase" }}>
                {dest ? (pickup ? "PICKUP DESK" : "YOUR ADDRESS") : label.toUpperCase()}
              </text>
              {(dest || hub) && (
                <text x={cx_ * cellW + cellW / 2} y={cy * cellH + cellH / 2 + 9} textAnchor="middle" fontSize="8.5" fill={dest ? "#2563EB" : "#475569"}>
                  {dest ? "Target destination" : "Dispatch origin"}
                </text>
              )}
            </g>
          );
        })}
        {[1, 2, 3].map((i) => <line key={`v${i}`} x1={i * cellW} y1="0" x2={i * cellW} y2={H} stroke="#CBD5E1" strokeDasharray="4 5" />)}
        {[1, 2].map((i) => <line key={`h${i}`} x1="0" y1={i * cellH - 9} x2={W} y2={i * cellH - 9} stroke="#CBD5E1" strokeDasharray="4 5" />)}
        <path d={path} fill="none" stroke="#94A3B8" strokeWidth="3" strokeDasharray="8 7" strokeLinecap="round" />
        <path d={path} fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="10 6" strokeLinecap="round" pathLength="1" style={{ strokeDasharray: `${t} 1` }} />
        <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="11" fill="#243367" stroke="#FEE047" strokeWidth="2" />
        <text x={ROUTE[0][0]} y={ROUTE[0][1] + 3} textAnchor="middle" fontSize="7" fontWeight="800" fill="#FFFFFF">HUB</text>
        <circle cx={ROUTE[ROUTE.length - 1][0]} cy={ROUTE[ROUTE.length - 1][1]} r="10" fill="#FEE047" stroke="#1E293B" strokeWidth="2" />
        <circle cx={ROUTE[ROUTE.length - 1][0]} cy={ROUTE[ROUTE.length - 1][1]} r="4" fill="#DC2626" />
        <g transform={`translate(${x - 13} ${y - 13})`}>
          <circle cx="13" cy="13" r="13" fill="#243367" stroke="#FEE047" strokeWidth="2" />
        </g>
      </svg>
      <div className="flex items-center gap-1.5 border-t border-ts-border bg-white px-3 py-1.5 text-[11px] text-ts-muted">
        <LuBike aria-hidden className="text-ts-navy" /> Courier position updates as the order moves through each stage.
      </div>
    </div>
  );
}
