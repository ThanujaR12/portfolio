// Reports overlaps between big words and their neighbouring text, and horizontal overflow,
// on /about at several widths. Usage: node scripts/check-overlap.mjs [baseUrl]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const widths = [375, 768, 1024, 1180, 1220, 1280, 1366, 1440, 1920];
const browser = await chromium.launch({ channel: "chrome" });
let problems = 0;
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(base + "/about", { waitUntil: "networkidle" });
  const report = await page.evaluate(() => {
    const out = [];
    const overflowX = document.documentElement.scrollWidth - window.innerWidth;
    if (overflowX > 0) out.push(`page scrolls sideways by ${overflowX}px`);
    // Each Approach row: the word must end before the paragraph starts (when side by side).
    for (const li of document.querySelectorAll("#approach li")) {
      const word = li.querySelector(".fill-word")?.getBoundingClientRect();
      const text = li.querySelector("p:last-child")?.getBoundingClientRect();
      if (!word || !text) continue;
      const sideBySide = Math.abs(word.top - text.top) < word.height;
      if (sideBySide && word.right > text.left - 8) out.push(`"${li.querySelector(".fill-word").textContent}" overlaps its text by ${Math.round(word.right - text.left + 8)}px`);
      if (text.right > window.innerWidth) out.push(`text runs off screen by ${Math.round(text.right - window.innerWidth)}px`);
    }
    // Any giant word wider than its section container.
    for (const w of document.querySelectorAll(".fill-word")) {
      const r = w.getBoundingClientRect();
      const box = w.closest(".max-w-7xl, .max-w-5xl")?.getBoundingClientRect();
      if (box && r.right > box.right + 2) out.push(`"${w.textContent}" sticks out of its section by ${Math.round(r.right - box.right)}px`);
    }
    return out;
  });
  problems += report.length;
  console.log(`${String(width).padStart(4)}px: ${report.length ? report.join(" | ") : "ok"}`);
  await page.close();
}
await browser.close();
process.exit(problems ? 1 : 0);
