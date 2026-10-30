// Full-page screenshots at desktop and phone widths using installed Chrome.
// Usage: node scripts/screenshots.mjs <outDir> [route ...]   (routes without a leading slash,
// e.g. "projects/paletteboard"; none = home). Requires `npm run dev` on port 3000.
import { chromium } from "@playwright/test";

const [, , out, ...routes] = process.argv;
const browser = await chromium.launch({ channel: "chrome" });
const viewports = [
  ["desk", { width: 1280, height: 800 }, false],
  ["phone", { width: 375, height: 812 }, true],
];

for (const [name, viewport, mobile] of viewports) {
  const page = await browser.newPage({ viewport, isMobile: mobile, hasTouch: mobile });
  for (const route of routes.length ? routes : [""]) {
    const path = "/" + route.replace(/^\/+/, "");
    await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const file = `${out}/${name}_${route.replace(/[^a-z0-9]+/gi, "_") || "home"}.png`;
    await page.screenshot({ path: file, fullPage: process.env.FULL !== "0" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(name, path, "horizontal overflow:", overflow, "→", file);
  }
  await page.close();
}
await browser.close();
