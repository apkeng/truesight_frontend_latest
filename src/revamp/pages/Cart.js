import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuArrowRight, LuMinus, LuPlus, LuTrash2, LuHeart, LuShoppingCart } from "react-icons/lu";
import { cx, num } from "../lib/format";
import { Button, Card, EmptyState, Skeleton } from "../ui";
import { Page, useShell } from "../layout/AppShell";
import { HeartButton, RewardImage, useCart, useWishlist } from "../components/ShopBits";

const B = "/l2dashboard";

export default function Cart() {
  const navigate = useNavigate();
  const { profile } = useShell();
  const cart = useCart();
  const wish = useWishlist();
  const points = profile?.points || 0;
  const short = Math.max(0, cart.subtotal - points);
  const inCart = new Set(cart.items.map((i) => i.rewardId));

  return (
    <Page>
      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to={`${B}/rewards`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ts-muted hover:text-ts-ink"><LuArrowLeft aria-hidden /> Back to Rewards</Link>
          <h1 className="mt-1 text-[22px] font-extrabold tracking-tight text-ts-ink">Wished Rewards & Cart</h1>
          <p className="text-sm text-ts-muted">Save rewards you love, then redeem them together in one order.</p>
        </div>
        <Button variant="indigo" to={`${B}/rewards/orders`}>Track My Orders</Button>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-ts-ink"><LuShoppingCart aria-hidden className="text-ts-navy" /> Cart <span className="text-ts-muted">({cart.count})</span></h2>
            {cart.isLoading ? (
              <div className="mt-4 space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : !cart.items.length ? (
              <EmptyState className="mt-4" icon={LuShoppingCart} title="Your cart is empty" description="Add rewards from the catalog or your wishlist below." action={<Button size="sm" to={`${B}/rewards`}>Browse rewards</Button>} />
            ) : (
              <ul className="mt-4 divide-y divide-ts-border">
                {cart.items.map((item) => (
                  <li key={item.key} className="flex items-center gap-4 py-3">
                    <Link to={`${B}/rewards/${item.rewardId}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ts-subtle"><RewardImage src={item.reward.imageUrl} /></Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`${B}/rewards/${item.rewardId}`} className="line-clamp-1 text-[13.5px] font-bold text-ts-ink hover:text-ts-navy">{item.reward.name}</Link>
                      {item.option && <p className="text-[11px] font-semibold uppercase text-ts-muted">{item.option}</p>}
                      <p className="text-xs font-bold text-ts-navy">{num(item.reward.pointsRequired)} pts</p>
                    </div>
                    <div className="inline-flex items-center rounded-lg border border-ts-border">
                      <button type="button" onClick={() => cart.setQty(item.key, item.qty - 1)} disabled={item.qty <= 1} className="flex h-8 w-8 items-center justify-center text-ts-muted disabled:opacity-40" aria-label="Decrease quantity"><LuMinus aria-hidden /></button>
                      <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                      <button type="button" onClick={() => cart.setQty(item.key, item.qty + 1)} disabled={item.qty >= 5} className="flex h-8 w-8 items-center justify-center text-ts-muted disabled:opacity-40" aria-label="Increase quantity"><LuPlus aria-hidden /></button>
                    </div>
                    <p className="hidden w-20 text-right text-sm font-extrabold text-ts-ink sm:block">{num(item.lineTotal ?? item.reward.pointsRequired * item.qty)}</p>
                    <button type="button" onClick={() => cart.remove(item.key)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ts-faint hover:bg-red-50 hover:text-red-500" aria-label={`Remove ${item.reward.name}`}><LuTrash2 aria-hidden /></button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-ts-ink"><LuHeart aria-hidden className="fill-rose-500 text-rose-500" /> Wishlist <span className="text-ts-muted">({wish.items.length})</span></h2>
            {wish.loading ? (
              <Skeleton className="mt-4 h-40" />
            ) : !wish.items.length ? (
              <p className="mt-3 text-sm text-ts-muted">Tap the heart on any reward to save it here.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {wish.items.map((r) => (
                  <div key={r.id} className="flex gap-3 rounded-xl border border-ts-border p-2.5">
                    <Link to={`${B}/rewards/${r.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ts-subtle"><RewardImage src={r.imageUrl} /></Link>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[12.5px] font-bold leading-snug text-ts-ink">{r.name}</p>
                      <p className="text-[11px] font-bold text-ts-navy">{num(r.pointsRequired)} pts</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {r.hasOptions ? (
                          <Button size="xs" variant="secondary" onClick={() => navigate(`${B}/rewards/${r.id}`)}>Choose option</Button>
                        ) : (
                          <Button size="xs" variant="secondary" disabled={inCart.has(r.id)} onClick={() => cart.add(r)}>{inCart.has(r.id) ? "In cart" : "Add to cart"}</Button>
                        )}
                        <HeartButton on onClick={() => wish.toggle(r)} className="h-7 w-7" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="h-fit p-5 lg:sticky lg:top-6">
          <h2 className="text-[15px] font-bold text-ts-ink">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label={`Items (${cart.count})`} value={`${num(cart.subtotal)} pts`} />
            <Row label="Your balance" value={`${num(points)} pts`} />
            <div className="border-t border-ts-border pt-2">
              <Row label="Balance after" value={`${num(points - cart.subtotal)} pts`} strong tone={short ? "red" : "green"} />
            </div>
          </dl>
          {short > 0 && <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">You need {num(short)} more points. A student coupon at checkout may help.</p>}
          <Button block size="lg" className="mt-4" iconRight={LuArrowRight} disabled={!cart.items.length} onClick={() => navigate(`${B}/rewards/checkout`)}>Proceed to Redeem</Button>
        </Card>
      </div>
    </Page>
  );
}

const Row = ({ label, value, strong, tone }) => (
  <div className="flex items-center justify-between">
    <dt className="text-ts-muted">{label}</dt>
    <dd className={cx(strong ? "font-extrabold" : "font-semibold", tone === "red" ? "text-red-600" : tone === "green" ? "text-emerald-600" : "text-ts-ink")}>{value}</dd>
  </div>
);
