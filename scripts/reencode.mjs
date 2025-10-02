import { readFileSync, writeFileSync } from "fs";
import path from "path";

const target = path.join(process.cwd(), "scripts", "cofounder-snapshots", "index-main.processed.jsx");
const buffer = readFileSync(target);
const utf8 = buffer.toString("utf16le");
writeFileSync(target, utf8, "utf8");
console.log("Re-encoded processed JSX to UTF-8.");
