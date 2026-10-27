import { useState } from "react";
import { AlertCircle, ArrowRight, Check, CircleDashed, FlaskConical, Gift, Minus, Package, Ruler, ShieldCheck, SplitSquareHorizontal, Target, TrendingUp, X } from "lucide-react";
import { COMPETITOR_VIEWS, REC, VENTURE, usd } from "../data/model";
import { FEATURE_MATRIX, OPPORTUNITIES, STRENGTHS_WEAKNESSES } from "../data/insights";
import type { Cell } from "../data/insights";
import { BasisTag, Panel, PanelTitle, Pill, SectionHeader } from "../components/ui";

const ICONS = { shield: ShieldCheck, ruler: Ruler, gap: SplitSquareHorizontal, gift: Gift, package: Package };

export const Opportunities = ({ onNavigate }: { onNavigate: (id: "explorer") => void }) => {
  const [comp, setComp] = useState(COMPETITOR_VIEWS[0].competitor_id);
  const sw = STRENGTHS_WEAKNESSES[comp];
  const cv = COMPETITOR_VIEWS.find((c) => c.competitor_id === comp)!;

  return (
    <div>
      <SectionHeader eyebrow="05 · Competitive Opportunities" title="From research findings to strategic options"
        subtitle={<>Facts are tagged <BasisTag basis="Documented" /> and interpretations are tagged <BasisTag basis="Inference" />. Venture features are concepts that have not yet been tested.</>} />

      {/* A. opportunities */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {OPPORTUNITIES.map((o) => {
          const Icon = ICONS[o.icon];
          return (
            <Panel key={o.title} hover className="flex flex-col p-5">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-500/25 to-teal-400/15 text-accent-400 ring-1 ring-white/10"><Icon size={18} /></div>
              <h3 className="text-[15px] font-semibold text-mist-100">{o.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-mist-400">{o.body}</p>
              <div className="mt-3 flex flex-wrap gap-1.5"><BasisTag basis={o.basis} /><Pill>{o.source}</Pill></div>
            </Panel>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        {/* B. strengths & weaknesses */}
        <Panel className="p-5 xl:col-span-2">
          <PanelTitle icon={<TrendingUp size={16} />} title="Competitor strengths & limitations" hint="Select a competitor" />
          <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Competitor">
            {COMPETITOR_VIEWS.map((c) => (
              <button key={c.competitor_id} role="tab" aria-selected={comp === c.competitor_id} onClick={() => setComp(c.competitor_id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 transition ${comp === c.competitor_id ? "bg-white/10 text-mist-100 ring-white/20" : "text-mist-400 ring-white/5 hover:text-mist-200"}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name}
              </button>
            ))}
          </div>
          <div className="mb-3 text-xs text-mist-400">{cv.classification} · {cv.positioning} · representative {usd(cv.rep.current_price)}</div>
          <div className="space-y-4" role="tabpanel">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300/90">Strengths</div>
              <div className="space-y-2">{sw.strengths.map((s) => <Item key={s.title} {...s} good />)}</div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-300/90">Limitations</div>
              <div className="space-y-2">{sw.limitations.map((s) => <Item key={s.title} {...s} />)}</div>
            </div>
          </div>
        </Panel>

        {/* C. venture differentiation */}
        <Panel className="p-5 xl:col-span-3">
          <PanelTitle icon={<Target size={16} />} title="Venture differentiation vs. alternatives" hint={`${VENTURE.venture_name} features are planned concepts — ${VENTURE.status_notes}`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className="text-xs text-mist-400">
                  <th className="pb-3 pr-3 font-medium">Feature</th>
                  <th className="pb-3 pr-3 font-medium text-yellow-300">Jewelry / Journey</th>
                  {COMPETITOR_VIEWS.map((c) => <th key={c.competitor_id} className="pb-3 pr-3 font-medium"><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {FEATURE_MATRIX.map((row) => (
                  <tr key={row.feature} className="group">
                    <td className="py-2.5 pr-3 text-mist-200">
                      {row.feature}
                      <div className="hidden text-[11px] text-mist-400 group-hover:block">{row.note}</div>
                    </td>
                    <td className="py-2.5 pr-3"><CellMark v={row.venture} /></td>
                    {COMPETITOR_VIEWS.map((c) => <td key={c.competitor_id} className="py-2.5 pr-3"><CellMark v={row.byCompetitor[c.competitor_id]} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-mist-400">
            <span className="flex items-center gap-1"><CellMark v="yes" />Documented in research</span>
            <span className="flex items-center gap-1"><CellMark v="no" />Research says absent</span>
            <span className="flex items-center gap-1"><CellMark v="planned" />Planned (untested concept)</span>
            <span className="flex items-center gap-1"><CellMark v="unknown" />Not documented</span>
            <span>· Hover a row for its source note</span>
          </div>
          <div className="mt-4 rounded-xl bg-ink-950/40 p-3 text-[13px] text-mist-300 ring-1 ring-white/5">
            <span className="font-medium text-mist-100">Value proposition (concept): </span>{VENTURE.value_proposition}
          </div>
        </Panel>
      </div>

      {/* D. preliminary recommendation */}
      <Panel className="relative mt-4 overflow-hidden p-6">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-80">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200 ring-1 ring-amber-300/30">
              <AlertCircle size={13} />Preliminary — Subject to Cost and Demand Analysis
            </div>
            <div className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-teal-300">Mission 1 tentative range</div>
            <div className="mt-1 text-5xl font-semibold tracking-tight text-mist-100 tabular-nums">{usd(REC.tentative_range_min, 0)}–{usd(REC.tentative_range_max, 0)}</div>
            <div className="mt-1 text-sm text-mist-400">{REC.currency} · one-time purchase · {REC.status}</div>
            <p className="mt-3 text-[13px] text-mist-300">{REC.position}.</p>
            <button onClick={() => onNavigate("explorer")} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-400/90 px-3.5 py-2 text-sm font-medium text-ink-950 hover:bg-teal-300">Test prices in the explorer <ArrowRight size={15} /></button>
          </div>
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <Block title="Most relevant benchmarks" items={REC.most_relevant_benchmarks} />
            <Block title="Competitive rationale" items={REC.rationale} />
            <Block title="Differentiation needed to justify it" items={[REC.value_proposition_to_justify]} />
            <Block title="Key uncertainties" items={REC.uncertainties} tone="warn" />
            <div className="md:col-span-2 flex items-start gap-2 rounded-xl bg-accent-500/[0.06] p-3 text-[13px] text-mist-300 ring-1 ring-accent-500/20">
              <FlaskConical size={16} className="mt-0.5 shrink-0 text-accent-400" />
              <span>{(() => { const t = REC.optional_test.replace(/^STRATEGIC INTERPRETATION:\s*/i, ""); return t.charAt(0).toUpperCase() + t.slice(1); })()} <BasisTag basis="Inference" /></span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};

const Item = ({ title, body, basis, source, good }: { title: string; body: string; basis: "Documented" | "Inference"; source: string; good?: boolean }) => (
  <div className="rounded-xl bg-ink-950/40 p-3 ring-1 ring-white/5">
    <div className="flex items-start justify-between gap-2">
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-mist-100">{good ? <Check size={14} className="text-emerald-300" /> : <Minus size={14} className="text-rose-300" />}{title}</span>
      <BasisTag basis={basis} />
    </div>
    <p className="mt-1 text-[12.5px] leading-relaxed text-mist-400">{body}</p>
    <div className="mt-1 text-[10px] text-mist-400/80">Source: {source}</div>
  </div>
);

const CellMark = ({ v }: { v: Cell }) => {
  if (v === "yes") return <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-emerald-400/15 text-emerald-300" title="Documented in research"><Check size={14} /></span>;
  if (v === "no") return <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-rose-400/12 text-rose-300" title="Research says absent"><X size={14} /></span>;
  if (v === "planned") return <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-yellow-400/15 text-yellow-300" title="Planned — untested concept"><CircleDashed size={14} /></span>;
  return <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-white/5 text-mist-400" title="Not documented in the research">–</span>;
};

const Block = ({ title, items, tone }: { title: string; items: string[]; tone?: "warn" }) => (
  <div className="rounded-xl bg-ink-950/40 p-4 ring-1 ring-white/5">
    <div className={`mb-2 text-xs font-semibold uppercase tracking-wider ${tone === "warn" ? "text-amber-200/90" : "text-mist-300"}`}>{title}</div>
    <ul className="space-y-1.5 text-[13px] leading-relaxed text-mist-400">{items.map((i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-mist-400" />{i}</li>)}</ul>
  </div>
);
