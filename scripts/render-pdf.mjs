import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const start = process.env.START_DATE || "2026-03-17";
const title = process.env.TITLE || "薬袋式暗記シート";
const max = process.env.MAX_REVIEW_COUNT || "10";
const guide = process.env.MANUAL_GUIDE || "start-dot";
const page = process.env.SHOW_PAGE_NUMBER || "false";
const gaps = process.env.GAP_DAYS || "1,3,5,8,12,17,20,21,21,21,21,21,21";

const outDir = path.resolve("output");
fs.mkdirSync(outDir, { recursive: true });

const htmlPath = path.resolve("index.html");
const url = new URL(pathToFileURL(htmlPath));

url.searchParams.set("start", start);
url.searchParams.set("title", title);
url.searchParams.set("max", max);
url.searchParams.set("guide", guide);
url.searchParams.set("page", page);
url.searchParams.set("gaps", gaps);
url.searchParams.set("pdf", "1");

const safeDate = start.replaceAll("-", "");
const outPath = path.join(outDir, `memorization_schedule_${safeDate}.pdf`);

const browser = await chromium.launch();
const pageObj = await browser.newPage();

await pageObj.goto(url.toString(), { waitUntil: "load" });
await pageObj.waitForFunction(() => window.__renderDone === true);

await pageObj.pdf({
  path: outPath,
  format: "A4",
  landscape: true,
  printBackground: true,
  margin: {
    top: "0mm",
    right: "0mm",
    bottom: "0mm",
    left: "0mm",
  },
});

await browser.close();
console.log(`saved: ${outPath}`);
