import { useState } from "react";
import { AlertTriangle, BookOpen, CalendarClock, CheckCircle2, Database, FileSpreadsheet, ListChecks, XCircle } from "lucide-react";
import { ALL_QUARTILES, ALL_STATS, DATA, INTEGRITY, OFFERS, REP_STATS, RESEARCH_DATE, VENTURE, competitorById, colorOf, usd } from "../data/model";
import type { Verification } from "../data/model";
import { AvailabilityBadge, ExternalLink, Panel, PanelTitle, Pill, PriceTypeBadge, SectionHeader, VerificationBadge } from "../components/ui";

const STATUSES: Verification[] = ["Verified", "Partially Verified", "Estimated", "Unavailable"];

export const Sources = () => {
  const [filter, setFilter] = useState<Verification | "all">("all");
  const counts = Object.fromEntries(STATUSES.map((s) => [s, OFFERS.filter((o) => o.verification_status === s).length])) as Record<Verification, number>;
  const rows = OFFERS.filter((o) => filter === "all" || o.verification_status === filter);
  const allOk = INTEGRITY.every((c) => c.ok);

  return (
    <div>
      <SectionHeader eyebrow="06 · Research Sources & Methodology" title="Sources, verification, and transparency"
        subtitle="How every number in this dashboard was collected and calculated, and what the research cannot tell you." />

      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-4">
        <CalendarClock size={20} className="mt-0.5 shrink-0 text-amber-300" />
        <div className="text-sm text-amber-50/90">
          <span className="font-semibold">Snapshot, not live data.</span> All prices were observed once, on <span className="font-mono">{RESEARCH_DATE}</span>, and may have changed since. Amazon and BAGSMART prices in particular fluctuate. Shipping, taxes, and coupon codes are excluded.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(filter === s ? "all" : s)} aria-pressed={filter === s}
            className={`panel panel-hover p-4 text-left ${filter === s ? "ring-1 ring-accent-500/50" : ""}`}>
            <div className="flex items-center justify-between"><VerificationBadge status={s} /><span className="text-2xl font-semibold text-mist-100 tabular-nums">{counts[s]}</span></div>
            <p className="mt-2 text-xs leading-relaxed text-mist-400">{DATA.metadata.verification_categories[s]}</p>
          </button>
        ))}
      </div>

      <Panel className="mt-4 p-5">
        <PanelTitle icon={<BookOpen size={16} />} title="Source register" hint={`${rows.length} of ${OFFERS.length} pricing records${filter !== "all" ? ` · filtered to ${filter}` : ""}. Click a verification card above to filter.`}
          right={filter !== "all" ? <button onClick={() => setFilter("all")} className="text-xs text-accent-400 hover:underline">Show all</button> : undefined} />
        <div className="overflow-x-auto rounded-xl ring-1 ring-white/5">
          <table className="w-full min-w-[1000px] text-left text-[13px]">
            <thead className="bg-ink-950/60 text-xs text-mist-400">
              <tr>{["ID", "Competitor", "Product", "Price & unit", "Status", "Availability", "Source", "Checked"].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((o) => (
                <tr key={o.offer_id} className="align-top hover:bg-white/[0.02]">
                  <td className="px-3 py-3 font-mono text-[11px] text-mist-400">{o.offer_id}</td>
                  <td className="px-3 py-3"><span className="flex items-center gap-2 text-mist-200"><span className="h-2 w-2 rounded-full" style={{ background: colorOf(o.competitor_id) }} />{competitorById(o.competitor_id).name}</span></td>
                  <td className="max-w-[280px] px-3 py-3 text-mist-200">{o.product_name}<p className="mt-1 text-[11px] leading-relaxed text-mist-400">{o.notes}</p></td>
                  <td className="px-3 py-3"><div className="font-mono text-mist-100">{usd(o.current_price)}</div><div className="text-[11px] text-mist-400">{o.currency} · {o.pricing_unit}</div><div className="mt-1"><PriceTypeBadge offer={o} /></div></td>
                  <td className="px-3 py-3"><VerificationBadge status={o.verification_status} />{!o.include_in_case_comparison && <div className="mt-1"><Pill tone="warn">Add-on · excluded</Pill></div>}</td>
                  <td className="px-3 py-3"><AvailabilityBadge offer={o} /></td>
                  <td className="px-3 py-3 text-xs"><ExternalLink href={o.source_url} /><div className="mt-1 text-[11px] text-mist-400">{o.source_type}</div></td>
                  <td className="px-3 py-3 font-mono text-[11px] text-mist-400">{o.date_checked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel className="p-5">
          <PanelTitle icon={<FileSpreadsheet size={16} />} title="How the statistics are calculated" />
          <div className="space-y-3 text-[13px] leading-relaxed text-mist-300">
            <p><span className="font-semibold text-mist-100">Representative set (n={REP_STATS.count}).</span> One most-comparable product per competitor, chosen in Mission 1 ({DATA.price_statistics.representative.offer_ids.join(", ")}). Min {usd(REP_STATS.min)}, max {usd(REP_STATS.max)}, median {usd(REP_STATS.median)}, mean {usd(REP_STATS.mean)}. Each competitor counts once.</p>
            <p><span className="font-semibold text-mist-100">All comparable offers (n={ALL_STATS.count}).</span> Every researched jewelry-organizer product, including promotional, out-of-stock, and partially verified prices. Min {usd(ALL_STATS.min)}, max {usd(ALL_STATS.max)}, median {usd(ALL_STATS.median)}, mean {usd(ALL_STATS.mean)}. Quartiles: Q1 {usd(ALL_QUARTILES.q1)}, Q3 {usd(ALL_QUARTILES.q3)}.</p>
            <p><span className="font-semibold text-mist-100">Excluded.</span> P09, Mark & Graham's $17 monogram fee, is an add-on charge rather than a standalone product, so it is excluded from every product-price statistic and chart. It still appears in the tables for completeness.</p>
            <p><span className="font-semibold text-mist-100">Prices used.</span> The current listed price on the research date. Regular prices are shown only where the research established them. Compare-at / strikethrough prices (BAGSMART $33.00 and $37.00; Mark & Graham $49) are never treated as regular prices.</p>
            <p><span className="font-semibold text-mist-100">Normalization.</span> {DATA.price_statistics.normalization_note}</p>
            <p><span className="font-semibold text-mist-100">Tiers.</span> Budget / Mid-market / Premium follow each competitor's positioning label in the research.</p>
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelTitle icon={<ListChecks size={16} />} title="Data validation (runs when the page loads)"
            right={allOk ? <Pill tone="good"><CheckCircle2 size={12} />All checks passed</Pill> : <Pill tone="bad"><XCircle size={12} />Check failed</Pill>} />
          <ul className="space-y-2">
            {INTEGRITY.map((c) => (
              <li key={c.label} className="flex items-start gap-2.5 rounded-xl bg-ink-950/40 p-3 ring-1 ring-white/5" data-testid="integrity-check" data-ok={c.ok}>
                {c.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" /> : <XCircle size={16} className="mt-0.5 shrink-0 text-rose-300" />}
                <div><div className="text-[13px] text-mist-200">{c.label}</div><div className="mt-0.5 font-mono text-[11px] text-mist-400">{c.detail}</div></div>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-ink-950/40 p-3 text-[12.5px] leading-relaxed text-mist-400 ring-1 ring-white/5">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-mist-200"><Database size={14} />Cross-file consistency & resolution</div>
            The JSON (primary source), Excel workbook, and Word report agree on all competitors, prices, flags, and statistics. One presentational difference: the JSON stores unchecked availability as <span className="font-mono">null</span> for P09–P11, while the workbook writes “Not checked”. The dashboard shows “Not checked”. The JSON's representative mean is stored rounded ($56.80); the exact value is $56.796.
          </div>
        </Panel>
      </div>

      <Panel className="mt-4 p-5">
        <PanelTitle icon={<AlertTriangle size={16} />} title="Research limitations" hint="Reproduced from Mission 1" />
        <ul className="grid gap-2 md:grid-cols-2">
          {DATA.research_limitations.map((l) => (
            <li key={l} className="flex gap-2.5 rounded-xl bg-ink-950/40 p-3 text-[13px] leading-relaxed text-mist-300 ring-1 ring-white/5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/80" />{l}</li>
          ))}
        </ul>
        <div className="mt-4 text-xs text-mist-400">
          Venture sources: {VENTURE.sources.map((s, i) => <span key={s}>{i > 0 && " · "}{s.startsWith("http") ? <ExternalLink href={s} /> : s}</span>)}
        </div>
      </Panel>
    </div>
  );
};
