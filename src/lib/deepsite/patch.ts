export interface PatchMarkers {
  searchStart: string;
  divider: string;
  replaceEnd: string;
}

/**
 * Extract patch blocks from a text that uses markers like:
 * <<<<<<< SEARCH\n...search...\n=======\n...replace...\n>>>>>>> REPLACE
 */
export function extractPatches(text: string, markers: PatchMarkers): Array<{search: string; replace: string}> {
  const blocks: Array<{search: string; replace: string}> = [];
  if (!text) return blocks;
  const { searchStart, divider, replaceEnd } = markers;
  let i = 0;
  while (true) {
    const start = text.indexOf(searchStart, i);
    if (start === -1) break;
    const mid = text.indexOf(divider, start + searchStart.length);
    if (mid === -1) break;
    const end = text.indexOf(replaceEnd, mid + divider.length);
    if (end === -1) break;
    const search = text.slice(start + searchStart.length, mid).replace(/^\s+|\s+$/g, '');
    const replace = text.slice(mid + divider.length, end).replace(/^\s+|\s+$/g, '');
    blocks.push({ search, replace });
    i = end + replaceEnd.length;
  }
  return blocks;
}

/**
 * Apply search/replace patches to the original string. Replaces the first match of each search block.
 */
export function applyPatches(original: string, patches: Array<{search: string; replace: string}>): { html: string; applied: number } {
  let html = original;
  let applied = 0;
  for (const p of patches) {
    const idx = html.indexOf(p.search);
    if (idx !== -1) {
      html = html.slice(0, idx) + p.replace + html.slice(idx + p.search.length);
      applied++;
    }
  }
  return { html, applied };
}

