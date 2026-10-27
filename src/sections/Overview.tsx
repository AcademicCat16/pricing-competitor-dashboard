import { useState } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpToLine, Building2, Equal, Layers, ListChecks, Package, Sigma, Users } from "lucide-react";
import { ALL_STATS, COMPETITOR_VIEWS, OFFERS, REC, REP_STATS, comparableOffers, addOnOffers, usd, VENTURE } from "../data/model";
import type { Tier } from "../data/model";
import { MARKET_OBSERVATIONS } from "../data/insights";
import { BasisTag, Kpi, Panel, PanelTitle, Pill, SectionHeader, Segmented } from "../components/ui";

type Pop = "rep" | "all";
const TIERS: { tier: Tier; tone: string; band: string }[] = [
  { tier: "Budget", tone: "from-sky-400/20", band: "≈ $10–$23" },
  { tier: "Mid-market", tone: "from-pink-400/20", band: "≈ $30–$48" },
  { tier: "Premium", tone: "from-violet-400/25", band: "≈ $69–$99" },
];

export const Overview = ({ onNavigate }: { onNavigate: (id: "explorer" | "landscape" | "sources") => void }) => {
  const [pop, setPop] = useState<Pop>("rep");
  const S = pop === "rep" ? REP_STATS : ALL_STATS;
  const scope = pop === "rep" ? "Representative · n=5" : "All comparable offers · n=11";
  const direct = COMPETITOR_VIEWS.filter((c) => c.classification === "Direct").length;
  const models = Object.entries(
    OFFERS.reduce<Record<string, number>>((acc, o) => {
      const k = o.pricing_model.startsWith("One-time purchase") ? (o.pricing_model.includes("add-on") ? "One-time + optional add-on" : "One-time purchase") : o.pricing_model;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  );
  const axisMax = 110;

  return (
    <div>
      <SectionHeader
        eyebrow="01 · Executive Overview"
        title="Competitive pricing landscape at a glance"
        subtitle={<>Travel jewelry organizers for U.S. online shoppers. Five competitors and {OFFERS.length} pricing records were researched for <span className="text-mist-200">{VENTURE.venture_name}</span>. All prices are one-time USD purchases, so they compare directly.</>}
        right={<Segmented<Pop> label="Statistic population" value={pop} onChange={setPop} options={[{ value: "rep", label: "Representative (n=5)" }, { value: "all", label: "All offers (n=11)" }]} />}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Kpi label="Competitors" value={COMPETITOR_VIEWS.length} icon={<Users size={16} />} scope="Unique brands" sub={<span>{direct} direct · {COMPETITOR_VIEWS.length - direct} indirect</span>} />
        <Kpi label="Pricing records researched" value={OFFERS.length} icon={<ListChecks size={16} />} scope="All records" sub={<span>incl. {addOnOffers.length} add-on fee</span>} />
        <Kpi label="Comparable products" value={comparableOffers.length} icon={<Package size={16} />} scope="Excl. add-ons" sub={<span>jewelry organizers</span>} />
        <Kpi label="Direct / indirect" value={<>{direct}<span className="text-mist-400"> / </span>{COMPETITOR_VIEWS.length - direct}</>} icon={<Building2 size={16} />} scope="Classification" sub={<span>Monos is indirect</span>} />
        <Kpi label="Lowest comparable price" value={usd(S.min)} icon={<ArrowDownToLine size={16} />} scope={scope} />
        <Kpi label="Highest comparable price" value={usd(S.max)} icon={<ArrowUpToLine size={16} />} scope={scope} />
        <Kpi label="Median comparable price" value={usd(S.median)} icon={<Equal size={16} />} scope={scope} />
        <Kpi label="Average comparable price" value={usd(S.mean)} icon={<Sigma size={16} />} scope={scope} sub={pop === "rep" ? <span>pulled up by two premium cases</span> : <span>includes promotions</span>} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Panel className="p-5 xl:col-span-2">
          <PanelTitle icon={<Layers size={16} />} title="Market snapshot" hint="Tiers use each competitor's positioning label from the research; prices are representative products." />
          <div className="grid gap-3 md:grid-cols-3">
            {TIERS.map((t) => {
              const list = COMPETITOR_VIEWS.filter((c) => c.tier === t.tier);
              return (
                <div key={t.tier} className={`rounded-2xl bg-gradient-to-b ${t.tone} to-transparent p-4 ring-1 ring-white/5`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-mist-100">{t.tier}</span>
                    <span className="font-mono text-[11px] text-mist-400">{t.band}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {list.map((c) => (
                      <div key={c.competitor_id} className="flex items-center justify-between rounded-xl bg-ink-950/50 px-3 py-2">
                        <span className="flex items-center gap-2 text-sm text-mist-200"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name}</span>
                        <span className="font-mono text-sm text-mist-100">{usd(c.rep.current_price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] text-mist-400">{list.map((c) => c.positioning).join(" · ")}</div>
                </div>
              );
            })}
          </div>

          {/* relative positioning strip */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-mist-400">
              <span>Relative price positioning (representative products)</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-teal-400/40 ring-1 ring-teal-300/50" />Preliminary range {usd(REC.tentative_range_min, 0)}–{usd(REC.tentative_range_max, 0)}</span>
            </div>
            <div className="relative h-24 rounded-xl bg-ink-950/60 ring-1 ring-white/5">
              <div className="absolute inset-x-4 top-1/2 h-px bg-white/10" />
              <div className="absolute top-[38%] h-[24%] rounded bg-teal-400/25 ring-1 ring-teal-300/40"
                style={{ left: `calc(1rem + (100% - 2rem) * ${REC.tentative_range_min / axisMax})`, width: `calc((100% - 2rem) * ${(REC.tentative_range_max - REC.tentative_range_min) / axisMax})` }} />
              {COMPETITOR_VIEWS.map((c, i) => (
                <div key={c.competitor_id} className="absolute -translate-x-1/2 text-center" style={{ left: `calc(1rem + (100% - 2rem) * ${c.rep.current_price / axisMax})`, top: i % 2 ? "58%" : "4%" }}>
                  {i % 2 === 0 && <div className="whitespace-nowrap text-[11px] font-medium text-mist-200">{c.name} <span className="font-mono text-mist-400">{usd(c.rep.current_price, 0)}</span></div>}
                  <div className="mx-auto my-0.5 h-3 w-3 rounded-full ring-2 ring-ink-950" style={{ background: c.color }} />
                  {i % 2 === 1 && <div className="whitespace-nowrap text-[11px] font-medium text-mist-200">{c.name} <span className="font-mono text-mist-400">{usd(c.rep.current_price, 0)}</span></div>}
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between px-4 font-mono text-[10px] text-mist-400"><span>$0</span><span>$55</span><span>$110</span></div>
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelTitle title="What the research suggests" hint="Summary of the Mission 1 report" />
          <p className="text-sm leading-relaxed text-mist-300">
            The market splits into a <span className="text-sky-300">budget marketplace tier</span>, a thin <span className="text-pink-300">value/mid band</span>, and a <span className="text-violet-300">premium tier</span> driven by brand, materials, and personalization.
            Representative prices run from {usd(REP_STATS.min)} to {usd(REP_STATS.max)} (median {usd(REP_STATS.median)}). Few offers sit between roughly $23 and $48 at regular price.
            The report's <span className="text-teal-300">preliminary</span> range of {usd(REC.tentative_range_min, 0)}–{usd(REC.tentative_range_max, 0)} sits in that gap, subject to cost and demand analysis.
          </p>
          <div className="mt-5">
            <div className="mb-2 text-xs font-medium text-mist-400">Pricing models observed ({OFFERS.length} records)</div>
            <div className="space-y-2">
              {models.map(([m, n]) => (
                <div key={m}>
                  <div className="flex justify-between text-xs"><span className="text-mist-300">{m}</span><span className="font-mono text-mist-400">{n}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-accent-500 to-teal-400" style={{ width: `${(n / OFFERS.length) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-mist-400">No subscription, usage-based, or freemium models were observed.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => onNavigate("explorer")} className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-3.5 py-2 text-sm font-medium text-ink-950 transition hover:bg-accent-400">Explore a price <ArrowRight size={15} /></button>
            <button onClick={() => onNavigate("landscape")} className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3.5 py-2 text-sm font-medium text-mist-200 ring-1 ring-white/10 transition hover:bg-white/10">View competitors</button>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4 p-5">
        <PanelTitle title="Important competitive observations" hint="From the report's positioning analysis (§7)." right={<button onClick={() => onNavigate("sources")} className="text-xs text-accent-400 hover:underline">How these were sourced →</button>} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {MARKET_OBSERVATIONS.map((o) => (
            <div key={o.title} className="rounded-xl bg-ink-950/40 p-4 ring-1 ring-white/5">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-mist-100">{o.title}</span>
                <BasisTag basis={o.basis} />
              </div>
              <p className="text-[13px] leading-relaxed text-mist-400">{o.body}</p>
              <div className="mt-2"><Pill>{o.source}</Pill></div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
