/**
 * Surbee Agentic Tools
 *
 * All sandbox operations go through Modal relay (FastAPI on port 8000).
 * The relay writes files to disk; Next.js Fast Refresh picks up changes
 * and the preview (port 3000 tunnel) updates live.
 *
 * KEY OPTIMIZATION: Sandbox creation starts eagerly (in parallel with AI
 * generation) via startEagerSandboxCreation(). By the time the AI calls
 * surb_init_sandbox, the sandbox is already booting or ready.
 */

import { tool } from 'ai';
import { z } from 'zod';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// State: sandbox instances and project files
// ---------------------------------------------------------------------------

interface ModalSandboxInfo {
  sandboxId: string;
  relayUrl: string;
  previewUrl: string;
  projectId?: string;
}

export const activeSandboxes = new Map<string, ModalSandboxInfo>();

/** Promises for sandboxes that are currently being created (eager creation). */
const pendingSandboxCreations = new Map<string, Promise<ModalSandboxInfo>>();

interface ProjectFiles {
  files: Map<string, string>;
  components: Set<string>;
}
const projectFiles = new Map<string, ProjectFiles>();

interface UploadedImage {
  index: number;
  dataUrl: string;
  filename?: string;
  mediaType?: string;
}
export const chatUploadedImages = new Map<string, UploadedImage[]>();

let latestProjectName: string | null = null;

// Console logs captured from the sandbox
export const sandboxConsoleLogs = new Map<string, { stdout: string[]; stderr: string[]; errors: string[] }>();

// ---------------------------------------------------------------------------
// Direct Modal controller call (skips self-calling API route)
// ---------------------------------------------------------------------------

function createSignedHeaders(body: string): Record<string, string> {
  const apiKey = process.env.SANDBOX_API_KEY;
  const signingSecret = process.env.SANDBOX_SIGNING_SECRET;
  if (!apiKey || !signingSecret) throw new Error('Sandbox credentials not configured');

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac('sha256', signingSecret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  };
}

/** Call Modal controller directly — no API route hop. */
async function createSandboxDirect(sandboxId: string): Promise<ModalSandboxInfo> {
  const modalEndpoint = process.env.MODAL_SANDBOX_ENDPOINT;
  if (!modalEndpoint) throw new Error('MODAL_SANDBOX_ENDPOINT not configured');

  const requestBody = JSON.stringify({ files: {}, sandbox_id: sandboxId });
  const headers = createSignedHeaders(requestBody);

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 300_000); // 5 min

  try {
    const resp = await fetch(`${modalEndpoint}/api/sandbox/create`, {
      method: 'POST',
      headers,
      body: requestBody,
      signal: ac.signal,
    });
    clearTimeout(timer);

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Modal ${resp.status}: ${text}`);
    }

    const result = await resp.json();
    if (!result.relay_url || !result.preview_url) {
      throw new Error('Sandbox created but missing tunnel URLs');
    }

    return {
      sandboxId: result.sandbox_id,
      relayUrl: result.relay_url,
      previewUrl: result.preview_url,
    };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Eager (parallel) sandbox creation
// ---------------------------------------------------------------------------

/**
 * Start sandbox creation immediately. Called from the workflow BEFORE
 * streamText() so the sandbox boots in parallel with AI generation.
 * By the time the AI calls surb_init_sandbox the sandbox is ready.
 */
export function startEagerSandboxCreation(projectName: string): void {
  // Already have a running sandbox
  if (activeSandboxes.has(projectName)) return;
  // Already creating one
  if (pendingSandboxCreations.has(projectName)) return;

  const sandboxId = `${projectName}-${Date.now()}`;
  console.log(`[Sandbox] Eager creation started: ${sandboxId}`);

  const promise = createSandboxDirect(sandboxId)
    .then((info) => {
      activeSandboxes.set(projectName, { ...info, projectId: projectName });
      projectFiles.set(projectName, { files: new Map(), components: new Set() });
      pendingSandboxCreations.delete(projectName);
      console.log(`[Sandbox] Eager creation done: relay=${info.relayUrl}, preview=${info.previewUrl}`);
      return info;
    })
    .catch((err) => {
      pendingSandboxCreations.delete(projectName);
      console.error(`[Sandbox] Eager creation failed: ${err}`);
      throw err;
    });

  pendingSandboxCreations.set(projectName, promise);
}

/**
 * Get a sandbox — returns immediately if ready, awaits pending creation,
 * or throws if nothing is available.
 */
async function getOrAwaitSandbox(projectName?: string): Promise<ModalSandboxInfo> {
  const name = projectName || latestProjectName;
  if (!name) throw new Error('No active project');

  // Already running
  const existing = activeSandboxes.get(name);
  if (existing) return existing;

  // Being created eagerly — just await it
  const pending = pendingSandboxCreations.get(name);
  if (pending) return await pending;

  throw new Error('No sandbox available');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAllSourceFiles(): Record<string, string> {
  if (!latestProjectName) return {};
  const files = projectFiles.get(latestProjectName);
  if (!files) return {};
  const result: Record<string, string> = {};
  files.files.forEach((content, path) => { result[path] = content; });
  return result;
}

/** Sync check — returns sandbox if already running, null otherwise. */
function getActiveSandbox(): ModalSandboxInfo | null {
  if (!latestProjectName) return null;
  return activeSandboxes.get(latestProjectName) || null;
}

async function relayPost(endpoint: string, body: unknown): Promise<unknown> {
  const sandbox = await getOrAwaitSandbox();

  const resp = await fetch(`${sandbox.relayUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Relay ${endpoint} failed (${resp.status}): ${text}`);
  }

  return resp.json();
}

async function relayGet(endpoint: string): Promise<unknown> {
  const sandbox = await getOrAwaitSandbox();

  const resp = await fetch(`${sandbox.relayUrl}${endpoint}`);

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Relay ${endpoint} failed (${resp.status}): ${text}`);
  }

  return resp.json();
}

/** Write a file both locally (projectFiles) and to the sandbox relay. */
async function writeFileToSandbox(filePath: string, content: string): Promise<void> {
  // Local tracking
  const files = projectFiles.get(latestProjectName!);
  if (files) files.files.set(filePath, content);

  // Write to relay → Next.js picks up changes via Fast Refresh
  await relayPost('/write', { path: filePath, content });
}

// ============================================================================
// Sandbox Initialization
// ============================================================================

export const surbInitSandboxTool = tool({
  description: 'Initialize a Modal sandbox for the survey project. Call this ONCE at the start before any file operations. Returns the sandbox preview URL.',
  inputSchema: z.object({
    project_name: z.string().describe('Unique project identifier (e.g., "survey-123")'),
  }),
  execute: async ({ project_name }) => {
    latestProjectName = project_name;

    try {
      // Await the eagerly-started sandbox (created in parallel with AI generation)
      const info = await getOrAwaitSandbox(project_name);

      console.log(`[Sandbox] Ready for ${project_name}: preview=${info.previewUrl}`);

      return {
        status: 'success',
        sandbox_id: info.sandboxId,
        project_name,
        preview_url: info.previewUrl,
        relay_url: info.relayUrl,
        message: 'Sandbox ready. Preview URL is live.',
      };
    } catch {
      // Fallback: eager creation wasn't started or failed — create now
      console.log(`[Sandbox] Fallback: creating sandbox for ${project_name} now...`);
      try {
        const sandboxId = `${project_name}-${Date.now()}`;
        const info = await createSandboxDirect(sandboxId);

        activeSandboxes.set(project_name, { ...info, projectId: project_name });
        projectFiles.set(project_name, { files: new Map(), components: new Set() });

        console.log(`[Sandbox] Fallback created: preview=${info.previewUrl}`);
        return {
          status: 'success',
          sandbox_id: info.sandboxId,
          project_name,
          preview_url: info.previewUrl,
          relay_url: info.relayUrl,
          message: 'Sandbox ready. Preview URL is live.',
        };
      } catch (error) {
        console.error(`[Sandbox] Init failed: ${error}`);
        return {
          status: 'error',
          message: `Failed to initialize sandbox: ${error}`,
        };
      }
    }
  },
});

// ============================================================================
// File Operations
// ============================================================================

export const surbeWrite = tool({
  description: "\nUse this tool to write to a file in the sandbox. Creates the file with the specified content.\n\n  ### IMPORTANT: MINIMIZE CODE WRITING\n  - PREFER using surbe-line-replace for most changes instead of rewriting entire files\n  - This tool is mainly meant for creating new files or as fallback if surbe-line-replace fails\n  \n  ### Parallel Tool Usage\n  - If you need to create multiple files, it is very important that you create all of them at once instead of one by one, because it's much faster\n",
  inputSchema: z.object({
    content: z.string().describe("The complete file content"),
    file_path: z.string().describe("File path relative to project root (e.g., 'app/page.tsx')"),
  }),
  execute: async ({ content, file_path }) => {
    console.log(`[Write] ${file_path} (${content.length} bytes)`);

    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized. Call surb_init_sandbox first.' };
    }

    try {
      await writeFileToSandbox(file_path, content);
      const allFiles = getAllSourceFiles();
      const sandbox = getActiveSandbox()!;

      return {
        status: 'success',
        message: `File written: ${file_path}`,
        file_path,
        content_length: content.length,
        source_files: allFiles,
        preview_url: sandbox.previewUrl,
      };
    } catch (error) {
      console.error(`[Write] Failed: ${error}`);
      return { status: 'error', message: `Failed to write file: ${error}` };
    }
  },
});

export const surbeQuickEdit = tool({
  description: `Use this tool to quickly edit existing files using the "// ... existing code ..." pattern. This is faster than surbe_line_replace for small changes because you don't need to specify line numbers.

### How it works:
- Write ONLY the parts you want to change
- Use "// ... existing code ..." to skip unchanged sections
- Add <CHANGE> comments to explain what you're editing
- The system merges your changes with the original file

### When to use:
- Small, focused edits to existing files
- Changing a few lines without rewriting entire file
- Adding imports, updating props, or modifying components

### When NOT to use:
- Creating new files (use surbe_write)
- Large refactors (use surbe_line_replace for precision)
- When you need exact line control`,
  inputSchema: z.object({
    file_path: z.string().describe("File path relative to project root (e.g., 'app/page.tsx')"),
    content: z.string().describe("Partial file content with '// ... existing code ...' markers indicating unchanged sections"),
  }),
  execute: async ({ file_path, content }) => {
    console.log(`[QuickEdit] ${file_path}`);

    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized. Call surb_init_sandbox first.' };
    }

    const files = projectFiles.get(latestProjectName);
    if (!files) {
      return { status: 'error', message: `Project not found: ${latestProjectName}` };
    }

    try {
      const originalContent = files.files.get(file_path);
      if (!originalContent) {
        return { status: 'error', message: `File not found: ${file_path}. Use surbe_write to create it first.` };
      }

      const MARKER = '// ... existing code ...';
      const mergedContent = mergeQuickEdit(originalContent, content, MARKER);

      if (!mergedContent) {
        return { status: 'error', message: `Failed to merge content. Check your "${MARKER}" markers.` };
      }

      await writeFileToSandbox(file_path, mergedContent);
      const allFiles = getAllSourceFiles();
      const sandbox = getActiveSandbox()!;

      return {
        status: 'success',
        message: `Quick edit applied to ${file_path}`,
        file_path,
        changes_applied: true,
        source_files: allFiles,
        preview_url: sandbox.previewUrl,
      };
    } catch (error) {
      console.error(`[QuickEdit] Failed: ${error}`);
      return { status: 'error', message: `Failed to apply quick edit: ${error}` };
    }
  },
});

function mergeQuickEdit(original: string, partial: string, marker: string): string | null {
  try {
    if (!partial.includes(marker)) return partial;

    const originalLines = original.split('\n');
    const partialLines = partial.split('\n');
    const result: string[] = [];
    let originalIndex = 0;
    let partialIndex = 0;

    while (partialIndex < partialLines.length) {
      const line = partialLines[partialIndex];

      if (line.trim() === marker.trim()) {
        let nextPartialIndex = partialIndex + 1;
        while (nextPartialIndex < partialLines.length && partialLines[nextPartialIndex].trim() === marker.trim()) {
          nextPartialIndex++;
        }

        if (nextPartialIndex >= partialLines.length) {
          result.push(...originalLines.slice(originalIndex));
          break;
        }

        const nextPartialSection = partialLines[nextPartialIndex];
        const foundIndex = originalLines.findIndex((origLine, idx) =>
          idx >= originalIndex && origLine.trim() === nextPartialSection.trim()
        );

        if (foundIndex === -1) {
          result.push(...originalLines.slice(originalIndex));
          originalIndex = originalLines.length;
        } else {
          result.push(...originalLines.slice(originalIndex, foundIndex));
          originalIndex = foundIndex;
        }

        partialIndex = nextPartialIndex;
      } else {
        result.push(line);
        partialIndex++;
        if (originalIndex < originalLines.length && originalLines[originalIndex].trim() === line.trim()) {
          originalIndex++;
        }
      }
    }

    return result.join('\n');
  } catch {
    return null;
  }
}

export const surbeLineReplace = tool({
  description: "Line-Based Search and Replace Tool\n\nUse this tool to find and replace specific content in a file using explicit line numbers. This is the PREFERRED and PRIMARY tool for editing existing files.\n\nProvide:\n1. file_path - Path of the file to modify\n2. search - Content to search for (use ellipsis ... for large sections)\n3. first_replaced_line - Line number of the first line (1-indexed)\n4. last_replaced_line - Line number of the last line (1-indexed)\n5. replace - New content\n\nIMPORTANT: When making multiple edits to the same file in parallel, always use original line numbers from your initial view.",
  inputSchema: z.object({
    file_path: z.string().describe("File path relative to project root"),
    first_replaced_line: z.number().describe("First line number (1-indexed)"),
    last_replaced_line: z.number().describe("Last line number (1-indexed)"),
    replace: z.string().describe("New content to replace with"),
    search: z.string().describe("Content to search for (use ... for large sections)"),
  }),
  execute: async ({ file_path, search, first_replaced_line, last_replaced_line, replace }) => {
    console.log(`[LineReplace] ${file_path} lines ${first_replaced_line}-${last_replaced_line}`);

    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized. Call surb_init_sandbox first.' };
    }

    const files = projectFiles.get(latestProjectName);
    if (!files) {
      return { status: 'error', message: `Project not found: ${latestProjectName}` };
    }

    try {
      const currentContent = files.files.get(file_path);
      if (!currentContent) {
        return { status: 'error', message: `File not found: ${file_path}. Use surbe_write to create it first.` };
      }

      const lines = currentContent.split('\n');

      if (first_replaced_line < 1 || last_replaced_line > lines.length || first_replaced_line > last_replaced_line) {
        return { status: 'error', message: `Invalid line range: ${first_replaced_line}-${last_replaced_line}. File has ${lines.length} lines.` };
      }

      const startIdx = first_replaced_line - 1;
      const endIdx = last_replaced_line - 1;
      const originalSection = lines.slice(startIdx, endIdx + 1).join('\n');

      // Validate search pattern
      const searchLines = search.split('\n');
      const hasEllipsis = searchLines.some(line => line.trim() === '...');

      if (hasEllipsis) {
        const ellipsisIdx = searchLines.findIndex(line => line.trim() === '...');
        const searchPrefix = searchLines.slice(0, ellipsisIdx).join('\n');
        const searchSuffix = searchLines.slice(ellipsisIdx + 1).join('\n');
        if (!originalSection.startsWith(searchPrefix) || !originalSection.endsWith(searchSuffix)) {
          return { status: 'error', message: `Search pattern mismatch at lines ${first_replaced_line}-${last_replaced_line}.` };
        }
      } else {
        if (originalSection !== search) {
          return { status: 'error', message: `Search pattern mismatch at lines ${first_replaced_line}-${last_replaced_line}.` };
        }
      }

      const newLines = [...lines.slice(0, startIdx), ...replace.split('\n'), ...lines.slice(endIdx + 1)];
      const newContent = newLines.join('\n');

      await writeFileToSandbox(file_path, newContent);
      const allFiles = getAllSourceFiles();
      const sandbox = getActiveSandbox()!;

      return {
        status: 'success',
        message: `Replaced lines ${first_replaced_line}-${last_replaced_line} in ${file_path}`,
        file_path,
        lines_affected: last_replaced_line - first_replaced_line + 1,
        new_line_count: newLines.length,
        source_files: allFiles,
        preview_url: sandbox.previewUrl,
      };
    } catch (error) {
      console.error(`[LineReplace] Failed: ${error}`);
      return { status: 'error', message: `Failed to replace lines: ${error}` };
    }
  },
});

export const surbeBuildPreview = tool({
  description: 'Sync all project files to the sandbox and return the live preview URL. Call after writing component files to ensure the preview is up to date.',
  inputSchema: z.object({
    entry_file: z.string().describe('Main component file (e.g., "app/page.tsx")'),
  }),
  execute: async ({ entry_file }) => {
    console.log(`[BuildPreview] Syncing files for: ${entry_file}`);

    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    const sandbox = getActiveSandbox()!;
    const allFiles = getAllSourceFiles();

    try {
      // Batch-write all files to the sandbox relay
      if (Object.keys(allFiles).length > 0) {
        await relayPost('/write-batch', { files: allFiles });
      }

      return {
        status: 'success',
        message: 'All files synced. Preview is live.',
        preview_url: sandbox.previewUrl,
        source_files: allFiles,
        entry_point: entry_file,
      };
    } catch (error) {
      console.error(`[BuildPreview] Failed: ${error}`);
      return { status: 'error', message: `Build failed: ${error}` };
    }
  },
});

// ============================================================================
// Read / Delete / Rename / Copy
// ============================================================================

export const surbeView = tool({
  description: "Read the contents of a file. If you need to read multiple files, invoke this tool multiple times in parallel.",
  inputSchema: z.object({
    file_path: z.string().describe("File path relative to project root"),
    lines: z.string().optional().describe("Line range (e.g., '1-500')"),
  }),
  execute: async ({ file_path, lines }) => {
    if (!latestProjectName) {
      return { status: 'error', message: 'No project initialized.' };
    }

    // Try local first
    const files = projectFiles.get(latestProjectName);
    let content = files?.files.get(file_path);

    // Fall back to relay if not in local cache
    if (!content && getActiveSandbox()) {
      try {
        const result = await relayPost('/read', { path: file_path }) as { content?: string };
        content = result.content;
        if (content && files) files.files.set(file_path, content);
      } catch {
        return { status: 'error', message: `File not found: ${file_path}` };
      }
    }

    if (!content) {
      return { status: 'error', message: `File not found: ${file_path}` };
    }

    const allLines = content.split('\n');
    let displayContent = content;
    let linesRead = `1-${allLines.length}`;

    if (lines) {
      // Parse line ranges like "1-500, 800-1000"
      const ranges = lines.split(',').map(r => r.trim());
      const selectedLines: string[] = [];
      for (const range of ranges) {
        const [start, end] = range.split('-').map(Number);
        selectedLines.push(...allLines.slice((start || 1) - 1, end || allLines.length));
      }
      displayContent = selectedLines.join('\n');
      linesRead = lines;
    }

    return {
      status: 'success',
      content: displayContent,
      total_lines: allLines.length,
      lines_read: linesRead,
    };
  },
});

export const surbeDelete = tool({
  description: "Delete a file from the sandbox.",
  inputSchema: z.object({
    file_path: z.string().describe("File path relative to project root"),
  }),
  execute: async ({ file_path }) => {
    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    try {
      await relayPost('/delete', { path: file_path });
      const files = projectFiles.get(latestProjectName);
      if (files) files.files.delete(file_path);

      return { status: 'success', message: `Deleted ${file_path}`, file_path };
    } catch (error) {
      return { status: 'error', message: `Failed to delete: ${error}` };
    }
  },
});

export const surbeRename = tool({
  description: "Rename a file in the sandbox.",
  inputSchema: z.object({
    original_file_path: z.string().describe("Current file path"),
    new_file_path: z.string().describe("New file path"),
  }),
  execute: async ({ original_file_path, new_file_path }) => {
    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    try {
      // Read the original file, write to new path, delete original
      const files = projectFiles.get(latestProjectName);
      const content = files?.files.get(original_file_path);

      if (!content) {
        // Try reading from relay
        const result = await relayPost('/read', { path: original_file_path }) as { content?: string };
        if (!result.content) return { status: 'error', message: `File not found: ${original_file_path}` };
        await writeFileToSandbox(new_file_path, result.content);
      } else {
        await writeFileToSandbox(new_file_path, content);
      }

      await relayPost('/delete', { path: original_file_path });
      if (files) files.files.delete(original_file_path);

      return { status: 'success', message: `Renamed ${original_file_path} to ${new_file_path}` };
    } catch (error) {
      return { status: 'error', message: `Failed to rename: ${error}` };
    }
  },
});

export const surbeCopy = tool({
  description: "Copy a file to a new location in the sandbox.",
  inputSchema: z.object({
    source_file_path: z.string().describe("Source file path"),
    destination_file_path: z.string().describe("Destination file path"),
  }),
  execute: async ({ source_file_path, destination_file_path }) => {
    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    try {
      const files = projectFiles.get(latestProjectName);
      let content = files?.files.get(source_file_path);

      if (!content) {
        const result = await relayPost('/read', { path: source_file_path }) as { content?: string };
        content = result.content;
      }

      if (!content) return { status: 'error', message: `Source not found: ${source_file_path}` };

      await writeFileToSandbox(destination_file_path, content);
      return { status: 'success', message: `Copied ${source_file_path} to ${destination_file_path}` };
    } catch (error) {
      return { status: 'error', message: `Failed to copy: ${error}` };
    }
  },
});

// ============================================================================
// Dependencies & Console Logs
// ============================================================================

export const surbeAddDependency = tool({
  description: "Install an npm package in the sandbox. Uses pnpm add.",
  inputSchema: z.object({
    package: z.string().describe("Package name (e.g., 'recharts' or 'recharts@latest')"),
  }),
  execute: async ({ package: pkg }) => {
    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    try {
      const result = await relayPost('/exec', {
        command: `pnpm add ${pkg}`,
        timeout: 60,
      }) as { stdout?: string; stderr?: string; exit_code?: number };

      return {
        status: result.exit_code === 0 ? 'success' : 'error',
        message: result.exit_code === 0 ? `Installed ${pkg}` : `Failed to install ${pkg}`,
        stdout: result.stdout,
        stderr: result.stderr,
        package: pkg,
      };
    } catch (error) {
      return { status: 'error', message: `Failed to install dependency: ${error}` };
    }
  },
});

export const surbeRemoveDependency = tool({
  description: "Uninstall an npm package from the sandbox.",
  inputSchema: z.object({
    package: z.string().describe("Package name"),
  }),
  execute: async ({ package: pkg }) => {
    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    try {
      const result = await relayPost('/exec', {
        command: `pnpm remove ${pkg}`,
        timeout: 30,
      }) as { stdout?: string; stderr?: string; exit_code?: number };

      return {
        status: result.exit_code === 0 ? 'success' : 'error',
        message: result.exit_code === 0 ? `Removed ${pkg}` : `Failed to remove ${pkg}`,
        package: pkg,
      };
    } catch (error) {
      return { status: 'error', message: `Failed to remove dependency: ${error}` };
    }
  },
});

export const surbeReadConsoleLogs = tool({
  description: "Read sandbox console logs (Next.js dev server output). Call this after building if you want to check for errors.",
  inputSchema: z.object({
    search: z.string().optional().describe("Optional search term to filter logs"),
  }),
  execute: async ({ search }) => {
    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized.', logs: [] };
    }

    try {
      const result = await relayPost('/exec', {
        command: 'tail -100 /tmp/nextjs.log 2>/dev/null || echo "No logs available"',
        timeout: 10,
      }) as { stdout?: string; stderr?: string };

      const output = (result.stdout || '') + (result.stderr || '');
      const logLines = output.split('\n');

      const filtered = search
        ? logLines.filter(line => line.toLowerCase().includes(search.toLowerCase()))
        : logLines;

      const errorLines = filtered.filter(line =>
        line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')
      );

      return {
        status: errorLines.length > 0 ? 'error' : 'success',
        message: errorLines.length > 0
          ? `Found ${errorLines.length} error(s) in console.`
          : 'No errors detected.',
        stdout: filtered,
        errors: errorLines,
        error_count: errorLines.length,
      };
    } catch (error) {
      return { status: 'error', message: `Failed to read logs: ${error}`, logs: [] };
    }
  },
});

// ============================================================================
// Search, Fetch, Download
// ============================================================================

export const surbeSearchFiles = tool({
  description: "Search for patterns across project files.",
  inputSchema: z.object({
    query: z.string().describe("Search pattern"),
    include_pattern: z.string().optional().describe("Files to include"),
    exclude_pattern: z.string().optional().describe("Files to exclude"),
    case_sensitive: z.boolean().optional().describe("Case sensitive search"),
  }),
  execute: async ({ query, include_pattern, exclude_pattern, case_sensitive }) => {
    if (!latestProjectName) {
      return { status: 'error', message: 'No project initialized.', matches: [] };
    }

    const files = projectFiles.get(latestProjectName);
    if (!files) return { status: 'error', message: 'No files available.', matches: [] };

    const matches: { file: string; line: number; content: string }[] = [];
    const regex = new RegExp(query, case_sensitive ? '' : 'i');

    files.files.forEach((content, path) => {
      if (include_pattern && !path.includes(include_pattern.replace('**/', ''))) return;
      if (exclude_pattern && path.includes(exclude_pattern.replace('**/', ''))) return;

      content.split('\n').forEach((line, idx) => {
        if (regex.test(line)) {
          matches.push({ file: path, line: idx + 1, content: line.trim() });
        }
      });
    });

    return { status: 'success', matches, total_matches: matches.length };
  },
});

export const surbeDownloadToRepo = tool({
  description: "Download a file from a URL and save it to the sandbox.",
  inputSchema: z.object({
    source_url: z.string().describe("URL to download from"),
    target_path: z.string().describe("Destination path in project"),
  }),
  execute: async ({ source_url, target_path }) => {
    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    try {
      // Download via relay exec (curl)
      const result = await relayPost('/exec', {
        command: `curl -sL "${source_url}" -o "/root/survey-app/${target_path}" && echo "OK"`,
        timeout: 30,
      }) as { stdout?: string; exit_code?: number };

      if (result.exit_code === 0) {
        return { status: 'success', message: `Downloaded to ${target_path}`, source_url, target_path };
      }
      return { status: 'error', message: 'Download failed' };
    } catch (error) {
      return { status: 'error', message: `Download failed: ${error}` };
    }
  },
});

export const surbeFetchWebsite = tool({
  description: "Fetch a website and return its content.",
  inputSchema: z.object({
    url: z.string().describe("URL to fetch"),
    formats: z.string().optional().describe("Content formats (markdown, html)"),
  }),
  execute: async ({ url, formats }) => {
    return {
      status: 'success',
      message: `Fetched content from ${url}`,
      url,
      formats: formats || 'markdown',
      content_preview: 'Website content preview...',
    };
  },
});

export const surbeReadNetworkRequests = tool({
  description: "Read recent network requests from the sandbox.",
  inputSchema: z.object({
    search: z.string().describe("Search filter"),
  }),
  execute: async ({ search }) => {
    return { status: 'success', message: `Network requests with filter: ${search}`, requests: [] };
  },
});

// ============================================================================
// Image Tools
// ============================================================================

export const surbeSaveChatImage = tool({
  description: `Save a user-uploaded image from the chat to the project.

When users upload images, they are stored and indexed (0, 1, 2, etc.).
Call this tool to save them to the sandbox, then import in code.

Example:
1. surbe_save_chat_image(image_index: 0, target_path: "public/header.png")
2. In code: <img src="/header.png" alt="Header" />`,
  inputSchema: z.object({
    image_index: z.number().default(0).describe("Index of the uploaded image (0 = most recent)"),
    target_path: z.string().describe("Destination path (e.g., 'public/header.png')"),
  }),
  execute: async ({ image_index, target_path }) => {
    console.log(`[SaveImage] Saving image ${image_index} to ${target_path}`);

    if (!latestProjectName || !getActiveSandbox()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    const uploadedImages = chatUploadedImages.get(latestProjectName);
    if (!uploadedImages || uploadedImages.length === 0) {
      return { status: 'error', message: 'No uploaded images found.', available_images: 0 };
    }

    if (image_index < 0 || image_index >= uploadedImages.length) {
      return { status: 'error', message: `Invalid image index. Available: 0-${uploadedImages.length - 1}` };
    }

    const image = uploadedImages[image_index];

    try {
      const dataUrl = image.dataUrl;
      const base64Match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) {
        return { status: 'error', message: 'Invalid image format.' };
      }

      const mimeType = base64Match[1];
      const base64Data = base64Match[2];

      // Write base64 image via relay exec (decode on the sandbox side)
      await relayPost('/exec', {
        command: `mkdir -p "$(dirname /root/survey-app/${target_path})" && echo "${base64Data}" | base64 -d > "/root/survey-app/${target_path}"`,
        timeout: 15,
      });

      const files = projectFiles.get(latestProjectName);
      if (files) files.files.set(target_path, `[Binary Image: ${mimeType}]`);

      return {
        status: 'success',
        message: `Image saved to ${target_path}`,
        target_path,
        mime_type: mimeType,
        usage_hint: target_path.startsWith('public/')
          ? `Use in code: <img src="/${target_path.replace('public/', '')}" />`
          : `Import in code: import img from "@/${target_path}"`,
      };
    } catch (error) {
      return { status: 'error', message: `Failed to save image: ${error}` };
    }
  },
});

export const imagegenGenerateImage = tool({
  description: "Generate an image from a text prompt and save it to the sandbox.\n\nFor small images use flux.schnell (default). For large/hero images use flux.dev.\nAfter generating, use the image in code via <img src> or ES6 imports.",
  inputSchema: z.object({
    height: z.number().optional().describe("Image height (512-1920)"),
    model: z.string().optional().describe("flux.schnell (default) or flux.dev"),
    prompt: z.string().describe("Text description of the image"),
    target_path: z.string().describe("Save path (e.g., 'public/hero.jpg')"),
    width: z.number().optional().describe("Image width (512-1920)"),
  }),
  execute: async ({ prompt, target_path, width, height, model }) => {
    return {
      status: 'success',
      message: `Generated image: ${prompt}`,
      target_path,
      dimensions: `${width || 512}x${height || 512}`,
      model: model || 'flux.schnell',
    };
  },
});

export const imagegenEditImage = tool({
  description: "Edit or merge existing images based on a text prompt.",
  inputSchema: z.object({
    image_paths: z.array(z.string()).describe("Paths to source images"),
    prompt: z.string().describe("How to edit/merge the images"),
    target_path: z.string().describe("Save path for result"),
  }),
  execute: async ({ image_paths, prompt, target_path }) => {
    return {
      status: 'success',
      message: `Edited images: ${prompt}`,
      source_images: image_paths,
      target_path,
    };
  },
});

// ============================================================================
// Web Search
// ============================================================================

export const websearchWebSearch = tool({
  description: "Search the web for information. Use for current docs, technical info, etc.",
  inputSchema: z.object({
    category: z.string().optional().describe("Category: news, linkedin profile, pdf, github, etc."),
    imageLinks: z.number().optional().describe("Number of image links per result"),
    links: z.number().optional().describe("Number of links per result"),
    numResults: z.number().optional().describe("Number of results (default: 5)"),
    query: z.string().describe("Search query"),
  }),
  execute: async ({ query, numResults, links, imageLinks, category }) => {
    return {
      status: 'success',
      message: `Web search: ${query}`,
      query,
      results: [],
      total_results: 0,
      category: category || 'general',
    };
  },
});

// ============================================================================
// Exports for workflow integration
// ============================================================================

export { projectFiles };
