import fs from "fs";
import path from "path";
import ReplicaClient from "./ReplicaClient";

const ASSET_BASE = "https://cofounder.co";

const projectRoot = process.cwd();
const htmlSourcePath = path.join(projectRoot, "..", "view-page-source.com-cofounder.co_.html");
const cssSourcePath = path.join(projectRoot, "..", "cofoundercss.css");

const rawHtml = fs.readFileSync(htmlSourcePath, "utf-8");
const rawCss = fs.readFileSync(cssSourcePath, "utf-8");

const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
const bodyInner = bodyMatch ? bodyMatch[1] : "";

const sanitizedBody = sanitizeBody(bodyInner);
const bodyTagMatch = rawHtml.match(/<body([^>]*)>/i);
const bodyAttributesString = bodyTagMatch ? bodyTagMatch[1] : "";

const bodyAttributesEntries: Array<[string, string]> = [];
bodyAttributesString.replace(/([a-zA-Z0-9:-]+)="([^"]*)"/g, (_, name: string, value: string) => {
  bodyAttributesEntries.push([name, value]);
  return "";
});

const bodyAttributes = bodyAttributesEntries.filter(([name]) => name.length > 0);
const rewrittenCss = absolutizeCssUrls(rawCss);

function sanitizeBody(html: string) {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  const withAbsoluteAssets = absolutizeAttributeUrls(withoutScripts);
  const withAbsoluteSrcsets = absolutizeSrcSets(withAbsoluteAssets);
  return absolutizeInlineStyles(withAbsoluteSrcsets);
}

function absolutizeAttributeUrls(html: string) {
  return html.replace(/\b(src|href|poster)="(\/[^"#][^"]*)"/g, (_, attr: string, url: string) => {
    if (url.startsWith("//")) {
      return `${attr}="https:${url}"`;
    }
    return `${attr}="${ASSET_BASE}${url}"`;
  });
}

function absolutizeSrcSets(html: string) {
  return html.replace(/\bsrcset="([^"]*)"/g, (_, value: string) => {
    const updated = value
      .split(",")
      .map((entry) => {
        const trimmed = entry.trim();
        if (!trimmed) return trimmed;
        const parts = trimmed.split(/\s+/, 2);
        const url = parts[0];
        const descriptor = parts[1];
        if (!url.startsWith("/") || url.startsWith("//")) {
          return trimmed;
        }
        const absoluteUrl = `${ASSET_BASE}${url}`;
        return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl;
      })
      .join(", ");
    return `srcset="${updated}"`;
  });
}

function absolutizeInlineStyles(html: string) {
  return html.replace(/url\((['"]?)(\/[^)'" ]+)\1\)/g, (match, quote: string, url: string) => {
    const q = quote || "";
    if (url.startsWith("//") || url.startsWith("data:")) {
      return `url(${q}${url}${q})`;
    }
    return `url(${q}${ASSET_BASE}${url}${q})`;
  });
}

function absolutizeCssUrls(css: string) {
  return css.replace(/url\((['"]?)(\/[^)'" ]+)\1\)/g, (match, quote: string, url: string) => {
    const q = quote || "";
    if (url.startsWith("//") || url.startsWith("data:")) {
      return `url(${q}${url}${q})`;
    }
    return `url(${q}${ASSET_BASE}${url}${q})`;
  });
}

export default function TestLanding01Page() {
  return (
    <ReplicaClient
      bodyHtml={sanitizedBody}
      css={rewrittenCss}
      bodyAttributes={bodyAttributes}
    />
  );
}
