import { readFileSync, writeFileSync } from "fs";
import path from "path";
import HTMLtoJSX from "htmltojsx";

const inputPath = path.join(process.cwd(), "scripts", "cofounder-snapshots", "index-main.html");
const outputPath = path.join(process.cwd(), "scripts", "cofounder-snapshots", "index-main.jsx");

const converter = new HTMLtoJSX({ createClass: false });
const html = readFileSync(inputPath, "utf8");
const jsx = converter.convert(html);
writeFileSync(outputPath, jsx, "utf8");
console.log("Converted HTML to JSX via htmltojsx API.");
