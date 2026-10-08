import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LuArrowLeft, LuCheck, LuTicketPercent, LuTruck, LuBuilding2, LuX, LuMail, LuPhone } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { cx, num } from "../lib/format";
import { Button, Card, EmptyState, Field, Input, RadioCard, Skeleton, Textarea } from "../ui";
import { Page, useShell } from "../layout/AppShell";
import { RewardImage, useCart } from "../components/ShopBits";

const B = "/l2dashboard";
const ADDRESS_KEY = "ts-last-address";

const readAddress = () => {
  try {
    return localStorage.getItem(ADDRESS_KEY) || "";
  } catch {
    return "";
  }
};

export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const buyNow = state?.buyNow || null;
  const { profile } = useShell();
  const cart = useCart();
  const me = useQuery(keys.me(), api.me, { staleMs: 300_000 });

  const lines = buyNow
    ? buyNow.map((l) => ({ key: `${l.rewardId}|${l.option || ""}`, rewardId: l.rewardId, qty: l.qty, option: l.option, reward: l.reward }))
    : cart.items;
  const subtotal = lines.reduce((s, l) => s + l.reward.pointsRequired * l.qty, 0);

  const [fulfilment, setFulfilment] = useState("delivery");
  const [address, setAddress] = useState(readAddress);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState(null); // { coupon, discount }
  const [couponOpen, setCouponOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (me.data?.phone && !phone) setPhone(me.data.phone);
    // only prefill once the profile arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.data]);

  // A coupon's discount depends on the subtotal; drop it if the cart changes.
  useEffect(() => setCoupon(null), [subtotal]);

  const discount = coupon?.discount || 0;
  const total = subtotal - discount;
  const points = profile?.points ?? 0;
  const short = Math.max(0, total - points);
  const valid = lines.length && (fulfilment === "pickup" || address.trim().length >= 10) && /^[+\d\s()-]{6,20}$/.test(phone.trim()) && !short;

  const applyCoupon = async () => {
    if (!code.trim()) return;
    setChecking(true);
    try {
      const result = await api.validateCoupon(code.trim(), subtotal);
      setCoupon(result);
      toast.success(`${result.coupon.code} applied - ${num(result.discount)} pts off.`);
    } catch (e) {
      setCoupon(null);
      toast.error(e.message);
    } finally {
      setChecking(false);
    }
  };

  const place = async () => {
    setPlacing(true);
    try {
      const payload = {
        fulfilment,
        address: fulfilment === "delivery" ? address.trim() : "",
        phone: phone.trim(),
        couponCode: coupon?.coupon.code || undefined,
        ...(buyNow ? { items: lines.map(({ rewardId, qty, option }) => ({ rewardId, qty, option })) } : { fromCart: true }),
      };
      const { order, remainingPoints } = await api.placeOrder(payload);
      try {
        if (fulfilment === "delivery") localStorage.setItem(ADDRESS_KEY, address.trim());
      } catch {
        // ignore
      }
      setQueryData(keys.orders(), (d) => (d ? [order, ...d] : d));
      if (!buyNow) setQueryData(keys.cart(), { items: [], subtotal: 0, count: 0 });
      setQueryData(keys.bootstrap(), (d) => d && { ...d, profile: { ...d.profile, points: remainingPoints }, badges: { ...d.badges, cart: buyNow ? d.badges.cart : 0 } });
      invalidate(keys.orders(), keys.cart(), keys.bootstrap(), keys.dashboard(), keys.rewards(), keys.results());
      toast.success(`Order ${order.orderNumber} confirmed!`);
      navigate(`${B}/rewards/orders`, { replace: true, state: { highlight: order.id } });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (!buyNow && cart.isLoading) return <Page><Skeleton className="h-[480px] rounded-2xl" /></Page>;
  if (!lines.length) return <Page><EmptyState title="Nothing to redeem" description="Your cart is empty." action={<Button size="sm" to={`${B}/rewards`}>Browse rewards</Button>} /></Page>;

  return (
    <Page>
      <Link to={buyNow ? `${B}/rewards/${lines[0].rewardId}` : `${B}/rewards/cart`} className="inline-flex items-center gap-1.5 rounded-full border border-ts-border bg-white px-3 py-1.5 text-xs font-semibold text-ts-ink shadow-card hover:border-ts-field">
        <LuArrowLeft aria-hidden /> {buyNow ? "Back to Product" : "Back to Cart"}
      </Link>
      <h1 className="mt-4 text-[24px] font-extrabold tracking-tight text-ts-ink">Confirm your redemption</h1>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-ts-ink">1. How should we get it to you?</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <RadioCard name="fulfilment" value="delivery" checked={fulfilment === "delivery"} onChange={setFulfilment} icon={LuTruck} title="Home delivery" description="Shipped to your address · ~7 days" />
              <RadioCard name="fulfilment" value="pickup" checked={fulfilment === "pickup"} onChange={setFulfilment} icon={LuBuilding2} title="Campus pickup" description={`Collect at ${profile?.instituteName || "your institute"} · ~3 days`} />
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-[15px] font-bold text-ts-ink">2. Contact details</h2>
            {fulfilment === "delivery" && (
              <Field label="Delivery address" required hint="House / flat, street, city, PIN code">
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="e.g. 12 MG Road, Indiranagar, Bengaluru 560038" />
              </Field>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone number" required>
                <div className="relative">
                  <LuPhone aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ts-faint" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="pl-9" inputMode="tel" />
                </div>
              </Field>
              <Field label="Email" hint="Order updates are sent here">
                <div className="relative">
                  <LuMail aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ts-faint" />
                  <Input value={profile?.email || ""} disabled className="pl-9" />
                </div>
              </Field>
            </div>
          </Card>
        </div>

        {/* Card / Order Summary (Figma 11) */}
        <Card className="h-fit p-5 lg:sticky lg:top-6">
          <ul className="space-y-3 border-b border-ts-border pb-4">
            {lines.map((l) => (
              <li key={l.key} className="flex items-center gap-3">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-ts-border bg-ts-subtle"><RewardImage src={l.reward.imageUrl} className="object-contain" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.08em] text-ts-blue">{l.reward.category}</span>
                  <span className="line-clamp-1 text-[13.5px] font-bold text-ts-ink">{l.reward.name}</span>
                  <span className="text-[11px] text-ts-muted">
                    {l.option ? `Option: ${l.option} · ` : ""}Qty {l.qty}
                    {l.reward.stock !== 0 && <span className="font-semibold text-emerald-600"> · In Stock</span>}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-b border-ts-border py-4 text-[13px]">
            <div className="flex justify-between"><dt className="text-ts-muted">Base Points Price</dt><dd className="font-semibold text-ts-ink">{num(subtotal)} PTS</dd></div>
            <div className="flex justify-between"><dt className="text-ts-muted">Cash Payment</dt><dd className="font-semibold text-emerald-600">FREE (₹0.00)</dd></div>
            <div className="flex justify-between"><dt className="text-ts-muted">{fulfilment === "pickup" ? "Campus pickup" : "Delivery"}</dt><dd className="font-semibold text-emerald-600">Free</dd></div>
            {discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Coupon {coupon?.coupon.code}</dt><dd className="font-semibold">−{num(discount)} PTS</dd></div>}
            <div className="pt-1">
              {coupon ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-700"><LuTicketPercent aria-hidden /> {coupon.coupon.code}{coupon.coupon.description ? ` · ${coupon.coupon.description}` : ""}</span>
                  <button type="button" onClick={() => setCoupon(null)} className="text-emerald-700 hover:text-emerald-900" aria-label="Remove coupon"><LuX aria-hidden /></button>
                </div>
              ) : couponOpen ? (
                <div className="flex gap-2">
                  <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="STUDENT CODE" className="h-9 font-mono uppercase" onKeyDown={(e) => e.key === "Enter" && applyCoupon()} autoFocus />
                  <Button variant="navy" size="sm" className="h-9" loading={checking} onClick={applyCoupon}>Apply</Button>
                </div>
              ) : (
                <button type="button" onClick={() => setCouponOpen(true)} className="text-[13px] font-semibold text-ts-blue hover:underline">+ Apply Student Coupon</button>
              )}
            </div>
          </dl>

          <div className="border-b border-ts-border py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-bold text-ts-ink">Total Deduction</span>
              <span className="text-[22px] font-extrabold text-ts-navy">{num(total)} PTS</span>
            </div>
            <div className="mt-0.5 flex justify-between text-[12px]">
              <span className="text-ts-muted">Post-Redemption Balance:</span>
              <span className={cx("font-semibold", short ? "text-red-600" : "text-emerald-600")}>{num(points - total)} PTS (from {num(points)} PTS)</span>
            </div>
          </div>

          <fieldset className="pt-4">
            <legend className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-ts-faint">Payment method</legend>
            <label className="mt-2 flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-ts-deep px-3 py-2.5 ring-1 ring-ts-deep/20">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-ts-ink">
                <input type="radio" name="payment" checked readOnly className="accent-[#0B3A6F]" /> 100% Mastery Points
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">Instant ({num(total)} PTS)</span>
            </label>
            <label className="mt-2 flex cursor-not-allowed items-center justify-between gap-2 rounded-lg border border-ts-border bg-ts-subtle px-3 py-2.5 opacity-70">
              <span className="flex items-center gap-2 text-[13px] text-ts-muted">
                <input type="radio" name="payment" disabled className="accent-[#0B3A6F]" /> Cash on Points (Hybrid)
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ts-faint">Coming soon</span>
            </label>
          </fieldset>

          {short > 0 && <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">You're {num(short)} points short. Earn more through quizzes, challenges and events.</p>}
          <Button block size="lg" className="mt-4" iconRight={LuCheck} disabled={!valid} loading={placing} onClick={place}>Authorize &amp; Confirm Acquisition</Button>
          <p className="mt-2 text-center text-[11px] text-ts-faint">Points are deducted now. You can cancel until the order is packed.</p>
        </Card>
      </div>
    </Page>
  );
}
