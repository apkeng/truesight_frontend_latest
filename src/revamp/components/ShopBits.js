import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LuHeart, LuShoppingBag, LuTruck, LuPackage } from "react-icons/lu";
import { api, keys } from "../lib/api";
import { getQueryData, invalidate, setQueryData, useQuery } from "../lib/query";
import { cx, num } from "../lib/format";

const B = "/l2dashboard";

/** Wishlist ids as a Set, plus an optimistic toggle. */
export function useWishlist() {
  const { data } = useQuery(keys.wishlist(), api.wishlist, { staleMs: 60_000 });
  const ids = new Set(data?.rewardIds || []);
  const toggle = async (reward) => {
    const on = !ids.has(reward.id);
    setQueryData(keys.wishlist(), (d) => {
      const base = d || { rewardIds: [], items: [] };
      return on
        ? { rewardIds: [...base.rewardIds, reward.id], items: [...base.items, reward] }
        : { rewardIds: base.rewardIds.filter((x) => x !== reward.id), items: base.items.filter((x) => x.id !== reward.id) };
    });
    setQueryData(keys.bootstrap(), (d) => d && { ...d, badges: { ...d.badges, wishlist: (d.badges.wishlist || 0) + (on ? 1 : -1) } });
    try {
      await (on ? api.wish(reward.id) : api.unwish(reward.id));
      invalidate(keys.dashboard());
    } catch (e) {
      toast.error(e.message);
      invalidate(keys.wishlist(), keys.bootstrap());
    }
  };
  return { ids, items: data?.items || [], toggle, loading: !data };
}

/** Server-backed cart with optimistic writes. */
export function useCart() {
  const query = useQuery(keys.cart(), api.cart, { staleMs: 60_000 });
  const syncBadge = (cart) => setQueryData(keys.bootstrap(), (d) => d && { ...d, badges: { ...d.badges, cart: cart.count } });

  const save = async (nextItems) => {
    const previous = getQueryData(keys.cart());
    try {
      const cart = await api.saveCart(nextItems.map(({ rewardId, qty, option }) => ({ rewardId, qty, option })));
      setQueryData(keys.cart(), cart);
      syncBadge(cart);
      return cart;
    } catch (e) {
      toast.error(e.message);
      if (previous) setQueryData(keys.cart(), previous);
      throw e;
    }
  };

  const add = async (reward, { qty = 1, option = null } = {}) => {
    try {
      const cart = await api.addToCart({ rewardId: reward.id, qty, option });
      setQueryData(keys.cart(), cart);
      syncBadge(cart);
      toast.success(<span>Added <b>{reward.name}</b> to your cart. <Link to={`${B}/rewards/cart`} className="font-bold underline">View cart</Link></span>);
      return cart;
    } catch (e) {
      toast.error(e.message);
      throw e;
    }
  };

  const items = query.data?.items || [];
  const setQty = (key, qty) => {
    const next = items.map((i) => (i.key === key ? { ...i, qty } : i));
    setQueryData(keys.cart(), (d) => d && { ...d, items: next, subtotal: next.reduce((s, i) => s + i.reward.pointsRequired * i.qty, 0), count: next.reduce((n, i) => n + i.qty, 0) });
    return save(next);
  };
  const remove = (key) => {
    const next = items.filter((i) => i.key !== key);
    setQueryData(keys.cart(), (d) => d && { ...d, items: next, subtotal: next.reduce((s, i) => s + i.reward.pointsRequired * i.qty, 0), count: next.reduce((n, i) => n + i.qty, 0) });
    return save(next);
  };

  return { ...query, items, subtotal: query.data?.subtotal || 0, count: query.data?.count || 0, add, setQty, remove };
}

export const HeartButton = ({ on, onClick, className }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    aria-pressed={on}
    aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
    className={cx("flex h-8 w-8 items-center justify-center rounded-full border bg-white/95 shadow-sm transition-colors", on ? "border-rose-200 text-rose-500" : "border-ts-border text-ts-muted hover:text-rose-500", className)}
  >
    <LuHeart aria-hidden className={cx(on && "fill-rose-500")} />
  </button>
);

export const RewardImage = ({ src, alt = "", className }) =>
  src ? (
    <img src={src} alt={alt} className={cx("h-full w-full object-cover", className)} loading="lazy" decoding="async" />
  ) : (
    <span className={cx("flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-3xl text-ts-faint", className)}>
      <LuPackage aria-hidden />
    </span>
  );

/** "Wishlist Cart" + "Track Orders" counter buttons (Button / Counter). */
export function ShopCounters({ badges = {}, orders = 0 }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link to={`${B}/rewards/cart`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-ts-border bg-white px-3.5 text-sm font-semibold text-ts-ink shadow-card hover:border-ts-field">
        <LuHeart aria-hidden className="fill-rose-500 text-rose-500" /> Wishlist Cart
        <span className="rounded-full bg-rose-100 px-1.5 text-[11px] font-bold text-rose-600">{num((badges.cart || 0) + (badges.wishlist || 0))}</span>
      </Link>
      <Link to={`${B}/rewards/orders`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#20346B] px-3.5 text-sm font-semibold text-white shadow-card hover:bg-ts-navy-hover">
        <LuTruck aria-hidden className="text-ts-yellow" /> Track Orders
        {orders > 0 && <span className="rounded-full bg-ts-yellow px-1.5 text-[11px] font-bold text-ts-ink">{orders}</span>}
      </Link>
    </div>
  );
}

export const CATEGORY_META = {
  all: { label: "All Vaults", icon: LuShoppingBag },
};
