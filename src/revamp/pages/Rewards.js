import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuShieldCheck, LuHeart, LuShirt, LuWand, LuFlame, LuShoppingBag, LuArrowRight, LuArrowDownWideNarrow, LuChevronDown, LuGift, LuStar } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { prefetch, useQuery } from "../lib/query";
import { cx, num } from "../lib/format";
import { Button, Card, EmptyState, ErrorState, SearchField, Skeleton } from "../ui";
import { Page, useShell } from "../layout/AppShell";
import { HeartButton, RewardImage, ShopHeaderActions, useWishlist } from "../components/ShopBits";

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
      {/* Rewards header (Figma 10) */}
      <header className="flex flex-col gap-4 rounded-2xl bg-ts-navy px-6 py-5 text-white shadow-lift md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">Rewards</h1>
          <p className="mt-0.5 text-[13px] text-white/80">Exchange the points you have earned for the rewards available to your institute.</p>
        </div>
        <ShopHeaderActions badges={badges} orders={activeOrders} points={points} />
      </header>

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
  const affordable = points >= r.pointsRequired;
  const out = r.stock === 0;
  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-lift" onMouseEnter={() => prefetch(keys.reward(r.id), () => api.reward(r.id))}>
      <Link to={to} className="relative block aspect-[4/3] overflow-hidden bg-ts-subtle">
        <RewardImage src={r.imageUrl} alt={r.name} className="object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-ts-navy px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow">
          <LuStar aria-hidden className="fill-ts-yellow text-ts-yellow" /> {num(r.pointsRequired)} PTS
        </span>
        <span className="absolute right-11 top-2.5 rounded-md border border-ts-border bg-white px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.06em] text-ts-ink">
          {CATEGORY[r.category]?.label || r.category}
        </span>
        <HeartButton on={wished} onClick={onWish} className="absolute right-2.5 top-2 h-7 w-7" />
        {out && <span className="absolute bottom-2.5 left-2.5 rounded bg-ts-ink/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Out of stock</span>}
        {!out && typeof r.stock === "number" && r.stock <= 3 && <span className="absolute bottom-2.5 left-2.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Only {r.stock} left</span>}
      </Link>
      <div className="flex flex-1 flex-col border-t border-ts-border p-4">
        {affordable && !out && <span className="mb-1.5 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">Available to Redeem</span>}
        <Link to={to} className="line-clamp-2 text-[14px] font-bold leading-snug text-ts-ink hover:text-ts-navy">{r.name}</Link>
        {r.summary && <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ts-muted">{r.summary}</p>}
        <div className="mt-auto pt-4">
          {affordable && !out ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(to)}>Details</Button>
              <Button size="sm" className="flex-[1.6]" iconRight={LuArrowRight} onClick={() => navigate(to)}>Redeem Now</Button>
            </div>
          ) : (
            <Button size="sm" block iconRight={LuArrowRight} disabled={out} onClick={() => navigate(to)}>View &amp; Redeem</Button>
          )}
          {!affordable && !out && <p className="mt-1.5 text-center text-[10.5px] text-ts-muted">{num(r.pointsRequired - points)} more points to unlock</p>}
        </div>
      </div>
    </Card>
  );
}
