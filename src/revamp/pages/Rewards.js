import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuShieldCheck, LuHeart, LuShirt, LuWand, LuFlame, LuShoppingBag, LuArrowRight, LuArrowDownWideNarrow, LuChevronDown, LuLock, LuGift } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { prefetch, useQuery } from "../lib/query";
import { cx, num } from "../lib/format";
import { Button, Card, EmptyState, ErrorState, ProgressBar, SearchField, Skeleton } from "../ui";
import { Page, useShell } from "../layout/AppShell";
import { HeartButton, RewardImage, ShopCounters, useWishlist } from "../components/ShopBits";

const B = "/l2dashboard";
const PAGE = 24;
const CATEGORY = {
  wellness: { label: "Wellness", icon: LuHeart },
  apparel: { label: "Apparel", icon: LuShirt },
  fantasy: { label: "Fantasy", icon: LuWand },
  trend: { label: "Trending", icon: LuFlame },
};

export default function Rewards() {
  const { profile, badges } = useShell();
  const { data, error, isLoading, refetch } = useQuery(keys.rewards(), api.rewards, { staleMs: 300_000 });
  const orders = useQuery(keys.orders(), api.orders, { staleMs: 60_000 });
  const wish = useWishlist();
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("asc");
  const [affordable, setAffordable] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const points = profile?.points || 0;

  const list = useMemo(() => {
    const needle = q.toLowerCase();
    return (data?.rewards || [])
      .filter((r) => cat === "all" || (cat === "wishlist" ? wish.ids.has(r.id) : r.category === cat))
      .filter((r) => !needle || `${r.name} ${r.summary} ${r.brand || ""}`.toLowerCase().includes(needle))
      .filter((r) => !affordable || r.pointsRequired <= points)
      .sort((a, b) => (sort === "asc" ? a.pointsRequired - b.pointsRequired : b.pointsRequired - a.pointsRequired));
  }, [data, cat, q, sort, affordable, points, wish.ids]);

  const activeOrders = (orders.data || []).filter((o) => !["delivered", "collected", "cancelled"].includes(o.status)).length;
  const cats = Object.keys(data?.categories || {});

  return (
    <Page wide>
      <Card className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-ts-ink">Rewards</h1>
          <p className="mt-0.5 text-sm text-ts-muted">Redeem your points for gear, collectibles and wellness picks - delivered to you or your campus.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-ts-yellow/30 px-3.5 text-sm font-bold text-ts-ink">
            <LuGift aria-hidden className="text-ts-navy" /> {num(points)} pts available
          </span>
          <ShopCounters badges={badges} orders={activeOrders} />
        </div>
      </Card>

      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl border border-ts-border bg-white p-1 shadow-card no-scrollbar">
          <CatButton active={cat === "all"} onClick={() => setCat("all")} icon={LuShieldCheck} label="All Vaults" count={data?.rewards.length} />
          {cats.map((c) => (
            <CatButton key={c} active={cat === c} onClick={() => { setCat(c); setLimit(PAGE); }} icon={CATEGORY[c]?.icon || LuShoppingBag} label={CATEGORY[c]?.label || c.replace(/(^|-)\w/g, (m) => m.toUpperCase())} count={data.categories[c]} />
          ))}
          <CatButton active={cat === "wishlist"} onClick={() => setCat("wishlist")} icon={LuHeart} label="Wishlist" count={wish.ids.size} />
        </div>
        <SearchField value={q} onChange={(v) => { setQ(v); setLimit(PAGE); }} placeholder="Search rewards, brands…" className="min-w-[200px] flex-1" />
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-ts-border bg-white px-3 text-sm font-semibold text-ts-ink shadow-card">
          <input type="checkbox" checked={affordable} onChange={(e) => setAffordable(e.target.checked)} className="accent-[#0B3A6F]" /> Within my points
        </label>
        <label className="relative inline-flex h-10 items-center gap-2 rounded-lg border border-ts-border bg-white pl-3 pr-8 text-sm font-semibold text-ts-ink shadow-card">
          <LuArrowDownWideNarrow aria-hidden className="text-ts-muted" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-transparent outline-none" aria-label="Sort rewards">
            <option value="asc">Points: low to high</option>
            <option value="desc">Points: high to low</option>
          </select>
          <LuChevronDown aria-hidden className="pointer-events-none absolute right-2.5 text-ts-muted" />
        </label>
      </div>

      <div className="mt-5">
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[340px] rounded-xl" />)}</div>
        ) : !list.length ? (
          <EmptyState icon={LuGift} title={cat === "wishlist" ? "Your wishlist is empty" : "No rewards match"} description={cat === "wishlist" ? "Tap the heart on any reward to save it here." : "Try another category or clear the search."} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {list.slice(0, limit).map((r) => <RewardCard key={r.id} reward={r} points={points} wished={wish.ids.has(r.id)} onWish={() => wish.toggle(r)} />)}
            </div>
            {list.length > limit && (
              <div className="mt-6 text-center">
                <Button variant="secondary" onClick={() => setLimit(limit + PAGE)}>Show more ({list.length - limit} left)</Button>
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}

const CatButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button type="button" onClick={onClick} className={cx("inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold transition-colors", active ? "bg-ts-navy text-white" : "text-ts-muted hover:bg-ts-subtle hover:text-ts-ink")}>
    <Icon aria-hidden className={active ? "text-ts-yellow" : ""} /> {label}
    {count !== undefined && <span className={cx("rounded-full px-1.5 text-[10px] leading-[18px]", active ? "bg-white/20" : "bg-slate-100")}>{count}</span>}
  </button>
);

function RewardCard({ reward: r, points, wished, onWish }) {
  const navigate = useNavigate();
  const to = `${B}/rewards/${r.id}`;
  const pct = Math.min(100, Math.round((points / Math.max(1, r.pointsRequired)) * 100));
  const unlocked = points >= r.pointsRequired;
  const out = r.stock === 0;
  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-lift" onMouseEnter={() => prefetch(keys.reward(r.id), () => api.reward(r.id))}>
      <Link to={to} className="relative block aspect-[4/3] overflow-hidden bg-ts-subtle">
        <RewardImage src={r.imageUrl} alt={r.name} className="transition-transform duration-300 group-hover:scale-[1.03]" />
        <HeartButton on={wished} onClick={onWish} className="absolute right-2.5 top-2.5" />
        {out && <span className="absolute left-2.5 top-2.5 rounded bg-ts-ink/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Out of stock</span>}
        {typeof r.stock === "number" && r.stock > 0 && r.stock <= 3 && <span className="absolute left-2.5 top-2.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Only {r.stock} left</span>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ts-faint">{r.brand || CATEGORY[r.category]?.label || r.category}</p>
        <Link to={to} className="mt-0.5 line-clamp-2 text-[14px] font-bold leading-snug text-ts-ink hover:text-ts-navy">{r.name}</Link>
        <p className="mt-1.5 text-[17px] font-extrabold text-ts-navy">{num(r.pointsRequired)} <span className="text-[11px] font-bold text-ts-muted">PTS</span></p>
        <div className="mt-auto pt-3">
          <div className="mb-1 flex items-center justify-between text-[10.5px]">
            <span className={unlocked ? "font-semibold text-emerald-600" : "text-ts-muted"}>{unlocked ? "Unlocked" : `${num(r.pointsRequired - points)} pts to unlock`}</span>
            {!unlocked && <LuLock aria-hidden className="text-ts-faint" />}
          </div>
          <ProgressBar value={pct} tone={unlocked ? "green" : "navy"} className="h-1" />
          <Button size="sm" block className="mt-3" iconRight={LuArrowRight} disabled={out} onClick={() => navigate(to)}>View & Redeem</Button>
        </div>
      </div>
    </Card>
  );
}
