/**
 * Data layer. The research file (competitor_data.json, copied unchanged from Mission 1)
 * is the single source of truth; everything the UI shows is derived here.
 * To update the dashboard, replace competitor_data.json and rebuild — no UI changes needed.
 */
import raw from "./competitor_data.json";

export type Verification = "Verified" | "Partially Verified" | "Estimated" | "Unavailable";
export type Tier = "Budget" | "Mid-market" | "Premium";

export interface Competitor {
  competitor_id: string;
  name: string;
  classification: "Direct" | "Indirect";
  website: string;
  website_note: string;
  geographic_market: string;
  target_customers: string;
  main_products: string;
  positioning: string;
  differentiators: string;
  reason_for_inclusion: string;
}

export interface Offer {
  offer_id: string;
  competitor_id: string;
  product_name: string;
  description: string;
  pricing_model: string;
  current_price: number;
  regular_price: number | null;
  promotional_price: number | null;
  currency: string;
  pricing_unit: string;
  features: string[];
  is_representative: boolean;
  include_in_case_comparison: boolean;
  availability: string | null;
  source_url: string;
  source_type: string;
  date_checked: string;
  verification_status: Verification;
  notes: string;
}

export const DATA = raw as unknown as {
  metadata: { project: string; date_compiled: string; currency: string; verification_categories: Record<Verification, string> };
  venture: {
    venture_name: string; founder: string; business_concept: string; primary_product: string; target_customers: string;
    customer_needs: string[]; value_proposition: string; differentiation: string[]; geographic_market: string;
    distribution_channels: string; relevant_features: string[]; competitive_environment: string; status_notes: string; sources: string[];
  };
  competitors: Competitor[];
  pricing_offers: Offer[];
  price_statistics: {
    representative: { offer_ids: string[]; count: number; min: number; max: number; mean: number; median: number; basis: string };
    all_case_offers: { offer_ids: string[]; count: number; min: number; max: number; mean: number; median: number; basis: string };
    competitor_ranges: { competitor_id: string; name: string; min: number; max: number; offer_count: number }[];
    normalization_note: string;
  };
  preliminary_pricing_recommendation: {
    status: string; tentative_range_min: number; tentative_range_max: number; currency: string; position: string;
    most_relevant_benchmarks: string[]; rationale: string[]; value_proposition_to_justify: string; optional_test: string; uncertainties: string[];
  };
  research_limitations: string[];
};

export const RESEARCH_DATE = DATA.metadata.date_compiled;
export const VENTURE = DATA.venture;
export const REC = DATA.preliminary_pricing_recommendation;
export const COMPETITORS = DATA.competitors;
export const OFFERS = DATA.pricing_offers;

// ---------- formatting ----------
export const usd = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });

// ---------- classification helpers (rules documented in the Methodology section) ----------
/** Comparable products = researched jewelry-organizer offers. Add-on charges (e.g. a monogram fee) are excluded. */
export const isComparable = (o: Offer) => o.include_in_case_comparison && o.pricing_model !== "Add-on charge";
export const isAddOn = (o: Offer) => !o.include_in_case_comparison;

export type PriceType = "Promotional" | "Regular" | "Listed";
/** Regular only when the research established it; a compare-at/strikethrough price never counts as regular. */
export const priceType = (o: Offer): PriceType =>
  o.promotional_price != null ? "Promotional" : o.regular_price != null ? "Regular" : "Listed";

/** The JSON stores unchecked availability as null; the workbook labels these "Not checked". */
export const availabilityLabel = (o: Offer) => o.availability ?? "Not checked";
export const isOutOfStock = (o: Offer) => /out of stock/i.test(o.availability ?? "") && !/some colors/i.test(o.availability ?? "");
export const isLimitedStock = (o: Offer) => /limited|partially/i.test(o.availability ?? "");

/** Tier from the research's own positioning label (first word): "Budget…", "Mid-market…", "Premium…". */
export const tierOf = (c: Competitor): Tier =>
  /^budget/i.test(c.positioning) ? "Budget" : /^mid/i.test(c.positioning) ? "Mid-market" : "Premium";

// ---------- statistics ----------
export const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
export const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
/** Linear-interpolation quantile (same method as Excel QUARTILE.INC / NumPy default). */
export const quantile = (v: number[], q: number) => {
  const s = [...v].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
};
const summary = (v: number[]) => ({ count: v.length, min: Math.min(...v), max: Math.max(...v), mean: mean(v), median: median(v) });

export const competitorById = (id: string) => COMPETITORS.find((c) => c.competitor_id === id)!;
export const comparableOffers = OFFERS.filter(isComparable);
export const addOnOffers = OFFERS.filter(isAddOn);

/** One representative offer per competitor (the research flags exactly one each). */
export const representativeOf = (competitorId: string) => OFFERS.find((o) => o.competitor_id === competitorId && o.is_representative)!;

export const REP_PRICES = COMPETITORS.map((c) => representativeOf(c.competitor_id).current_price);
export const ALL_PRICES = comparableOffers.map((o) => o.current_price);
export const REP_STATS = summary(REP_PRICES);
export const ALL_STATS = summary(ALL_PRICES);
export const ALL_QUARTILES = { q1: quantile(ALL_PRICES, 0.25), q2: quantile(ALL_PRICES, 0.5), q3: quantile(ALL_PRICES, 0.75) };

export interface CompetitorView extends Competitor {
  tier: Tier;
  rep: Offer;
  offers: Offer[]; // comparable offers only
  addOns: Offer[];
  min: number;
  max: number;
  color: string;
}

const PALETTE: Record<string, string> = { C01: "#FB923C", C02: "#60A5FA", C03: "#F472B6", C04: "#A78BFA", C05: "#34D399" };
const FALLBACK = ["#FB923C", "#60A5FA", "#F472B6", "#A78BFA", "#34D399", "#F87171", "#22D3EE"];

export const COMPETITOR_VIEWS: CompetitorView[] = COMPETITORS.map((c, i) => {
  const offers = comparableOffers.filter((o) => o.competitor_id === c.competitor_id);
  const prices = offers.map((o) => o.current_price);
  return {
    ...c, tier: tierOf(c), rep: representativeOf(c.competitor_id), offers,
    addOns: addOnOffers.filter((o) => o.competitor_id === c.competitor_id),
    min: Math.min(...prices), max: Math.max(...prices), color: PALETTE[c.competitor_id] ?? FALLBACK[i % FALLBACK.length],
  };
});
export const colorOf = (competitorId: string) => COMPETITOR_VIEWS.find((c) => c.competitor_id === competitorId)?.color ?? "#94A3B8";

export const VENTURE_COLOR = "#FACC15";

// ---------- integrity check against the statistics stored in the research file ----------
export interface CheckResult { label: string; ok: boolean; detail: string }
const near = (a: number, b: number) => Math.abs(a - b) < 0.006; // research rounds to cents

export const INTEGRITY: CheckResult[] = (() => {
  const s = DATA.price_statistics;
  const out: CheckResult[] = [];
  const cmp = (label: string, mine: ReturnType<typeof summary>, theirs: typeof s.representative) => {
    const ok = mine.count === theirs.count && near(mine.min, theirs.min) && near(mine.max, theirs.max) && near(mine.mean, theirs.mean) && near(mine.median, theirs.median);
    out.push({ label, ok, detail: `n=${mine.count}, min ${usd(mine.min)}, max ${usd(mine.max)}, mean ${usd(mine.mean)}, median ${usd(mine.median)}` });
  };
  cmp("Representative statistics match the research file", REP_STATS, s.representative);
  cmp("All-offer statistics match the research file", ALL_STATS, s.all_case_offers);
  const repIds = COMPETITORS.map((c) => representativeOf(c.competitor_id).offer_id).sort().join(",");
  out.push({ label: "Representative offer IDs match", ok: repIds === [...s.representative.offer_ids].sort().join(","), detail: repIds });
  const allIds = comparableOffers.map((o) => o.offer_id).sort().join(",");
  out.push({ label: "Comparable offer IDs match (add-ons excluded)", ok: allIds === [...s.all_case_offers.offer_ids].sort().join(","), detail: allIds });
  const rangesOk = s.competitor_ranges.every((r) => {
    const v = COMPETITOR_VIEWS.find((c) => c.competitor_id === r.competitor_id);
    return v && near(v.min, r.min) && near(v.max, r.max) && v.offers.length === r.offer_count;
  });
  out.push({ label: "Competitor price ranges match", ok: rangesOk, detail: `${s.competitor_ranges.length} competitors` });
  const oneRepEach = COMPETITORS.every((c) => OFFERS.filter((o) => o.competitor_id === c.competitor_id && o.is_representative).length === 1);
  out.push({ label: "Exactly one representative offer per competitor", ok: oneRepEach, detail: `${COMPETITORS.length} competitors` });
  const oneCurrency = OFFERS.every((o) => o.currency === "USD" && /per unit|per item/.test(o.pricing_unit));
  out.push({ label: "All prices USD, per unit (no normalisation needed)", ok: oneCurrency, detail: s.normalization_note });
  return out;
})();
if (INTEGRITY.some((c) => !c.ok)) console.warn("Research data integrity check failed", INTEGRITY.filter((c) => !c.ok));

// ---------- price position logic (Price Position Explorer) ----------
export type Position = { key: "below" | "budget" | "middle" | "premium" | "above"; label: string; rule: string };

/**
 * Classification uses the distribution of all 11 comparable offers:
 * below the lowest observed offer · bottom quarter (< Q1) · middle half (Q1–Q3) · top quarter (> Q3) · above the highest.
 */
export const classify = (p: number): Position => {
  const { q1, q3 } = ALL_QUARTILES;
  if (p < ALL_STATS.min) return { key: "below", label: "Below the researched market", rule: `Lower than every researched offer (lowest ${usd(ALL_STATS.min)})` };
  if (p > ALL_STATS.max) return { key: "above", label: "Above the researched market", rule: `Higher than every researched offer (highest ${usd(ALL_STATS.max)})` };
  if (p < q1) return { key: "budget", label: "Budget-oriented", rule: `In the lowest quarter of researched offers (below Q1 = ${usd(q1)})` };
  if (p > q3) return { key: "premium", label: "Premium-oriented", rule: `In the highest quarter of researched offers (above Q3 = ${usd(q3)})` };
  return { key: "middle", label: "Near the market middle", rule: `Within the middle half of researched offers (Q1 ${usd(q1)} – Q3 ${usd(q3)})` };
};

/**
 * Presets sit just inside the quartile bands used by `classify`, at a conventional $.99 price point,
 * so that each preset is classified as its label says (a price exactly on Q1/Q3 would count as "middle").
 */
const LOWER_PRESET = Math.floor(ALL_QUARTILES.q1) - 0.01;
const PREMIUM_PRESET = Math.ceil(ALL_QUARTILES.q3) + 0.99;
export const SCENARIOS = [
  { id: "lower", label: "Lower-Price", price: LOWER_PRESET, basis: `Nearest $.99 price point below Q1 of the 11 researched offers (${usd(ALL_QUARTILES.q1)})` },
  { id: "middle", label: "Market-Middle", price: REP_STATS.median, basis: `Median representative competitor price (${usd(REP_STATS.median)})` },
  { id: "premium", label: "Premium", price: PREMIUM_PRESET, basis: `Nearest $.99 price point above Q3 of the 11 researched offers (${usd(ALL_QUARTILES.q3)})` },
] as const;

/** Starting price for the explorer: midpoint of the Mission 1 preliminary range. */
export const START_PRICE = (REC.tentative_range_min + REC.tentative_range_max) / 2;
export const SLIDER_MIN = Math.max(1, Math.floor(ALL_STATS.min - 5));
export const SLIDER_MAX = Math.ceil(ALL_STATS.max + 11);
