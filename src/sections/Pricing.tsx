import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownUp, BarChart3, ChevronDown, ChevronUp, Filter, GitCommitHorizontal, Table2 } from "lucide-react";
import { ALL_STATS, COMPETITOR_VIEWS, OFFERS, REP_STATS, availabilityLabel, colorOf, competitorById, isOutOfStock, priceType, usd } from "../data/model";
import type { Offer } from "../data/model";
import { AvailabilityBadge, EmptyState, ExternalLink, Panel, PanelTitle, Pill, PriceTypeBadge, SectionHeader, Segmented, VerificationBadge } from "../components/ui";

type RepSort = "asc" | "desc" | "research";
type Pop = "all" | "rep";

const TooltipBox = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-xs rounded-xl border border-white/10 bg-ink-850/95 p-3 text-xs shadow-2xl backdrop-blur">{children}</div>
);

export const Pricing = () => {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [repSort, setRepSort] = useState<RepSort>("asc");
  const [pop, setPop] = useState<Pop>("all");
  const [focus, setFocus] = useState<string | null>(null); // competitor clicked in a chart → filters the table
  const toggle = (id: string) => setHidden((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const visible = COMPETITOR_VIEWS.filter((c) => !hidden.has(c.competitor_id));

  const repData = useMemo(() => {
    const d = visible.map((c) => ({ id: c.competitor_id, name: c.name, price: c.rep.current_price, product: c.rep.product_name, color: c.color, offer: c.rep }));
    if (repSort === "asc") d.sort((a, b) => a.price - b.price);
    if (repSort === "desc") d.sort((a, b) => b.price - a.price);
    return d;
  }, [visible, repSort]);

  const distOffers = useMemo(() => {
    const base = pop === "all" ? OFFERS.filter((o) => o.include_in_case_comparison) : COMPETITOR_VIEWS.map((c) => c.rep);
    return base.filter((o) => !hidden.has(o.competitor_id));
  }, [pop, hidden]);
  const bins = useMemo(() => Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10, hi = lo + 10;
    const items = distOffers.filter((o) => o.current_price >= lo && o.current_price < hi);
    return { band: `$${lo}–${hi}`, lo, count: items.length, items };
  }), [distOffers]);

  return (
    <div>
      <SectionHeader eyebrow="03 · Pricing Comparison" title="Competitive pricing visualizations"
        subtitle="Every chart uses the researched prices on the snapshot date. Optional add-on fees (Mark & Graham's $17 monogram) are never shown as product prices." />

      <Panel className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <span className="mr-1 flex items-center gap-1.5 text-xs text-mist-400"><Filter size={13} />Competitors (click to show / hide)</span>
        {COMPETITOR_VIEWS.map((c) => {
          const on = !hidden.has(c.competitor_id);
          return (
            <button key={c.competitor_id} onClick={() => toggle(c.competitor_id)} aria-pressed={on}
              className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 transition ${on ? "bg-white/5 text-mist-100 ring-white/15" : "text-mist-400/60 ring-white/5 line-through"}`}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: on ? c.color : "#3b4252" }} />{c.name}
            </button>
          );
        })}
        {hidden.size > 0 && <button onClick={() => setHidden(new Set())} className="ml-auto text-xs text-accent-400 hover:underline">Show all</button>}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Chart A */}
        <Panel className="p-5">
          <PanelTitle icon={<BarChart3 size={16} />} title="A · Representative competitor prices" hint={`One most-comparable product per competitor · median ${usd(REP_STATS.median)}`}
            right={<Segmented<RepSort> label="Sort representative prices" value={repSort} onChange={setRepSort} options={[{ value: "asc", label: "Low→High" }, { value: "desc", label: "High→Low" }, { value: "research", label: "Research order" }]} />} />
          {repData.length === 0 ? <EmptyState title="All competitors hidden" body="Use the legend above to show at least one competitor." /> : (
            <div className="h-[300px]" role="img" aria-label={`Bar chart of representative prices: ${repData.map((d) => `${d.name} ${usd(d.price)}`).join(", ")}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repData} margin={{ top: 24, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} width={44} domain={[0, 110]} />
                  <ReferenceLine y={REP_STATS.median} stroke="#98a4ff" strokeDasharray="4 4" label={{ value: `Median ${usd(REP_STATS.median, 0)}`, fill: "#98a4ff", fontSize: 11, position: "insideTopLeft" }} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as (typeof repData)[number];
                    return (
                      <TooltipBox>
                        <div className="mb-1 flex items-center gap-2 font-semibold text-mist-100"><span className="h-2 w-2 rounded-full" style={{ background: d.color }} />{d.name}</div>
                        <div className="text-mist-300">{d.product}</div>
                        <div className="mt-1.5 font-mono text-sm text-mist-100">{usd(d.price)}</div>
                        <div className="mt-1 text-mist-400">{priceType(d.offer)} · {availabilityLabel(d.offer)} · {d.offer.verification_status}</div>
                        <div className="mt-1 text-[10px] text-mist-400">Click to filter the table</div>
                      </TooltipBox>
                    );
                  }} />
                  <Bar dataKey="price" radius={[8, 8, 2, 2]} animationDuration={500} onClick={(d) => setFocus((d as unknown as { id: string }).id)} cursor="pointer">
                    {repData.map((d) => <Cell key={d.id} fill={d.color} fillOpacity={focus && focus !== d.id ? 0.35 : 0.9} />)}
                    <LabelList dataKey="price" position="top" formatter={(v) => usd(Number(v))} style={{ fill: "#cfd4df", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="mt-2 text-[11px] text-mist-400">BAGSMART's representative price ($22.99) is promotional; Monos ($95) was out of stock on the snapshot date.</p>
        </Panel>

        {/* Chart B */}
        <Panel className="p-5">
          <PanelTitle icon={<GitCommitHorizontal size={16} />} title="B · Competitor price ranges" hint="Lowest to highest comparable offer per competitor; each dot is one product." />
          <RangeChart ids={visible.map((c) => c.competitor_id)} onPick={setFocus} focus={focus} />
        </Panel>

        {/* Chart C */}
        <Panel className="p-5 xl:col-span-2">
          <PanelTitle icon={<BarChart3 size={16} />} title="C · Market price distribution"
            hint={pop === "all" ? `All ${ALL_STATS.count} comparable offers (includes promotional and partially verified prices) in $10 bands` : `Representative products only (n=${REP_STATS.count}) in $10 bands`}
            right={<Segmented<Pop> label="Distribution population" value={pop} onChange={setPop} options={[{ value: "all", label: "All offers (n=11)" }, { value: "rep", label: "Representative (n=5)" }]} />} />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bins} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="band" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const b = payload[0].payload as (typeof bins)[number];
                    return (
                      <TooltipBox>
                        <div className="mb-1 font-semibold text-mist-100">{b.band} · {b.count} offer{b.count === 1 ? "" : "s"}</div>
                        {b.items.length === 0 ? <div className="text-mist-400">No researched offers in this band</div> :
                          b.items.map((o) => <div key={o.offer_id} className="text-mist-300"><span className="font-mono">{usd(o.current_price)}</span> · {competitorById(o.competitor_id).name}</div>)}
                      </TooltipBox>
                    );
                  }} />
                  <Bar dataKey="count" radius={[6, 6, 2, 2]} animationDuration={450} fill="url(#distGrad)" />
                  <defs><linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#98a4ff" /><stop offset="1" stopColor="#2dd4bf" stopOpacity={0.5} /></linearGradient></defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <DotPlot offers={distOffers} />
          </div>
        </Panel>
      </div>

      {/* Chart D */}
      <OfferTable focus={focus} setFocus={setFocus} hidden={hidden} />
    </div>
  );
};

/* ---------------- Chart B: interval chart ---------------- */
const RangeChart = ({ ids, onPick, focus }: { ids: string[]; onPick: (id: string) => void; focus: string | null }) => {
  const rows = COMPETITOR_VIEWS.filter((c) => ids.includes(c.competitor_id));
  const [hover, setHover] = useState<Offer | null>(null);
  if (rows.length === 0) return <EmptyState title="All competitors hidden" body="Use the legend above to show at least one competitor." />;
  const max = 110, W = 560, L = 112, R = 16, rowH = 46, H = rows.length * rowH + 30;
  const x = (p: number) => L + (p / max) * (W - L - R);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Range chart of comparable offers per competitor">
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t}><line x1={x(t)} x2={x(t)} y1={6} y2={H - 22} stroke="rgba(255,255,255,0.05)" /><text x={x(t)} y={H - 6} textAnchor="middle" fill="#8b93a7" fontSize={11}>${t}</text></g>
        ))}
        {rows.map((c, i) => {
          const y = 22 + i * rowH;
          const dim = focus && focus !== c.competitor_id;
          return (
            <g key={c.competitor_id} opacity={dim ? 0.35 : 1} className="cursor-pointer" onClick={() => onPick(c.competitor_id)}>
              <text x={L - 12} y={y + 4} textAnchor="end" fill="#e9ecf2" fontSize={12} fontWeight={500}>{c.name}</text>
              <text x={L - 12} y={y + 18} textAnchor="end" fill="#8b93a7" fontSize={10}>{c.offers.length} offer{c.offers.length > 1 ? "s" : ""}</text>
              <line x1={x(c.min)} x2={x(c.max)} y1={y} y2={y} stroke={c.color} strokeWidth={6} strokeLinecap="round" opacity={0.35} />
              {c.offers.map((o) => {
                const promo = priceType(o) === "Promotional", partial = o.verification_status !== "Verified", rep = o.is_representative;
                return (
                  <g key={o.offer_id} onMouseEnter={() => setHover(o)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(o)} onBlur={() => setHover(null)} tabIndex={0}
                    aria-label={`${o.product_name}: ${usd(o.current_price)}${promo ? ", promotional" : ""}${partial ? ", partially verified" : ""}`}>
                    <circle cx={x(o.current_price)} cy={y} r={rep ? 8 : 6} fill={promo ? "#0b0d12" : c.color} stroke={c.color} strokeWidth={2.5} strokeDasharray={partial ? "2.5 2" : undefined} />
                    {rep && <circle cx={x(o.current_price)} cy={y} r={12} fill="none" stroke={c.color} strokeOpacity={0.5} />}
                  </g>
                );
              })}
              {c.min !== c.max && <text x={x(c.max) + 14} y={y + 4} fill="#8b93a7" fontSize={10} fontFamily="JetBrains Mono">{usd(c.min, 0)}–{usd(c.max, 0)}</text>}
            </g>
          );
        })}
      </svg>
      {hover && (
        <div className="pointer-events-none absolute right-2 top-2"><TooltipBox>
          <div className="font-semibold text-mist-100">{hover.product_name}</div>
          <div className="mt-1 font-mono text-sm text-mist-100">{usd(hover.current_price)}</div>
          <div className="mt-1 text-mist-400">{priceType(hover)} · {availabilityLabel(hover)} · {hover.verification_status}</div>
        </TooltipBox></div>
      )}
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-mist-400">
        <span className="flex items-center gap-1.5"><svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="#98a4ff" /></svg>Listed / regular</span>
        <span className="flex items-center gap-1.5"><svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="#0b0d12" stroke="#98a4ff" strokeWidth="2" /></svg>Promotional</span>
        <span className="flex items-center gap-1.5"><svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="#98a4ff" stroke="#98a4ff" strokeWidth="2" strokeDasharray="2.5 2" /></svg>Partially verified</span>
        <span className="flex items-center gap-1.5"><svg width="18" height="18"><circle cx="9" cy="9" r="5" fill="#98a4ff" /><circle cx="9" cy="9" r="8" fill="none" stroke="#98a4ff" strokeOpacity=".5" /></svg>Representative</span>
      </div>
    </div>
  );
};

/* ---------------- Chart C (companion): dot plot price ladder ---------------- */
const DotPlot = ({ offers }: { offers: Offer[] }) => {
  const W = 460, H = 200, L = 14, R = 14, max = 110;
  const x = (p: number) => L + (p / max) * (W - L - R);
  const sorted = [...offers].sort((a, b) => a.current_price - b.current_price);
  // stack dots that are close together
  const placed: { o: Offer; lane: number }[] = [];
  sorted.forEach((o) => {
    let lane = 0;
    while (placed.some((p) => p.lane === lane && Math.abs(x(p.o.current_price) - x(o.current_price)) < 16)) lane++;
    placed.push({ o, lane });
  });
  return (
    <div>
      <div className="mb-1 text-xs text-mist-400">Price ladder · each dot is one offer (hover for details)</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Dot plot of offer prices">
        <line x1={L} x2={W - R} y1={150} y2={150} stroke="rgba(255,255,255,0.15)" />
        {[0, 20, 40, 60, 80, 100].map((t) => <text key={t} x={x(t)} y={170} textAnchor="middle" fill="#8b93a7" fontSize={11}>${t}</text>)}
        {placed.map(({ o, lane }) => (
          <g key={o.offer_id}>
            <title>{`${competitorById(o.competitor_id).name} — ${o.product_name}: ${usd(o.current_price)} (${priceType(o)}${o.verification_status !== "Verified" ? ", partially verified" : ""}${isOutOfStock(o) ? ", out of stock" : ""})`}</title>
            <circle cx={x(o.current_price)} cy={136 - lane * 17} r={7} fill={priceType(o) === "Promotional" ? "#0b0d12" : colorOf(o.competitor_id)} stroke={colorOf(o.competitor_id)} strokeWidth={2.5}
              strokeDasharray={o.verification_status !== "Verified" ? "2.5 2" : undefined} />
            {o.is_representative && <circle cx={x(o.current_price)} cy={136 - lane * 17} r={10.5} fill="none" stroke={colorOf(o.competitor_id)} strokeOpacity={0.5} />}
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-mist-400">
        {COMPETITOR_VIEWS.map((c) => <span key={c.competitor_id} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name}</span>)}
      </div>
    </div>
  );
};

/* ---------------- Chart D: comparison table ---------------- */
type SortKey = "competitor" | "product" | "price" | "type" | "availability" | "verification";
const OfferTable = ({ focus, setFocus, hidden }: { focus: string | null; setFocus: (v: string | null) => void; hidden: Set<string> }) => {
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [dir, setDir] = useState<1 | -1>(1);
  const [ptype, setPtype] = useState("all");
  const [verif, setVerif] = useState("all");
  const [showAddOns, setShowAddOns] = useState(true);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const rows = useMemo(() => {
    const r = OFFERS.filter((o) =>
      !hidden.has(o.competitor_id) && (!focus || o.competitor_id === focus) &&
      (showAddOns || o.include_in_case_comparison) && (ptype === "all" || priceType(o) === ptype) &&
      (verif === "all" || o.verification_status === verif) && (!onlyInStock || !isOutOfStock(o)));
    const key = (o: Offer): string | number => ({
      competitor: competitorById(o.competitor_id).name, product: o.product_name, price: o.current_price, type: priceType(o),
      availability: availabilityLabel(o), verification: o.verification_status,
    })[sortKey];
    return r.sort((a, b) => { const A = key(a), B = key(b); return (typeof A === "number" ? A - (B as number) : A.localeCompare(B as string)) * dir; });
  }, [sortKey, dir, ptype, verif, showAddOns, onlyInStock, focus, hidden]);

  const head = (k: SortKey, label: string, cls = "") => (
    <th className={`px-3 py-3 font-medium ${cls}`} aria-sort={sortKey === k ? (dir === 1 ? "ascending" : "descending") : "none"}>
      <button onClick={() => (sortKey === k ? setDir((d) => (d === 1 ? -1 : 1)) : (setSortKey(k), setDir(1)))} className="inline-flex items-center gap-1 hover:text-mist-100">
        {label}{sortKey === k ? (dir === 1 ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : <ArrowDownUp size={12} className="opacity-40" />}
      </button>
    </th>
  );
  const sel = "rounded-lg bg-ink-950/60 px-2.5 py-1.5 text-xs text-mist-100 ring-1 ring-white/10 outline-none";

  return (
    <Panel className="mt-4 p-5">
      <PanelTitle icon={<Table2 size={16} />} title="D · Product and pricing comparison" hint="All 12 researched pricing records. Click a column to sort." />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {focus && <button onClick={() => setFocus(null)} className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500/15 px-2.5 py-1.5 text-xs text-accent-400 ring-1 ring-accent-500/30">Showing {competitorById(focus).name} only ✕</button>}
        <label className="text-xs text-mist-400">Price type <select className={sel} value={ptype} onChange={(e) => setPtype(e.target.value)}><option value="all">All</option><option>Promotional</option><option>Regular</option><option>Listed</option></select></label>
        <label className="text-xs text-mist-400">Verification <select className={sel} value={verif} onChange={(e) => setVerif(e.target.value)}><option value="all">All</option><option>Verified</option><option>Partially Verified</option></select></label>
        <label className="flex items-center gap-1.5 text-xs text-mist-400"><input type="checkbox" className="accent-indigo-400" checked={showAddOns} onChange={(e) => setShowAddOns(e.target.checked)} />Show add-on fees</label>
        <label className="flex items-center gap-1.5 text-xs text-mist-400"><input type="checkbox" className="accent-indigo-400" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />Hide out-of-stock</label>
        <span className="ml-auto text-xs text-mist-400" aria-live="polite">{rows.length} record{rows.length === 1 ? "" : "s"}</span>
      </div>
      {rows.length === 0 ? <EmptyState title="No records match these filters" body="Loosen the filters or clear the competitor focus." /> : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-white/5">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead className="bg-ink-950/60 text-xs text-mist-400">
              <tr>
                {head("competitor", "Competitor")}{head("product", "Product / service")}{head("price", "Current price", "text-right")}
                <th className="px-3 py-3 font-medium">Regular price</th>{head("type", "Promotion")}
                <th className="px-3 py-3 font-medium">Pricing model</th>{head("availability", "Availability")}{head("verification", "Verification")}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((o) => (
                <tr key={o.offer_id} className={`transition hover:bg-white/[0.025] ${!o.include_in_case_comparison ? "bg-amber-400/[0.03]" : ""}`}>
                  <td className="px-3 py-3"><span className="flex items-center gap-2 text-mist-200"><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colorOf(o.competitor_id) }} />{competitorById(o.competitor_id).name}</span></td>
                  <td className="max-w-[300px] px-3 py-3 text-mist-200">
                    <span className="mr-1 font-mono text-[10px] text-mist-400">{o.offer_id}</span>{o.product_name}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {o.is_representative && <Pill tone="accent">Representative</Pill>}
                      {!o.include_in_case_comparison && <Pill tone="warn">Add-on · not a product</Pill>}
                    </div>
                    <div className="mt-1 text-[11px]"><ExternalLink href={o.source_url}>Source: {new URL(o.source_url).hostname.replace(/^www\./, "")}</ExternalLink></div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-mist-100">{usd(o.current_price)}{o.pricing_unit !== "per unit" && <div className="text-[10px] text-mist-400">{o.pricing_unit}</div>}</td>
                  <td className="px-3 py-3 font-mono text-mist-300">{o.regular_price != null ? usd(o.regular_price) : <span className="font-sans text-xs text-mist-400" title="Compare-at prices were not treated as historical regular prices">Not established</span>}</td>
                  <td className="px-3 py-3"><PriceTypeBadge offer={o} /></td>
                  <td className="px-3 py-3 text-xs text-mist-400">{o.pricing_model.replace(/\s*\(optional personalization add-on\)/i, "")}{/add-on\)/i.test(o.pricing_model) && <div className="mt-1"><Pill>Add-on available</Pill></div>}</td>
                  <td className="px-3 py-3"><AvailabilityBadge offer={o} /></td>
                  <td className="px-3 py-3"><VerificationBadge status={o.verification_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
        Compare-at / strikethrough prices (BAGSMART $33.00 and $37.00; Mark & Graham $49) appear only in the research notes. They are <span className="text-mist-300">not</span> shown as regular prices because there is no evidence they were ever charged.
      </p>
    </Panel>
  );
};
