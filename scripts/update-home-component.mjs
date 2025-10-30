import { readFileSync, writeFileSync } from "fs";
import path from "path";

const source = path.join(process.cwd(), "scripts", "cofounder-snapshots", "index-main.processed.jsx");
const target = path.join(process.cwd(), "src", "app", "testapage", "components", "CofounderHome.tsx");

const markup = readFileSync(source, "utf8");
const indented = markup
  .replace(/\r/g, "")
  .split("\n")
  .map((line) => (line.length ? `    ${line}` : ""))
  .join("\n");

const component = `"use client";\n\nexport default function CofounderHome() {\n  return (\n${indented}\n  );\n}\n`;

writeFileSync(target, component, "utf8");
console.log("Updated CofounderHome.tsx");
