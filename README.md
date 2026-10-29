# Competitive Pricing Intelligence Dashboard — Jewelry / Journey

An interactive competitive-pricing dashboard for **Jewelry / Journey** (working concept name), a travel jewelry organizer venture by Sarah Bielski. It turns the Phase 1 · Mission 1 competitor research into an analytics application. You can explore the market, compare competitors, and test where a tentative selling price would sit among the observed prices.

**Live site:** https://academiccat16.github.io/pricing-competitor-dashboard/

> **Scope.** This covers competitor-oriented pricing only. The dashboard contains **no** cost analysis, break-even, demand curves, elasticity, sales or revenue forecasts, or willingness-to-pay estimates. Those belong to later missions.
>
> **Snapshot, not live data.** All prices were observed once, on **2026-10-27**, and may have changed since.

## Sections

| # | Section | What it does |
|---|---|---|
| 1 | **Executive Overview** | KPI cards (switch between the representative n=5 and all-offer n=11 populations), a Budget / Mid-market / Premium snapshot, a positioning strip, pricing models, and the report's key observations. |
| 2 | **Competitor Landscape** | Profiles you can search, filter (direct / indirect, positioning tier), sort and expand, plus a side-by-side comparison of selected competitors. |
| 3 | **Pricing Comparison** | A. representative price bar chart · B. price-range chart per competitor · C. distribution histogram + dot plot · D. comparison table you can sort and filter. A legend toggles competitors on and off across the charts. |
| 4 | **Price Position Explorer** | A large slider with numeric input; Lower / Market-Middle / Premium presets; a draggable price ladder; live position classification; a comparison against each competitor; and interpretation that updates with the price. |
| 5 | **Competitive Opportunities** | The report's opportunities, competitor strengths and limitations (each tagged *Documented* or *Strategic inference*), the venture feature matrix, and the **Preliminary — Subject to Cost and Demand Analysis** $29–$39 range. |
| 6 | **Sources & Methodology** | Verification legend and counts, a filterable source register with links, limitations, calculation rules, and live data-integrity checks. |

## Data

The research files from Mission 1 sit one folder up (`../competitor_data.json`, `../competitor_research.xlsx`, `../competitor_analysis.docx`).

- **Primary source:** `src/data/competitor_data.json`, a byte-identical copy of the Mission 1 JSON.
- **Derived values:** `src/data/model.ts` computes every statistic from the JSON. When the page loads, it checks those results against the statistics stored in the research file; the results are shown in *Sources & Methodology*.
- **Qualitative findings:** `src/data/insights.ts` holds findings transcribed from the Word report, each tagged with its source and whether it is documented or an inference.
- **Updating:** to update the dashboard, replace `src/data/competitor_data.json` and rebuild. The UI components contain no research data.

### Validated figures

| Measure | Value |
|---|---|
| Competitors | 5 (4 direct, 1 indirect: Monos) |
| Pricing records | 12 |
| Comparable products | 11 (excludes P09, Mark & Graham's $17 monogram add-on) |
| Representative prices (n=5) | min $18.99 · max $99.00 · median $48.00 · mean $56.80 |
| All comparable offers (n=11) | min $9.99 · max $99.00 · median $39.99 · mean $48.27 · Q1 $20.99 · Q3 $74.00 |

### Calculation rules

- **Representative set.** One most-comparable product per competitor, as chosen in Mission 1 (P01, P02, P06, P08, P12). Each competitor counts once.
- **All comparable offers.** Every jewelry-organizer product, including promotional, out-of-stock and partially verified prices.
- **Add-ons excluded.** Add-on charges are excluded from all product statistics and charts.
- **Regular prices.** A regular price is shown only where the research established one. Compare-at / strikethrough prices (BAGSMART $33 and $37; Mark & Graham $49) are never shown as regular prices.
- **Position classification** uses the quartiles of the 11 comparable offers:
  - below $9.99: below the researched market
  - below Q1: budget-oriented
  - Q1 to Q3: near the market middle
  - above Q3: premium-oriented
  - above $99: above the researched market
- **Scenario presets:**
  - Lower: $19.99, the nearest $.99 price point below Q1.
  - Market-Middle: $48.00, the representative median.
  - Premium: $74.99, the nearest $.99 price point above Q3.
  - Start price: $34.00, the midpoint of the preliminary range.
- **"Comparable" band.** In the explorer, "comparable" means within ±10% of a competitor's price by default (adjustable to ±5% or ±15%). This is a display convention, not a research finding.

### Data discrepancies and resolution

The JSON, workbook and report agree on all competitors, prices, flags and statistics. There are two presentational differences:

- **Unchecked availability.** The JSON stores this as `null` for P09–P11, where the workbook says "Not checked". The dashboard shows "Not checked".
- **Representative mean.** The JSON stores it rounded to $56.80; the exact value is $56.796.

## Technology

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Recharts 3 · lucide-react. It is a static site with no backend, API keys or database. Navigation uses URL hashes (`#explorer` and so on), so deep links and page refreshes work on GitHub Pages.

## Run locally

```bash
npm install
npm run dev          # development server
npm run build        # production build into dist/
npm run preview      # serve the production build at http://localhost:4173/pricing-competitor-dashboard/
```

## Test

`tests/e2e.mjs` drives a real Chrome or Edge browser (via `playwright-core`; no browser download needed) through every section. It checks the KPI values, filters, search, sorting, the comparison table, presets, the slider, the ladder, classification, links, deep links, and mobile layout. Expected values were computed independently of the app code.

```bash
npm run build && npm run preview     # terminal 1
npm run test:e2e                     # terminal 2
BASE_URL=https://academiccat16.github.io/pricing-competitor-dashboard/ npm run test:e2e   # test the live site
```

## Deploy

```bash
npm run deploy   # builds, then publishes dist/ to the gh-pages branch
```

GitHub Pages serves the `gh-pages` branch (Settings → Pages → Deploy from a branch → `gh-pages` / root).

## Sources

All competitor sources (official product pages and one Amazon listing, accessed 2026-10-27) are listed with their verification status in the dashboard's *Sources & Methodology* section and in `competitor_data.json`. No competitor logos, product photos or brand claims beyond the research were added.
