/**
 * End-to-end browser test. Drives a real Chrome against the built site and checks
 * what is actually rendered on screen.
 *
 * Expected numbers are hard-coded from an independent recomputation of competitor_data.json
 * (Python, outside this codebase), so this test does not share code with the app.
 *
 * Usage:
 *   npm run build && npm run preview      (in one terminal)
 *   node tests/e2e.mjs                    (in another)
 *   BASE_URL=https://<user>.github.io/<repo>/ node tests/e2e.mjs   (test the live site)
 * Env: CHROME_PATH to override the browser executable.
 */
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE_URL ?? "http://localhost:4173/venture-pricing-intelligence/";
const CHROME = process.env.CHROME_PATH ?? [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => existsSync(p));
const SHOTS = new URL("./screenshots/", import.meta.url);
const shot = (name) => fileURLToPath(new URL(name, SHOTS)); // decodes %20 etc. correctly
mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`); };

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });
const failedRequests = [];
page.on("requestfailed", (r) => { if (!r.url().includes("fonts.g")) failedRequests.push(r.url()); });
page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("fonts.g")) failedRequests.push(`${r.status()} ${r.url()}`); });

const nav = async (label) => { await page.getByRole("button", { name: label, exact: false }).first().click(); await page.waitForTimeout(350); };
const text = async (sel) => (await page.locator(sel).first().innerText()).trim();
const kpi = async (label) => (await page.locator(".panel", { hasText: label }).first().innerText());

// ---------- Overview ----------
await page.goto(BASE, { waitUntil: "networkidle" });
check("App loads with title", (await page.title()).includes("Pricing Intelligence"));
check("Competitors KPI = 5 (4 direct · 1 indirect)", /Competitors\s+5[\s\S]*4 direct · 1 indirect/.test(await kpi("Competitors")));
check("Pricing records KPI = 12", /\b12\b/.test(await kpi("Pricing records researched")));
check("Comparable products KPI = 11", /\b11\b/.test(await kpi("Comparable products")));
const repKpis = [await kpi("Lowest comparable price"), await kpi("Highest comparable price"), await kpi("Median comparable price"), await kpi("Average comparable price")];
check("Representative min/max/median/mean = $18.99/$99.00/$48.00/$56.80",
  repKpis[0].includes("$18.99") && repKpis[1].includes("$99.00") && repKpis[2].includes("$48.00") && repKpis[3].includes("$56.80"), repKpis.map((k) => k.split("\n")[1]).join(" "));
await page.getByRole("radio", { name: "All offers (n=11)" }).click();
const allKpis = [await kpi("Lowest comparable price"), await kpi("Highest comparable price"), await kpi("Median comparable price"), await kpi("Average comparable price")];
check("All-offer min/max/median/mean = $9.99/$99.00/$39.99/$48.27",
  allKpis[0].includes("$9.99") && allKpis[1].includes("$99.00") && allKpis[2].includes("$39.99") && allKpis[3].includes("$48.27"), allKpis.map((k) => k.split("\n")[1]).join(" "));
check("KPI scope label switches to n=11", allKpis[0].includes("n=11"));
await page.waitForTimeout(900); await page.screenshot({ path: shot("01-overview.png"), fullPage: true });

// ---------- Landscape ----------
await nav("Competitor Landscape");
const cards = () => page.locator("h3", { hasText: /^(Lolalet|BAGSMART|BÉIS|Mark & Graham|Monos)$/ });
check("Landscape shows 5 competitor cards", (await cards().count()) === 5);
await page.getByRole("radio", { name: "Indirect" }).click();
check("Indirect filter → only Monos", (await cards().count()) === 1 && (await cards().first().innerText()) === "Monos");
await page.getByRole("radio", { name: "All" }).click();
await page.getByRole("button", { name: "Premium" }).click();
check("Toggling off Premium tier → 3 cards", (await cards().count()) === 3);
await page.getByRole("button", { name: "Premium" }).click();
await page.getByPlaceholder("Search competitors or products…").fill("crush");
check("Search 'crush' (a non-representative product) → BAGSMART", (await cards().count()) === 1 && (await cards().first().innerText()) === "BAGSMART");
await page.getByPlaceholder("Search competitors or products…").fill("zzzz");
check("Search with no match → empty state", await page.getByText("No competitors match these filters").isVisible());
await page.getByRole("button", { name: "Reset filters" }).click();
await page.locator("select").first().selectOption("price-desc");
check("Sort high→low → Mark & Graham first", (await cards().first().innerText()) === "Mark & Graham");
await page.getByRole("button", { name: "All offers & sources" }).first().click();
check("Expand profile shows all offers incl. add-on", await page.getByText("Add-on · excluded from product stats").isVisible());
await page.getByLabel("Compare").nth(0).check();
await page.getByLabel("Compare").nth(1).check();
check("Compare 2 competitors → side-by-side table", await page.getByText("Side-by-side comparison (2)").isVisible());
await page.waitForTimeout(900); await page.screenshot({ path: shot("02-landscape.png"), fullPage: true });

// ---------- Pricing ----------
await nav("Pricing Comparison");
const tableRows = () => page.locator("table").last().locator("tbody tr");
check("Comparison table lists all 12 records", (await tableRows().count()) === 12);
await page.getByLabel("Show add-on fees").uncheck();
check("Hiding add-on fees → 11 records", (await tableRows().count()) === 11);
await page.getByLabel("Verification").selectOption("Partially Verified");
check("Partially Verified filter → 2 records (P10, P11)", (await tableRows().count()) === 2);
await page.getByLabel("Verification").selectOption("all");
await page.getByLabel("Hide out-of-stock").check();
check("Hide out-of-stock → 9 records (P04, P12 removed)", (await tableRows().count()) === 9);
await page.getByLabel("Hide out-of-stock").uncheck();
await page.getByRole("button", { name: "Current price" }).click(); // already sorted asc → toggles to desc
check("Sorting by price descending → $99.00 first", (await tableRows().first().innerText()).includes("$99.00"));
const regularCellP02 = await page.locator("tr", { hasText: "Dazzling" }).last().innerText();
check("P02 compare-at $33 not shown as regular price", regularCellP02.includes("Not established") && !regularCellP02.includes("$33"));
await page.getByRole("button", { name: /Monos/ }).first().click(); // legend toggle
check("Legend hides Monos from table", (await tableRows().count()) === 10);
await page.getByRole("button", { name: "Show all" }).click();
const svgText = await page.locator("svg").evaluateAll((els) => els.map((e) => e.textContent ?? "").join(" "));
const bars = await page.locator(".recharts-bar-rectangle").count();
check("Charts render (range chart labels + Recharts bars drawn)", svgText.includes("Lolalet") && svgText.includes("Monos") && bars >= 5, `${bars} bars`);
await page.waitForTimeout(900); await page.screenshot({ path: shot("03-pricing.png"), fullPage: true });

// ---------- Explorer ----------
await nav("Price Position Explorer");
const price = () => text('[data-testid="price-display"]');
const position = () => text('[data-testid="position-label"]');
const counts = async () => [await text('[data-testid="count-cheaper"]'), await text('[data-testid="count-comparable"]'), await text('[data-testid="count-pricier"]')].join("/");
check("Explorer starts at $34.00 (preliminary midpoint)", (await price()) === "$34.00");
check("$34.00 → Near the market middle; 2 cheaper / 0 comparable / 3 pricier", (await position()) === "Near the market middle" && (await counts()) === "2/0/3", `${await position()} ${await counts()}`);
await page.getByTestId("preset-lower").click();
check("Lower preset → $19.99, Budget-oriented", (await price()) === "$19.99" && (await position()) === "Budget-oriented", `${await price()} ${await position()}`);
check("At $19.99: Lolalet comparable (±10%), BAGSMART 13% away", (await counts()) === "0/1/4", await counts());
await page.getByTestId("preset-middle").click();
check("Market-middle preset → $48.00, BÉIS comparable", (await price()) === "$48.00" && (await counts()) === "2/1/2", `${await price()} ${await counts()}`);
await page.getByTestId("preset-premium").click();
check("Premium preset → $74.99, Premium-oriented", (await price()) === "$74.99" && (await position()) === "Premium-oriented", `${await price()} ${await position()}`);
const interp = await text('[data-testid="interpretation"]');
check("Interpretation updates (mentions above preliminary range)", interp.includes("above the preliminary range"));
await page.getByRole("radio", { name: "±15%" }).click();
check("Tolerance control changes comparable count at $74.99", (await counts()) === "3/0/2", await counts());
const input = page.getByTestId("price-input");
await input.fill("120"); await input.blur();
check("Typing $120 clamps to $110.00 → Above the researched market", (await price()) === "$110.00" && (await position()) === "Above the researched market", `${await price()} ${await position()}`);
await input.fill("5"); await input.blur();
check("Typing $5 → Below the researched market", (await position()) === "Below the researched market", await position());
await input.fill("34.50"); await input.blur();
check("Exact entry $34.50 accepted", (await price()) === "$34.50");
const slider = page.getByTestId("price-slider");
await slider.focus(); await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight");
check("Keyboard on slider: +2 steps → $35.50", (await price()) === "$35.50", await price());
const ladder = page.locator('svg[aria-label^="Price ladder"]');
const box = await ladder.boundingBox();
await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.5);
const afterClick = await price();
check("Clicking the ladder moves the marker", afterClick !== "$35.50" && parseFloat(afterClick.slice(1)) > 80, afterClick);
await page.getByTestId("preset-middle").click();
await nav("Executive Overview"); await nav("Price Position Explorer");
check("Exploratory price persists across navigation", (await price()) === "$48.00");
await page.waitForTimeout(900); await page.screenshot({ path: shot("04-explorer.png"), fullPage: true });

// ---------- Opportunities ----------
await nav("Competitive Opportunities");
check("Preliminary label present", await page.getByText("Preliminary — Subject to Cost and Demand Analysis").isVisible());
await page.getByRole("tab", { name: /Monos/ }).click();
check("Strengths tab switches competitor (Monos limitation shown)", await page.getByText("No dedicated necklace separation").isVisible());
await page.waitForTimeout(900); await page.screenshot({ path: shot("05-opportunities.png"), fullPage: true });

// ---------- Sources ----------
await nav("Sources & Methodology");
const checksOk = await page.locator('[data-testid="integrity-check"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-ok")));
check("All in-app data integrity checks pass", checksOk.length === 7 && checksOk.every((v) => v === "true"), checksOk.join(","));
const links = await page.locator("a[href^='http']").evaluateAll((as) => as.map((a) => ({ href: a.href, target: a.target, rel: a.rel })));
const badLinks = links.filter((l) => { try { new URL(l.href); } catch { return true; } return l.target !== "_blank" || !l.rel.includes("noopener"); });
check("Source links valid, open in new tab with rel=noopener", links.length >= 12 && badLinks.length === 0, `${links.length} links`);
await page.getByRole("button", { name: /Partially Verified/ }).first().click();
check("Verification filter in source register → 2 rows", (await page.locator("table").last().locator("tbody tr").count()) === 2);
await page.waitForTimeout(900); await page.screenshot({ path: shot("06-sources.png"), fullPage: true });

// ---------- Deep link / refresh ----------
await page.goto(BASE + "#explorer", { waitUntil: "networkidle" });
check("Reload on #explorer opens the Explorer", await page.getByTestId("price-display").isVisible());

// ---------- Mobile ----------
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on("pageerror", (e) => errors.push(`mobile pageerror: ${e.message}`));
for (const id of ["overview", "landscape", "pricing", "explorer", "opportunities", "sources"]) {
  await m.goto(BASE + "#" + id, { waitUntil: "networkidle" });
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`Mobile ${id}: no page-level horizontal overflow`, overflow <= 1, `overflow ${overflow}px`);
  await m.waitForTimeout(900); await m.screenshot({ path: shot(`m-${id}.png`), fullPage: true });
}
await m.goto(BASE, { waitUntil: "networkidle" });
await m.getByRole("button", { name: "Open navigation" }).click();
await m.getByRole("button", { name: /Price Position Explorer/ }).click();
await m.waitForTimeout(400);
check("Mobile drawer navigation works", await m.getByTestId("price-display").isVisible());
await m.getByTestId("preset-premium").click();
check("Mobile preset tap works", (await m.getByTestId("price-display").innerText()) === "$74.99");

check("No runtime errors in console", errors.length === 0, errors.slice(0, 3).join(" | "));
check("No failed asset requests", failedRequests.length === 0, failedRequests.slice(0, 3).join(" | "));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
