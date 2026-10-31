// Renders tools/social-card.html to a 1200x630 PNG for the og:image of a site.
//
//   node tools/social-card.mjs --title gitlab-sync \
//     --tagline "Keep two GitLab instances in sync" \
//     --url boxboxjason.github.io/gitlab-sync \
//     --out ../gitlab-sync/docs/static/images/social.png
//
// Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium).
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    title: { type: "string" },
    tagline: { type: "string", default: "" },
    url: { type: "string", default: "" },
    brand: { type: "string", default: "BoxBoxJason" },
    out: { type: "string" },
  },
});
if (!values.title || !values.out) {
  console.error("usage: social-card.mjs --title <title> [--tagline <text>] [--url <text>] --out <file.png>");
  process.exit(2);
}

const template = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "social-card.html"));
const query = new URLSearchParams({ title: values.title, tagline: values.tagline, url: values.url, brand: values.brand });
template.search = query.toString();

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(template.href);
  await page.screenshot({ path: values.out });
} finally {
  await browser.close();
}
