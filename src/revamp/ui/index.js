import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { LuArrowLeft, LuSearch, LuX, LuLoaderCircle, LuLayoutGrid, LuList, LuInbox } from "react-icons/lu";
import { cx, initials } from "../lib/format";

/*
 * Primitives from the TrueSights component library (Figma: 01 Action
 * buttons, 03 Inputs, 05 Tabs & filters, 06 Badges). Kept dependency-free so
 * each lazy-loaded screen only pulls in what it renders.
 */

// ------------------------------------------------------------------ Button

const BUTTON_VARIANTS = {
  primary: "bg-ts-yellow text-ts-ink hover:bg-ts-yellow-hover shadow-[0_1px_0_rgba(15,23,42,0.08)]",
  navy: "bg-ts-deep text-white hover:bg-ts-night",
  indigo: "bg-ts-navy text-white hover:bg-ts-navy-hover",
  secondary: "bg-white text-ts-ink border border-ts-border hover:border-ts-field hover:bg-ts-subtle",
  outline: "bg-white text-ts-navy border border-ts-navy/70 hover:bg-ts-wash",
  soft: "bg-ts-wash text-ts-blue border border-blue-200 hover:bg-blue-100",
  danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  "danger-solid": "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-ts-body hover:bg-slate-100",
  link: "text-ts-blue hover:underline px-0 h-auto",
};

const BUTTON_SIZES = {
  xs: "h-7 px-2.5 text-[11px] gap-1.5",
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  xl: "h-12 px-6 text-[15px] gap-2",
};

export const Button = React.forwardRef(function Button(
  { variant = "primary", size = "md", pill = false, block = false, loading = false, icon: Icon, iconRight: IconRight, to, href, className, children, disabled, ...props },
  ref
) {
  const classes = cx(
    "inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-blue/40 disabled:cursor-not-allowed disabled:opacity-50",
    BUTTON_VARIANTS[variant],
    variant !== "link" && BUTTON_SIZES[size],
    pill ? "rounded-full" : "rounded-lg",
    block && "w-full",
    className
  );
  const content = (
    <>
      {loading ? <LuLoaderCircle className="animate-spin" aria-hidden /> : Icon ? <Icon aria-hidden className="shrink-0" /> : null}
      {children}
      {IconRight && !loading ? <IconRight aria-hidden className="shrink-0" /> : null}
    </>
  );
  if (to) return <Link ref={ref} to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a ref={ref} href={href} className={classes} {...props}>{content}</a>;
  return (
    <button ref={ref} type="button" className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
});

export const IconButton = ({ icon: Icon, label, active = false, tone = "neutral", size = "md", className, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cx(
      "inline-flex shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-blue/40 disabled:opacity-50",
      size === "sm" ? "h-7 w-7 text-sm" : size === "lg" ? "h-11 w-11 text-lg" : "h-9 w-9 text-base",
      tone === "danger"
        ? "border-red-200 bg-white text-red-500 hover:bg-red-50"
        : tone === "dark"
          ? "border-transparent bg-ts-navy text-white hover:bg-ts-navy-hover"
          : active
            ? "border-rose-200 bg-rose-50 text-rose-500"
            : "border-ts-border bg-white text-ts-muted hover:text-ts-ink hover:border-ts-field",
      className
    )}
    {...props}
  >
    <Icon aria-hidden />
  </button>
);

// ------------------------------------------------------------------- Badge

const BADGE_TONES = {
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
  blue: "bg-ts-wash text-blue-700 border-blue-100",
  navy: "bg-ts-navy text-white border-ts-navy",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-600 border-red-200",
  yellow: "bg-ts-yellow text-ts-ink border-ts-yellow",
};

export const Badge = ({ tone = "neutral", icon: Icon, caps = false, dot = false, className, children }) => (
  <span
    className={cx(
      "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 font-semibold leading-none",
      caps ? "text-[10px] uppercase tracking-[0.06em]" : "text-[11px]",
      BADGE_TONES[tone],
      className
    )}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
    {Icon && <Icon aria-hidden className="text-[11px]" />}
    {children}
  </span>
);

export const CountPill = ({ children, active = false, tone }) => (
  <span
    className={cx(
      "inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-[18px]",
      tone === "red" ? "bg-red-500 text-white" : tone === "yellow" ? "bg-ts-yellow text-ts-ink" : active ? "bg-white/20 text-white" : "bg-slate-200/80 text-ts-muted"
    )}
  >
    {children}
  </span>
);

// -------------------------------------------------------------------- Card

export const Card = ({ as: Tag = "div", className, children, ...props }) => (
  <Tag className={cx("rounded-xl border border-ts-border bg-white shadow-card", className)} {...props}>
    {children}
  </Tag>
);

export const CardTitle = ({ icon: Icon, children, action, className }) => (
  <div className={cx("flex items-center justify-between gap-3", className)}>
    <h2 className="flex min-w-0 items-center gap-2 text-[17px] font-bold text-ts-ink">
      {Icon && <Icon aria-hidden className="shrink-0 text-ts-navy" />}
      <span className="truncate">{children}</span>
    </h2>
    {action}
  </div>
);

export const ViewAll = ({ to, children = "View all", onMouseEnter }) => (
  <Link to={to} onMouseEnter={onMouseEnter} className="shrink-0 text-[13px] font-semibold text-ts-blue hover:underline">
    {children} →
  </Link>
);

// -------------------------------------------------------------- PageHeader

export const PageHeader = ({ title, description, back = { to: "/l2dashboard/dashboard", label: "Back to Dashboard" }, action, aside, tone = "indigo", children }) => (
  <header
    className={cx(
      "relative overflow-hidden rounded-2xl px-6 py-6 text-white shadow-lift sm:px-8 sm:py-7",
      tone === "deep" ? "bg-gradient-to-br from-[#0A386B] via-[#09305C] to-[#062346]" : "bg-gradient-to-br from-[#2A3B78] via-[#243367] to-[#1B2757]"
    )}
  >
    <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
    <div aria-hidden className="pointer-events-none absolute right-40 top-10 h-40 w-40 rounded-full bg-sky-300/10 blur-2xl" />
    <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 max-w-3xl">
        {back && (
          <Link to={back.to} className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white">
            <LuArrowLeft aria-hidden /> {back.label}
          </Link>
        )}
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[30px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">{description}</p>}
        {children}
      </div>
      {(action || aside) && <div className="flex shrink-0 items-center gap-3">{aside}{action}</div>}
    </div>
  </header>
);

export const BackLink = ({ to, children, onClick }) =>
  to ? (
    <Link to={to} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ts-border bg-white px-3 text-xs font-semibold text-ts-ink shadow-card hover:border-ts-field">
      <LuArrowLeft aria-hidden /> {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ts-border bg-white px-3 text-xs font-semibold text-ts-ink shadow-card hover:border-ts-field">
      <LuArrowLeft aria-hidden /> {children}
    </button>
  );

// -------------------------------------------------------------------- Tabs

/**
 * Segmented state tabs (Tab / Archive Filter, Tab / Events, Tab / Challenge).
 * `items`: [{ value, label, count, icon, countTone }]
 */
export const SegmentTabs = ({ items, value, onChange, caps = true, className, size = "md" }) => (
  <div role="tablist" className={cx("inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-ts-border bg-white p-1 shadow-card no-scrollbar", className)}>
    {items.map((item) => {
      const active = item.value === value;
      const Icon = item.icon;
      return (
        <button
          key={item.value}
          role="tab"
          type="button"
          aria-selected={active}
          onClick={() => onChange(item.value)}
          className={cx(
            "inline-flex shrink-0 items-center gap-2 rounded-lg font-semibold transition-colors",
            size === "sm" ? "h-8 px-3 text-[11px]" : "h-9 px-4 text-xs",
            caps && "uppercase tracking-[0.06em]",
            active ? "bg-ts-deep text-white shadow-sm" : "text-ts-muted hover:bg-ts-subtle hover:text-ts-ink"
          )}
        >
          {Icon && <Icon aria-hidden className="text-sm" />}
          {item.label}
          {item.count !== undefined && item.count !== null && (
            <CountPill active={active} tone={item.countTone}>{item.count}</CountPill>
          )}
        </button>
      );
    })}
  </div>
);

export const ViewToggle = ({ value, onChange }) => (
  <div className="inline-flex items-center gap-1 rounded-xl border border-ts-border bg-white p-1 shadow-card">
    {[
      { v: "grid", label: "Grid", Icon: LuLayoutGrid },
      { v: "list", label: "List", Icon: LuList },
    ].map(({ v, label, Icon }) => (
      <button
        key={v}
        type="button"
        aria-pressed={value === v}
        onClick={() => onChange(v)}
        className={cx(
          "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors",
          value === v ? "bg-ts-yellow text-ts-ink" : "text-ts-muted hover:text-ts-ink"
        )}
      >
        <Icon aria-hidden /> {label}
      </button>
    ))}
  </div>
);

// ------------------------------------------------------------------ Fields

export const SearchField = ({ value, onChange, placeholder = "Search…", className, autoFocus, onKeyDown }) => (
  <label className={cx("relative flex items-center", className)}>
    <LuSearch aria-hidden className="pointer-events-none absolute left-3 text-ts-faint" />
    <input
      type="search"
      value={value}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-lg border border-ts-border bg-white pl-9 pr-3 text-sm text-ts-ink outline-none transition-colors placeholder:text-ts-faint focus:border-ts-blue/60 focus:ring-2 focus:ring-ts-blue/15"
    />
  </label>
);

export const Field = ({ label, required, hint, error, children, className }) => {
  const id = useId();
  return (
    <div className={cx("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-semibold text-ts-ink">
          {label} {required && <span className="text-ts-muted">*</span>}
        </label>
      )}
      {React.isValidElement(children) ? React.cloneElement(children, { id, "aria-invalid": Boolean(error) || undefined }) : children}
      {error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="text-xs text-ts-muted">{hint}</p> : null}
    </div>
  );
};

const inputClass =
  "h-10 w-full rounded-lg border border-ts-field/80 bg-white px-3 text-sm text-ts-ink outline-none transition-colors placeholder:text-ts-faint focus:border-ts-blue/60 focus:ring-2 focus:ring-ts-blue/15 disabled:bg-ts-subtle disabled:text-ts-muted aria-[invalid=true]:border-red-400";

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cx(inputClass, className)} {...props} />;
});

export const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cx(inputClass, "h-auto min-h-[88px] py-2.5 leading-relaxed", className)} {...props} />;
});

export const Select = React.forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cx(inputClass, "appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props}>
      {children}
    </select>
  );
});

export const Checkbox = ({ checked, onChange, label, className }) => (
  <input
    type="checkbox"
    aria-label={label}
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className={cx("h-4 w-4 cursor-pointer rounded border-ts-field text-ts-deep accent-[#0B3A6F]", className)}
  />
);

export const RadioCard = ({ name, value, checked, onChange, title, description, icon: Icon, disabled }) => (
  <label
    className={cx(
      "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
      checked ? "border-ts-deep bg-ts-wash/60 ring-1 ring-ts-deep/30" : "border-ts-border bg-white hover:border-ts-field",
      disabled && "cursor-not-allowed opacity-50"
    )}
  >
    <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} className="mt-1 accent-[#0B3A6F]" />
    {Icon && <Icon aria-hidden className="mt-0.5 shrink-0 text-lg text-ts-navy" />}
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-ts-ink">{title}</span>
      {description && <span className="mt-0.5 block text-xs text-ts-muted">{description}</span>}
    </span>
  </label>
);

// ------------------------------------------------------------------ Dialog

export function Dialog({ open, onClose, title, eyebrow, description, children, footer, size = "md", tone = "light", initialFocusRef }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => e.key === "Escape" && onCloseRef.current?.();
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => (initialFocusRef?.current || panelRef.current)?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;
  // Portalled to <body>: page wrappers animate with transforms, which would
  // otherwise trap position:fixed and leave the sidebar uncovered.
  return createPortal(
    <div className="ts-app fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        className={cx(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-pop outline-none animate-ts-fade sm:rounded-2xl",
          size === "sm" ? "sm:max-w-sm" : size === "lg" ? "sm:max-w-2xl" : size === "xl" ? "sm:max-w-4xl" : "sm:max-w-lg"
        )}
      >
        {(title || eyebrow) && (
          <div className={cx("relative px-6 pb-4 pt-5", tone === "navy" ? "bg-ts-deep text-white" : "border-b border-ts-border")}>
            {eyebrow && (
              <span className={cx("mb-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]", tone === "navy" ? "bg-white/15 text-white" : "bg-ts-wash text-ts-blue")}>
                {eyebrow}
              </span>
            )}
            {title && <h2 className="pr-8 text-lg font-bold">{title}</h2>}
            {description && <p className={cx("mt-1 text-xs", tone === "navy" ? "text-white/75" : "text-ts-muted")}>{description}</p>}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cx("absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full", tone === "navy" ? "bg-white/10 text-white hover:bg-white/20" : "text-ts-muted hover:bg-slate-100")}
            >
              <LuX aria-hidden />
            </button>
          </div>
        )}
        <div className="ts-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-ts-border bg-ts-subtle/60 px-6 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/** Confirmation dialog - used instead of window.confirm (which blocks the page). */
export const ConfirmDialog = ({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", tone = "danger", loading }) => (
  <Dialog
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant={tone === "danger" ? "danger-solid" : "navy"} size="sm" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </>
    }
  >
    <p className="text-sm leading-relaxed text-ts-body">{description}</p>
  </Dialog>
);

// ------------------------------------------------------------ Feedback etc

export const Skeleton = ({ className }) => <div className={cx("ts-skeleton animate-ts-shimmer rounded-lg", className)} aria-hidden />;

export const EmptyState = ({ icon: Icon = LuInbox, title, description, action, className }) => (
  <div className={cx("flex flex-col items-center justify-center rounded-xl border border-dashed border-ts-field/70 bg-white/60 px-6 py-12 text-center", className)}>
    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-ts-wash text-xl text-ts-navy">
      <Icon aria-hidden />
    </span>
    <p className="text-sm font-bold text-ts-ink">{title}</p>
    {description && <p className="mt-1 max-w-md text-xs leading-relaxed text-ts-muted">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <EmptyState
    title="Couldn't load this"
    description={error?.message || "Something went wrong. Check your connection and try again."}
    action={onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Try again</Button>}
  />
);

export const ProgressBar = ({ value = 0, className, tone = "navy" }) => (
  <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-slate-200", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <div className={cx("h-full rounded-full transition-[width] duration-500", tone === "green" ? "bg-emerald-500" : "bg-ts-navy")} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

export const Avatar = ({ name, src, size = 36, className, ring }) => (
  <span
    className={cx("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-100 to-indigo-200 font-bold text-ts-navy", ring && "ring-2 ring-white", className)}
    style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
  >
    {src ? <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /> : initials(name)}
  </span>
);

export const Spinner = ({ className }) => <LuLoaderCircle className={cx("animate-spin text-ts-navy", className)} aria-label="Loading" />;

export const StatTile = ({ label, value, tone }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ts-faint">{label}</p>
    <p className={cx("mt-0.5 truncate text-sm font-bold", tone === "green" ? "text-emerald-600" : tone === "red" ? "text-red-600" : "text-ts-ink")}>{value}</p>
  </div>
);
