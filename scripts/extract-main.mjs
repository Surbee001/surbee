import { JSDOM } from "jsdom";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const snapshot = path.join(process.cwd(), "scripts", "cofounder-snapshots", "index.html");
const html = readFileSync(snapshot, "utf8");
const dom = new JSDOM(html);
const main = dom.window.document.querySelector("main");

if (!main) {
  throw new Error("Failed to locate <main> in snapshot");
}

const output = path.join(process.cwd(), "scripts", "cofounder-snapshots", "index-main.html");
writeFileSync(output, main.outerHTML, "utf8");
console.log(`Extracted main to ${output}`);
