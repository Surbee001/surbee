import { readFileSync, writeFileSync } from "fs";
import path from "path";

const jsxPath = path.join(process.cwd(), "scripts", "cofounder-snapshots", "index-main.jsx");
let content = readFileSync(jsxPath, "utf8");

const manifestPath = path.join(process.cwd(), "public", "testapage", "assets", "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const { src, fileName } of manifest) {
  const regex = new RegExp(escapeRegex(src), "g");
  content = content.replace(regex, `/testapage/assets/${fileName}`);
}

content = content
  .replace(/\s+loading=\"[^\"]*\"/g, "")
  .replace(/\s+decoding=\"[^\"]*\"/g, "")
  .replace(/\s+data-nimg=\{[^}]+\}/g, "")
  .replace(/\s+srcSet=\"[^\"]*\"/g, "")
  .replace(/\s+style=\{\{[^}]*\}\}/g, "");

writeFileSync(path.join(process.cwd(), "scripts", "cofounder-snapshots", "index-main.processed.jsx"), content, "utf8");
console.log("Processed JSX written.");
