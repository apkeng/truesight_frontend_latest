import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft, LuArrowRight, LuShoppingCart, LuMinus, LuPlus, LuTruck, LuShieldCheck, LuRotateCcw } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { getQueryData, useQuery } from "../lib/query";
import { cx, num } from "../lib/format";
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton } from "../ui";
import { Page, useShell } from "../layout/AppShell";
import { HeartButton, RewardImage, useCart, useWishlist } from "../components/ShopBits";

const B = "/l2dashboard";

export default function RewardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useShell();
  // Seed from the catalog list so the header renders instantly.
  const seed = getQueryData(keys.rewards())?.rewards.find((r) => r.id === id);
  const { data, error, isLoading, refetch } = useQuery(keys.reward(id), () => api.reward(id), { staleMs: 300_000 });
  const wish = useWishlist();
  const cart = useCart();
  const [img, setImg] = useState(0);
  const [option, setOption] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const reward = data?.reward;
  useEffect(() => {
    setImg(0);
    setOption("");
    setQty(1);
  }, [id]);

  if (error && !data) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;
  if (!reward && !seed && isLoading) return <Page><Skeleton className="h-[520px] rounded-2xl" /></Page>;
  if (!reward && !seed) return <Page><EmptyState title="Reward not found" action={<Button to={`${B}/rewards`} size="sm" variant="secondary">Back to Rewards</Button>} /></Page>;

  const r = reward || { ...seed, images: seed.imageUrl ? [seed.imageUrl] : [], options: [], description: seed.summary };
  const images = r.images.length ? r.images : [null];
  const points = profile?.points || 0;
  const total = r.pointsRequired * qty;
  const needsOption = r.options.length > 0 && !option;
  const out = r.stock === 0;
  const maxQty = Math.min(5, typeof r.stock === "number" ? r.stock : 5);
  const specs = r.specifications || [
    ["Category", r.category],
    ["Type", r.type === "voucher" ? "Digital voucher" : "Physical product"],
    ["Points", `${num(r.pointsRequired)} pts`],
    ["Availability", typeof r.stock === "number" ? (r.stock ? `${r.stock} in stock` : "Out of stock") : "In stock"],
    ...(r.options.length ? [[r.optionLabel || "Options", r.options.join(", ")]] : []),
  ].map(([label, value]) => ({ label, value }));

  const addToCart = async () => {
    setAdding(true);
    try {
      await cart.add(r, { qty, option: option || null });
    } catch {
      // toast shown by useCart
    } finally {
      setAdding(false);
    }
  };

  const redeemNow = () => navigate(`${B}/rewards/checkout`, { state: { buyNow: [{ rewardId: r.id, qty, option: option || null, reward: r }] } });

  return (
    <Page>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`${B}/rewards`} className="inline-flex h-9 items-center gap-2 rounded-lg bg-ts-yellow px-4 text-sm font-bold text-ts-ink shadow-card hover:bg-ts-yellow-hover">
          <LuArrowLeft aria-hidden /> Back to Rewards Catalog
        </Link>
        <Link to={`${B}/rewards/cart`} className="inline-flex items-center gap-2 text-sm font-semibold text-ts-muted hover:text-ts-ink">
          <LuShoppingCart aria-hidden /> Cart ({cart.count})
        </Link>
      </div>

      <Card className="mt-4 grid gap-6 p-5 md:grid-cols-2 md:p-6">
        {/* Product / Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-ts-subtle">
            <RewardImage src={images[img]} alt={r.name} className="object-contain" />
            <HeartButton on={wish.ids.has(r.id)} onClick={() => wish.toggle(r)} className="absolute right-3 top-3 h-9 w-9" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(0, 5).map((src, i) => (
                <button key={src || i} type="button" onClick={() => setImg(i)} className={cx("aspect-square overflow-hidden rounded-lg border-2 bg-ts-subtle", i === img ? "border-ts-blue" : "border-transparent opacity-80 hover:opacity-100")} aria-label={`View image ${i + 1}`}>
                  <RewardImage src={src} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ts-blue">{r.brand || r.category}</p>
          <h1 className="mt-1 text-[22px] font-extrabold leading-tight text-ts-ink">{r.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[26px] font-extrabold text-ts-navy">{num(r.pointsRequired)}<span className="ml-1 text-sm text-ts-muted">PTS</span></span>
            {points >= r.pointsRequired ? <Badge tone="green">You can redeem this</Badge> : <Badge tone="amber">{num(r.pointsRequired - points)} more pts needed</Badge>}
            {typeof r.stock === "number" && r.stock > 0 && r.stock <= 3 && <Badge tone="red">Only {r.stock} left</Badge>}
          </div>

          {r.options.length > 0 && (
            <div className="mt-5">
              <p className="text-[13px] font-semibold text-ts-ink">{r.optionLabel || "Choose an option"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.options.map((o) => (
                  <button key={o} type="button" onClick={() => setOption(o)} className={cx("h-9 rounded-lg border px-3.5 text-xs font-bold uppercase tracking-wide transition-colors", option === o ? "border-ts-deep bg-ts-deep text-white" : "border-ts-border bg-white text-ts-ink hover:border-ts-field")}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <p className="text-[13px] font-semibold text-ts-ink">Quantity</p>
            <div className="inline-flex items-center rounded-lg border border-ts-border">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} className="flex h-9 w-9 items-center justify-center text-ts-muted hover:text-ts-ink disabled:opacity-40" aria-label="Decrease quantity"><LuMinus aria-hidden /></button>
              <span className="w-8 text-center text-sm font-bold">{qty}</span>
              <button type="button" onClick={() => setQty(Math.min(maxQty, qty + 1))} disabled={qty >= maxQty} className="flex h-9 w-9 items-center justify-center text-ts-muted hover:text-ts-ink disabled:opacity-40" aria-label="Increase quantity"><LuPlus aria-hidden /></button>
            </div>
            {qty > 1 && <span className="text-xs text-ts-muted">= {num(total)} pts</span>}
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" size="lg" icon={LuShoppingCart} disabled={needsOption || out} loading={adding} onClick={addToCart}>Add to cart</Button>
            <Button size="lg" iconRight={LuArrowRight} disabled={needsOption || out} onClick={redeemNow}>Redeem Now</Button>
          </div>
          {needsOption && <p className="mt-2 text-xs text-ts-muted">Choose an option to continue.</p>}

          <ul className="mt-6 grid gap-2 text-[12px] text-ts-body sm:grid-cols-3">
            <li className="flex items-center gap-2"><LuTruck aria-hidden className="text-ts-navy" /> Ships in ~7 days</li>
            <li className="flex items-center gap-2"><LuShieldCheck aria-hidden className="text-ts-navy" /> Verified student order</li>
            <li className="flex items-center gap-2"><LuRotateCcw aria-hidden className="text-ts-navy" /> Cancel before packing</li>
          </ul>

          {r.description && (
            <div className="mt-6 border-t border-ts-border pt-5">
              <h2 className="text-[14px] font-bold text-ts-ink">About this reward</h2>
              <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-ts-body">{r.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Product / Specifications */}
      <Card className="mt-5 overflow-hidden">
        <h2 className="border-b border-ts-border px-5 py-3 text-[14px] font-bold text-ts-ink">Specifications</h2>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
          {specs.map((s) => (
            <div key={s.label} className="border-b border-ts-border px-5 py-3 sm:border-r">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-ts-faint">{s.label}</dt>
              <dd className="mt-0.5 text-[13px] font-semibold capitalize text-ts-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {data?.related?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-[15px] font-bold text-ts-ink">More like this</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.related.map((x) => (
              <Link key={x.id} to={`${B}/rewards/${x.id}`} className="overflow-hidden rounded-xl border border-ts-border bg-white shadow-card hover:shadow-lift">
                <div className="aspect-[4/3] bg-ts-subtle"><RewardImage src={x.imageUrl} /></div>
                <div className="p-3">
                  <p className="line-clamp-1 text-[13px] font-bold text-ts-ink">{x.name}</p>
                  <p className="text-xs font-bold text-ts-navy">{num(x.pointsRequired)} pts</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
