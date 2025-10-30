import { DEFAULT_HTML } from '@/lib/deepsite/constants';

/**
 * Compares if the current HTML is the same as the default HTML
 */
export const isTheSameHtml = (currentHtml: string): boolean => {
  const normalize = (html: string): string =>
    html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\s+/g, " ")
      .trim();

  return normalize(DEFAULT_HTML) === normalize(currentHtml);
};

/**
 * Converts HTML tag names to human-readable text
 */
export const htmlTagToText = (tagName: string): string => {
  switch (tagName.toLowerCase()) {
    case "h1":
      return "Heading 1";
    case "h2":
      return "Heading 2";
    case "h3":
      return "Heading 3";
    case "h4":
      return "Heading 4";
    case "h5":
      return "Heading 5";
    case "h6":
      return "Heading 6";
    case "p":
      return "Text Paragraph";
    case "span":
      return "Inline Text";
    case "button":
      return "Button";
    case "input":
      return "Input Field";
    case "select":
      return "Select Dropdown";
    case "textarea":
      return "Text Area";
    case "form":
      return "Form";
    case "table":
      return "Table";
    case "thead":
      return "Table Header";
    case "tbody":
      return "Table Body";
    case "tr":
      return "Table Row";
    case "th":
      return "Table Header Cell";
    case "td":
      return "Table Data Cell";
    case "nav":
      return "Navigation";
    case "header":
      return "Header";
    case "footer":
      return "Footer";
    case "section":
      return "Section";
    case "article":
      return "Article";
    case "aside":
      return "Aside";
    case "div":
      return "Block";
    case "main":
      return "Main Content";
    case "details":
      return "Details";
    case "summary":
      return "Summary";
    case "code":
      return "Code Snippet";
    case "pre":
      return "Preformatted Text";
    case "kbd":
      return "Keyboard Input";
    case "label":
      return "Label";
    case "canvas":
      return "Canvas";
    case "svg":
      return "SVG Graphic";
    case "video":
      return "Video Player";
    case "audio":
      return "Audio Player";
    case "iframe":
      return "Embedded Frame";
    case "link":
      return "Link";
    case "a":
      return "Link";
    case "img":
      return "Image";
    case "ul":
      return "Unordered List";
    case "ol":
      return "Ordered List";
    case "li":
      return "List Item";
    case "blockquote":
      return "Blockquote";
    default:
      return tagName.charAt(0).toUpperCase() + tagName.slice(1);
  }
};

/**
 * Extracts HTML content from a streamed response
 */
export const extractHtmlFromResponse = (response: string): string => {
  // 1) Prefer full document match
  const fullMatch = response.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
  if (fullMatch) return fullMatch[0];

  // 2) Progressive best-effort: start at <!DOCTYPE or <html
  const startIndex = (() => {
    const d = response.lastIndexOf('<!DOCTYPE html>');
    if (d !== -1) return d;
    const h = response.lastIndexOf('<html');
    return h !== -1 ? h : -1;
  })();
  if (startIndex === -1) return '';

  // 3) If we have a safe closer, cut to it
  const safeClosers = ['</body>', '</html>'];
  for (const closer of safeClosers) {
    const idx = response.lastIndexOf(closer);
    if (idx !== -1) {
      return response.slice(startIndex, idx + closer.length);
    }
  }

  // 4) No closers yet — only start updating once we see a <body ...> tag to avoid blank screens
  const snippet = response.slice(startIndex);
  const hasBody = /<body[>\s]/i.test(snippet);
  if (!hasBody) return '';
  return snippet;
};

/**
 * Validates if HTML content is complete and valid
 */
export const isValidHtml = (html: string): boolean => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const errors = doc.getElementsByTagName('parsererror');
    return errors.length === 0 && html.includes('<!DOCTYPE html>') && html.includes('</html>');
  } catch {
    return false;
  }
};

/**
 * Sanitizes HTML content for safe rendering
 */
export const sanitizeHtml = (html: string): string => {
  // Basic sanitization - in production you'd want a more robust solution
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove on* event handlers
};
