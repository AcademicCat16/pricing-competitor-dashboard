/**
 * Qualitative findings transcribed from competitor_analysis.docx (Mission 1 report)
 * and the JSON/workbook fields. Each item records where it comes from.
 * "Documented" = stated in the research; "Inference" = a strategic interpretation the report labels as such.
 */
export type Basis = "Documented" | "Inference";

export interface Insight { title: string; body: string; basis: Basis; source: string }

/** Report §8 "Market Opportunities" — the report labels these as strategic interpretations. */
export const OPPORTUNITIES: (Insight & { icon: "shield" | "ruler" | "gap" | "gift" | "package" })[] = [
  {
    icon: "shield", title: "Durability as a proof point", basis: "Inference", source: "Report §8",
    body: "Faulty snaps were the top defect in the founder's Lolalet review sample (7 of 80); no competitor checked advertises tested closure durability.",
  },
  {
    icon: "ruler", title: "Long necklaces", basis: "Inference", source: "Report §8",
    body: "Whole-chain, adjustable supports could address poor fit for long necklaces, which competitor descriptions rarely address directly.",
  },
  {
    icon: "gap", title: "Price gap between budget and branded cases", basis: "Inference", source: "Report §8",
    body: "Few researched offers sit between about $23 and $48 at regular price (only BAGSMART Crush at $39.99), leaving room for a functional all-in-one organizer.",
  },
  {
    icon: "gift", title: "Personalization & gifting", basis: "Inference", source: "Report §8",
    body: "Mark & Graham charges $17 for a monogram; a lower-cost personalization or gift-ready packaging option could serve the secondary gift-buyer segment.",
  },
  {
    icon: "package", title: "Bundling instead of discounting", basis: "Inference", source: "Report §8",
    body: "BÉIS cross-sells its case into a cosmetic organizer; a small pouch or travel-checklist bundle could raise perceived value without discounting.",
  },
];

/** Report §7 "Verified observations" and "Interpretation". */
export const MARKET_OBSERVATIONS: Insight[] = [
  { title: "Budget tier ($10–$23)", basis: "Documented", source: "Report §7",
    body: "Lolalet ($18.99) and BAGSMART (Dazzling $22.99 sale; Peri $9.99–$18.99): synthetic materials, marketplace-style listings, heavy use of compare-at markdowns at BAGSMART." },
  { title: "Mid-market tier ($30–$48)", basis: "Documented", source: "Report §7",
    body: "BAGSMART Crush ($39.99, regular price) and BÉIS ($48, \"Regular price,\" recycled materials, lifestyle brand)." },
  { title: "Premium tier ($69–$99)", basis: "Documented", source: "Report §7",
    body: "Mark & Graham ($69 Small, $99 Medium, +$17 monogram) and Monos ($95, out of stock). Prices are supported by brand, materials, gifting, and personalization." },
  { title: "One pricing model across the category", basis: "Documented", source: "Report §7",
    body: "Every competitor uses one-time purchase pricing; Mark & Graham adds size tiers and paid personalization; no subscriptions, bundles-for-discount, or freemium models were observed." },
  { title: "Promotions", basis: "Documented", source: "Report §7",
    body: "BAGSMART and Mark & Graham show frequent sale/clearance prices; Lolalet, BÉIS, and Monos showed none on the check date." },
  { title: "Price tracks brand more than features", basis: "Inference", source: "Report §7 Interpretation",
    body: "Budget products already offer snap hooks or necklace straps, while premium cases often offer fewer necklace-specific features. Functional necklace protection alone does not appear to command a premium unless performance is visibly demonstrated." },
];

/** Strengths/limitations per competitor. Facts come from the competitor profile, offer notes or the Sources sheet. */
export const STRENGTHS_WEAKNESSES: Record<string, { strengths: Insight[]; limitations: Insight[] }> = {
  C01: {
    strengths: [
      { title: "Necklace-specific design", basis: "Documented", source: "Competitor profile", body: "12 snap hooks plus elastic strap and clear pendant pocket ('triple-secure')." },
      { title: "Low price, strong ratings", basis: "Documented", source: "Offer P01 notes", body: "$18.99; 4.4/5 stars from 311 ratings at time of check." },
    ],
    limitations: [
      { title: "Snap reliability complaints", basis: "Documented", source: "Competitor profile", body: "7 of 80 reviews in the founder's sample reported faulty snaps." },
      { title: "Necklace-only scope", basis: "Documented", source: "Report §9", body: "Described as a necklace-only organizer, offering less than an all-in-one organizer." },
      { title: "Single channel", basis: "Documented", source: "Research limitations", body: "Only confirmed sales channel is Amazon; no independent brand site was verified." },
    ],
  },
  C02: {
    strengths: [
      { title: "Broad, recognised value line", basis: "Documented", source: "Competitor profile", body: "Three jewelry organizers in multiple formats (binder-style, folding, structured case); also widely sold on Amazon." },
      { title: "Multi-zone organizers", basis: "Documented", source: "Offers P03, P05", body: "Peri has 5 zones incl. a necklace buckled strap; Crush has elastic necklace slots and a removable divider." },
    ],
    limitations: [
      { title: "Promotion-driven pricing", basis: "Documented", source: "Competitor profile", body: "Frequent markdowns from compare-at prices; there is no evidence the compare-at prices were ever charged." },
      { title: "Stock gaps", basis: "Documented", source: "Offers P02–P04", body: "Dazzling 3 of 6 colors in stock; Peri Medium limited stock; Peri Small out of stock." },
    ],
  },
  C03: {
    strengths: [
      { title: "Lifestyle brand appeal", basis: "Documented", source: "Competitor profile", body: "Brand-led design aimed at style-conscious women travelers; recycled plastic bottle material." },
      { title: "Ecosystem & policies", basis: "Documented", source: "Competitor profile", body: "Fits inside the BÉIS Cosmetic Organizer; 45-day returns; TSA-approved claim." },
    ],
    limitations: [
      { title: "Necklace details unspecified", basis: "Documented", source: "Sources sheet", body: "The product description does not specify the number of necklace slots." },
    ],
  },
  C04: {
    strengths: [
      { title: "Gifting & personalization", basis: "Documented", source: "Competitor profile", body: "Monogramming for $17, gift wrapping, many sizes and colors; Small case labeled Best Seller and 'most popular gift'." },
      { title: "Looped necklace clips", basis: "Documented", source: "Offer P08", body: "Medium case uses looped clips so necklaces do not tangle." },
    ],
    limitations: [
      { title: "Premium price point", basis: "Documented", source: "Offers P07–P09", body: "$69 Small / $99 Medium, with personalization adding $17." },
      { title: "Two prices only partially verified", basis: "Documented", source: "Offers P10, P11", body: "Zipper Case ($79) and Sanderson ($29.99 sale) were seen only in listing tiles." },
    ],
  },
  C05: {
    strengths: [
      { title: "Premium modular design", basis: "Documented", source: "Competitor profile", body: "Removable earring and ring panels, removable mini pouch, water- and scratch-resistant vegan leather." },
    ],
    limitations: [
      { title: "No dedicated necklace separation", basis: "Documented", source: "Competitor profile", body: "Necklaces hang over the earring panel — the reason it is classified as an indirect competitor." },
      { title: "Out of stock", basis: "Documented", source: "Offer P12", body: "Both colors showed 'Notify me when available' on the check date." },
    ],
  },
};

/**
 * Feature comparison. Values: "yes" (documented in the research), "no" (research explicitly says absent),
 * "planned" (venture concept, untested), "unknown" (not documented in the research).
 */
export type Cell = "yes" | "no" | "planned" | "unknown";
export const FEATURE_MATRIX: { feature: string; venture: Cell; byCompetitor: Record<string, Cell>; note: string }[] = [
  { feature: "Dedicated necklace separation", venture: "planned",
    byCompetitor: { C01: "yes", C02: "yes", C03: "unknown", C04: "yes", C05: "no" },
    note: "Lolalet snap hooks; BAGSMART Peri strap / Crush slots; M&G Medium looped clips; BÉIS slot count not specified; Monos hangs necklaces over the earring panel." },
  { feature: "Support repeated along the whole chain", venture: "planned",
    byCompetitor: { C01: "unknown", C02: "unknown", C03: "unknown", C04: "unknown", C05: "no" },
    note: "Venture concept feature. Not described for any competitor in the research." },
  { feature: "Pendant pocket", venture: "planned",
    byCompetitor: { C01: "yes", C02: "unknown", C03: "unknown", C04: "unknown", C05: "unknown" },
    note: "Lolalet has a clear pendant pocket." },
  { feature: "Earring storage", venture: "planned",
    byCompetitor: { C01: "unknown", C02: "yes", C03: "yes", C04: "yes", C05: "yes" },
    note: "BAGSMART earring panel/compartments; BÉIS (for earrings); M&G compartments/stud tabs; Monos 8-hole panel." },
  { feature: "Bracelet / bangle storage", venture: "planned",
    byCompetitor: { C01: "unknown", C02: "unknown", C03: "yes", C04: "unknown", C05: "unknown" },
    note: "BÉIS lists bracelets. Venture plans dedicated bracelet storage and a hoops & bangles page." },
  { feature: "Advertised tested closure durability", venture: "planned",
    byCompetitor: { C01: "no", C02: "no", C03: "no", C04: "no", C05: "no" },
    note: "Report §8: no competitor checked advertises tested closure durability. Venture lists it as a development priority (not yet tested)." },
  { feature: "Paid personalization", venture: "unknown",
    byCompetitor: { C01: "unknown", C02: "unknown", C03: "unknown", C04: "yes", C05: "unknown" },
    note: "Mark & Graham monogram +$17. The report suggests testing a personalization add-on (strategic interpretation)." },
];
