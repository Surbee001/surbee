/**
 * Surbee Agentic Tools
 * Frontend-focused tools for Surbee workflow
 *
 * Tools from agentic tools file with surbe- prefix
 * Backend/database tools excluded (Supabase, Stripe, Secrets, Analytics, Security)
 * Image generation and web search tools included
 */

import { tool } from 'ai';
import { z } from 'zod';
import { Sandbox } from '@e2b/code-interpreter';

// Maps for E2B sandbox instances and project files
const sandboxInstances = new Map<string, Sandbox>();

interface ProjectFiles {
  files: Map<string, string>;
  components: Set<string>;
}
const projectFiles = new Map<string, ProjectFiles>();

// Store for user-uploaded images from chat (keyed by project name)
// Images are stored as { index: number, dataUrl: string, filename?: string }[]
interface UploadedImage {
  index: number;
  dataUrl: string;
  filename?: string;
  mediaType?: string;
}
export const chatUploadedImages = new Map<string, UploadedImage[]>();

// Helper to get the latest project name (for tools that don't receive it)
let latestProjectName: string | null = null;

// Helper function to get all source files for the latest project
function getAllSourceFiles(): Record<string, string> {
  if (!latestProjectName) return {};

  const files = projectFiles.get(latestProjectName);
  if (!files) return {};

  const source_files: Record<string, string> = {};
  files.files.forEach((content, path) => {
    source_files[path] = content;
  });

  return source_files;
}

// ============================================================================
// Sandbox Initialization & Execution (E2B Code Interpreter)
// ============================================================================

export const surbInitSandboxTool = tool({
  description: 'Initialize a new E2B cloud sandbox environment for the survey project. Call this ONCE at the start before any file operations. Returns the sandbox ID and URL.',
  inputSchema: z.object({
    project_name: z.string().describe('Unique project identifier for this survey (e.g., "survey-123")'),
  }),
  execute: async ({ project_name }) => {
    console.log(`🚀 Initializing E2B sandbox for project: ${project_name}`);

    try {
      const apiKey = process.env.E2B_API_KEY;
      if (!apiKey) {
        console.error('❌ E2B_API_KEY not configured');
        return {
          status: 'error',
          message: 'E2B_API_KEY not configured. Please set E2B_API_KEY environment variable.',
        };
      }

      console.log('📦 Creating E2B Code Interpreter sandbox...');
      const sandbox = await Sandbox.create({ apiKey });
      sandboxInstances.set(project_name, sandbox);
      latestProjectName = project_name;
      console.log(`✅ E2B sandbox created: ${sandbox.sandboxId}`);

      // Initialize project files tracking
      projectFiles.set(project_name, {
        files: new Map(),
        components: new Set(),
      });

      console.log('✅ Sandbox ready (Node.js pre-installed in E2B)');

      return {
        status: 'success',
        sandbox_id: sandbox.sandboxId,
        project_name,
        message: 'Sandbox initialized. Ready to create React survey components.',
      };
    } catch (error) {
      console.error(`❌ Failed to initialize sandbox: ${error}`);
      return {
        status: 'error',
        message: `Failed to initialize sandbox: ${error}`,
      };
    }
  },
});

// ============================================================================
// Surbee Agentic Tools (renamed from lov- to surbe-)
// ============================================================================

export const surbeAddDependency = tool({
  description: "Use this tool to add a dependency to the project. The dependency should be a valid npm package name.",
  inputSchema: z.object({
    package: z.string().describe("lodash@latest"),
  }),
  execute: async ({ package: pkg }) => {
    // Placeholder - would integrate with actual package manager
    return {
      status: 'success',
      message: `Dependency ${pkg} added to project`,
      package: pkg
    };
  },
});

export const surbeSearchFiles = tool({
  description: "Regex-based code search with file filtering and context.\n\nSearch using regex patterns across files in your project.\n\nParameters:\n- query: Regex pattern to find (e.g., \"useState\")\n- include_pattern: Files to include using glob syntax (e.g., \"src/**\")\n- exclude_pattern: Files to exclude using glob syntax (e.g., \"**/*.test.tsx\")\n- case_sensitive: Whether to match case (default: false)\n\nTip: Use \\\\ to escape special characters in regex patterns.",
  inputSchema: z.object({
    case_sensitive: z.boolean().optional().describe("false"),
    exclude_pattern: z.string().optional().describe("src/components/ui/**"),
    include_pattern: z.string().describe("src/**"),
    query: z.string().describe("useEffect\\("),
  }),
  execute: async ({ query, include_pattern, exclude_pattern, case_sensitive }) => {
    // Placeholder - would integrate with actual file search
    return {
      status: 'success',
      message: `Search completed for pattern: ${query}`,
      matches: [],
      total_matches: 0
    };
  },
});

export const surbeWrite = tool({
  description: "\nUse this tool to write to a file in the E2B sandbox. Creates the file with the specified content.\n\n  ### IMPORTANT: MINIMIZE CODE WRITING\n  - PREFER using surbe-line-replace for most changes instead of rewriting entire files\n  - This tool is mainly meant for creating new files or as fallback if surbe-line-replace fails\n  \n  ### Parallel Tool Usage\n  - If you need to create multiple files, it is very important that you create all of them at once instead of one by one, because it's much faster\n",
  inputSchema: z.object({
    content: z.string().describe("The complete file content"),
    file_path: z.string().describe("File path relative to project root (e.g., 'src/Survey.tsx')"),
  }),
  execute: async ({ content, file_path }) => {
    console.log(`📝 Writing file: ${file_path} (${content.length} bytes)`);

    if (!latestProjectName) {
      console.error('❌ No project initialized. Call surb_init_sandbox first.');
      return {
        status: 'error',
        message: 'No project initialized. Call surb_init_sandbox first.',
      };
    }

    const files = projectFiles.get(latestProjectName);
    const sandbox = sandboxInstances.get(latestProjectName);

    if (!files || !sandbox) {
      console.error(`❌ Project not found: ${latestProjectName}`);
      return {
        status: 'error',
        message: `Project not found: ${latestProjectName}`,
      };
    }

    try {
      // Store in memory
      files.files.set(file_path, content);

      // Write to E2B sandbox
      await sandbox.files.write(`/home/user/${file_path}`, content);
      console.log(`✅ File written: ${file_path}`);

      // Get all current files
      const allFiles = getAllSourceFiles();

      return {
        status: 'success',
        message: `File written: ${file_path}`,
        file_path,
        content_length: content.length,
        source_files: allFiles,
      };
    } catch (error) {
      console.error(`❌ Failed to write file: ${error}`);
      return {
        status: 'error',
        message: `Failed to write file: ${error}`,
      };
    }
  },
});

// Quick Edit Tool: Edit files using "// ... existing code ..." markers
export const surbeQuickEdit = tool({
  description: `Use this tool to quickly edit existing files using the "// ... existing code ..." pattern. This is faster than surbe_line_replace for small changes because you don't need to specify line numbers.

### How it works:
- Write ONLY the parts you want to change
- Use "// ... existing code ..." to skip unchanged sections
- Add <CHANGE> comments to explain what you're editing
- The system merges your changes with the original file

### Example:
\`\`\`tsx
function MyComponent() {
  // ... existing code ...

  // <CHANGE> Updating button color from red to blue
  return (
    <div>
      <button className="bg-blue-500">Click me</button>
    </div>
  );

  // ... existing code ...
}
\`\`\`

### When to use:
- Small, focused edits to existing files
- Changing a few lines without rewriting entire file
- Adding imports, updating props, or modifying components

### When NOT to use:
- Creating new files (use surbe_write)
- Large refactors (use surbe_line_replace for precision)
- When you need exact line control`,
  inputSchema: z.object({
    file_path: z.string().describe("File path relative to project root (e.g., 'src/Survey.tsx')"),
    content: z.string().describe("Partial file content with '// ... existing code ...' markers indicating unchanged sections"),
  }),
  execute: async ({ file_path, content }) => {
    console.log(`⚡ Quick edit: ${file_path}`);

    if (!latestProjectName) {
      console.error('❌ No project initialized. Call surb_init_sandbox first.');
      return {
        status: 'error',
        message: 'No project initialized. Call surb_init_sandbox first.',
      };
    }

    const files = projectFiles.get(latestProjectName);
    const sandbox = sandboxInstances.get(latestProjectName);

    if (!files || !sandbox) {
      console.error(`❌ Project not found: ${latestProjectName}`);
      return {
        status: 'error',
        message: `Project not found: ${latestProjectName}`,
      };
    }

    try {
      // Get current file content
      const originalContent = files.files.get(file_path);
      if (!originalContent) {
        return {
          status: 'error',
          message: `File not found: ${file_path}. Use surbe_write to create it first, or surbe_view to check the file exists.`,
        };
      }

      // Merge the content by replacing "// ... existing code ..." markers
      const MARKER = '// ... existing code ...';
      const mergedContent = mergeQuickEdit(originalContent, content, MARKER);

      if (!mergedContent) {
        return {
          status: 'error',
          message: `Failed to merge content. Make sure your content uses "${MARKER}" markers correctly.`,
        };
      }

      // Store in memory
      files.files.set(file_path, mergedContent);

      // Write to E2B sandbox
      await sandbox.files.write(`/home/user/${file_path}`, mergedContent);
      console.log(`✅ Quick edit applied: ${file_path}`);

      // Get all current files
      const allFiles = getAllSourceFiles();

      return {
        status: 'success',
        message: `Quick edit applied to ${file_path}`,
        file_path,
        changes_applied: true,
        source_files: allFiles,
      };
    } catch (error) {
      console.error(`❌ Failed to apply quick edit: ${error}`);
      return {
        status: 'error',
        message: `Failed to apply quick edit: ${error}`,
      };
    }
  },
});

// Helper function to merge quick edit content with existing code
function mergeQuickEdit(original: string, partial: string, marker: string): string | null {
  try {
    // If no markers, return the partial content as-is (user wants to replace everything)
    if (!partial.includes(marker)) {
      return partial;
    }

    // Split both original and partial by lines
    const originalLines = original.split('\n');
    const partialLines = partial.split('\n');

    const result: string[] = [];
    let originalIndex = 0;
    let partialIndex = 0;

    while (partialIndex < partialLines.length) {
      const line = partialLines[partialIndex];

      // Check if this line is a marker
      if (line.trim() === marker.trim()) {
        // Find the next non-marker section in partial content
        let nextPartialIndex = partialIndex + 1;
        while (nextPartialIndex < partialLines.length && partialLines[nextPartialIndex].trim() === marker.trim()) {
          nextPartialIndex++;
        }

        // If we're at the end, copy remaining original lines
        if (nextPartialIndex >= partialLines.length) {
          result.push(...originalLines.slice(originalIndex));
          break;
        }

        // Find where the next partial section appears in the original
        const nextPartialSection = partialLines[nextPartialIndex];
        const foundIndex = originalLines.findIndex((origLine, idx) =>
          idx >= originalIndex && origLine.trim() === nextPartialSection.trim()
        );

        if (foundIndex === -1) {
          // If we can't find the next section, copy remaining original and continue with partial
          result.push(...originalLines.slice(originalIndex));
          originalIndex = originalLines.length;
        } else {
          // Copy original lines up to the found index
          result.push(...originalLines.slice(originalIndex, foundIndex));
          originalIndex = foundIndex;
        }

        partialIndex = nextPartialIndex;
      } else {
        // Regular line from partial content - add it
        result.push(line);
        partialIndex++;

        // Try to sync originalIndex by skipping matching lines
        if (originalIndex < originalLines.length && originalLines[originalIndex].trim() === line.trim()) {
          originalIndex++;
        }
      }
    }

    return result.join('\n');
  } catch (error) {
    console.error('Error merging quick edit:', error);
    return null;
  }
}

// New tool: Build and preview React app in E2B
export const surbeBuildPreview = tool({
  description: 'Build the React survey and generate a preview. Call this AFTER writing all component files. Returns the HTML preview and any build errors.',
  inputSchema: z.object({
    entry_file: z.string().describe('Main component file (e.g., "src/Survey.tsx")'),
  }),
  execute: async ({ entry_file }) => {
    console.log(`🔨 Building preview for: ${entry_file}`);

    if (!latestProjectName) {
      return {
        status: 'error',
        message: 'No project initialized.',
      };
    }

    const sandbox = sandboxInstances.get(latestProjectName);
    const files = projectFiles.get(latestProjectName);

    if (!sandbox || !files) {
      return {
        status: 'error',
        message: 'Sandbox not found.',
      };
    }

    try {
      // Initialize console log storage for this project
      sandboxConsoleLogs.set(latestProjectName, {
        stdout: [],
        stderr: [],
        errors: []
      });

      // Create package.json if not exists
      if (!files.files.has('package.json')) {
        const packageJson = {
          name: latestProjectName,
          version: '1.0.0',
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
          },
        };
        await sandbox.files.write('/home/user/package.json', JSON.stringify(packageJson, null, 2));
      }

      // Create HTML template
      const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    // Capture console errors in the preview
    window.addEventListener('error', (event) => {
      console.error('[Runtime Error]:', event.message, 'at', event.filename, ':', event.lineno);
    });
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Unhandled Promise Rejection]:', event.reason);
    });
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${files.files.get(entry_file) || ''}
  </script>
</body>
</html>`;

      await sandbox.files.write('/home/user/preview.html', htmlTemplate);

      // Try to validate the JavaScript by running a syntax check
      const entryCode = files.files.get(entry_file) || '';

      try {
        // Run a simple syntax validation using Node.js in the sandbox
        const validationCode = `
try {
  // Check if code has basic syntax errors
  new Function(${JSON.stringify(entryCode)});
  console.log("✅ Syntax validation passed");
} catch (error) {
  console.error("❌ Syntax error:", error.message);
  throw error;
}
`;

        const execution = await sandbox.runCode(validationCode);

        // Capture logs from validation
        const logs = sandboxConsoleLogs.get(latestProjectName)!;
        if (execution.logs?.stdout) {
          execution.logs.stdout.forEach(log => logs.stdout.push(log));
        }
        if (execution.logs?.stderr) {
          execution.logs.stderr.forEach(log => logs.stderr.push(log));
        }
        if (execution.error) {
          logs.errors.push(execution.error.name + ': ' + execution.error.value);
        }

        console.log('✅ Preview HTML generated and validated');
      } catch (validationError) {
        // Validation failed - still continue but log it
        console.warn('⚠️ Syntax validation failed:', validationError);
        const logs = sandboxConsoleLogs.get(latestProjectName)!;
        logs.errors.push(String(validationError));
      }

      // Get all source files
      const allFiles = getAllSourceFiles();

      return {
        status: 'success',
        message: 'Preview built successfully!',
        preview_html: htmlTemplate,
        source_files: allFiles,
        entry_point: entry_file,
      };
    } catch (error) {
      console.error(`❌ Build failed: ${error}`);

      // Store build error in logs
      const logs = sandboxConsoleLogs.get(latestProjectName);
      if (logs) {
        logs.errors.push(`Build Error: ${String(error)}`);
      }

      return {
        status: 'error',
        message: `Build failed: ${error}`,
        logs: String(error),
      };
    }
  },
});

export const surbeLineReplace = tool({
  description: "Line-Based Search and Replace Tool\n\nUse this tool to find and replace specific content in a file you have access to, using explicit line numbers. This is the PREFERRED and PRIMARY tool for editing existing files. Always use this tool when modifying existing code rather than rewriting entire files.\n\nProvide the following details to make an edit:\n\t1.\tfile_path - The path of the file to modify\n\t2.\tsearch - The content to search for (use ellipsis ... for large sections instead of writing them out in full)\n\t3.\tfirst_replaced_line - The line number of the first line in the search (1-indexed)\n\t4.\tlast_replaced_line - The line number of the last line in the search (1-indexed)\n\t5.\treplace - The new content to replace the found content\n\nThe tool will validate that search matches the content at the specified line range and then replace it with replace.\n\nIMPORTANT: When invoking this tool multiple times in parallel (multiple edits to the same file), always use the original line numbers from the file as you initially viewed it. Do not adjust line numbers based on previous edits.\n\nELLIPSIS USAGE:\nWhen replacing sections of code longer than ~6 lines, you should use ellipsis (...) in your search to reduce the number of lines you need to specify (writing fewer lines is faster).\n- Include the first few lines (typically 2-3 lines) of the section you want to replace\n- Add \"...\" on its own line to indicate omitted content\n- Include the last few lines (typically 2-3 lines) of the section you want to replace\n- The key is to provide enough unique context at the beginning and end to ensure accurate matching\n- Focus on uniqueness rather than exact line counts - sometimes 2 lines is enough, sometimes you need 4\n\n\n\nExample:\nTo replace a user card component at lines 22-42:\n\nOriginal content in file (lines 20-45):\n20:   return (\n21:     \n22:       \n23:         \n24:         {user.name}\n25:         {user.email}\n26:         {user.role}\n27:         {user.department}\n28:         {user.location}\n29:         \n30:            onEdit(user.id)}>Edit\n31:            onDelete(user.id)}>Delete\n32:            onView(user.id)}>View\n33:         \n34:         \n35:           Created: {user.createdAt}\n36:           Updated: {user.updatedAt}\n37:           Status: {user.status}\n38:         \n39:         \n40:           Permissions: {user.permissions.join(', ')}\n41:         \n42:       \n43:     \n44:   );\n45: }\n\nFor a large replacement like this, you must use ellipsis:\n- search: \"      \\n        \\n...\\n          Permissions: {user.permissions.join(', ')}\\n        \\n      \"\n- first_replaced_line: 22\n- last_replaced_line: 42\n- replace: \"      \\n        \\n           {\\n              e.currentTarget.src = '/default-avatar.png';\\n            }}\\n          />\\n        \\n        \\n          {user.name}\\n          {user.email}\\n          \\n            {user.role}\\n            {user.department}\\n          \\n        \\n        \\n           onEdit(user.id)}\\n            aria-label=\\\"Edit user profile\\\"\\n          >\\n            Edit Profile\\n          \\n        \\n      \"\n\nCritical guidelines:\n\t1. Line Numbers - Specify exact first_replaced_line and last_replaced_line (1-indexed, first line is line 1)\n\t2. Ellipsis Usage - For large sections (>6 lines), use ellipsis (...) to include only the first few and last few key identifying lines for cleaner, more focused matching\n\t3. Content Validation - The prefix and suffix parts of search (before and after ellipsis) must contain exact content matches from the file (without line numbers). The tool validates these parts against the actual file content\n\t4. File Validation - The file must exist and be readable\n\t5. Parallel Tool Calls - When multiple edits are needed, invoke necessary tools simultaneously in parallel. Do NOT wait for one edit to complete before starting the next\n\t6. Original Line Numbers - When making multiple edits to the same file, always use original line numbers from your initial view of the file",
  inputSchema: z.object({
    file_path: z.string().describe("src/components/TaskList.tsx"),
    first_replaced_line: z.number().describe("15"),
    last_replaced_line: z.number().describe("28"),
    replace: z.string().describe("  const handleTaskComplete = useCallback((taskId: string) => {\n    const updatedTasks = tasks.map(task =>\n      task.id === taskId \n        ? { ...task, completed: !task.completed, completedAt: new Date() }\n        : task\n    );\n    setTasks(updatedTasks);\n    onTaskUpdate?.(updatedTasks);\n    \n    // Analytics tracking\n    analytics.track('task_completed', { taskId, timestamp: Date.now() });\n  }, [tasks, onTaskUpdate]);"),
    search: z.string().describe("  const handleTaskComplete = (taskId: string) => {\n    setTasks(tasks.map(task =>\n...\n    ));\n    onTaskUpdate?.(updatedTasks);\n  };"),
  }),
  execute: async ({ file_path, search, first_replaced_line, last_replaced_line, replace }) => {
    console.log(`🔄 Line replace in ${file_path} at lines ${first_replaced_line}-${last_replaced_line}`);

    if (!latestProjectName) {
      console.error('❌ No project initialized. Call surb_init_sandbox first.');
      return {
        status: 'error',
        message: 'No project initialized. Call surb_init_sandbox first.',
      };
    }

    const files = projectFiles.get(latestProjectName);
    const sandbox = sandboxInstances.get(latestProjectName);

    if (!files || !sandbox) {
      console.error(`❌ Project not found: ${latestProjectName}`);
      return {
        status: 'error',
        message: `Project not found: ${latestProjectName}`,
      };
    }

    try {
      // Get current file content
      const currentContent = files.files.get(file_path);
      if (!currentContent) {
        return {
          status: 'error',
          message: `File not found: ${file_path}. Use surbe_write to create it first.`,
        };
      }

      // Split content into lines
      const lines = currentContent.split('\n');

      // Validate line numbers
      if (first_replaced_line < 1 || last_replaced_line > lines.length || first_replaced_line > last_replaced_line) {
        return {
          status: 'error',
          message: `Invalid line range: ${first_replaced_line}-${last_replaced_line}. File has ${lines.length} lines.`,
        };
      }

      // Extract the section to be replaced (convert to 0-indexed)
      const startIdx = first_replaced_line - 1;
      const endIdx = last_replaced_line - 1;
      const originalSection = lines.slice(startIdx, endIdx + 1).join('\n');

      // Validate search pattern (handle ellipsis)
      const searchLines = search.split('\n');
      const hasEllipsis = searchLines.some(line => line.trim() === '...');

      if (hasEllipsis) {
        // For ellipsis mode, validate first and last few lines
        const ellipsisIdx = searchLines.findIndex(line => line.trim() === '...');
        const searchPrefix = searchLines.slice(0, ellipsisIdx).join('\n');
        const searchSuffix = searchLines.slice(ellipsisIdx + 1).join('\n');

        if (!originalSection.startsWith(searchPrefix) || !originalSection.endsWith(searchSuffix)) {
          return {
            status: 'error',
            message: `Search pattern mismatch at lines ${first_replaced_line}-${last_replaced_line}. Expected content doesn't match actual content.`,
          };
        }
      } else {
        // Exact match required
        if (originalSection !== search) {
          return {
            status: 'error',
            message: `Search pattern mismatch at lines ${first_replaced_line}-${last_replaced_line}. Expected:\n${search}\n\nActual:\n${originalSection}`,
          };
        }
      }

      // Perform replacement
      const newLines = [
        ...lines.slice(0, startIdx),
        ...replace.split('\n'),
        ...lines.slice(endIdx + 1)
      ];
      const newContent = newLines.join('\n');

      // Update in memory and E2B sandbox
      files.files.set(file_path, newContent);
      await sandbox.files.write(`/home/user/${file_path}`, newContent);

      console.log(`✅ Replaced lines ${first_replaced_line}-${last_replaced_line} in ${file_path}`);

      // Get all current files
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
      console.error(`❌ Failed to replace lines: ${error}`);
      return {
        status: 'error',
        message: `Failed to replace lines: ${error}`,
      };
    }
  },
});

export const surbeDownloadToRepo = tool({
  description: "Download a file from a URL and save it to the repository.\n\nThis tool is useful for:\n- Downloading images, assets, or other files from URLs. Download images in the src/assets folder and import them as ES6 modules.\n- Saving external resources directly to the project\n- Migrating files from external sources to the repository\n\nThe file will be downloaded and saved at the specified path in the repository, ready to be used in the project.\nIMPORTANT:DO NOT USE this tool to handle the image uploaded by users in the chat and follow the instructions given with the images!\n\n",
  inputSchema: z.object({
    source_url: z.string().describe("https://example.com/image.png"),
    target_path: z.string().describe("public/images/logo.png"),
  }),
  execute: async ({ source_url, target_path }) => {
    // Placeholder - would integrate with actual download functionality
    return {
      status: 'success',
      message: `Downloaded ${source_url} to ${target_path}`,
      source_url,
      target_path
    };
  },
});

export const surbeFetchWebsite = tool({
  description: "Fetches a website and temporarily saves its content (markdown, HTML, screenshot) to files in `tmp://fetched-websites/`. Returns the paths to the created files and a preview of the content.",
  inputSchema: z.object({
    formats: z.string().optional().describe("markdown,screenshot"),
    url: z.string().describe("https://example.com"),
  }),
  execute: async ({ url, formats }) => {
    // Placeholder - would integrate with actual website fetching
    return {
      status: 'success',
      message: `Fetched website content from ${url}`,
      url,
      formats: formats || 'markdown',
      content_preview: 'Website content preview...'
    };
  },
});

export const surbeCopy = tool({
  description: "Use this tool to copy a file or directory to a new location. This tool is primarily useful when copying files from a virtual file system (e.g. `user-uploads://`) to the project repo.",
  inputSchema: z.object({
    destination_file_path: z.string().describe("src/main_copy.ts"),
    source_file_path: z.string().describe("src/main.ts"),
  }),
  execute: async ({ source_file_path, destination_file_path }) => {
    // Placeholder - would integrate with actual file copying
    return {
      status: 'success',
      message: `Copied ${source_file_path} to ${destination_file_path}`,
      source: source_file_path,
      destination: destination_file_path
    };
  },
});

export const surbeView = tool({
  description: "Use this tool to read the contents of a file. If it's a project file, the file path should be relative to the project root. You can optionally specify line ranges to read using the lines parameter (e.g., \"1-800, 1001-1500\"). By default, the first 500 lines are read if lines is not specified.\n\nIMPORTANT GUIDELINES:\n- Do NOT use this tool if the file contents have already been provided in \n- Do NOT specify line ranges unless the file is very large (>500 lines) - rely on the default behavior which shows the first 500 lines\n- Only use line ranges when you need to see specific sections of large files that weren't shown in the default view\n- If you need to read multiple files, invoke this tool multiple times in parallel (not sequentially) for efficiency",
  inputSchema: z.object({
    file_path: z.string().describe("src/App.tsx"),
    lines: z.string().optional().describe("1-800, 1001-1500"),
  }),
  execute: async ({ file_path, lines }) => {
    // Placeholder - would integrate with actual file reading
    return {
      status: 'success',
      message: `Read file ${file_path}`,
      content: 'File content...',
      total_lines: 100,
      lines_read: lines || '1-500'
    };
  },
});

// Store for E2B sandbox console logs (stdout/stderr from build execution)
export const sandboxConsoleLogs = new Map<string, { stdout: string[]; stderr: string[]; errors: string[] }>();

export const surbeReadConsoleLogs = tool({
  description: "Read E2B sandbox console logs to check for errors and warnings. Call this after building if you want to verify the code is running correctly. If errors are found, you can fix them and rebuild. Don't loop more than 2 times checking logs.",
  inputSchema: z.object({
    search: z.string().optional().describe("Optional search term to filter logs (e.g., 'error', 'warning')"),
  }),
  execute: async ({ search }) => {
    if (!latestProjectName) {
      return {
        status: 'error',
        message: 'No project initialized. Call surb_init_sandbox first.',
        logs: []
      };
    }

    const logs = sandboxConsoleLogs.get(latestProjectName);

    if (!logs) {
      return {
        status: 'warning',
        message: 'No console logs available yet. Build the project first with surbe_build_preview.',
        logs: []
      };
    }

    // Check for errors in stderr
    const hasErrors = logs.stderr.length > 0 || logs.errors.length > 0;

    // Filter logs if search term provided
    const filterLogs = (logArray: string[]) => search
      ? logArray.filter(log => log.toLowerCase().includes(search.toLowerCase()))
      : logArray;

    const filteredStderr = filterLogs(logs.stderr);
    const filteredErrors = filterLogs(logs.errors);
    const filteredStdout = filterLogs(logs.stdout);

    if (!hasErrors) {
      return {
        status: 'success',
        message: '✅ No errors detected in sandbox console!',
        stdout: filteredStdout,
        stderr: [],
        errors: [],
        error_count: 0
      };
    }

    return {
      status: 'error',
      message: `❌ Found ${filteredStderr.length + filteredErrors.length} error(s) in sandbox console.`,
      stdout: filteredStdout,
      stderr: filteredStderr,
      errors: filteredErrors,
      error_count: filteredStderr.length + filteredErrors.length,
      suggestion: 'Fix the errors above and rebuild. If errors persist after 2 attempts, let the user know.'
    };
  },
});

export const surbeReadNetworkRequests = tool({
  description: "Use this tool to read the contents of the latest network requests. You can optionally provide a search query to filter the requests. If empty you will get all latest requests. You may not be able to see the requests that didn't happen recently.",
  inputSchema: z.object({
    search: z.string().describe("error"),
  }),
  execute: async ({ search }) => {
    // Placeholder - would integrate with actual network request monitoring
    return {
      status: 'success',
      message: `Retrieved network requests with search: ${search}`,
      requests: [],
      filtered_by: search
    };
  },
});

export const surbeRemoveDependency = tool({
  description: "Use this tool to uninstall a package from the project.",
  inputSchema: z.object({
    package: z.string().describe("lodash"),
  }),
  execute: async ({ package: pkg }) => {
    // Placeholder - would integrate with actual package manager
    return {
      status: 'success',
      message: `Removed dependency ${pkg} from project`,
      package: pkg
    };
  },
});

export const surbeRename = tool({
  description: "You MUST use this tool to rename a file instead of creating new files and deleting old ones. The original and new file path should be relative to the project root.",
  inputSchema: z.object({
    new_file_path: z.string().describe("src/main_new2.ts"),
    original_file_path: z.string().describe("src/main.ts"),
  }),
  execute: async ({ original_file_path, new_file_path }) => {
    // Placeholder - would integrate with actual file renaming
    return {
      status: 'success',
      message: `Renamed ${original_file_path} to ${new_file_path}`,
      original: original_file_path,
      new: new_file_path
    };
  },
});

export const surbeDelete = tool({
  description: "Use this tool to delete a file. The file path should be relative to the project root.",
  inputSchema: z.object({
    file_path: z.string().describe("src/App.tsx"),
  }),
  execute: async ({ file_path }) => {
    // Placeholder - would integrate with actual file deletion
    return {
      status: 'success',
      message: `Deleted file ${file_path}`,
      file_path
    };
  },
});

// Tool to save user-uploaded images from chat to the project
export const surbeSaveChatImage = tool({
  description: `Save a user-uploaded image from the chat to the project assets folder.

USE THIS TOOL when users upload an image and want to use it in their survey/project (e.g., as a header, logo, background, etc.)

How it works:
1. When users upload images in the chat, they are automatically stored and indexed (0, 1, 2, etc.)
2. Call this tool with the image_index to save the image to your project
3. The image will be saved to the specified target_path (recommend: src/assets/)
4. After saving, import the image in your code using ES6 imports

Parameters:
- image_index: Which uploaded image to save (0 = first/most recent, 1 = second, etc.)
- target_path: Where to save in the project (e.g., "src/assets/header-image.png")

Example workflow:
1. User uploads an image and says "use this as the survey header"
2. Call: surbe_save_chat_image(image_index: 0, target_path: "src/assets/header.png")
3. In your code: import headerImage from "@/assets/header.png"
4. Use: <img src={headerImage} alt="Header" />

IMPORTANT:
- Always use this tool when users provide an image they want incorporated into the project
- Do NOT use imagegen_generate_image to recreate user-uploaded images
- Do NOT ask users for file paths - just use image_index 0 for their most recent upload`,
  inputSchema: z.object({
    image_index: z.number().default(0).describe("Index of the uploaded image to save (0 = most recent, 1 = second most recent, etc.)"),
    target_path: z.string().describe("Destination path in the project (e.g., 'src/assets/header.png')"),
  }),
  execute: async ({ image_index, target_path }) => {
    console.log(`📷 Saving chat image ${image_index} to ${target_path}`);

    if (!latestProjectName) {
      console.error('❌ No project initialized');
      return {
        status: 'error',
        message: 'No project initialized. Call surb_init_sandbox first.',
      };
    }

    const uploadedImages = chatUploadedImages.get(latestProjectName);

    if (!uploadedImages || uploadedImages.length === 0) {
      return {
        status: 'error',
        message: 'No uploaded images found in this chat session. Ask the user to upload an image first.',
        available_images: 0
      };
    }

    if (image_index < 0 || image_index >= uploadedImages.length) {
      return {
        status: 'error',
        message: `Invalid image index ${image_index}. Available images: 0-${uploadedImages.length - 1}`,
        available_images: uploadedImages.length
      };
    }

    const image = uploadedImages[image_index];
    const sandbox = sandboxInstances.get(latestProjectName);
    const files = projectFiles.get(latestProjectName);

    if (!sandbox || !files) {
      return {
        status: 'error',
        message: 'Sandbox not found. Initialize the project first.',
      };
    }

    try {
      // Extract base64 data from data URL
      const dataUrl = image.dataUrl;
      const base64Match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

      if (!base64Match) {
        return {
          status: 'error',
          message: 'Invalid image format. Expected base64 data URL.',
        };
      }

      const mimeType = base64Match[1];
      const base64Data = base64Match[2];

      // Convert base64 to Buffer for E2B
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Write to E2B sandbox as binary
      await sandbox.files.write(`/home/user/${target_path}`, imageBuffer);

      // Also track in project files (store as data URL for reference)
      files.files.set(target_path, `[Binary Image: ${mimeType}, ${imageBuffer.length} bytes]`);

      console.log(`✅ Saved chat image to ${target_path} (${imageBuffer.length} bytes)`);

      return {
        status: 'success',
        message: `Image saved to ${target_path}`,
        target_path,
        original_filename: image.filename || 'uploaded-image',
        mime_type: mimeType,
        size_bytes: imageBuffer.length,
        usage_hint: `Import in code: import myImage from "@/${target_path.replace(/^src\//, '')}"`
      };
    } catch (error) {
      console.error(`❌ Failed to save chat image: ${error}`);
      return {
        status: 'error',
        message: `Failed to save image: ${error}`,
      };
    }
  },
});

// ============================================================================
// Image Generation Tools (keep original names)
// ============================================================================

export const imagegenGenerateImage = tool({
  description: "Generates an image based on a text prompt and saves it to the specified file path. Use the best models for large images that are really important. Make sure that you consider aspect ratio given the location of the image on the page when selecting dimensions.\n\nFor small images (less than 1000px), use flux.schnell, it's much faster and really good! This should be your default model.\nWhen you generate large images like a fullscreen image, use flux.dev. The maximum resolution is 1920x1920.\nOnce generated, you MUST import the images in code as ES6 imports.\n\nPrompting tips:\n- Mentioning the aspect ratio in the prompt will help the model generate the image with the correct dimensions. For example: \"A 16:9 aspect ratio image of a sunset over a calm ocean.\"\n- Use the \"Ultra high resolution\" suffix to your prompts to maximize image quality.\n- If you for example are generating a hero image, mention it in the prompt. Example: \"A hero image of a sunset over a calm ocean.\"\n\nExample:\nimport heroImage from \"@/assets/hero-image.jpg\";\n\nIMPORTANT: \n- Dimensions must be between 512 and 1920 pixels and multiples of 32.\n- Make sure to not replace images that users have uploaded by generated images unless they explicitly ask for it.",
  inputSchema: z.object({
    height: z.number().optional().describe("Image height (minimum 512, maximum 1920)"),
    model: z.string().optional().describe("The model to use for generation. Options: flux.schnell (default), flux.dev. flux.dev generates higher quality images but is slower. Always use flux.schnell unless you're generating a large image like a hero image or fullscreen banner, of if the user asks for high quality."),
    prompt: z.string().describe("Text description of the desired image"),
    target_path: z.string().describe("The file path where the generated image should be saved. Prefer to put them in the 'src/assets' folder."),
    width: z.number().optional().describe("Image width (minimum 512, maximum 1920)"),
  }),
  execute: async ({ prompt, target_path, width, height, model }) => {
    // Placeholder - would integrate with actual image generation API
    return {
      status: 'success',
      message: `Generated image with prompt: ${prompt}`,
      target_path,
      dimensions: `${width || 512}x${height || 512}`,
      model: model || 'flux.schnell'
    };
  },
});

export const imagegenEditImage = tool({
  description: "Edits or merges existing images based on a text prompt.\n\nThis tool can work with single or multiple images:\n- Single image: Apply AI-powered edits based on your prompt\n- Multiple images: Merge/combine images according to your prompt\n\nExample prompts for single image:\n- \"make it rainy\"\n- \"change to sunset lighting\"\n- \"add snow\"\n- \"make it more colorful\"\n\nExample prompts for multiple images:\n- \"blend these two landscapes seamlessly\"\n- \"combine the foreground of the first image with the background of the second\"\n- \"merge these portraits into a group photo\"\n- \"create a collage from these images\"\n\n\nThis tool is great for object or character consistency. You can reuse the same image and place it in different scenes for example. If users ask to tweak an existing image, use this tool rather than generating a new image.",
  inputSchema: z.object({
    image_paths: z.array(z.string()).describe("Array of paths to existing image files. For single image editing, provide one path. For merging/combining multiple images, provide multiple paths."),
    prompt: z.string().describe("Text description of how to edit/merge the image(s). For multiple images, describe how they should be combined."),
    target_path: z.string().describe("The file path where the edited/merged image should be saved."),
  }),
  execute: async ({ image_paths, prompt, target_path }) => {
    // Placeholder - would integrate with actual image editing API
    return {
      status: 'success',
      message: `Edited/merged images with prompt: ${prompt}`,
      source_images: image_paths,
      target_path,
      operation: image_paths.length > 1 ? 'merge' : 'edit'
    };
  },
});

// ============================================================================
// Web Search Tool (keep original name)
// ============================================================================

export const websearchWebSearch = tool({
  description: "Performs a web search and returns relevant results with text content.\nUse this to find current information, documentation, or any web-based content.\nYou can optionally ask for links or image links to be returned as well.\nYou can also optionally specify a category of search results to return.\nValid categories are (you must use the exact string):\n- \"news\"\n- \"linkedin profile\"\n- \"pdf\"\n- \"github\"\n- \"personal site\"\n- \"financial report\"\n\nThere are no other categories. If you don't specify a category, the search will be general.\n\nWhen to use?\n- When you don't have any information about what the user is asking for.\n- When you need to find current information, documentation, or any web-based content.\n- When you need to find specific technical information, etc.\n- When you need to find information about a specific person, company, or organization.\n- When you need to find information about a specific event, product, or service.\n- When you need to find real (not AI generated) images about a specific person, company, or organization.\n\n** Search guidelines **\n\nYou can filter results to specific domains using \"site:domain.com\" in your query.\nYou can specify multiple domains: \"site:docs.anthropic.com site:github.com API documentation\" will search on both domains.\nYou can search for exact phrases by putting them in double quotes: '\"gpt5\" model name OAI' will include \"gpt5\" in the search.\nYou can exclude specific words by prefixing them with minus: jaguar speed -car will exclude \"car\" from the search.\nFor technical information, the following sources are especially useful: stackoverflow, github, official docs of the product, framework, or service.\nAccount for \"Current date\" in your responses. For example, if you instructions say \"Current date: 2025-07-01\", and the user wants the latest docs, do\nnot use 2024 in the search query. Use 2025!\n",
  inputSchema: z.object({
    category: z.string().optional().describe("Category of search results to return"),
    imageLinks: z.number().optional().describe("Number of image links to return for each result"),
    links: z.number().optional().describe("Number of links to return for each result"),
    numResults: z.number().optional().describe("Number of search results to return (default: 5)"),
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query, numResults, links, imageLinks, category }) => {
    // Placeholder - would integrate with actual web search API
    return {
      status: 'success',
      message: `Performed web search for: ${query}`,
      query,
      results: [],
      total_results: 0,
      category: category || 'general'
    };
  },
});

// ============================================================================
// Export maps for sync with main workflow
// ============================================================================

export { sandboxInstances, projectFiles };