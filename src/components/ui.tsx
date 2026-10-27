import type { ReactNode } from "react";
import { AlertTriangle, BadgeCheck, CircleDashed, CircleHelp, ExternalLink as ExtIcon, PackageX, Sparkles, Tag } from "lucide-react";
import type { Offer, Verification } from "../data/model";
import { availabilityLabel, isLimitedStock, isOutOfStock, priceType } from "../data/model";

export const Panel = ({ children, className = "", hover = false }: { children: ReactNode; className?: string; hover?: boolean }) => (
  <div className={`panel ${hover ? "panel-hover" : ""} ${className}`}>{children}</div>
);

export const SectionHeader = ({ eyebrow, title, subtitle, right }: { eyebrow: string; title: string; subtitle?: ReactNode; right?: ReactNode }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-400">{eyebrow}</div>
      <h2 className="text-2xl font-semibold tracking-tight text-mist-100 md:text-[28px]">{title}</h2>
      {subtitle && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist-400">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const PanelTitle = ({ icon, title, hint, right }: { icon?: ReactNode; title: string; hint?: ReactNode; right?: ReactNode }) => (
  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div className="flex items-start gap-2.5">
      {icon && <span className="mt-0.5 text-accent-400">{icon}</span>}
      <div>
        <h3 className="text-[15px] font-semibold text-mist-100">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-mist-400">{hint}</p>}
      </div>
    </div>
    {right}
  </div>
);

export const Pill = ({ children, tone = "neutral", title }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "info" | "accent" | "rec" | "venture"; title?: string }) => {
  const tones: Record<string, string> = {
    neutral: "bg-white/5 text-mist-300 ring-white/10",
    good: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
    warn: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
    bad: "bg-rose-400/10 text-rose-300 ring-rose-400/25",
    info: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
    accent: "bg-accent-500/12 text-accent-400 ring-accent-500/30",
    rec: "bg-teal-400/10 text-teal-300 ring-teal-400/30",
    venture: "bg-yellow-400/12 text-yellow-300 ring-yellow-400/35",
  };
  return (
    <span title={title} className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tones[tone]}`}>{children}</span>
  );
};

export const VerificationBadge = ({ status }: { status: Verification }) => {
  const map: Record<Verification, { tone: "good" | "warn" | "info" | "bad"; icon: ReactNode }> = {
    Verified: { tone: "good", icon: <BadgeCheck size={12} /> },
    "Partially Verified": { tone: "warn", icon: <CircleDashed size={12} /> },
    Estimated: { tone: "info", icon: <CircleHelp size={12} /> },
    Unavailable: { tone: "bad", icon: <AlertTriangle size={12} /> },
  };
  return <Pill tone={map[status].tone}>{map[status].icon}{status}</Pill>;
};

export const PriceTypeBadge = ({ offer }: { offer: Offer }) => {
  const t = priceType(offer);
  if (t === "Promotional") return <Pill tone="info" title="Sale / promotional price on the research date"><Sparkles size={12} />Promotional</Pill>;
  if (t === "Regular") return <Pill tone="neutral" title="Regular price established by the research"><Tag size={12} />Regular</Pill>;
  return <Pill tone="neutral" title="Listed price; regular-price status was not established">Listed</Pill>;
};

export const AvailabilityBadge = ({ offer }: { offer: Offer }) => {
  const label = availabilityLabel(offer);
  if (isOutOfStock(offer)) return <Pill tone="bad"><PackageX size={12} />{label}</Pill>;
  if (isLimitedStock(offer)) return <Pill tone="warn">{label}</Pill>;
  if (offer.availability == null) return <Pill tone="neutral">{label}</Pill>;
  return <Pill tone="good">{label}</Pill>;
};

export const BasisTag = ({ basis }: { basis: "Documented" | "Inference" }) =>
  basis === "Documented"
    ? <Pill tone="good" title="Stated in the Mission 1 research">Documented</Pill>
    : <Pill tone="accent" title="Strategic interpretation — not a verified fact">Strategic inference</Pill>;

/** External links always open in a new tab without giving the target page access to this window. */
export const ExternalLink = ({ href, children, className = "" }: { href: string; children?: ReactNode; className?: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-accent-400 underline-offset-2 hover:text-accent-500 hover:underline ${className}`}>
    {children ?? new URL(href).hostname.replace(/^www\./, "")}
    <ExtIcon size={12} aria-hidden />
    <span className="sr-only">(opens in a new tab)</span>
  </a>
);

export const Kpi = ({ label, value, sub, icon, scope }: { label: string; value: ReactNode; sub?: ReactNode; icon: ReactNode; scope: string }) => (
  <Panel hover className="fade-in relative overflow-hidden p-4">
    <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-500/10 blur-2xl" />
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-mist-400">{label}</span>
      <span className="text-mist-400">{icon}</span>
    </div>
    <div className="mt-2 text-[26px] font-semibold tracking-tight text-mist-100 tabular-nums">{value}</div>
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-mist-400">
      <span className="rounded bg-white/5 px-1.5 py-0.5 font-medium text-mist-300">{scope}</span>
      {sub}
    </div>
  </Panel>
);

export const EmptyState = ({ title, body, action }: { title: string; body: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-white/5 p-3 text-mist-400"><CircleDashed size={22} /></div>
    <div className="text-sm font-semibold text-mist-200">{title}</div>
    <p className="mt-1 max-w-sm text-sm text-mist-400">{body}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Segmented = <T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) => (
  <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-ink-950/60 p-1 ring-1 ring-white/5">
    {options.map((o) => (
      <button key={o.value} role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${value === o.value ? "bg-ink-600 text-mist-100 shadow" : "text-mist-400 hover:text-mist-200"}`}>
        {o.label}
      </button>
    ))}
  </div>
);
