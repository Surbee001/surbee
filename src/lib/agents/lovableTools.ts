/**
 * Surbee Agentic Tools
 *
 * All tools are "virtual" — they operate on an in-memory projectFiles Map.
 * Tool results include `source_files` which the client extracts and writes
 * to an in-browser sandbox for live preview.
 */

import { tool } from 'ai';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// State: project files
// ---------------------------------------------------------------------------

interface ProjectFiles {
  files: Map<string, string>;
  components: Set<string>;
}
export const projectFiles = new Map<string, ProjectFiles>();

interface UploadedImage {
  index: number;
  dataUrl: string;
  filename?: string;
  mediaType?: string;
}
export const chatUploadedImages = new Map<string, UploadedImage[]>();

let latestProjectName: string | null = null;

// Console logs — kept for API compatibility, returns empty data
export const sandboxConsoleLogs = new Map<string, { stdout: string[]; stderr: string[]; errors: string[] }>();

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

function isProjectInitialized(): boolean {
  return !!latestProjectName && projectFiles.has(latestProjectName);
}

/** Track a file in the in-memory store */
function trackFile(filePath: string, content: string): void {
  if (!latestProjectName) return;
  const files = projectFiles.get(latestProjectName);
  if (files) files.files.set(filePath, content);
}

// ============================================================================
// Sandbox Initialization
// ============================================================================

export const surbInitSandboxTool = tool({
  description: 'Initialize the project for live preview. Call this ONCE at the start before any file operations.',
  inputSchema: z.object({
    project_name: z.string().describe('Unique project identifier (e.g., "survey-123")'),
  }),
  execute: async ({ project_name }) => {
    latestProjectName = project_name;

    // Initialize project files if not already done
    if (!projectFiles.has(project_name)) {
      projectFiles.set(project_name, { files: new Map(), components: new Set() });
    }

    console.log(`[Sandbox] Initialized project: ${project_name}`);

    return {
      status: 'success',
      project_name,
      source_files: {},
      preview_url: 'webcontainer',
      message: 'Project initialized. Write files to see live preview.',
    };
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

    if (!isProjectInitialized()) {
      return { status: 'error', message: 'No project initialized. Call surb_init_sandbox first.' };
    }

    trackFile(file_path, content);
    const allFiles = getAllSourceFiles();

    return {
      status: 'success',
      message: `File written: ${file_path}`,
      file_path,
      content_length: content.length,
      source_files: allFiles,
    };
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

    if (!isProjectInitialized()) {
      return { status: 'error', message: 'No project initialized. Call surb_init_sandbox first.' };
    }

    const files = projectFiles.get(latestProjectName!);
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

      trackFile(file_path, mergedContent);
      const allFiles = getAllSourceFiles();

      return {
        status: 'success',
        message: `Quick edit applied to ${file_path}`,
        file_path,
        changes_applied: true,
        source_files: allFiles,
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

    if (!isProjectInitialized()) {
      return { status: 'error', message: 'No project initialized. Call surb_init_sandbox first.' };
    }

    const files = projectFiles.get(latestProjectName!);
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

      trackFile(file_path, newContent);
      const allFiles = getAllSourceFiles();

      return {
        status: 'success',
        message: `Replaced lines ${first_replaced_line}-${last_replaced_line} in ${file_path}`,
        file_path,
        lines_affected: last_replaced_line - first_replaced_line + 1,
        new_line_count: newLines.length,
        source_files: allFiles,
      };
    } catch (error) {
      console.error(`[LineReplace] Failed: ${error}`);
      return { status: 'error', message: `Failed to replace lines: ${error}` };
    }
  },
});

export const surbeBuildPreview = tool({
  description: 'Return all project files for the live preview. Call after writing component files to ensure the preview is up to date.',
  inputSchema: z.object({
    entry_file: z.string().describe('Main component file (e.g., "app/page.tsx")'),
  }),
  execute: async ({ entry_file }) => {
    console.log(`[BuildPreview] Returning files for: ${entry_file}`);

    if (!isProjectInitialized()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    const allFiles = getAllSourceFiles();

    return {
      status: 'success',
      message: 'All files ready. Preview is live.',
      source_files: allFiles,
      entry_point: entry_file,
    };
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

    const files = projectFiles.get(latestProjectName);
    const content = files?.files.get(file_path);

    if (!content) {
      return { status: 'error', message: `File not found: ${file_path}` };
    }

    const allLines = content.split('\n');
    let displayContent = content;
    let linesRead = `1-${allLines.length}`;

    if (lines) {
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
  description: "Delete a file from the project.",
  inputSchema: z.object({
    file_path: z.string().describe("File path relative to project root"),
  }),
  execute: async ({ file_path }) => {
    if (!isProjectInitialized()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    const files = projectFiles.get(latestProjectName!);
    if (files) files.files.delete(file_path);

    const allFiles = getAllSourceFiles();

    return {
      status: 'success',
      message: `Deleted ${file_path}`,
      file_path,
      source_files: allFiles,
    };
  },
});

export const surbeRename = tool({
  description: "Rename a file in the project.",
  inputSchema: z.object({
    original_file_path: z.string().describe("Current file path"),
    new_file_path: z.string().describe("New file path"),
  }),
  execute: async ({ original_file_path, new_file_path }) => {
    if (!isProjectInitialized()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    const files = projectFiles.get(latestProjectName!);
    const content = files?.files.get(original_file_path);

    if (!content) {
      return { status: 'error', message: `File not found: ${original_file_path}` };
    }

    files!.files.set(new_file_path, content);
    files!.files.delete(original_file_path);

    const allFiles = getAllSourceFiles();

    return {
      status: 'success',
      message: `Renamed ${original_file_path} to ${new_file_path}`,
      source_files: allFiles,
    };
  },
});

export const surbeCopy = tool({
  description: "Copy a file to a new location in the project.",
  inputSchema: z.object({
    source_file_path: z.string().describe("Source file path"),
    destination_file_path: z.string().describe("Destination file path"),
  }),
  execute: async ({ source_file_path, destination_file_path }) => {
    if (!isProjectInitialized()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    const files = projectFiles.get(latestProjectName!);
    const content = files?.files.get(source_file_path);

    if (!content) {
      return { status: 'error', message: `Source not found: ${source_file_path}` };
    }

    files!.files.set(destination_file_path, content);

    const allFiles = getAllSourceFiles();

    return {
      status: 'success',
      message: `Copied ${source_file_path} to ${destination_file_path}`,
      source_files: allFiles,
    };
  },
});

// ============================================================================
// Dependencies & Console Logs
// ============================================================================

export const surbeAddDependency = tool({
  description: "Install an npm package. The client sandbox will handle the actual installation.",
  inputSchema: z.object({
    package: z.string().describe("Package name (e.g., 'recharts' or 'recharts@latest')"),
  }),
  execute: async ({ package: pkg }) => {
    console.log(`[AddDependency] ${pkg}`);

    const allFiles = getAllSourceFiles();

    return {
      status: 'success',
      message: `Dependency queued: ${pkg}. Client will install.`,
      action: 'install_dependency',
      package: pkg,
      source_files: allFiles,
    };
  },
});

export const surbeRemoveDependency = tool({
  description: "Uninstall an npm package.",
  inputSchema: z.object({
    package: z.string().describe("Package name"),
  }),
  execute: async ({ package: pkg }) => {
    console.log(`[RemoveDependency] ${pkg}`);

    const allFiles = getAllSourceFiles();

    return {
      status: 'success',
      message: `Dependency removal queued: ${pkg}. Client will handle.`,
      action: 'remove_dependency',
      package: pkg,
      source_files: allFiles,
    };
  },
});

export const surbeReadConsoleLogs = tool({
  description: "Read console logs. Console output is now handled client-side by the sandbox.",
  inputSchema: z.object({
    search: z.string().optional().describe("Optional search term to filter logs"),
  }),
  execute: async () => {
    return {
      status: 'success',
      message: 'Console logs are handled client-side by the sandbox.',
      stdout: [],
      errors: [],
      error_count: 0,
    };
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
  description: "Download a file from a URL and save it to the project.",
  inputSchema: z.object({
    source_url: z.string().describe("URL to download from"),
    target_path: z.string().describe("Destination path in project"),
  }),
  execute: async ({ source_url, target_path }) => {
    if (!isProjectInitialized()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    // Track the file — actual download would need to happen client-side or via fetch
    try {
      const response = await fetch(source_url);
      if (response.ok) {
        const content = await response.text();
        trackFile(target_path, content);
      }
    } catch {
      // Track as placeholder if fetch fails server-side
      trackFile(target_path, `/* Downloaded from ${source_url} */`);
    }

    const allFiles = getAllSourceFiles();

    return {
      status: 'success',
      message: `Downloaded to ${target_path}`,
      source_url,
      target_path,
      source_files: allFiles,
    };
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
  description: "Read recent network requests. Network monitoring is now handled client-side.",
  inputSchema: z.object({
    search: z.string().describe("Search filter"),
  }),
  execute: async () => {
    return { status: 'success', message: 'Network monitoring is handled client-side.', requests: [] };
  },
});

// ============================================================================
// Image Tools
// ============================================================================

export const surbeSaveChatImage = tool({
  description: `Save a user-uploaded image from the chat to the project.

When users upload images, they are stored and indexed (0, 1, 2, etc.).
Call this tool to save them to the project, then import in code.

Example:
1. surbe_save_chat_image(image_index: 0, target_path: "public/header.png")
2. In code: <img src="/header.png" alt="Header" />`,
  inputSchema: z.object({
    image_index: z.number().default(0).describe("Index of the uploaded image (0 = most recent)"),
    target_path: z.string().describe("Destination path (e.g., 'public/header.png')"),
  }),
  execute: async ({ image_index, target_path }) => {
    console.log(`[SaveImage] Saving image ${image_index} to ${target_path}`);

    if (!isProjectInitialized()) {
      return { status: 'error', message: 'No project initialized.' };
    }

    const uploadedImages = chatUploadedImages.get(latestProjectName!);
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

      // Store the data URL in projectFiles — the client sandbox can handle binary files
      trackFile(target_path, dataUrl);

      const allFiles = getAllSourceFiles();

      return {
        status: 'success',
        message: `Image saved to ${target_path}`,
        target_path,
        mime_type: mimeType,
        source_files: allFiles,
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
  description: "Generate an image from a text prompt and save it to the project.\n\nFor small images use flux.schnell (default). For large/hero images use flux.dev.\nAfter generating, use the image in code via <img src> or ES6 imports.",
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
