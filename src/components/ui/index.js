import React from "react";

/**
 * Shared building blocks for the student dashboards.
 *
 * The design is deliberately flat and institutional: cream page, white panels,
 * hairline borders, square corners, navy for anything interactive, and
 * uppercase letter-spaced labels above every block of content.
 */

export const cx = (...parts) => parts.filter(Boolean).join(" ");

/** Small uppercase label that introduces a section of the page. */
export const SectionLabel = ({ children, className }) => (
  <h2
    className={cx(
      "font-sharp text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted",
      className
    )}
  >
    {children}
  </h2>
);

/** White square tile used inside the navy banner (e.g. total points). */
export const BannerStat = ({ value, label }) => (
  <div className="min-w-[7rem] bg-white px-6 py-4 text-center">
    <div className="font-display text-2xl font-bold leading-none text-navy">{value}</div>
    <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
      {label}
    </div>
  </div>
);

/** Full-width navy banner that opens every page. */
export const PageBanner = ({ title, subtitle, stat, actions, children }) => (
  <div className="bg-navy px-6 py-8 text-white sm:px-10">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-display sm:text-[1.75rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">{subtitle}</p>
        )}
      </div>
      {stat && <BannerStat {...stat} />}
      {actions}
    </div>
    {children}
  </div>
);

/** Bordered stat tile for the "Your progress" style rows. */
export const StatCard = ({ label, value, hint, onClick }) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cx(
        "border border-line bg-white px-6 py-5 text-left",
        onClick && "transition-colors hover:border-navy/40 hover:bg-navy-wash/40"
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-[2rem] font-bold leading-none text-ink">{value}</p>
      {hint && <p className="mt-2 text-xs text-ink-muted">{hint}</p>}
    </Tag>
  );
};

/** White panel with an optional heading rail. */
export const Panel = ({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  divided = false,
}) => (
  <section className={cx("border border-line bg-white", className)}>
    {(title || action) && (
      <div
        className={cx(
          "flex flex-wrap items-start justify-between gap-4 px-6 pt-6",
          divided ? "border-b border-line-soft pb-5" : "pb-4"
        )}
      >
        <div className="min-w-0">
          {title && (
            <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
          )}
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-shrink-0 items-center gap-2">{action}</div>}
      </div>
    )}
    <div className={cx("px-6 pb-6", !title && !action && "pt-6", bodyClassName)}>
      {children}
    </div>
  </section>
);

const BUTTON_VARIANTS = {
  primary: "bg-navy text-white hover:bg-navy-dark disabled:bg-navy/40",
  secondary: "border border-navy bg-white text-navy hover:bg-navy-wash",
  quiet: "border border-line bg-white text-ink hover:border-navy/40 hover:text-navy",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  ghost: "text-navy hover:text-navy-dark",
};

const BUTTON_SIZES = {
  sm: "h-8 px-3 text-[10px]",
  md: "h-10 px-5 text-[11px]",
  lg: "h-12 px-7 text-xs",
};

/** Square, uppercase button. */
export const Button = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => (
  <button
    {...props}
    className={cx(
      "inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
      BUTTON_VARIANTS[variant],
      BUTTON_SIZES[size],
      className
    )}
  >
    {children}
  </button>
);

const BADGE_TONES = {
  navy: "border-navy/30 bg-navy-wash text-navy",
  neutral: "border-line bg-parchment text-ink-muted",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  negative: "border-red-200 bg-red-50 text-red-600",
};

/** Small square status chip. */
export const Badge = ({ tone = "neutral", children, className }) => (
  <span
    className={cx(
      "inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
      BADGE_TONES[tone],
      className
    )}
  >
    {children}
  </span>
);

/** Centred placeholder for empty lists. */
export const EmptyState = ({ title, description, action, className }) => (
  <div
    className={cx(
      "border border-dashed border-line bg-parchment px-6 py-14 text-center",
      className
    )}
  >
    <p className="font-display text-base font-bold text-ink">{title}</p>
    {description && (
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{description}</p>
    )}
    {action && <div className="mt-6 flex justify-center">{action}</div>}
  </div>
);

/** Square text input matching the panel borders. */
export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={cx(
      "h-10 w-full border border-line bg-white px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-navy",
      className
    )}
  />
));
Input.displayName = "Input";

/** Highlighted navy-wash row, e.g. the current syllabus strip. */
export const Highlight = ({ icon, label, title, description, action, className }) => (
  <div
    className={cx(
      "flex flex-wrap items-start justify-between gap-4 border border-navy/15 bg-navy-wash px-4 py-4",
      className
    )}
  >
    <div className="flex min-w-0 items-start gap-3">
      {icon !== undefined && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-navy text-sm text-white">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        {label && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy">
            {label}
          </p>
        )}
        {title && <h3 className="mt-0.5 text-sm font-bold text-ink">{title}</h3>}
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>
    </div>
    {action && <div className="flex flex-shrink-0 items-center gap-2">{action}</div>}
  </div>
);

/** Standard page wrapper: consistent max width and rhythm on every screen. */
export const PageShell = ({ children, className }) => (
  <div className={cx("mx-auto w-full max-w-[1400px] space-y-8 pb-16", className)}>{children}</div>
);
