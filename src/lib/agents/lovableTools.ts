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

      console.log('📦 Setting up Node.js environment...');

      // Install pnpm and create-react-app dependencies
      const setupCommands = [
        'apt-get update -qq',
        'apt-get install -y -qq nodejs npm',
        'npm install -g pnpm',
      ];

      for (const cmd of setupCommands) {
        const result = await sandbox.commands.run(cmd);
        if (result.exitCode !== 0) {
          console.warn(`⚠️ Setup warning: ${cmd} exited with ${result.exitCode}`);
        }
      }

      console.log('✅ Node.js environment ready');

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
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${files.files.get(entry_file) || ''}
  </script>
</body>
</html>`;

      await sandbox.files.write('/home/user/preview.html', htmlTemplate);
      console.log('✅ Preview HTML generated');

      // Get all source files
      const allFiles = getAllSourceFiles();

      return {
        status: 'success',
        message: 'Preview built successfully',
        preview_html: htmlTemplate,
        source_files: allFiles,
        entry_point: entry_file,
      };
    } catch (error) {
      console.error(`❌ Build failed: ${error}`);
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
    // Placeholder - would integrate with actual line-based search and replace
    return {
      status: 'success',
      message: `Replaced content in ${file_path} at lines ${first_replaced_line}-${last_replaced_line}`,
      lines_affected: last_replaced_line - first_replaced_line + 1
    };
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

export const surbeReadConsoleLogs = tool({
  description: "Use this tool to read the contents of the latest console logs at the moment the user sent the request.\nYou can optionally provide a search query to filter the logs. If empty you will get all latest logs.\nYou may not be able to see the logs that didn't happen recently.\nThe logs will not update while you are building and writing code. So do not expect to be able to verify if you fixed an issue by reading logs again. They will be the same as when you started writing code.\nDO NOT USE THIS MORE THAN ONCE since you will get the same logs each time.",
  inputSchema: z.object({
    search: z.string().describe("error"),
  }),
  execute: async ({ search }) => {
    // Placeholder - would integrate with actual console log monitoring
    return {
      status: 'success',
      message: `Retrieved console logs with search: ${search}`,
      logs: [],
      filtered_by: search
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