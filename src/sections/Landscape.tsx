import { useMemo, useState } from "react";
import { ChevronDown, Columns3, Globe, Search, Target, X } from "lucide-react";
import { COMPETITOR_VIEWS, usd } from "../data/model";
import type { CompetitorView, Tier } from "../data/model";
import { AvailabilityBadge, EmptyState, ExternalLink, Panel, PanelTitle, Pill, PriceTypeBadge, SectionHeader, Segmented, VerificationBadge } from "../components/ui";

type Cls = "all" | "Direct" | "Indirect";
type Sort = "price-asc" | "price-desc" | "name";
const TIER_LIST: Tier[] = ["Budget", "Mid-market", "Premium"];

export const Landscape = () => {
  const [cls, setCls] = useState<Cls>("all");
  const [tiers, setTiers] = useState<Set<Tier>>(new Set(TIER_LIST));
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("price-asc");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string[]>([]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = COMPETITOR_VIEWS.filter((c) =>
      (cls === "all" || c.classification === cls) &&
      tiers.has(c.tier) &&
      (!needle || [c.name, c.main_products, c.rep.product_name, ...c.offers.map((o) => o.product_name)].some((s) => s.toLowerCase().includes(needle))),
    );
    return out.sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "price-asc" ? a.rep.current_price - b.rep.current_price : b.rep.current_price - a.rep.current_price);
  }, [cls, tiers, q, sort]);

  const toggleTier = (t: Tier) => setTiers((s) => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n; });
  const toggleOpen = (id: string) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSel = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const reset = () => { setCls("all"); setTiers(new Set(TIER_LIST)); setQ(""); };
  const compared = COMPETITOR_VIEWS.filter((c) => selected.includes(c.competitor_id));

  return (
    <div>
      <SectionHeader eyebrow="02 · Competitor Landscape" title="Competitor intelligence profiles"
        subtitle="Five real competitors from the Mission 1 research. Representative products are the single most comparable item per brand. Tick “Compare” on two or more profiles to see them side by side." />

      <Panel className="mb-5 flex flex-col gap-3 p-4 xl:flex-row xl:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search competitors or products</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search competitors or products…"
            className="w-full rounded-xl bg-ink-950/60 py-2.5 pl-9 pr-9 text-sm text-mist-100 placeholder:text-mist-400 ring-1 ring-white/10 outline-none focus:ring-accent-500/60" />
          {q && <button onClick={() => setQ("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-mist-400 hover:text-mist-200"><X size={14} /></button>}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented<Cls> label="Competitor type" value={cls} onChange={setCls} options={[{ value: "all", label: "All" }, { value: "Direct", label: "Direct" }, { value: "Indirect", label: "Indirect" }]} />
          <div className="flex gap-1.5" role="group" aria-label="Market positioning">
            {TIER_LIST.map((t) => (
              <button key={t} onClick={() => toggleTier(t)} aria-pressed={tiers.has(t)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 transition ${tiers.has(t) ? "bg-accent-500/15 text-accent-400 ring-accent-500/30" : "text-mist-400 ring-white/10 hover:text-mist-200"}`}>{t}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-mist-400">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-lg bg-ink-950/60 px-2.5 py-1.5 text-xs text-mist-100 ring-1 ring-white/10 outline-none">
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>
      </Panel>

      <div className="mb-3 text-xs text-mist-400" aria-live="polite">Showing {list.length} of {COMPETITOR_VIEWS.length} competitors{selected.length > 0 && ` · ${selected.length} selected for comparison`}</div>

      {list.length === 0 ? (
        <EmptyState title="No competitors match these filters" body="Try clearing the search or re-enabling a positioning tier."
          action={<button onClick={reset} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-mist-200 ring-1 ring-white/10 hover:bg-white/10">Reset filters</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {list.map((c) => <Card key={c.competitor_id} c={c} open={open.has(c.competitor_id)} onToggle={() => toggleOpen(c.competitor_id)} selected={selected.includes(c.competitor_id)} onSelect={() => toggleSel(c.competitor_id)} />)}
        </div>
      )}

      {compared.length > 0 && (
        <Panel className="mt-6 overflow-hidden p-5">
          <PanelTitle icon={<Columns3 size={16} />} title={`Side-by-side comparison (${compared.length})`} hint={compared.length < 2 ? "Select at least one more competitor to compare." : "Representative products; ranges cover comparable offers only."}
            right={<button onClick={() => setSelected([])} className="text-xs text-mist-400 hover:text-mist-200">Clear selection</button>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <tbody className="divide-y divide-white/5">
                {([
                  ["Type", (c: CompetitorView) => c.classification],
                  ["Positioning", (c: CompetitorView) => c.positioning],
                  ["Representative product", (c: CompetitorView) => c.rep.product_name],
                  ["Representative price", (c: CompetitorView) => <span className="font-mono text-mist-100">{usd(c.rep.current_price)}</span>],
                  ["Comparable offers", (c: CompetitorView) => `${c.offers.length} (${usd(c.min)}–${usd(c.max)})`],
                  ["Target customers", (c: CompetitorView) => c.target_customers],
                  ["Differentiation", (c: CompetitorView) => c.differentiators],
                ] as const).map(([label, get]) => (
                  <tr key={label}>
                    <th className="w-44 py-2.5 pr-4 align-top text-xs font-medium text-mist-400">{label}</th>
                    {compared.map((c) => <td key={c.competitor_id} className="py-2.5 pr-4 align-top text-[13px] text-mist-300">{get(c)}</td>)}
                  </tr>
                ))}
              </tbody>
              <thead>
                <tr>
                  <th />
                  {compared.map((c) => <th key={c.competitor_id} className="pb-3 pr-4 text-sm font-semibold text-mist-100"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.name}</th>)}
                </tr>
              </thead>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
};

const Card = ({ c, open, onToggle, selected, onSelect }: { c: CompetitorView; open: boolean; onToggle: () => void; selected: boolean; onSelect: () => void }) => (
  <Panel hover className={`relative flex flex-col overflow-hidden p-5 ${selected ? "ring-1 ring-accent-500/50" : ""}`}>
    <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl text-base font-semibold text-ink-950" style={{ background: c.color }} aria-hidden>{c.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <h3 className="text-base font-semibold text-mist-100">{c.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Pill tone={c.classification === "Direct" ? "accent" : "warn"}>{c.classification}</Pill>
            <Pill>{c.positioning}</Pill>
          </div>
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-mist-400">
        <input type="checkbox" checked={selected} onChange={onSelect} className="h-4 w-4 accent-indigo-400" />
        Compare
      </label>
    </div>

    <div className="mt-4 rounded-xl bg-ink-950/50 p-3.5 ring-1 ring-white/5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-mist-400">Representative product</div>
      <div className="mt-1 text-[13px] text-mist-200">{c.rep.product_name}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-2xl font-semibold text-mist-100 tabular-nums">{usd(c.rep.current_price)}</span>
        <PriceTypeBadge offer={c.rep} />
        <AvailabilityBadge offer={c.rep} />
      </div>
      <div className="mt-1.5 text-[11px] text-mist-400">{c.offers.length} comparable offer{c.offers.length > 1 ? "s" : ""}{c.offers.length > 1 && ` · ${usd(c.min)}–${usd(c.max)}`}{c.addOns.length > 0 && ` · ${c.addOns.length} add-on fee (${usd(c.addOns[0].current_price)})`}</div>
    </div>

    <div className="mt-4 space-y-2.5 text-[13px]">
      <div className="flex gap-2"><Target size={14} className="mt-0.5 shrink-0 text-mist-400" /><span className="text-mist-300">{c.target_customers}</span></div>
      <div className="text-mist-400"><span className="text-mist-300">Differentiation: </span>{c.differentiators}</div>
      {c.rep.features.length > 0 && (
        <div className="flex flex-wrap gap-1.5">{c.rep.features.slice(0, 4).map((f) => <Pill key={f}>{f}</Pill>)}</div>
      )}
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
      <span className="flex items-center gap-1.5 text-xs"><Globe size={13} className="text-mist-400" /><ExternalLink href={c.website} /></span>
      <button onClick={onToggle} aria-expanded={open} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-mist-300 hover:bg-white/5">
        {open ? "Hide details" : "All offers & sources"}<ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
    </div>

    {open && (
      <div className="fade-in mt-3 space-y-3">
        <p className="text-xs leading-relaxed text-mist-400"><span className="text-mist-300">Why included: </span>{c.reason_for_inclusion}</p>
        {c.website_note && <p className="text-xs text-mist-400"><span className="text-mist-300">Website note: </span>{c.website_note}</p>}
        <div className="space-y-2">
          {[...c.offers, ...c.addOns].map((o) => (
            <div key={o.offer_id} className="rounded-xl bg-ink-950/40 p-3 ring-1 ring-white/5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] text-mist-200"><span className="mr-1.5 font-mono text-[11px] text-mist-400">{o.offer_id}</span>{o.product_name}</div>
                <span className="font-mono text-sm text-mist-100">{usd(o.current_price)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {!o.include_in_case_comparison && <Pill tone="warn">Add-on · excluded from product stats</Pill>}
                {o.is_representative && <Pill tone="accent">Representative</Pill>}
                <PriceTypeBadge offer={o} /><AvailabilityBadge offer={o} /><VerificationBadge status={o.verification_status} />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-mist-400">{o.notes}</p>
              <div className="mt-1.5 text-[11px]"><ExternalLink href={o.source_url}>{o.source_type}</ExternalLink></div>
            </div>
          ))}
        </div>
      </div>
    )}
  </Panel>
);
