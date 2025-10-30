import { JSDOM } from "jsdom";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const snapshotPath = path.join(process.cwd(), "scripts", "cofounder-snapshots", "index-main.html");
const dom = new JSDOM(readFileSync(snapshotPath, "utf8"));
const document = dom.window.document;

const outputDir = path.join(process.cwd(), "public", "testapage", "assets");
mkdirSync(outputDir, { recursive: true });

const baseUrl = "https://cofounder.co";
const images = Array.from(document.querySelectorAll("img"));

const seen = new Set();
const manifest = [];

for (const img of images) {
  const src = img.getAttribute("src");
  if (!src || src.startsWith("data:")) continue;
  if (seen.has(src)) continue;
  seen.add(src);

  let url = new URL(src, baseUrl);
  let fileUrl = url.href;
  let fileName = path.basename(url.pathname);

  if (url.pathname === "/_next/image") {
    const original = url.searchParams.get("url");
    if (!original) continue;
    const decoded = decodeURIComponent(original);
    const originalUrl = new URL(decoded, baseUrl);
    fileUrl = originalUrl.href;
    fileName = path.basename(originalUrl.pathname);
  }

  if (!fileName) continue;

  let finalName = fileName;
  let counter = 1;
  while (manifest.some((entry) => entry.fileName === finalName)) {
    const extIndex = fileName.lastIndexOf(".");
    const name = extIndex > -1 ? fileName.slice(0, extIndex) : fileName;
    const ext = extIndex > -1 ? fileName.slice(extIndex) : "";
    finalName = `${name}-${counter}${ext}`;
    counter += 1;
  }

  manifest.push({ src, fileUrl, fileName: finalName });
}

const download = async ({ fileUrl, fileName }) => {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download ${fileUrl}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(path.join(outputDir, fileName), buffer);
};

for (const asset of manifest) {
  const dst = path.join(outputDir, asset.fileName);
  if (!existsSync(dst)) {
    console.log(`Downloading ${asset.fileUrl} -> ${asset.fileName}`);
    await download(asset);
  }
}

writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Recorded ${manifest.length} assets.`);
