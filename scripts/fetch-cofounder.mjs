import puppeteer from "puppeteer";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const outputDir = path.join(process.cwd(), "scripts", "cofounder-snapshots");
mkdirSync(outputDir, { recursive: true });

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
const url = "https://cofounder.co/";

console.log(`Fetching ${url}`);
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await delay(2000);
const content = await page.content();
const filePath = path.join(outputDir, "index.html");
writeFileSync(filePath, content, "utf8");

await browser.close();
console.log(`Saved snapshot to ${filePath}`);
