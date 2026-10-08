import React, { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuArrowLeft, LuPackageCheck, LuTruck, LuCircleCheck, LuCircleX, LuWarehouse, LuMapPin, LuBuilding2, LuPackage, LuClipboardCheck, LuStore } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { cx, formatDate, num } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, SegmentTabs, Skeleton } from "../ui";
import { Page } from "../layout/AppShell";
import { useHighlight } from "../lib/useHighlight";
import { RewardImage } from "../components/ShopBits";

const B = "/l2dashboard";

const STAGE = {
  placed: { label: "Order placed", icon: LuClipboardCheck },
  confirmed: { label: "Confirmed", icon: LuCircleCheck },
  packed: { label: "Packed", icon: LuPackage },
  shipped: { label: "Shipped", icon: LuTruck },
  out_for_delivery: { label: "Out for delivery", icon: LuTruck },
  delivered: { label: "Delivered", icon: LuPackageCheck },
  ready_for_pickup: { label: "Ready for pickup", icon: LuStore },
  collected: { label: "Collected", icon: LuPackageCheck },
  cancelled: { label: "Cancelled", icon: LuCircleX },
};
const DONE = new Set(["delivered", "collected"]);

export default function Orders() {
  const { state } = useLocation();
  const [params] = useSearchParams();
  const highlightId = state?.highlight || params.get("highlight");
  const { data, error, isLoading, refetch } = useQuery(keys.orders(), api.orders, { staleMs: 30_000 });
  const [tab, setTab] = useState(params.get("highlight") ? "all" : "active");
  const orders = data || [];
  const active = orders.filter((o) => !DONE.has(o.status) && o.status !== "cancelled");
  const list = tab === "active" ? active : tab === "done" ? orders.filter((o) => DONE.has(o.status)) : orders;

  return (
    <Page>
      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to={`${B}/rewards`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ts-muted hover:text-ts-ink"><LuArrowLeft aria-hidden /> Back to Rewards</Link>
          <h1 className="mt-1 text-[22px] font-extrabold tracking-tight text-ts-ink">Track My Reward Orders</h1>
          <p className="text-sm text-ts-muted">Follow every redemption from our fulfilment hub to your door or campus desk.</p>
        </div>
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
      </Card>

      <div className="mt-5 space-y-5">
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-[380px] rounded-xl" />)
        ) : !list.length ? (
          <EmptyState icon={LuPackage} title={orders.length ? "Nothing here" : "No orders yet"} description={orders.length ? "Switch tabs to see other orders." : "Redeem a reward and you can track it here."} action={!orders.length && <Button size="sm" to={`${B}/rewards`}>Browse rewards</Button>} />
        ) : (
          list.map((o) => <OrderCard key={o.id} order={o} highlight={highlightId === o.id} />)
        )}
      </div>
    </Page>
  );
}

function OrderCard({ order: o, highlight }) {
  const cardRef = useHighlight(highlight);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const cancelled = o.status === "cancelled";
  const stageIndex = o.stages.indexOf(o.status);
  const cancellable = !o.legacy && ["placed", "confirmed"].includes(o.status);
  const at = Object.fromEntries((o.timeline || []).map((t) => [t.status, t.at]));

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
    <Card ref={cardRef} className={cx("overflow-hidden", highlight && "ring-2 ring-ts-yellow")}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ts-border bg-ts-subtle/60 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ts-muted">
          <span className="font-mono text-[13px] font-bold text-ts-ink">{o.orderNumber}</span>
          <span>Placed {formatDate(o.createdAt, { day: "numeric", month: "short", year: "numeric" })}</span>
          <span>{num(o.total)} pts{o.discount ? ` (saved ${num(o.discount)})` : ""}</span>
        </div>
        <Badge tone={cancelled ? "neutral" : DONE.has(o.status) ? "green" : "blue"} caps icon={STAGE[o.status]?.icon}>{STAGE[o.status]?.label || o.status}</Badge>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <ul className="space-y-2.5">
            {o.items.map((l, i) => (
              <li key={i} className="flex items-center gap-3">
                <Link to={`${B}/rewards/${l.rewardId}`} className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ts-subtle"><RewardImage src={l.imageUrl} /></Link>
                <div className="min-w-0 flex-1">
                  <Link to={`${B}/rewards/${l.rewardId}`} className="line-clamp-1 text-[13.5px] font-bold text-ts-ink hover:text-ts-navy">{l.name}</Link>
                  <p className="text-[11px] text-ts-muted">{l.option ? `${l.option} · ` : ""}Qty {l.qty} · {num(l.points * l.qty)} pts</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Delivery / Timeline */}
          {!cancelled ? (
            <ol className="mt-6 flex items-start">
              {o.stages.map((s, i) => {
                const reached = i <= stageIndex;
                const Icon = STAGE[s].icon;
                return (
                  <li key={s} className="relative flex flex-1 flex-col items-center text-center">
                    {i > 0 && <span className={cx("absolute right-1/2 top-4 h-0.5 w-full", i <= stageIndex ? "bg-ts-navy" : "bg-slate-200")} aria-hidden />}
                    <span className={cx("relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm", reached ? "border-ts-navy bg-ts-navy text-ts-yellow" : "border-slate-200 bg-white text-ts-faint", i === stageIndex && !DONE.has(s) && "ring-4 ring-ts-navy/15")}>
                      <Icon aria-hidden />
                    </span>
                    <span className={cx("mt-1.5 text-[10.5px] font-semibold leading-tight", reached ? "text-ts-ink" : "text-ts-faint")}>{STAGE[s].label}</span>
                    {at[s] && <span className="text-[9.5px] text-ts-faint">{formatDate(at[s], { day: "numeric", month: "short" })}</span>}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-ts-muted">This order was cancelled{at.cancelled ? ` on ${formatDate(at.cancelled, { day: "numeric", month: "short" })}` : ""} and its points were refunded.</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {o.estimatedDelivery && !cancelled && !DONE.has(o.status) && (
              <p className="mr-auto text-xs text-ts-muted">Estimated {o.fulfilment === "pickup" ? "ready" : "delivery"}: <span className="font-bold text-ts-ink">{formatDate(o.estimatedDelivery, { weekday: "short", day: "numeric", month: "short" })}</span></p>
            )}
            {cancellable && <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>Cancel order</Button>}
            <Button variant="secondary" size="sm" to={`${B}/rewards/${o.items[0]?.rewardId}`}>Back to Product</Button>
          </div>
          {o.trackingNote && <p className="mt-2 text-xs text-ts-muted">Note from fulfilment: {o.trackingNote}</p>}
        </div>

        <RouteMap order={o} stageIndex={cancelled ? -1 : stageIndex} />
      </div>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={cancel} loading={busy} title="Cancel this order?" description={`${num(o.total)} points will be refunded to your balance right away.`} confirmLabel="Cancel order" />
    </Card>
  );
}

/** Delivery / Route Map: hub → destination with the parcel's position by stage. */
function RouteMap({ order, stageIndex }) {
  const pickup = order.fulfilment === "pickup";
  const progress = stageIndex < 0 ? 0 : stageIndex / Math.max(1, order.stages.length - 1);
  // Quadratic path from hub (40,150) to destination (300,50).
  const t = progress;
  const x = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 120 + t * t * 300;
  const y = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * 20 + t * t * 50;
  return (
    <div className="relative overflow-hidden rounded-xl border border-ts-border bg-[#EEF3FB]">
      <svg viewBox="0 0 340 190" className="h-full min-h-[190px] w-full" role="img" aria-label="Delivery route">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#DCE5F3" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="340" height="190" fill="url(#grid)" />
        <path d="M0 120 C 80 100, 140 160, 340 130" stroke="#C9D7EE" strokeWidth="10" fill="none" />
        <path d="M60 0 C 90 60, 70 120, 110 190" stroke="#D5E0F1" strokeWidth="7" fill="none" />
        <path d="M40 150 Q 120 20 300 50" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 5" fill="none" />
        <path d="M40 150 Q 120 20 300 50" stroke="#243367" strokeWidth="3" fill="none" pathLength="1" strokeDasharray={`${progress} 1`} />
        <circle cx="40" cy="150" r="7" fill="#243367" />
        <circle cx="300" cy="50" r="7" fill={progress >= 1 ? "#10B981" : "#FEE047"} stroke="#243367" strokeWidth="2" />
        {stageIndex >= 0 && progress < 1 && (
          <g transform={`translate(${x - 11} ${y - 11})`}>
            <rect width="22" height="22" rx="6" fill="#0B3A6F" />
            <path d="M6 8h7v6H6zM13 10h2.5l1.5 2v2h-4z" fill="#FEE047" />
          </g>
        )}
      </svg>
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-[10.5px] font-semibold text-ts-ink shadow-sm">
        <LuWarehouse aria-hidden className="text-ts-navy" /> Truesight fulfilment hub
      </div>
      <div className="absolute right-2 top-2 flex max-w-[60%] items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-[10.5px] font-semibold text-ts-ink shadow-sm">
        {pickup ? <LuBuilding2 aria-hidden className="shrink-0 text-ts-navy" /> : <LuMapPin aria-hidden className="shrink-0 text-ts-navy" />}
        <span className="truncate">{pickup ? "Campus pickup desk" : order.address || "Your address"}</span>
      </div>
    </div>
  );
}
