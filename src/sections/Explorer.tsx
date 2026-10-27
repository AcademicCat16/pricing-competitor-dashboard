import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Equal, Info, Lightbulb, MoveHorizontal, RotateCcw, ShieldAlert, Sparkles, Target } from "lucide-react";
import {
  ALL_QUARTILES, ALL_STATS, COMPETITOR_VIEWS, REC, REP_STATS, SCENARIOS, SLIDER_MAX, SLIDER_MIN, START_PRICE, VENTURE_COLOR,
  classify, colorOf, competitorById, comparableOffers, priceType, usd,
} from "../data/model";
import { Panel, PanelTitle, Pill, SectionHeader, Segmented } from "../components/ui";

type Tol = "5" | "10" | "15";
const clampP = (v: number) => Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, v));
const pct = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(0)}%`;
const signed = (v: number) => `${v >= 0 ? "+" : "−"}${usd(Math.abs(v))}`;

export const Explorer = ({ price, setPrice }: { price: number; setPrice: (p: number) => void }) => {
  const [tol, setTol] = useState<Tol>("10");
  const [draft, setDraft] = useState<string | null>(null);
  const t = Number(tol) / 100;
  const p = price;
  const pos = classify(p);
  const inRec = p >= REC.tentative_range_min && p <= REC.tentative_range_max;
  const activeScenario = SCENARIOS.find((s) => Math.abs(s.price - p) < 0.005)?.id;

  const reps = useMemo(() => COMPETITOR_VIEWS.map((c) => {
    const cp = c.rep.current_price;
    const status = Math.abs(p - cp) / cp <= t ? "comparable" : cp < p ? "cheaper" : "pricier";
    return { c, cp, diff: p - cp, rel: (p - cp) / cp, status } as const;
  }).sort((a, b) => a.cp - b.cp), [p, t]);
  const cheaper = reps.filter((r) => r.status === "cheaper");
  const pricier = reps.filter((r) => r.status === "pricier");
  const comparable = reps.filter((r) => r.status === "comparable");

  const below = comparableOffers.filter((o) => o.current_price < p).length;
  const rangePos = Math.min(1, Math.max(0, (p - ALL_STATS.min) / (ALL_STATS.max - ALL_STATS.min)));
  const vsMedian = p - REP_STATS.median;
  const nearby = comparableOffers.filter((o) => Math.abs(o.current_price - p) <= 5).sort((a, b) => a.current_price - b.current_price);
  const sorted = [...comparableOffers].sort((a, b) => a.current_price - b.current_price);
  const nextBelow = [...sorted].reverse().find((o) => o.current_price < p);
  const nextAbove = sorted.find((o) => o.current_price > p);

  const names = (rs: typeof reps) => rs.map((r) => `${r.c.name} (${usd(r.cp)})`).join(", ");

  return (
    <div>
      <SectionHeader eyebrow="04 · Price Position Explorer" title="Where would your price sit in this market?"
        subtitle={<>Drag the slider or pick a scenario to compare a tentative price for {" "}<span className="text-mist-200">Jewelry / Journey</span> with the researched competitors. This is a <span className="text-mist-200">competitive positioning tool</span>, not a demand forecast.</>} />

      {/* ---------- control deck ---------- */}
      <Panel className="relative overflow-hidden p-5 md:p-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-yellow-300/90"><Target size={14} />Your exploratory price</div>
                <div className="mt-1 text-6xl font-semibold tracking-tight text-mist-100 tabular-nums md:text-7xl" aria-live="polite" data-testid="price-display">{usd(p)}</div>
              </div>
              <label className="mb-2 flex items-center gap-2 text-xs text-mist-400">
                Exact price
                <span className="flex items-center rounded-xl bg-ink-950/70 ring-1 ring-white/10 focus-within:ring-yellow-400/60">
                  <span className="pl-3 text-mist-400">$</span>
                  <input type="number" inputMode="decimal" min={SLIDER_MIN} max={SLIDER_MAX} step={0.01} data-testid="price-input"
                    value={draft ?? p.toFixed(2)}
                    onChange={(e) => { setDraft(e.target.value); const v = parseFloat(e.target.value); if (!Number.isNaN(v) && v >= SLIDER_MIN && v <= SLIDER_MAX) setPrice(Math.round(v * 100) / 100); }}
                    onBlur={() => { const v = parseFloat(draft ?? ""); if (draft != null) setPrice(Number.isNaN(v) ? p : clampP(Math.round(v * 100) / 100)); setDraft(null); }}
                    className="w-24 bg-transparent px-2 py-2 font-mono text-sm text-mist-100 outline-none" aria-label="Exact proposed price in US dollars" />
                </span>
              </label>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-mist-400">Position:</span>
                <span data-testid="position-label" className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${toneOf(pos.key)}`}>{pos.label}</span>
                {inRec ? <Pill tone="rec">Inside preliminary range</Pill> : <Pill>Outside preliminary range</Pill>}
              </div>
            </div>

            {/* slider with research overlays */}
            <div className="mt-6">
              <div className="relative h-11">
                <div className="pointer-events-none absolute inset-x-[13px] top-1/2 h-2 -translate-y-1/2 rounded-full bg-ink-600" />
                <div className="pointer-events-none absolute inset-x-[13px] top-1/2 h-2 -translate-y-1/2">
                  <div className="absolute h-full rounded-full bg-gradient-to-r from-yellow-500/30 to-yellow-300/80" style={{ width: `${((p - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%` }} />
                  <div className="absolute -top-1.5 h-5 rounded-md bg-teal-400/25 ring-1 ring-teal-300/60" title="Preliminary range (research)"
                    style={{ left: `${((REC.tentative_range_min - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%`, width: `${((REC.tentative_range_max - REC.tentative_range_min) / (SLIDER_MAX - SLIDER_MIN)) * 100}%` }} />
                  {COMPETITOR_VIEWS.map((c) => (
                    <div key={c.competitor_id} className="absolute -top-2 h-6 w-[3px] -translate-x-1/2 rounded-full" style={{ left: `${((c.rep.current_price - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%`, background: c.color }} title={`${c.name} ${usd(c.rep.current_price)}`} />
                  ))}
                </div>
                <input type="range" className="price-slider relative" min={SLIDER_MIN} max={SLIDER_MAX} step={0.5} value={p} data-testid="price-slider"
                  onChange={(e) => { setDraft(null); setPrice(Number(e.target.value)); }} aria-label="Proposed selling price" aria-valuetext={`${usd(p)}, ${pos.label}`} />
              </div>
              <div className="mt-1 flex justify-between px-[13px] font-mono text-[11px] text-mist-400"><span>{usd(SLIDER_MIN, 0)}</span><span>{usd((SLIDER_MIN + SLIDER_MAX) / 2, 0)}</span><span>{usd(SLIDER_MAX, 0)}</span></div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-mist-400">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full ring-2 ring-yellow-300" style={{ background: VENTURE_COLOR }} />Your exploratory price</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-sm bg-teal-400/30 ring-1 ring-teal-300/60" />Preliminary range {usd(REC.tentative_range_min, 0)}–{usd(REC.tentative_range_max, 0)} (Mission 1 research)</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-[3px] rounded bg-mist-300" />Competitor representative prices</span>
              </div>
            </div>
          </div>

          {/* presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-mist-400">Scenario presets</span>
              <button onClick={() => { setDraft(null); setPrice(START_PRICE); }} className="inline-flex items-center gap-1 text-xs text-mist-400 hover:text-mist-200"><RotateCcw size={12} />Start ({usd(START_PRICE)})</button>
            </div>
            {SCENARIOS.map((s) => (
              <button key={s.id} onClick={() => { setDraft(null); setPrice(s.price); }} aria-pressed={activeScenario === s.id} data-testid={`preset-${s.id}`}
                className={`w-full rounded-xl p-3 text-left ring-1 transition ${activeScenario === s.id ? "bg-yellow-400/10 ring-yellow-400/50" : "bg-ink-950/50 ring-white/10 hover:bg-white/[0.04] hover:ring-white/20"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-mist-100">{s.label}</span>
                  <span className="font-mono text-sm text-mist-100">{usd(s.price)}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-mist-400">{s.basis}</div>
              </button>
            ))}
            <p className="text-[11px] leading-relaxed text-mist-400">The start price is the midpoint of the preliminary range. Presets are computed from the researched prices, not chosen by hand.</p>
          </div>
        </div>
      </Panel>

      {/* ---------- ladder ---------- */}
      <Panel className="mt-4 p-5">
        <PanelTitle icon={<MoveHorizontal size={16} />} title="Competitive price ladder" hint="Click or drag on the ladder to move your marker. Shaded zones show the quartiles of all 11 researched offers." />
        <Ladder p={p} setPrice={(v) => { setDraft(null); setPrice(v); }} />
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        {/* ---------- classification + metrics ---------- */}
        <Panel className="p-5 xl:col-span-2">
          <PanelTitle icon={<Target size={16} />} title="Competitive position" hint="Transparent rule based on the observed price distribution" />
          <div className={`rounded-2xl p-4 ring-1 ${toneOf(pos.key)}`}>
            <div className="text-lg font-semibold">{pos.label}</div>
            <div className="mt-0.5 text-xs opacity-90">{pos.rule}</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="vs representative median" value={signed(vsMedian)} sub={`${pct(vsMedian / REP_STATS.median)} vs ${usd(REP_STATS.median)}`} />
            <Metric label="Researched offers below you" value={`${below} of ${ALL_STATS.count}`} sub={`${Math.round((below / ALL_STATS.count) * 100)}% of comparable offers`} />
            <Metric label="Position in observed range" value={`${Math.round(rangePos * 100)}%`} sub={`${usd(ALL_STATS.min)} = 0% · ${usd(ALL_STATS.max)} = 100%`} />
            <Metric label="Offers within ±$5" value={String(nearby.length)} sub={nearby.length ? nearby.map((o) => usd(o.current_price, 0)).join(", ") : "none observed"} />
          </div>
          <details className="mt-4 rounded-xl bg-ink-950/40 p-3 text-xs text-mist-400 ring-1 ring-white/5">
            <summary className="cursor-pointer font-medium text-mist-300">How the classification works</summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Uses all {ALL_STATS.count} comparable offers (add-on fee excluded): Q1 {usd(ALL_QUARTILES.q1)}, median {usd(ALL_QUARTILES.q2)}, Q3 {usd(ALL_QUARTILES.q3)}.</li>
              <li>Below {usd(ALL_STATS.min)} → below the researched market; below Q1 → budget-oriented; Q1–Q3 → near the market middle; above Q3 → premium-oriented; above {usd(ALL_STATS.max)} → above the researched market.</li>
              <li>Quartiles use linear interpolation (Excel QUARTILE.INC). With only 11 offers, boundaries are approximate.</li>
            </ul>
          </details>
        </Panel>

        {/* ---------- live competitor comparison ---------- */}
        <Panel className="p-5 xl:col-span-3">
          <PanelTitle title="Live competitor comparison" hint={`Representative products. "Comparable" means within ±${tol}% of that competitor's price (a display convention you can change).`}
            right={<Segmented<Tol> label="Comparable price band" value={tol} onChange={setTol} options={[{ value: "5", label: "±5%" }, { value: "10", label: "±10%" }, { value: "15", label: "±15%" }]} />} />
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <Count n={cheaper.length} label="Cheaper than you" icon={<ArrowDown size={14} />} tone="text-sky-300" testid="count-cheaper" />
            <Count n={comparable.length} label="Comparable" icon={<Equal size={14} />} tone="text-teal-300" testid="count-comparable" />
            <Count n={pricier.length} label="More expensive" icon={<ArrowUp size={14} />} tone="text-violet-300" testid="count-pricier" />
          </div>
          <div className="space-y-2.5">
            {reps.map((r) => {
              const w = Math.min(1, Math.abs(r.diff) / 80);
              return (
                <div key={r.c.competitor_id} className="grid grid-cols-[minmax(0,130px)_1fr_auto] items-center gap-3 rounded-xl bg-ink-950/40 px-3 py-2.5 ring-1 ring-white/5" data-testid={`row-${r.c.competitor_id}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate text-sm font-medium text-mist-100"><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: r.c.color }} />{r.c.name}</div>
                    <div className="font-mono text-[11px] text-mist-400">{usd(r.cp)}{priceType(r.c.rep) === "Promotional" ? " · promo" : ""}</div>
                  </div>
                  <div className="relative h-6" aria-hidden>
                    <div className="absolute inset-y-0 left-1/2 w-px bg-white/15" />
                    <div className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-full transition-all duration-300 ${r.diff >= 0 ? "left-1/2 bg-gradient-to-r from-yellow-400/70 to-yellow-300" : "right-1/2 bg-gradient-to-l from-sky-400/70 to-sky-300"}`} style={{ width: `${w * 50}%` }} />
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-mist-100">{signed(r.diff)}</div>
                    <StatusPill s={r.status} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-mist-400"><span>← you are cheaper</span><span>you are pricier →</span></div>
        </Panel>
      </div>

      {/* ---------- interpretation ---------- */}
      <Panel className="mt-4 p-5">
        <PanelTitle icon={<Lightbulb size={16} />} title="Strategic interpretation" hint="Updates with your price. Based only on observed competitor prices and the Mission 1 report." />
        <div className="grid gap-3 lg:grid-cols-2" data-testid="interpretation">
          <Insight icon={<ArrowDown size={15} />} title="Who you would underprice">
            {pricier.length ? <>At {usd(p)} you would be priced below {names(pricier)}.</> : <>No representative competitor is more expensive than {usd(p)} by more than ±{tol}%.</>}
            {comparable.length > 0 && <> Comparable (±{tol}%): {names(comparable)}.</>}
          </Insight>
          <Insight icon={<ArrowUp size={15} />} title="Who would be cheaper">
            {cheaper.length ? <>{names(cheaper)} would be cheaper than you.</> : <>No representative competitor is cheaper than {usd(p)} beyond the ±{tol}% band.</>}
            {cheaper.filter((r) => priceType(r.c.rep) === "Promotional").map((r) => <span key={r.c.competitor_id}> Note: {r.c.name}'s {usd(r.cp)} is a promotional price.</span>)}
          </Insight>
          <Insight icon={<Sparkles size={15} />} title="Against the preliminary recommendation">
            {inRec
              ? <>This price is inside the preliminary {usd(REC.tentative_range_min, 0)}–{usd(REC.tentative_range_max, 0)} range, which the report places “{REC.position.toLowerCase()}”.</>
              : p < REC.tentative_range_min
                ? <>This is {usd(REC.tentative_range_min - p)} below the preliminary range. The report argues the venture offers more than the necklace-only Lolalet at $18.99, which is why its range starts at {usd(REC.tentative_range_min, 0)}.</>
                : <>This is {usd(p - REC.tentative_range_max)} above the preliminary range. The report cautions that, as an unknown brand without proof of performance, pricing at or above BÉIS ($48) or the premium tier ($95–$99) is unlikely to be supported.</>}
          </Insight>
          <Insight icon={<Target size={15} />} title="What would need to justify this position">
            {p > REP_STATS.median
              ? <>Above the representative median, premium competitors lean on brand, materials, gifting, and personalization (report §7). The research does not show that a higher price signals higher quality. The report says the venture would first need: {REC.value_proposition_to_justify.toLowerCase()}</>
              : p >= REC.tentative_range_min
                ? <>A modest premium over budget organizers would rest on demonstrated value. The report suggests: {REC.value_proposition_to_justify.toLowerCase()}</>
                : <>At this level the venture would sit among budget and promotional offers (BAGSMART lists clearance prices as low as $9.99). The research does not show that a lower price produces more sales.</>}
          </Insight>
          <Insight icon={<Info size={15} />} title="How crowded is this price band?" wide>
            {nearby.length === 0 ? <>No researched offer falls within ±$5 of {usd(p)}. This is a sparsely populated part of the observed market. </> :
              <>{nearby.length} of {ALL_STATS.count} researched offers fall within ±$5: {nearby.map((o) => `${competitorById(o.competitor_id).name} ${usd(o.current_price)}${priceType(o) === "Promotional" ? " (promo)" : ""}${o.verification_status !== "Verified" ? " (partially verified)" : ""}`).join("; ")}. {nearby.length >= 3 ? "This is one of the more populated observed bands. " : "This band is sparsely populated in the research sample. "}</>}
            {nextBelow && <>Nearest cheaper offer: {competitorById(nextBelow.competitor_id).name} at {usd(nextBelow.current_price)}. </>}
            {nextAbove && <>Nearest pricier offer: {competitorById(nextAbove.competitor_id).name} at {usd(nextAbove.current_price)}.</>}
            <span className="block pt-1 text-[11px] text-mist-400">“Populated” refers only to the 11 researched offers; the report notes many unbranded Amazon organizers also compete.</span>
          </Insight>
        </div>
      </Panel>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-sm text-amber-100/90">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-300" />
        <div><span className="font-semibold">Analytical boundary.</span> This explorer shows how a price compares with observed competitors on {` `}<span className="font-mono">2026-10-27</span>. It does not estimate demand, price elasticity, sales, conversion, revenue, profit, or willingness to pay. Those belong to later missions.</div>
      </div>
    </div>
  );
};

/* ---------------- helpers ---------------- */
const toneOf = (k: string) => ({
  below: "bg-sky-400/10 text-sky-200 ring-sky-400/30",
  budget: "bg-sky-400/10 text-sky-200 ring-sky-400/30",
  middle: "bg-teal-400/10 text-teal-200 ring-teal-400/30",
  premium: "bg-violet-400/12 text-violet-200 ring-violet-400/35",
  above: "bg-rose-400/10 text-rose-200 ring-rose-400/30",
})[k] ?? "";

const Metric = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="rounded-xl bg-ink-950/50 p-3 ring-1 ring-white/5">
    <div className="text-[11px] text-mist-400">{label}</div>
    <div className="mt-1 font-mono text-lg text-mist-100">{value}</div>
    <div className="mt-0.5 text-[10px] leading-snug text-mist-400">{sub}</div>
  </div>
);

const Count = ({ n, label, icon, tone, testid }: { n: number; label: string; icon: React.ReactNode; tone: string; testid: string }) => (
  <div className="rounded-xl bg-ink-950/50 p-3 ring-1 ring-white/5">
    <div className={`flex items-center justify-center gap-1 text-2xl font-semibold ${tone}`} data-testid={testid}>{n}</div>
    <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-mist-400">{icon}{label}</div>
  </div>
);

const StatusPill = ({ s }: { s: "cheaper" | "pricier" | "comparable" }) =>
  s === "cheaper" ? <Pill tone="info">Cheaper than you</Pill> : s === "pricier" ? <Pill tone="accent">More expensive</Pill> : <Pill tone="rec">Comparable</Pill>;

const Insight = ({ icon, title, children, wide }: { icon: React.ReactNode; title: string; children: React.ReactNode; wide?: boolean }) => (
  <div className={`rounded-xl bg-ink-950/40 p-4 ring-1 ring-white/5 ${wide ? "lg:col-span-2" : ""}`}>
    <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-mist-100"><span className="text-yellow-300">{icon}</span>{title}</div>
    <p className="text-[13px] leading-relaxed text-mist-300">{children}</p>
  </div>
);

/* ---------------- interactive ladder ---------------- */
const Ladder = ({ p, setPrice }: { p: number; setPrice: (v: number) => void }) => {
  const ref = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const W = 1000, H = 230, L = 24, R = 24, axisY = 150;
  const x = (v: number) => L + ((v - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * (W - L - R);
  const fromEvent = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const v = SLIDER_MIN + ((vx - L) / (W - L - R)) * (SLIDER_MAX - SLIDER_MIN);
    return clampP(Math.round(v * 2) / 2);
  };
  const reps = [...COMPETITOR_VIEWS].sort((a, b) => a.rep.current_price - b.rep.current_price);
  const zones = [
    { a: ALL_STATS.min, b: ALL_QUARTILES.q1, c: "rgba(56,189,248,0.10)", t: "Budget-oriented" },
    { a: ALL_QUARTILES.q1, b: ALL_QUARTILES.q3, c: "rgba(45,212,191,0.08)", t: "Market middle" },
    { a: ALL_QUARTILES.q3, b: ALL_STATS.max, c: "rgba(167,139,250,0.12)", t: "Premium-oriented" },
  ];
  return (
    <div className="overflow-x-auto">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px] touch-none select-none" style={{ cursor: "ew-resize" }}
        onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); setPrice(fromEvent(e)); }}
        onPointerMove={(e) => { if (dragging.current) setPrice(fromEvent(e)); }}
        onPointerUp={() => { dragging.current = false; }} onPointerLeave={() => { dragging.current = false; }}
        role="img" aria-label={`Price ladder. Your price ${usd(p)}. Competitors: ${reps.map((c) => `${c.name} ${usd(c.rep.current_price)}`).join(", ")}`}>
        {zones.map((z) => (
          <g key={z.t}>
            <rect x={x(z.a)} y={20} width={x(z.b) - x(z.a)} height={axisY - 20 + 8} fill={z.c} />
            <text x={(x(z.a) + x(z.b)) / 2} y={H - 4} textAnchor="middle" fill="#8b93a7" fontSize={11}>{z.t}</text>
          </g>
        ))}
        <rect x={x(REC.tentative_range_min)} y={20} width={x(REC.tentative_range_max) - x(REC.tentative_range_min)} height={axisY - 20} fill="rgba(45,212,191,0.18)" stroke="rgba(94,234,212,0.55)" strokeDasharray="4 4" rx={6} />
        <text x={(x(REC.tentative_range_min) + x(REC.tentative_range_max)) / 2} y={14} textAnchor="middle" fill="#5eead4" fontSize={11} fontWeight={600}>Preliminary range</text>
        <line x1={L} x2={W - R} y1={axisY} y2={axisY} stroke="rgba(255,255,255,0.25)" />
        {Array.from({ length: Math.floor(SLIDER_MAX / 10) + 1 }, (_, i) => i * 10).filter((v) => v >= SLIDER_MIN).map((v) => (
          <g key={v}><line x1={x(v)} x2={x(v)} y1={axisY} y2={axisY + 5} stroke="rgba(255,255,255,0.3)" /><text x={x(v)} y={axisY + 18} textAnchor="middle" fill="#8b93a7" fontSize={11}>${v}</text></g>
        ))}
        {/* all offers as small ticks on the axis */}
        {comparableOffers.map((o) => (
          <circle key={o.offer_id} cx={x(o.current_price)} cy={axisY} r={4} fill={priceType(o) === "Promotional" ? "#0b0d12" : colorOf(o.competitor_id)} stroke={colorOf(o.competitor_id)} strokeWidth={1.5} opacity={0.85}>
            <title>{`${competitorById(o.competitor_id).name}: ${o.product_name} ${usd(o.current_price)}`}</title>
          </circle>
        ))}
        {/* representative markers with staggered labels */}
        {reps.map((c, i) => {
          const lx = x(c.rep.current_price), ly = 46 + (i % 3) * 30;
          return (
            <g key={c.competitor_id}>
              <line x1={lx} x2={lx} y1={ly + 6} y2={axisY - 6} stroke={c.color} strokeOpacity={0.5} strokeDasharray="2 3" />
              <circle cx={lx} cy={axisY} r={7} fill={c.color} stroke="#0b0d12" strokeWidth={2} />
              <text x={lx} y={ly} textAnchor="middle" fill="#e9ecf2" fontSize={12} fontWeight={600}>{c.name}</text>
              <text x={lx} y={ly + 13} textAnchor="middle" fill="#8b93a7" fontSize={10.5} fontFamily="JetBrains Mono">{usd(c.rep.current_price)}</text>
            </g>
          );
        })}
        {/* venture marker */}
        <g style={{ transition: "transform 0.12s ease-out" }} transform={`translate(${x(p)} 0)`}>
          <line x1={0} x2={0} y1={axisY - 30} y2={axisY + 30} stroke={VENTURE_COLOR} strokeWidth={2.5} />
          <circle cx={0} cy={axisY} r={10} fill={VENTURE_COLOR} stroke="#0b0d12" strokeWidth={3} />
          <circle cx={0} cy={axisY} r={17} fill="none" stroke={VENTURE_COLOR} strokeOpacity={0.4} strokeWidth={2} />
          <rect x={-56} y={axisY + 30} width={112} height={22} rx={11} fill={VENTURE_COLOR} />
          <text x={0} y={axisY + 45} textAnchor="middle" fill="#0b0d12" fontSize={12} fontWeight={700}>You · {usd(p)}</text>
        </g>
      </svg>
    </div>
  );
};
