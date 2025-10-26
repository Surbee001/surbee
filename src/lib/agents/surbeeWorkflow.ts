import { tool, webSearchTool, Agent, AgentInputItem, Runner, RunItem, RunStreamEvent } from "@openai/agents";
import { z } from "zod";
import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import type { ComponentType, ReactElement } from "react";

type GuardrailResult = any;

type GuardrailOutput = ReturnType<typeof buildGuardrailFailOutput> | { safe_text: string };

// Global CSS for shadcn/ui styling
const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;

const FilePayloadSchema = z.union([
  z.string(),
  z.object({
    content: z.string(),
    encoding: z.enum(["utf-8", "base64"]).default("utf-8"),
  }),
]);

const LegacyBundleSchema = z.object({
  files: z.record(FilePayloadSchema),
  entry: z.string().min(1, "entry must reference the root component file (e.g. src/Survey.tsx)"),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  htmlShell: z
    .object({
      title: z.string().nullish().optional(),
      head: z.array(z.string()).optional(),
      bodyClass: z.string().nullish().optional(),
    })
    .optional(),
});

const FileEntryInputSchema = z.object({
  path: z.string().min(1, "files[].path must be provided"),
  content: z.string(),
  encoding: z.enum(["utf-8", "base64"]).optional(),
});

const BuildProjectSchema = z
  .object({
    project_name: z.string().min(1, "project_name must be provided"),
    components: z.array(z.string()),
    initial_code: z.string().min(1, "initial_code must include TypeScript source").optional(),
    tailwind_config: z.string().min(1, "tailwind_config must be provided").optional(),
    files: z.array(FileEntryInputSchema).optional(),
    entry: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    devDependencies: z.array(z.string()).optional(),
  })
  .refine((value) => {
    const hasInitial = typeof value.initial_code === "string" && value.initial_code.trim().length > 0;
    const hasFiles = Array.isArray(value.files) && value.files.length > 0;
    return hasInitial || hasFiles;
  }, {
    message: "Provide either initial_code or a non-empty files array.",
    path: ["initial_code"],
  })
  .refine((value) => {
    if (Array.isArray(value.files) && value.files.length > 0) {
      return typeof value.entry === "string" && value.entry.trim().length > 0;
    }
    return true;
  }, {
    message: "entry must be provided when files are supplied.",
    path: ["entry"],
  });

const BuildProjectJsonSchema = {
  type: "object",
  properties: {
    project_name: {
      type: "string",
      description: "Name of the project to be built",
    },
    components: {
      type: "array",
      description: "List of UI components to include in the project",
      items: {
        type: "string",
        description: "Name of a UI component",
      },
    },
    initial_code: {
      type: "string",
      description: "Single-file TSX module if building a minimal project. Optional when providing a multi-file bundle.",
    },
    tailwind_config: {
      type: "string",
      description: "TailwindCSS configuration options. Optional when included inside the file bundle.",
    },
    files: {
      type: "array",
      description: "List of files to include when generating a multi-file project bundle.",
      items: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "File path relative to the project root (e.g. src/Survey.tsx).",
          },
          content: {
            type: "string",
            description: "File contents encoded as UTF-8 or base64 depending on the encoding field.",
          },
          encoding: {
            type: "string",
            description: "Encoding of the provided content (defaults to utf-8).",
            enum: ["utf-8", "base64"],
          },
        },
        required: ["path", "content"],
        additionalProperties: false,
      },
    },
    entry: {
      type: "string",
      description: "Entry point file path to render (e.g. src/Survey.tsx). Required whenever files are provided.",
    },
    dependencies: {
      type: "array",
      description: "Runtime dependencies to install / inject into the sandbox (e.g. tailwindcss@^3.4.0).",
      items: { type: "string" },
    },
    devDependencies: {
      type: "array",
      description: "Dev-only dependencies required for the project (rarely needed).",
      items: { type: "string" },
    },
  },
  required: ["project_name", "components"],
  additionalProperties: false,
} as const;

const stripCodeFence = (value: string) => {
  const trimmed = value.trim();
  const fenceMatch = trimmed.match(/^```[a-zA-Z0-9_-]*\s*\n([\s\S]*?)\n```$/);
  if (fenceMatch) {
    return fenceMatch[1];
  }
  return trimmed;
};

const normaliseCodePayload = (value: string | null | undefined) => {
  if (typeof value !== "string") return "";
  return stripCodeFence(value.replace(/^\uFEFF/, ""));
};

type ToolBundle = {
  files: Record<string, z.infer<typeof FilePayloadSchema>>;
  entry: string;
  dependencies: string[];
  devDependencies: string[];
  htmlShell: {
    title: string | null;
    head: string[];
    bodyClass: string | null;
  };
};

const DEFAULT_TAILWIND_CONFIG = `module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        "surbee-ink": "#0b0e14",
        "surbee-rose": "#ff5678",
        "surbee-amber": "#ffb454",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};`;

const DEFAULT_SURVEY_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background-color: #0b0e14;
  color: #f5f7fa;
}

body {
  @apply min-h-screen bg-gradient-to-br from-[#0b0e14] via-[#111827] to-[#020617] text-slate-100;
}

.survey-shell {
  @apply mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-16 md:px-10 lg:px-16;
}

.survey-card {
  @apply overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-lg;
}

.survey-section-title {
  @apply text-lg font-semibold text-white/90 tracking-wide uppercase;
}

.survey-grid {
  @apply grid grid-cols-1 gap-6 md:grid-cols-2;
}

.survey-button-primary {
  @apply inline-flex items-center justify-center rounded-xl bg-white/90 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white;
}

.survey-button-secondary {
  @apply inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white;
}

.survey-progress-bar {
  @apply h-2 w-full overflow-hidden rounded-full bg-white/10;
}

.survey-progress-value {
  @apply h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc] transition-all duration-500 ease-out;
}
`;

const mergeDependencySpecs = (...lists: (string[] | undefined)[]): string[] => {
  const merged = new Set<string>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const spec of list) {
      const trimmed = typeof spec === "string" ? spec.trim() : "";
      if (trimmed) {
        merged.add(trimmed);
      }
    }
  }
  return Array.from(merged);
};

const ensureTailwindScaffolding = (
  bundle: ToolBundle,
  explicitTailwindConfig: string | null | undefined
) => {
  bundle.dependencies = mergeDependencySpecs(bundle.dependencies, [
    "tailwindcss@^3.4.13",
    "@tailwindcss/forms@^0.5.7",
    "@tailwindcss/typography@^0.5.9",
  ]);

  const hasTailwindConfig = Object.keys(bundle.files).some((filePath) =>
    /tailwind\.config\.(cjs|mjs|js|ts)$/i.test(filePath)
  );

  if (!hasTailwindConfig) {
    bundle.files["tailwind.config.js"] =
      (explicitTailwindConfig && explicitTailwindConfig.trim().length > 0
        ? explicitTailwindConfig
        : DEFAULT_TAILWIND_CONFIG);
  } else if (explicitTailwindConfig && explicitTailwindConfig.trim().length > 0) {
    // Respect explicit config path only if not already provided inside bundle files
    const defaultPath = "tailwind.config.js";
    if (!bundle.files[defaultPath]) {
      bundle.files[defaultPath] = explicitTailwindConfig;
    }
  }

  const hasCss = Object.keys(bundle.files).some((filePath) => /\.css$/i.test(filePath));
  if (!hasCss) {
    bundle.files["src/styles/survey.css"] = DEFAULT_SURVEY_CSS;
  }

  const rootHtml = bundle.htmlShell || { title: null, head: [], bodyClass: null };
  bundle.htmlShell = {
    title: rootHtml.title ?? "Surbee Survey Preview",
    head: Array.isArray(rootHtml.head) ? rootHtml.head : [],
    bodyClass: rootHtml.bodyClass ?? "bg-slate-950 text-slate-100",
  };
};

// =============================================================================
// SANDBOX IDE TOOLS - Complete IDE Environment for Agents
// =============================================================================

// Sandbox state management
interface SandboxState {
  projectName: string;
  rootDir: string;
  files: Record<string, string>;
  dependencies: string[];
  devDependencies: string[];
  created: Date;
  lastModified: Date;
}

// Global sandbox state (in production, this would be in a database)
const sandboxStates = new Map<string, SandboxState>();

// Helper functions for sandbox operations
const createSandboxPath = (projectName: string, filePath: string = ""): string => {
  const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const baseDir = path.join(os.tmpdir(), `surbee-ide-${safeName}-${randomUUID()}`);
  return filePath ? path.join(baseDir, filePath) : baseDir;
};

const ensureSandboxDir = async (sandboxPath: string): Promise<void> => {
  await fs.mkdir(sandboxPath, { recursive: true });
};

const getSandboxState = (projectName: string): SandboxState | null => {
  console.log('[getSandboxState] Looking for project:', projectName);
  console.log('[getSandboxState] Available projects:', Array.from(sandboxStates.keys()));
  const state = sandboxStates.get(projectName);
  console.log('[getSandboxState] Found state:', !!state);
  return state || null;
};

// Helper function to find existing sandbox directories
const findSandboxDirectory = async (projectName: string): Promise<string | null> => {
  try {
    const tempDir = os.tmpdir();
    const pattern = `surbee-ide-${projectName.replace(/[^a-zA-Z0-9-_]/g, "_")}-*`;

    // In a real implementation, we'd scan the temp directory for matching patterns
    // For now, we'll return null and let the agent handle the error
    return null;
  } catch {
        return null;
      }
};

const saveSandboxState = (state: SandboxState): void => {
  state.lastModified = new Date();
  sandboxStates.set(state.projectName, state);
};

const deleteSandboxState = (projectName: string): void => {
  sandboxStates.delete(projectName);
};

// Tool: Initialize Sandbox IDE
const initSandbox = tool({
  name: "init_sandbox",
  description: "Initialize a new sandbox IDE environment with shadcn/ui and all necessary dependencies",
  parameters: z.object({
    project_name: z.string().min(1, "Project name is required"),
    initial_files: z.record(z.string()).optional().nullable(),
  }),
  execute: async (input) => {
    const { project_name, initial_files = {} } = input;
    console.log('[init_sandbox] Starting initialization for project:', project_name);

    // Clean up existing sandbox if it exists
    const existingState = getSandboxState(project_name);
    if (existingState) {
      console.log('[init_sandbox] Cleaning up existing sandbox:', existingState.rootDir);
      try {
        await fs.rm(existingState.rootDir, { recursive: true, force: true });
      } catch (e) {
        console.warn('[init_sandbox] Error cleaning up existing sandbox:', e);
      }
    }

    // Create new sandbox directory
    const rootDir = createSandboxPath(project_name);
    console.log('[init_sandbox] Creating sandbox directory:', rootDir);
    await ensureSandboxDir(rootDir);

    // Create initial project structure
    const packageJson = {
      name: project_name,
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "tailwindcss": "^3.4.0",
        "autoprefixer": "^10.4.0",
        "postcss": "^8.4.0",
        // Radix UI primitives for shadcn/ui
        "@radix-ui/react-slot": "^1.0.2",
        "@radix-ui/react-label": "^2.0.2",
        "@radix-ui/react-dialog": "^1.0.5",
        "@radix-ui/react-dropdown-menu": "^2.0.6",
        "@radix-ui/react-select": "^2.0.0",
        "@radix-ui/react-checkbox": "^1.0.4",
        "@radix-ui/react-radio-group": "^1.1.3",
        "@radix-ui/react-switch": "^1.0.3",
        "@radix-ui/react-tabs": "^1.0.4",
        "@radix-ui/react-toast": "^1.1.5",
        "@radix-ui/react-tooltip": "^1.0.7",
        "@radix-ui/react-popover": "^1.0.7",
        "@radix-ui/react-alert-dialog": "^1.0.5",
        "@radix-ui/react-progress": "^1.0.3",
        "@radix-ui/react-separator": "^1.0.3",
        "@radix-ui/react-slider": "^1.1.2",
        "@radix-ui/react-avatar": "^1.0.4",
        "@radix-ui/react-accordion": "^1.1.2",
        // Shadcn utilities
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.0.0",
        "tailwind-merge": "^2.0.0",
        "tailwindcss-animate": "^1.0.7",
        // Icons
        "lucide-react": "^0.294.0",
      },
      devDependencies: {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0",
        "tailwindcss": "^3.4.0",
      },
      scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
      },
    };

    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;


    // Create directory structure and files
    console.log('[init_sandbox] Creating files in:', rootDir);
    const packageJsonPath = path.join(rootDir, "package.json");
    const tailwindConfigPath = path.join(rootDir, "tailwind.config.js");

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    await fs.writeFile(tailwindConfigPath, tailwindConfig);
    console.log('[init_sandbox] Created package.json and tailwind.config.js');

    // Verify basic files exist
    try {
      await fs.access(packageJsonPath);
      await fs.access(tailwindConfigPath);
      console.log('[init_sandbox] Verified package.json and tailwind.config.js exist');
    } catch (error) {
      console.error('[init_sandbox] Failed to verify basic files exist:', error);
      throw new Error('Failed to create basic project files');
    }

    // Ensure src/styles directory exists
    const stylesDir = path.join(rootDir, "src", "styles");
    await fs.mkdir(stylesDir, { recursive: true });
    const globalsCssPath = path.join(stylesDir, "globals.css");
    await fs.writeFile(globalsCssPath, globalsCss);
    console.log('[init_sandbox] Created src/styles/globals.css at:', globalsCssPath);

    // Verify file was created
    try {
      await fs.access(globalsCssPath);
      console.log('[init_sandbox] Verified globals.css exists');
    } catch (error) {
      console.error('[init_sandbox] Failed to verify globals.css exists:', error);
      throw new Error('Failed to create globals.css file');
    }

    // Create tsconfig.json with path mappings
    const tsconfigPath = path.join(rootDir, "tsconfig.json");
    const tsconfigContent = {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["src"],
      references: [{ path: "./tsconfig.node.json" }]
    };
    await fs.writeFile(tsconfigPath, JSON.stringify(tsconfigContent, null, 2));
    console.log('[init_sandbox] Created tsconfig.json at:', tsconfigPath);

    // Create shadcn/ui utils
    const utilsPath = path.join(rootDir, "src", "lib", "utils.ts");
    await fs.mkdir(path.dirname(utilsPath), { recursive: true });
    await fs.writeFile(utilsPath, `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`);
    console.log('[init_sandbox] Created src/lib/utils.ts at:', utilsPath);

    // Verify utils file was created
    try {
      await fs.access(utilsPath);
      await fs.access(tsconfigPath);
      console.log('[init_sandbox] Verified utils.ts and tsconfig.json exist');
    } catch (error) {
      console.error('[init_sandbox] Failed to verify utils.ts or tsconfig.json exists:', error);
      throw new Error('Failed to create utils.ts or tsconfig.json file');
    }

    // Create initial files
    if (initial_files) {
      for (const [filePath, content] of Object.entries(initial_files)) {
        const fullPath = path.join(rootDir, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content);
      }
    }

    // Save sandbox state
    const sandboxState: SandboxState = {
      projectName: project_name,
      rootDir,
      files: { ...initial_files },
      dependencies: Object.keys(packageJson.dependencies),
      devDependencies: Object.keys(packageJson.devDependencies),
      created: new Date(),
      lastModified: new Date(),
    };

    saveSandboxState(sandboxState);
    console.log('[init_sandbox] Sandbox initialization completed successfully for:', project_name);

    return {
      status: "success",
      message: `Sandbox IDE initialized for project: ${project_name}`,
      project_name,
      root_dir: rootDir,
      files_created: initial_files ? Object.keys(initial_files).length : 0,
      dependencies_installed: Object.keys(packageJson.dependencies).length,
    };
  },
});

// Tool: Create File
const createFile = tool({
  name: "create_file",
  description: "Create a new file in the sandbox IDE",
  parameters: z.object({
    project_name: z.string(),
    file_path: z.string(),
    content: z.string(),
  }),
  execute: async (input) => {
    const { project_name, file_path, content } = input;
    console.log('[create_file] Starting for project:', project_name, 'file:', file_path);

    const state = getSandboxState(project_name);
    if (!state) {
      console.error('[create_file] Sandbox not found for project:', project_name);
      throw new Error(`Sandbox not found for project: ${project_name}. Please call init_sandbox first to create the project environment.`);
    }

    const fullPath = path.join(state.rootDir, file_path);
    console.log('[create_file] Creating file at:', fullPath);

    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
      console.log('[create_file] File created successfully');

      // Update state
      state.files[file_path] = content;
      saveSandboxState(state);

      console.log('[create_file] Completed successfully');
      return {
        status: "success",
        message: `File created: ${file_path}`,
        project_name,
        file_path,
        size: content.length,
      };
    } catch (error) {
      console.error('[create_file] Error creating file:', error);
      throw error;
    }
  },
});

// Tool: Read File
const readFile = tool({
  name: "read_file",
  description: "Read a file from the sandbox IDE",
  parameters: z.object({
    project_name: z.string(),
    file_path: z.string(),
  }),
  execute: async (input) => {
    const { project_name, file_path } = input;

    const state = getSandboxState(project_name);
    if (!state) {
      throw new Error(`Sandbox not found for project: ${project_name}. Please call init_sandbox first to create the project environment.`);
    }

    const fullPath = path.join(state.rootDir, file_path);
    console.log('[read_file] Attempting to read:', fullPath);

    try {
      const content = await fs.readFile(fullPath, "utf-8");
      console.log('[read_file] Successfully read file:', file_path, 'size:', content.length);
      state.files[file_path] = content; // Update cache
      saveSandboxState(state);

      return {
        status: "success",
        content,
        project_name,
        file_path,
        size: content.length,
      };
    } catch (error) {
      console.error('[read_file] Error reading file:', fullPath, error);
      throw new Error(`File not found: ${file_path}. Make sure the file exists in the sandbox. If this is a new project, ensure init_sandbox was called first.`);
    }
  },
});

// Tool: Update File
const updateFile = tool({
  name: "update_file",
  description: "Update an existing file in the sandbox IDE",
  parameters: z.object({
    project_name: z.string(),
    file_path: z.string(),
    content: z.string(),
  }),
  execute: async (input) => {
    const { project_name, file_path, content } = input;

    const state = getSandboxState(project_name);
    if (!state) {
      throw new Error(`Sandbox not found for project: ${project_name}. Please call init_sandbox first to create the project environment.`);
    }

    const fullPath = path.join(state.rootDir, file_path);

    try {
      await fs.writeFile(fullPath, content);

      // Update state
      state.files[file_path] = content;
      saveSandboxState(state);

      return {
        status: "success",
        message: `File updated: ${file_path}`,
        project_name,
        file_path,
        size: content.length,
      };
    } catch (error) {
      throw new Error(`Failed to update file: ${file_path}`);
    }
  },
});

// Tool: Delete File
const deleteFile = tool({
  name: "delete_file",
  description: "Delete a file from the sandbox IDE",
  parameters: z.object({
    project_name: z.string(),
    file_path: z.string(),
  }),
  execute: async (input) => {
    const { project_name, file_path } = input;

    const state = getSandboxState(project_name);
    if (!state) {
      throw new Error(`Sandbox not found for project: ${project_name}. Please call init_sandbox first to create the project environment.`);
    }

    const fullPath = path.join(state.rootDir, file_path);

    try {
      await fs.unlink(fullPath);

      // Update state
      delete state.files[file_path];
      saveSandboxState(state);

      return {
        status: "success",
        message: `File deleted: ${file_path}`,
        project_name,
        file_path,
      };
    } catch (error) {
      throw new Error(`Failed to delete file: ${file_path} - ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Tool: List Files
const listFiles = tool({
  name: "list_files",
  description: "List files and directories in the sandbox IDE",
  parameters: z.object({
    project_name: z.string(),
    directory: z.string().optional().nullable().default(""),
  }),
  execute: async (input) => {
    const { project_name, directory = "" } = input;

    const state = getSandboxState(project_name);
    if (!state) {
      throw new Error(`Sandbox not found for project: ${project_name}. Please call init_sandbox first to create the project environment.`);
    }

    const fullPath = path.join(state.rootDir, directory || "");
    const readdirOpts = { withFileTypes: true as const };
    const items = await fs.readdir(fullPath, readdirOpts);

    const result = items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? "directory" : "file",
      path: path.join(directory || "", item.name).replace(/\\/g, "/"),
    }));

    return {
      status: "success",
      directory: directory || "",
      items: result,
      count: result.length,
    };
  },
});

// Tool: Install Package
const installPackage = tool({
  name: "install_package",
  description: "Install a package in the sandbox IDE",
  parameters: z.object({
    project_name: z.string(),
    package_name: z.string(),
    dev: z.boolean().optional().nullable().default(false),
  }),
  execute: async (input) => {
    const { project_name, package_name, dev = false } = input;

    const state = getSandboxState(project_name);
    if (!state) {
      throw new Error(`Sandbox not found for project: ${project_name}. Please call init_sandbox first to create the project environment.`);
    }

    try {
      // In a real implementation, this would run npm/pnpm install
      // For now, we'll just update the package.json
      const packageJsonPath = path.join(state.rootDir, "package.json");
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

      if (dev) {
        packageJson.devDependencies = packageJson.devDependencies || {};
        packageJson.devDependencies[package_name] = "latest";
        state.devDependencies.push(package_name);
        } else {
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies[package_name] = "latest";
        state.dependencies.push(package_name);
      }

      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      saveSandboxState(state);

      return {
        status: "success",
        message: `Package ${package_name} ${dev ? "dev" : ""}dependency added`,
        project_name,
        package_name,
        type: dev ? "devDependency" : "dependency",
      };
    } catch (error) {
      throw new Error(`Failed to install package: ${package_name} - ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Tool: Run Console Command
const runCommand = tool({
  name: "run_command",
  description: "Run a console command in the sandbox IDE",
  parameters: z.object({
    project_name: z.string(),
    command: z.string(),
    args: z.array(z.string()).optional().nullable().default([]),
    cwd: z.string().optional().nullable(),
  }),
  execute: async (input) => {
    const { project_name, command, args = [], cwd } = input;

    const state = getSandboxState(project_name);
    if (!state) {
      throw new Error(`Sandbox not found for project: ${project_name}. Please call init_sandbox first to create the project environment.`);
    }

    const workingDir = cwd && cwd !== null ? path.join(state.rootDir, cwd) : state.rootDir;

    try {
      const { exec } = await import("child_process");
      const fullCommand = `${command} ${(args || []).join(" ")}`;

      return new Promise((resolve, reject) => {
        exec(fullCommand, { cwd: workingDir }, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`Command failed: ${error.message}`));
            return;
          }

          resolve({
            status: "success",
            command: fullCommand,
            stdout: stdout.toString(),
            stderr: stderr.toString(),
            cwd: workingDir,
          });
        });
      });
    } catch (error) {
      throw new Error(`Failed to run command: ${command} - ${error instanceof Error ? error.message : String(error)}`);
    }
          },
        });

// Tool: Render Preview
const renderPreview = tool({
  name: "render_preview",
  description: "Render the final TSX preview of the survey",
  parameters: z.object({
    project_name: z.string(),
    entry_file: z.string().optional().nullable().default("src/Survey.tsx"),
  }),
  execute: async (input) => {
    const { project_name, entry_file = "src/Survey.tsx" } = input;

    const state = getSandboxState(project_name);
    if (!state) {
      throw new Error(`Sandbox not found for project: ${project_name}. Please call init_sandbox first to create the project environment.`);
    }

    const entryPath = path.join(state.rootDir, entry_file || "src/Survey.tsx");

    try {
      // Check if entry file exists
      await fs.access(entryPath);

      // Compile and render the TSX component
      const content = await fs.readFile(entryPath, "utf-8");
      console.log('[render_preview] Compiling and rendering survey:', entryPath);

      // For React surveys, we don't return HTML - the Sandpack preview handles rendering
      // This placeholder is just for fallback compatibility
      const html = undefined;

      // Read all created files for the code preview
      const sourceFiles: Record<string, string> = {};

      // Helper function to recursively read directory
      const readDirRecursive = async (dir: string, basePath: string = ""): Promise<void> => {
        try {
          const readdirOptions = { withFileTypes: true as const };
          const items = await fs.readdir(dir, readdirOptions);

          for (const item of items) {
            const itemPath = path.join(dir, item.name);
            const relativePath = basePath ? path.join(basePath, item.name) : item.name;

            if (item.isFile()) {
              try {
                const fileContent = await fs.readFile(itemPath, "utf-8");
                // Use forward slashes for paths (sandpack expects this)
                const normalizedPath = relativePath.replace(/\\/g, '/');
                const finalPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
                sourceFiles[finalPath] = fileContent;
              } catch (e) {
                // Skip files that can't be read
                console.error(`[render_preview] Failed to read file: ${itemPath}`, e);
              }
            } else if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.git') {
              await readDirRecursive(itemPath, relativePath);
            }
          }
        } catch (e) {
          // Skip directories that can't be read
          console.error(`[render_preview] Failed to read directory: ${dir}`, e);
        }
      };

      await readDirRecursive(state.rootDir);

      return {
        status: "success",
        project_name,
        entry_file: entry_file || "src/Survey.tsx",
        entry: entry_file || "src/Survey.tsx", // Add this for compatibility
        content,
        html,
        files: sourceFiles,
        message: "Preview generated successfully",
      };
    } catch (error) {
      throw new Error(`Failed to render preview: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Tool: Create Shadcn Component
const createShadcnComponent = tool({
  name: "create_shadcn_component",
  description: "Create a shadcn/ui component in the sandbox",
  parameters: z.object({
    project_name: z.string(),
    component_name: z.string(),
    component_type: z.enum([
      "button", "input", "card", "dialog", "form", "select", "checkbox",
      "radio", "textarea", "label", "badge", "alert", "progress", "tabs"
    ]),
  }),
  execute: async (input) => {
    const { project_name, component_name, component_type } = input;

    const state = getSandboxState(project_name);
    if (!state) {
      throw new Error(`Sandbox not found for project: ${project_name}. Please call init_sandbox first to create the project environment.`);
    }

    // Component templates
    const componentTemplates: Record<string, string> = {
      button: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`,

      input: `import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }`,

      card: `import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`,

      label: `import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }`,
    };

    const componentContent = componentTemplates[component_type] || `// ${component_type} component not found`;

    const filePath = `src/components/ui/${component_name}.tsx`;
    const fullPath = path.join(state.rootDir, filePath);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, componentContent);

    // Update state
    state.files[filePath] = componentContent;
    saveSandboxState(state);

      return {
        status: "success",
      message: `${component_type} component created: ${component_name}`,
      project_name,
      component_name,
      file_path: filePath,
    };
  },
});

const webSearchPreview = webSearchTool({
  searchContextSize: "medium",
  userLocation: {
    type: "approximate",
  },
});

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const guardrailsConfig = {
  guardrails: [
    {
      name: "Contains PII",
      config: {
        block: true,
        entities: [
          "CREDIT_CARD",
          "CRYPTO",
          "MEDICAL_LICENSE",
          "US_BANK_NUMBER",
          "US_PASSPORT",
          "US_SSN",
        ],
      },
    },
    {
      name: "Moderation",
      config: {
        categories: [
          "sexual",
          "sexual/minors",
          "hate",
          "hate/threatening",
          "harassment",
          "harassment/threatening",
          "self-harm",
          "self-harm/intent",
          "self-harm/instructions",
          "violence",
          "violence/graphic",
          "illicit",
          "illicit/violent",
        ],
      },
    },
  ],
};

const context = { guardrailLlm: client };

export type SerializedRunItem =
  | {
      type: "message";
      text: string;
      agent?: string;
      isHtml?: boolean;
      isSummary?: boolean;
    }
  | {
      type: "reasoning";
      text: string;
      agent?: string;
    }
  | {
      type: "tool_call";
      name: string;
      arguments: unknown;
      agent?: string;
    }
  | {
      type: "tool_result";
      name: string;
      output: unknown;
      agent?: string;
      html?: string | null;
      files?: Record<string, string>;
      entry?: string;
      dependencies?: string[];
      devDependencies?: string[];
    }
  | {
      type: "handoff";
      from?: string;
      to?: string;
      agent?: string;
      description?: string;
    }
  | {
      type: "tool_approval";
      name?: string;
      status?: string;
      agent?: string;
    };

const HTML_LIKE_MARKERS = ["<!doctype", "<html", "<body", "<head", "<section", "<main", "<form", "<div"];

function looksLikeHtml(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const trimmed = input.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (HTML_LIKE_MARKERS.some((marker) => lower.startsWith(marker))) return true;
  // Heuristic: contains both opening and closing angle brackets with tag-like pattern
  return /<[^>]+>/.test(trimmed) && /<\/[^>]+>/.test(trimmed);
}

function safeJsonParse(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractAgentName(item: any): string | undefined {
  return item?.agent?.name ?? item?.agent?.id ?? undefined;
}

function extractReasoningText(rawItem: any): string {
  const segments: string[] = [];
  if (Array.isArray(rawItem?.content)) {
    for (const part of rawItem.content) {
      if (part?.type === "input_text" && typeof part?.text === "string") {
        segments.push(part.text);
      }
    }
  }
  if (Array.isArray(rawItem?.rawContent)) {
    for (const part of rawItem.rawContent) {
      if (typeof part?.text === "string") {
        segments.push(part.text);
      }
    }
  }
  return segments.join("\n").trim();
}

function extractHtmlFromToolOutput(output: unknown): string | null {
  if (!output) return null;
  if (typeof output === "string") {
    const trimmed = output.trim();
    if (!trimmed) return null;
    if (looksLikeHtml(trimmed)) return trimmed;
    const parsed = safeJsonParse(trimmed);
    if (parsed !== trimmed) {
      return extractHtmlFromToolOutput(parsed);
    }
    return null;
  }
  if (typeof output === "object") {
    const obj = output as Record<string, unknown>;
    if (typeof obj.html === "string" && obj.html.trim()) {
      return obj.html;
    }
    if (typeof obj.code === "string" && obj.code.trim() && looksLikeHtml(obj.code)) {
      return obj.code;
    }
    if (typeof obj.content === "string" && obj.content.trim() && looksLikeHtml(obj.content)) {
      return obj.content;
    }
  }
  return null;
}

function serializeRunItems(items: RunItem[]): SerializedRunItem[] {
  const serialized: SerializedRunItem[] = [];

  for (const item of items) {
    const rawItem = (item as any)?.rawItem;
    const agentName = extractAgentName(item);
    const type = (item as any)?.type as string | undefined;

    switch (type) {
      case "message_output_item": {
        const text = typeof (item as any)?.content === "string" ? (item as any).content : "";
        const isSummary = rawItem?.__summary === true;
        serialized.push({
          type: "message",
          text,
          agent: agentName,
          isHtml: looksLikeHtml(text),
          isSummary,
        });
        break;
      }
      case "reasoning_item": {
        const reasoningText = extractReasoningText(rawItem);
        if (reasoningText) {
          serialized.push({
            type: "reasoning",
            text: reasoningText,
            agent: agentName,
          });
        }
        break;
      }
      case "tool_call_item": {
        const name = rawItem?.name ?? "unknown_tool";
        const parsedArgs = safeJsonParse(rawItem?.arguments);
        serialized.push({
          type: "tool_call",
          name,
          arguments: parsedArgs,
          agent: agentName,
        });
        break;
      }
      case "tool_call_output_item": {
        const name = rawItem?.name ?? "unknown_tool";
        const output = (item as any)?.output ?? rawItem?.output;
        const files =
          output && typeof output === "object" && output !== null && "files" in (output as Record<string, unknown>)
            ? (output as Record<string, unknown>).files
            : undefined;
        const entry =
          output && typeof output === "object" && output !== null && typeof (output as any).entry === "string"
            ? ((output as any).entry as string)
            : undefined;
        const dependencies =
          output && typeof output === "object" && output !== null && Array.isArray((output as any).dependenciesApplied)
            ? ((output as any).dependenciesApplied as string[])
            : output && typeof output === "object" && output !== null && Array.isArray((output as any).dependencies)
              ? ((output as any).dependencies as string[])
              : undefined;
        const devDependencies =
          output && typeof output === "object" && output !== null && Array.isArray((output as any).devDependenciesApplied)
            ? ((output as any).devDependenciesApplied as string[])
            : output && typeof output === "object" && output !== null && Array.isArray((output as any).devDependencies)
              ? ((output as any).devDependencies as string[])
              : undefined;

        serialized.push({
          type: "tool_result",
          name,
          output,
          agent: agentName,
          html: extractHtmlFromToolOutput(output),
          files: files as Record<string, string> | undefined,
          entry,
          dependencies,
          devDependencies,
        });
        break;
      }
      case "summary_item":
      case "model_summary_item":
      case "assistant_summary_item":
      case "run_summary_item":
      case "summary_output_item": {
        const summaryText =
          extractReasoningText(rawItem) ||
          (typeof rawItem?.text === "string" ? rawItem.text.trim() : "") ||
          (typeof (rawItem?.summary ?? (item as any)?.summary) === "string"
            ? (rawItem?.summary ?? (item as any)?.summary).trim()
            : "");
        if (summaryText) {
          serialized.push({
            type: "message",
            text: summaryText,
            agent: agentName,
            isSummary: true,
          });
        }
        break;
      }
      case "handoff_call_item": {
        serialized.push({
          type: "handoff",
          agent: agentName,
          description: rawItem?.content ?? undefined,
        });
        break;
      }
      case "handoff_output_item": {
        serialized.push({
          type: "handoff",
          agent: agentName,
          description: rawItem?.content ?? undefined,
        });
        break;
      }
      case "tool_approval_item": {
        serialized.push({
          type: "tool_approval",
          agent: agentName,
          name: rawItem?.name,
          status: rawItem?.status,
        });
        break;
      }
      default:
        if (type && type.toLowerCase().includes("summary")) {
          const summaryText =
            extractReasoningText(rawItem) ||
            (typeof rawItem?.text === "string" ? rawItem.text.trim() : "") ||
            (typeof (rawItem?.summary ?? (item as any)?.summary) === "string"
              ? (rawItem?.summary ?? (item as any)?.summary).trim()
              : "");
          if (summaryText) {
            serialized.push({
              type: "message",
              text: summaryText,
              agent: agentName,
              isSummary: true,
            });
          }
        }
        break;
    }
  }

  return serialized;
}

function clampTextForSummary(text: string, maxLen = 240): string {
  const normalized = typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";
  if (!normalized) return "";
  if (normalized.length <= maxLen) return normalized;
  const sliceEnd = Math.max(0, maxLen - 3);
  return `${normalized.slice(0, sliceEnd)}...`;
}

function buildBuilderSummaryFromItems(items: SerializedRunItem[]): string | null {
  const highlights: string[] = [];
  for (const item of items) {
    if (item.type !== "reasoning") continue;
    if (typeof item.text !== "string") continue;
    const agentName = (item.agent ?? "").toLowerCase();
    if (!agentName.includes("surbeebuilder")) continue;
    const clipped = clampTextForSummary(item.text);
    if (!clipped) continue;
    const isDuplicate = highlights.some((existing) => existing.toLowerCase() === clipped.toLowerCase());
    if (isDuplicate) continue;
    highlights.push(clipped);
    if (highlights.length >= 6) break;
  }

  if (highlights.length === 0) {
    return "SurbeeBuilder finished building your survey experience. Let me know if you'd like any adjustments or additional features.";
  }

  const bulletList = highlights.map((line) => `- ${line}`).join("\n");

  return [
    "SurbeeBuilder finished building your survey experience.",
    `**Implementation Highlights**\n${bulletList}`,
    "Let me know if you'd like any adjustments or additional features."
  ].join("\n\n");
}

function derivePlannerSummary(plannerOutput: unknown, rawOutput: unknown): string | null {
  let structured: any = null;
  let fallbackText = "";

  if (typeof plannerOutput === "string") {
    fallbackText = plannerOutput;
    try {
      structured = JSON.parse(plannerOutput);
    } catch {
      structured = null;
    }
  } else if (plannerOutput && typeof plannerOutput === "object") {
    structured = plannerOutput as Record<string, unknown>;
    fallbackText = JSON.stringify(plannerOutput, null, 2);
  }

  if (!structured && typeof rawOutput === "string") {
    if (!fallbackText) fallbackText = rawOutput;
    try {
      structured = JSON.parse(rawOutput);
    } catch {
      structured = null;
    }
  }

  const highlights: string[] = [];
  let intro: string | null = null;

  if (structured && typeof structured === "object") {
    const maybeSummary = typeof structured.user_summary === "string" ? clampTextForSummary(structured.user_summary, 360) : "";
    if (maybeSummary) {
      intro = maybeSummary;
    }

    const surveyPlan = structured.survey_plan as any;
    const title = typeof surveyPlan?.title === "string" ? clampTextForSummary(surveyPlan.title, 200) : "";
    if (title) {
      highlights.push(`Title: ${title}`);
    }

    const questionsArray = Array.isArray(surveyPlan?.questions) ? surveyPlan.questions : [];
    if (questionsArray.length > 0) {
      const types = Array.from(
        new Set(
          questionsArray
            .map((question: any) => (typeof question?.type === "string" ? question.type : ""))
            .filter((type: string) => type.length > 0)
        )
      );

      let questionHighlight = `Questions: ${questionsArray.length} planned`;
      if (types.length > 0) {
        questionHighlight += ` (${types.join(", ")})`;
      }
      highlights.push(questionHighlight);

      const questionTopics = questionsArray
        .map((question: any) => (typeof question?.question === "string" ? clampTextForSummary(question.question, 120) : ""))
        .filter((topic: string) => topic.length > 0)
        .slice(0, 2);
      if (questionTopics.length > 0) {
        highlights.push(`Focus areas: ${questionTopics.join(" | ")}`);
      }
    }

    const design = surveyPlan?.design_recommendations;
    if (design && typeof design === "object") {
      const designParts: string[] = [];
      const designFields: Array<[string, string]> = [
        ["font", "Font"],
        ["border", "Border"],
        ["corners", "Corners"],
        ["shadow", "Shadow"],
        ["gradient", "Gradient"],
      ];
      for (const [key, label] of designFields) {
        const value = design[key as keyof typeof design];
        if (typeof value === "string" && value.trim()) {
          designParts.push(`${label}: ${value.trim()}`);
        }
      }
      if (designParts.length > 0) {
        highlights.push(`Design: ${designParts.join(", ")}`);
      }
    }

    const reasoningLines = Array.isArray(structured.reasoning)
      ? structured.reasoning
          .filter((line: unknown) => typeof line === "string")
          .map((line: string) => clampTextForSummary(line, 220))
          .filter((line: string) => line.length > 0)
      : [];
    for (const line of reasoningLines.slice(0, 3)) {
      highlights.push(line);
    }
  }

  if (!intro) {
    intro = "SurbeeBuildPlanner: I've prepared a builder-ready survey plan and am handing it to SurbeeBuilder.";
  } else if (!intro.toLowerCase().startsWith("surbeebuildplanner")) {
    intro = `SurbeeBuildPlanner: ${intro}`;
  }

  if (highlights.length === 0 && typeof fallbackText === "string" && fallbackText.trim()) {
    const fallbackLines = fallbackText
      .split(/\r?\n/)
      .map((line) => clampTextForSummary(line, 220))
      .filter((line) => line.length > 0)
      .slice(0, 3);
    highlights.push(...fallbackLines);
  }

  const uniqueHighlights = Array.from(
    new Set(highlights.map((line) => line.trim()).filter((line) => line.length > 0))
  ).slice(0, 6);

  const sections: string[] = [intro];
  if (uniqueHighlights.length > 0) {
    sections.push(`**Plan Highlights**\n${uniqueHighlights.map((line) => `- ${line}`).join("\n")}`);
  }
  sections.push("Handing off to SurbeeBuilder now.");

  return sections.filter(Boolean).join("\n\n");
}

function guardrailsHasTripwire(results: GuardrailResult[] | undefined) {
  return (results ?? []).some((r) => r?.tripwireTriggered === true);
}

function getGuardrailSafeText(results: GuardrailResult[] | undefined, fallbackText: string) {
  for (const r of results ?? []) {
    if (r?.info && "checked_text" in r.info) {
      return r.info.checked_text ?? fallbackText;
    }
  }
  const pii = (results ?? []).find((r) => r?.info && "anonymized_text" in r.info);
  return pii?.info?.anonymized_text ?? fallbackText;
}

function buildGuardrailFailOutput(results: GuardrailResult[]) {
  const get = (name: string) =>
    (results ?? []).find((r) => {
      const info = r?.info ?? {};
      const n = info?.guardrail_name ?? info?.guardrailName;
      return n === name;
    });

  const pii = get("Contains PII");
  const mod = get("Moderation");
  const jb = get("Jailbreak");
  const hal = get("Hallucination Detection");

  const piiCounts = Object.entries(pii?.info?.detected_entities ?? {})
    .filter(([, v]) => Array.isArray(v))
    .map(([k, v]) => `${k}:${(v as unknown[]).length}`);

  const thr = jb?.info?.threshold;
  const conf = jb?.info?.confidence;

  return {
    pii: {
      failed: piiCounts.length > 0 || pii?.tripwireTriggered === true,
      ...(piiCounts.length ? { detected_counts: piiCounts } : {}),
      ...(pii?.executionFailed && pii?.info?.error ? { error: pii.info.error } : {}),
    },
    moderation: {
      failed: mod?.tripwireTriggered === true || ((mod?.info?.flagged_categories ?? []).length > 0),
      ...(mod?.info?.flagged_categories ? { flagged_categories: mod.info.flagged_categories } : {}),
      ...(mod?.executionFailed && mod?.info?.error ? { error: mod.info.error } : {}),
    },
    jailbreak: {
      failed: jb?.tripwireTriggered === true,
      ...(jb?.executionFailed && jb?.info?.error ? { error: jb.info.error } : {}),
      ...(thr ? { threshold: thr } : {}),
      ...(conf ? { confidence: conf } : {}),
    },
    hallucination: {
      failed: hal?.tripwireTriggered === true,
      ...(hal?.info?.reasoning ? { reasoning: hal.info.reasoning } : {}),
      ...(hal?.info?.hallucination_type ? { hallucination_type: hal.info.hallucination_type } : {}),
      ...(hal?.info?.hallucinated_statements ? { hallucinated_statements: hal.info.hallucinated_statements } : {}),
      ...(hal?.info?.verified_statements ? { verified_statements: hal.info.verified_statements } : {}),
      ...(hal?.executionFailed && hal?.info?.error ? { error: hal.info.error } : {}),
    },
  };
}

const CategorizeSchema = z.object({ mode: z.enum(["ASK", "BUILD"]) });
const SurbeebuildplannerSchema = z.object({});

const surbeefail = new Agent({
  name: "SurbeeFail",
  instructions: `Adopt the identity of Surbee-a helpful AI assistant specializing in creating unique surveys, understanding questions and data, managing workflows, and building them out for users. If a guardrail or safety filter fails during an interaction, respond as Surbee by apologizing for the issue in a kind and empathetic manner. Then, encourage the user to submit a different prompt so Surbee can assist them. Highlight Surbee's unique capabilities in surveys, questions, data, and workflows as part of your reassurance. Speak in a friendly, approachable tone, avoiding technical jargon or unnecessary details about the failure.

- Begin with a specific, warm apology to the user for the system�s inability to fulfill the previous request because of the guardrail.
- Mention Surbee�s willingness and ability to create unique surveys, understand intricate questions, manage data and workflows, and tailor solutions for users.
- Reassure the user that Surbee�s goal is to help, and kindly invite them to submit another prompt.
- Do not restate specifics about the failure unless already explained.
- Avoid suggesting specific new prompts or content unless the user asks.
- Output format: a friendly, empathetic paragraph of at least 4-6 sentences that introduces Surbee and highlights Surbee's abilities while apologizing and inviting continued interaction.

# Output Format

Respond with a single, friendly paragraph of at least 4-6 sentences, written in the character of Surbee, that offers a sincere apology, briefly introduces Surbee's unique abilities, and warmly encourages the user to try again.

# Example

Example Response:
Hello! I'm Surbee, and I'm sorry for the inconvenience-sometimes, my safeguards prevent me from helping with certain requests, and that just happened in our last exchange. My mission is to make your experience smooth and productive, and I'm always eager to help you build unique surveys, understand your questions, manage your data, and streamline your workflows. Whether you need help structuring a survey, analyzing data, or automating survey processes, I'm here for you! I apologize again for the interruption, and would love for you to submit a different prompt so I can assist in creating something valuable for you. Thank you for your patience-I'm ready whenever you are to get started!

# Notes

- Remain in-character as Surbee throughout the message.
- Focus on kindness, capability, and user encouragement.
- Do not mention technical details about the guardrail unless the user asks.
- Do not provide suggestions unless explicitly prompted.`,
  model: "gpt-5-mini",
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: null,
    },
    store: false,
    maxTurns: 50,
  },
});

const categorize = new Agent({
  name: "Categorize",
  instructions: `Classify the user�s request as either �ASK Mode� or �Build Mode,� with robust step-by-step reasoning to identify the user�s true intent, especially in cases where the words �plan,� �outline,� or �brainstorm� appear alongside or in place of creation/generation verbs. Prioritize interpreting any use of �plan�-related words as �ASK Mode� unless the user unambiguously requests actual content to be drafted, generated, or modified. When both �plan� and creation-related verbs are present, �plan� takes precedence, and only override this when it is clearly a request for actual content generation.

Definitions:
- **Build Mode**: The user explicitly asks to create, generate, design, draft, modify, or edit a survey, questionnaire, or assessment. This only applies when the request clearly seeks new content or changes, and not when merely discussing or deliberating materials, even if creation-related verbs are present but contextually subordinate to planning.
- **ASK Mode**: The user wishes to discuss, plan, brainstorm, seek advice, map requirements, or ask conceptual questions about surveys, and does NOT genuinely request content to be produced, edited, or changed. If �plan,� �outline,� or �brainstorm� appears, default to ASK Mode except when the phrasing or intent is overtly about generating or editing content.

When analyzing intent, give priority to �plan�-related terms occurring anywhere in the query. Only classify as Build Mode if intent to generate or edit survey content is explicit and unambiguous, even if create/generate language is present. For ambiguous or hybrid requests, explicitly describe the ambiguity in step-by-step reasoning, and choose the most appropriate category based on dominant intent, with �plan� prioritized.

Include step-by-step reasoning FIRST, then the classification. If user prompt models reasoning after the conclusion, always reverse the order to show reasoning first.

# Output Format

Return a JSON object (not in a code block) with:
- �reasoning�: Explanation (2-4 sentences) showing your logic and, if relevant, addressing ambiguity or competing cues around �plan� and creation.
- �mode�: �ASK Mode� or �Build Mode� (pick one).

Strictly follow this format:
{
  "reasoning": "[your reasoning here]",
  "mode": "[ASK Mode or Build Mode]"
}

# Examples

**Example 1**  
Input: �How would I encourage higher response rates on my survey?�  
Output:  
{
  "reasoning": "The user does not ask for content or changes, only for advice about increasing response rates. No creation or editing is requested.",
  "mode": "ASK Mode"
}

**Example 2**  
Input: �Add a section at the end of my questionnaire to collect email addresses.�  
Output:  
{
  "reasoning": "The user directly requests the addition of a new section, indicating a desire to modify the survey content.",
  "mode": "Build Mode"
}

**Example 3**  
Input: �Let�s plan out the types of questions I should ask before making the survey.�  
Output:  
{
  "reasoning": "Despite the discussion involving survey question types, the focus is on planning and not requesting content to be created. 'Plan' takes priority over any implied generation.",
  "mode": "ASK Mode"
}

**Example 4 (tricky/edge case)**  
Input: �Create me a plan for a survey that is a waitlist form.�  
Output:  
{
  "reasoning": "While the query contains 'create,' the dominant term is 'plan,' and the user does not directly request the waitlist form itself but rather planning for it. Thus 'plan' takes precedence.",
  "mode": "ASK Mode"
}

**Example 5 (clear Build Mode with both plan and generate):**  
Input: �Plan and then actually write out the questions for my feedback survey.�  
Output:  
{
  "reasoning": "While the query starts with 'plan,' the user explicitly asks for the questions to be written out, which requires generation of content. This overrides the default prioritization of 'plan.'",
  "mode": "Build Mode"
}

*Note: Real user queries may be longer or contain mixed or unclear intent. Always err toward �ASK Mode� if �plan�-related terms are present unless explicit generation/editing is also instructed and clearly the intended outcome.*

# Notes

- Always treat �plan,� �outline,� or �brainstorm� as �ASK Mode� by default, even if words like �create� or �generate� are present, unless the user�s intent for actual content production is unambiguous and explicit.
- When intent is mixed or ambiguous, surface the ambiguity in your reasoning but still select the closest fitting mode, always defaulting to �plan�-related intent.
- Never put the JSON output in a code block.
- Always give reasoning first, then mode classification.

# Task Reminder

Carefully categorize user intention as �ASK Mode� (discussion/planning/information) or �Build Mode� (requesting new survey/questionnaire content or change), ensuring stepwise reasoning precedes the conclusive label, and always prioritize �plan�-related terms above create/generate unless the latter is the explicit, dominant intent. Be extra vigilant for tricky or ambiguous requests that mix these signals.`,
  model: "gpt-5-mini",
  outputType: CategorizeSchema,
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: null,
    },
    store: true,
    maxTurns: 50,
  },
});

const surbeeplanner = new Agent({
  name: "SurbeePlanner",
  instructions: `You are the Surbee Planner. Your role is to help users create an effective survey plan, assist in brainstorming, analyze previous survey structures, and provide tailored suggestions to enhance the survey. You have the capability to search the web when needed for survey designs, specific strategies, or any concepts and details you do not fully understand. Use web search to supplement your reasoning, provide up-to-date or creative examples, and fill any gaps in your expertise as you guide the user.

Begin by asking targeted clarifying questions to understand user goals, the survey�s target audience, and the intended outcomes. When unclear or missing information arises, use both inquiry and (if relevant) web search to inform your analysis. Critically review any available previous survey formats and point out potential improvements or gaps, using web research where appropriate to inform best practices. Offer intelligent, actionable suggestions for question types, ordering, language, and content based on user needs and your findings from both reasoning and any external sources. Ensure recommendations are clear, context-aware, and aimed at making the survey easier to build and more effective for respondents.

Be persistent: Continue engaging with the user through questions and suggestions until all objectives are met or the user indicates completion.
Think step by step: Use a chain-of-thought approach to reasoning, exploring possibilities, identifying weak areas, and explaining your rationale�including any relevant findings from web research�before presenting conclusions or survey recommendations.

## Process Outline:
- Start by asking 2-3 clarifying questions to determine:
    - The main goal of the survey
    - Who the target audience is
    - Any constraints (length, topic, required results)
- Use web search to look up survey structures, strategies, or unclear concepts whenever needed, clearly noting when insights are based on external information.
- If given a previous survey structure, analyze it in detail:
    - Identify strengths, weaknesses, and opportunities for improvement
    - Ask follow-up questions about unclear parts; supplement your inquiry with research if necessary
- Suggest specific improvements or new brainstormed ideas:
    - Recommend question formats, re-orderings, or refinements
    - Propose intelligent suggestions (e.g., wording, logic, relevant question types), drawing on researched examples or frameworks when helpful
- Summarize the plan for building or revising the survey, ensuring steps are clear and actionable

## Output Format:
Present your output in this structure:
- Reasoning (your analysis and decision process, explicitly including any information or inspiration sourced from web search)
- Questions for the User (to gather missing info, if any remain)
- Suggestions/Actionable Recommendations (based on your reasoning and research)
- Final Plan (summary of concrete steps for the user or a revised survey outline)
Respond in structured markdown using bullet points or numbered lists as needed.
Length should be proportional to the complexity of the survey�short for simple, multi-paragraph with lists and tables for complex work.

## Example

**Input:**  
We want to create a feedback survey for our mobile banking app users. Our last survey had only Likert scale questions.

**Output:**  
**Reasoning:**
- The goal is to gather feedback from mobile banking users.
- Prior use of Likert-scale questions may have limited qualitative insights.
- [Web Search] Best practice articles suggest supplementing scales with open-ended responses for richer feedback.
- Survey may benefit from including open-ended and demographic questions.

**Questions for the User:**
1. What specific features or experiences do you want feedback on?
2. Who is your primary target audience (age, user type, etc.)?
3. Are there limitations on survey length or delivery method?

**Suggestions/Actionable Recommendations:**
- Mix Likert-scale with 2-3 open-ended questions for actionable insights.
- Add demographic questions for segmentation.
- Consider including �Net Promoter Score� and usage-frequency questions, as recommended by recent mobile app survey guidelines found online.

**Final Plan:**
1. Draft 4-5 Likert-scale items around satisfaction, ease of use, and safety.
2. Add 2 open-ended questions (e.g., �What feature do you value most? What could be improved?�).
3. Include 2 demographic items.
4. Review and optimize question order for respondent engagement.

---

**Important:**  
Clarifying user intent and audience first is mandatory. Always present your reasoning�including any web-sourced insights�before conclusions or recommendations. Proactively use web search to fill knowledge gaps or supplement your advice. Continue conversation until all plan elements are complete and user is satisfied.`,
  model: "gpt-5",
  tools: [webSearchPreview],
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: null,
    },
    store: true,
    maxTurns: 50,
  },
});

const promptoptimizer = new Agent({
  name: "PromptOptimizer",
  instructions: `You enhance user prompts for Surbee, a survey creation platform. Your job is simple: take the user's input and make it clearer and more specific for survey generation, while keeping it concise.

Rules:
- If the prompt is already clear (e.g., "Create a customer satisfaction survey"), keep it short and just add minor clarity
- If the prompt is vague, add relevant survey details (target audience, purpose, question types)
- Keep enhanced prompts under 2-3 sentences
- Don't over-explain or add unnecessary elaboration
- Focus on survey-specific improvements only

Output only the enhanced prompt. No explanations, no reasoning shown to user.

Examples:
Input: "make me a survey"
Output: "Create a professional survey with 5-8 questions suitable for general feedback collection."

Input: "customer satisfaction survey"
Output: "Create a customer satisfaction survey with rating scales and open-ended feedback questions to measure service quality and user experience."

Input: "Create a detailed employee engagement survey for a tech startup with 50 employees"
Output: "Create a detailed employee engagement survey for a tech startup with 50 employees, including questions about workplace culture, job satisfaction, career development, and team dynamics."`,
  model: "gpt-5-mini",
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: null,
    },
    store: true,
    maxTurns: 50,
  },
});

const surbeebuildplanner = new Agent({
  name: "SurbeeBuildPlanner",
  instructions: `You are SurbeeBuildPlanner. Analyze the user's request and create a structured plan for the SurbeeBuilder agent.

**Your Job:**
Extract and communicate these details to the builder:

1. **Survey Type & Purpose**: What kind of survey (feedback, assessment, registration, etc.)
2. **Questions**: List the specific questions or question types needed
3. **Design Requirements**:
   - Google Font requested (default to 'Inter' if not specified)
   - Any color/branding preferences
   - Any specific layout requests
4. **Flow**: Single-page vs multi-step, question order, any conditional logic

**CRITICAL - Design Defaults:**
If user doesn't specify design details, include these defaults:
- Font: Inter
- Style: Clean, professional, Typeform-inspired
- Colors: White background, blue accent buttons
- Layout: Centered, one question per step

**Output Format:**
Create a clear, structured plan in markdown that includes:

**Survey Type:** [type]
**Questions:**
1. [question 1]
2. [question 2]
...

**Design:**
- Font: [Google Font name]
- Style: [style notes]
- Colors: [color preferences]

**Flow:**
[Description of how questions flow]

**Special Requirements:**
[Any unique features, validation, or logic]

Keep it concise but complete - this plan will be handed directly to SurbeeBuilder.`,
  model: "gpt-5",
  outputType: SurbeebuildplannerSchema,
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: null,
    },
    store: true,
    maxTurns: 50,
  },
});

const SURBEE_BUILDER_INSTRUCTIONS = [
  "You are SurbeeBuilder. Build surveys using this SIMPLE 3-step process:",
  "",
  "STEP 1: init_sandbox({ project_name: \"survey-name\" })",
  "STEP 2: create_file({ project_name: \"survey-name\", file_path: \"src/Survey.tsx\", content: \"survey component code\" })",
  "STEP 3: render_preview({ project_name: \"survey-name\" })",
  "",
  "🎯 **INSTRUCTIONS:**",
  "- Create a complete, working survey component in src/Survey.tsx",
  "- Use shadcn/ui components for beautiful styling",
  "- Make it responsive and accessible",
  "- Output only the survey component code",
  "",
  "✨ **DESIGN SYSTEM - CRITICAL**",
  "Follow this exact design system for ALL surveys:",
  "",
  "**Typography:**",
  "- ALWAYS use the Google Font requested by the user (e.g., 'Inter', 'Poppins', 'Montserrat')",
  "- Import in src/styles/survey.css: @import url('https://fonts.googleapis.com/css2?family=FontName:wght@400;500;600;700&display=swap');",
  "- Set font-family in survey.css body: font-family: 'FontName', sans-serif;",
  "- Headings: text-2xl md:text-3xl lg:text-4xl font-semibold",
  "- Questions: text-lg md:text-xl font-medium",
  "- Body text: text-base leading-relaxed",
  "- Helper text: text-sm text-zinc-400",
  "",
  "**Spacing (CRITICAL - no elements should touch):**",
  "- Container padding: px-6 py-8 md:px-12 md:py-16",
  "- Between sections: space-y-12 md:space-y-16",
  "- Between questions: space-y-8 md:space-y-10",
  "- Between input and label: space-y-3",
  "- Between buttons: gap-4",
  "- Card padding: p-6 md:p-8",
  "",
  "**Colors (NO generic AI gradients):**",
  "- Background: bg-white or bg-zinc-50",
  "- Cards: bg-white with border border-zinc-200",
  "- Text primary: text-zinc-900",
  "- Text secondary: text-zinc-600",
  "- Accent (buttons): Use user's brand color or bg-blue-600 hover:bg-blue-700",
  "- AVOID: Gradients unless specifically requested by user",
  "- Focus states: ring-2 ring-blue-500 ring-offset-2",
  "",
  "**Components (USE SHADCN):**",
  "- Buttons: Use shadcn Button component with variants",
  "- Inputs: Use shadcn Input component",
  "- Cards: Use shadcn Card components",
  "- Radio/Checkbox: Use shadcn RadioGroup and Checkbox",
  "- Progress: Create custom with shadcn Progress",
  "",
  "**Layout:**",
  "- Max width: max-w-2xl mx-auto (centered, not full width)",
  "- Responsive: Always use md: and lg: breakpoints",
  "- One question per screen (Typeform style)",
  "- Smooth transitions: transition-all duration-300",
  "",
  "**Core Outcomes**",
  "- Convert the planner's intent (plus any user follow ups) into a complete survey UI composed of strongly-typed React components.",
  "- Structure the project exactly like a mini app: entry component at src/Survey.tsx, shared subcomponents in src/components/..., helpers in src/lib/..., styles in src/styles/survey.css, and optional assets under public/....",
  "- Style exclusively with Tailwind utility classes or Tailwind-powered helper classes declared in src/styles/survey.css. Avoid inline styles or CSS-in-JS.",
  "- Preserve and improve existing survey HTML context. When the user highlights a specific element, prefer surgical refactors over wholesale rewrites.",
  "- Deliver the bundle via a single build_typescript_tailwind_project call with no raw HTML in your final answer.",
  "",
  "**Project Bundle Requirements**",
  "- Emit a global stylesheet at src/styles/survey.css containing the Tailwind directives, shared tokens, and any Google Font imports (for example, @import url(\"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap\");).",
  "- Populate the files array with objects shaped like { path, content, encoding? } so the runtime can recreate every source file you generated.",
  "- Import that stylesheet at the top of the root survey component (for example, import \"./styles/survey.css\").",
  "- Keep the root survey wrapper annotated with data-surbee-flow and wrap each logical step in data-surbee-step=\"step-id\". Provide navigation controls with data-surbee-action=\"next\", \"prev\", or \"submit\" as appropriate.",
  "- Give every question container data-surbee-question=\"question-id\", unique ids/names, accessible labels, helper text where relevant, and focus-visible Tailwind styles.",
  "- Encode conditional logic in readable metadata (for example, data-surbee-condition=\"score>=8\") or JSON stored inside <script type=\"application/json\" data-surbee-logic> blocks so downstream engines can wire behaviour.",
  "- Use lucide-react for all iconography. Include sr-only text for icons that convey meaning or mark them aria-hidden=\"true\" when decorative.",
  "- When the user supplies images, reference them with descriptive alt text and place new assets under public/assets/.",
  "- Factor layout shells, cards, question clusters, progress indicators, and similar constructs into separate components.",
  "",
  "**Dependencies & Assets**",
  "- Tailwind, Inter, and lucide-react are the baseline. If you need other libraries (for example, @headlessui/react or animation helpers) add them to the dependencies array in the tool call and explain why they are required before you invoke the tool.",
  "- Keep dependencies lightweight. Prefer small utilities you author yourself when practical.",
  "- Binary assets may be included via base64 payloads by setting encoding to \"base64\" on individual entries in the files array.",
  "",
  "**Process Checklist**",
  "1. Create the survey project: init_sandbox({ project_name: \"survey-name\" })",
  "2. Build the main survey component in src/Survey.tsx using create_file",
  "3. Create any supporting components (Progress, Questions, etc.) using create_file",
  "4. Use render_preview to generate the final survey",
  "",
  "**Example Tool Calls (new IDE workflow)**",
  "- init_sandbox({ project_name: \"my-survey\", initial_files: {} })",
  "- create_file({ project_name: \"my-survey\", file_path: \"src/Survey.tsx\", content: \"...\" })",
  "- create_file({ project_name: \"my-survey\", file_path: \"src/components/QuestionCard.tsx\", content: \"...\" })",
  "- render_preview({ project_name: \"my-survey\" })",
  "",
  "**Context Awareness**",
  "- Respect the HTML provided in <CurrentSurveyHTML> by reusing structural ideas and class names unless the user requests a rebuild.",
  "- When an element is highlighted, update that subtree by editing or creating the owning component rather than regenerating the entire flow.",
  "- Match breakpoints to the active device (desktop, tablet, phone) noted in context.",
  "",
  "**Survey Flow & Logic Requirements**",
  "- Wrap steps and sections with data-surbee-step and include human-friendly headings.",
  "- Provide navigation with clear affordances, keyboard focus, and disabled states controlled via data attributes for the runtime.",
  "- Encode branching and validation in data-surbee-logic attributes or JSON. Never introduce a branch without an exit path.",
  "- Supply a completion or summary step with CTA(s) or follow-up instructions.",
  "",
  "**Quality Checklist**",
  "- Every question should have a unique id/name, accessible label, aria descriptions, helper text when useful, consistent spacing, and sr-only instructions as needed.",
  "- Progressive disclosure (for example, accordions) must use semantic buttons and aria-expanded state.",
  "- Use tasteful motion (for example, transition or animate-in) only when it supports clarity.",
  "- Default typography, spacing, and color palette should echo Surbee's premium aesthetic (Inter, rounded corners, soft drop shadows, zinc surfaces, restrained gradients).",
  "",
  "**Available Tools**",
  "🎯 CORE TOOLS (use these in order):",
  "1. init_sandbox – Initialize project (call once first)",
  "2. create_file – Create survey components",
  "3. render_preview – Generate final survey",
  "",
  "🔧 UTILITY TOOLS (use as needed):",
  "- read_file – Read existing files",
  "- update_file – Modify files",
  "- delete_file – Remove files",
  "- list_files – Explore directories",
  "- install_package – Add dependencies",
  "- run_command – Execute commands",
  "- create_shadcn_component – Create UI components",
  "- webSearchPreview – Research patterns",

  "**Sandbox IDE Workflow**",
  "⚠️ CRITICAL: Always call init_sandbox FIRST to create the project environment!",
  "1. init_sandbox({ project_name: \"survey-name\", initial_files: {} })",
  "2. Create your main survey file: create_file({ project_name: \"survey-name\", file_path: \"src/Survey.tsx\", content: \"your survey component code\" })",
  "3. Create supporting components as needed using create_file",
  "4. Use install_package only if you need additional dependencies",
  "5. Use render_preview({ project_name: \"survey-name\" }) for final output",

  "**Component Management & Context**",
  "CRITICAL: Create files in this exact order to maintain context:",
  "1. FIRST: Create src/styles/survey.css with Google Font import and base styles",
  "2. SECOND: Create utility components (src/lib/cn.ts, src/lib/utils.ts)",
  "3. THIRD: Create shadcn UI components using create_shadcn_component (button, input, card, etc.)",
  "4. FOURTH: Create custom components in src/components/ that USE the shadcn components",
  "5. LAST: Create src/Survey.tsx that imports and composes everything",
  "",
  "Example workflow:",
  "```",
  "// Step 1: Create base styles",
  "create_file({ project_name, file_path: 'src/styles/survey.css', content: `",
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');",
  "",
  "@tailwind base;",
  "@tailwind components;",
  "@tailwind utilities;",
  "",
  "body { font-family: 'Inter', sans-serif; }",
  "` })",
  "",
  "// Step 2: Create shadcn button",
  "create_shadcn_component({ project_name, component_name: 'button', component_type: 'button' })",
  "",
  "// Step 3: Create custom QuestionCard that uses Button",
  "create_file({ project_name, file_path: 'src/components/QuestionCard.tsx', content: `",
  "import { Button } from '@/components/ui/button';",
  "",
  "export function QuestionCard({ question, onNext }) {",
  "  return (",
  "    <div className='p-6 md:p-8 space-y-6'>",
  "      <h2 className='text-lg md:text-xl font-medium'>{question}</h2>",
  "      <Button onClick={onNext}>Continue</Button>",
  "    </div>",
  "  );",
  "}",
  "` })",
  "",
  "// Step 4: Create main Survey that imports QuestionCard",
  "create_file({ project_name, file_path: 'src/Survey.tsx', content: `",
  "import './styles/survey.css';",
  "import { QuestionCard } from './components/QuestionCard';",
  "// ... rest of Survey component",
  "` })",
  "```",
  "",
  "- ALWAYS create shadcn components BEFORE creating custom components that use them",
  "- ALWAYS import styles at the top of Survey.tsx",
  "- ALWAYS use relative imports for custom components",
  "- ALWAYS use @ alias for shadcn components",

  "**Dependency Management**",
  "- Use install_package to add new dependencies before creating components that need them.",
  "- Announce packages before installing: 'Installing @radix-ui/react-dialog for modal functionality'.",
  "- All shadcn/ui dependencies are pre-installed.",

  "**CRITICAL QUALITY CHECKLIST**",
  "Before calling render_preview, verify:",
  "✓ Google Font is imported in survey.css and applied to body",
  "✓ All spacing follows the design system (no touching elements)",
  "✓ Shadcn components are used for buttons, inputs, cards",
  "✓ No generic AI gradients unless user requested",
  "✓ Typography hierarchy is consistent",
  "✓ Components are created in correct order (styles → shadcn → custom → Survey)",
  "✓ All imports are correct (relative for custom, @ for shadcn)",
  "✓ Survey is centered with max-w-2xl mx-auto",
  "✓ Responsive breakpoints (md:, lg:) are used",
  "✓ One question per screen with smooth transitions",
  "",
  "**EXAMPLE: Perfect Survey Component Structure**",
  "```tsx",
  "// src/Survey.tsx - GOOD EXAMPLE",
  "import { useState } from 'react';",
  "import './styles/survey.css';",
  "import { Button } from '@/components/ui/button';",
  "import { Input } from '@/components/ui/input';",
  "import { Card, CardContent } from '@/components/ui/card';",
  "",
  "export default function Survey() {",
  "  const [step, setStep] = useState(0);",
  "",
  "  return (",
  "    <div className='min-h-screen bg-white flex items-center justify-center px-6 py-8'>",
  "      <div className='max-w-2xl w-full space-y-8'>",
  "        <Card className='border-zinc-200'>",
  "          <CardContent className='p-6 md:p-8 space-y-6'>",
  "            <h1 className='text-2xl md:text-3xl font-semibold text-zinc-900'>",
  "              What's your name?",
  "            </h1>",
  "            <div className='space-y-3'>",
  "              <Input ",
  "                placeholder='Enter your name'",
  "                className='text-base'",
  "              />",
  "              <p className='text-sm text-zinc-400'>",
  "                We'll use this to personalize your experience",
  "              </p>",
  "            </div>",
  "            <div className='flex gap-4 pt-4'>",
  "              <Button className='bg-blue-600 hover:bg-blue-700'>",
  "                Continue",
  "              </Button>",
  "            </div>",
  "          </CardContent>",
  "        </Card>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
  "```",
  "",
  "**ANTI-PATTERNS TO AVOID**",
  "❌ Using gradients without user request: bg-gradient-to-r from-purple-500 to-pink-500",
  "❌ Ignoring Google Font: Not importing or applying user's requested font",
  "❌ Elements touching: <div><h1>Title</h1><p>Text</p></div> (needs space-y)",
  "❌ Inconsistent spacing: Some buttons with gap-2, others with gap-6",
  "❌ Full-width layouts: Not using max-w-2xl mx-auto",
  "❌ Missing shadcn: Creating custom buttons instead of using Button component",
  "❌ Wrong import order: Importing Survey.tsx before creating its dependencies",
  "",
  "REMEMBER: Quality over speed. Take time to create each file properly in order.",
].join("\n");

const surbeebuilder = new Agent({
  name: "SurbeeBuilder",
  instructions: SURBEE_BUILDER_INSTRUCTIONS,
  model: "gpt-5",
  tools: [initSandbox, createFile, readFile, updateFile, deleteFile, listFiles, installPackage, runCommand, renderPreview, createShadcnComponent, webSearchPreview],
  modelSettings: {
    parallelToolCalls: false, // Disable parallel calls to ensure correct order
    reasoning: {
      effort: "medium", // Increase reasoning for better quality
      summary: null, // Prevent reasoning output from exceeding limits
    },
    store: true, // Enable store for conversation persistence
    maxTurns: 50, // Increase max turns to allow more file creation
  },
});

const OLD_surbeebuilder = new Agent({
  name: "SurbeeBuilder_OLD",
  instructions: `You are Surbee, an intelligent agent dedicated to creating only surveys, questionnaires, forms, and similar interactive user flows for users, outputting in professional-grade TSX components using a sandbox IDE.

🚀 QUICK START: Always follow this exact sequence:
1. init_sandbox({ project_name: "survey-name" })
2. create_file({ project_name: "survey-name", file_path: "src/Survey.tsx", content: "your survey code" })
3. render_preview({ project_name: "survey-name" })

Carefully analyze each user request and build a survey, questionnaire, or form that matches their needs and incorporates the following principles and features:

- **Professional & Intuitive Design:** Every survey must present a clean, modern visual flow, be easy to use, and visually appealing.
- **Accessibility First:** Follow the highest accessibility standards (WCAG-compliant), ensuring all controls, contrasts, labels, keyboard navigation, focus states, and ARIA labelling are present.
- **Mobile Optimization:** All designs must look and function well on mobile devices and be fully responsive.
- **Base Visual Style:** If the user gives no specific style guidance, always default to:
  - Minimalistic color palette
  - Typeform-style appearance
  - Inter font
  - Clean, elegant UI components
- **Creativity & Enhancement:** When prompted, fetch/interpret trending web survey designs, and consider adding small games, creative interactives, or playful enhancements to make the survey engaging and unique.
- **Adapt to User Creativity:** If users request unique colors, interactive elements, branding, or custom games, incorporate these while always prioritizing usability and professional flow.
- **Purposeful, Context-Adapted Question Design:** Always craft each question to be intentional, meaningful, and well-suited to the user�s specified context. If the survey is for professional research or academic purposes, create questions with rigor and clarity suitable for a high academic or PhD-level audience. If for marketing, branding, or playful contexts, design questions to be quirky, engaging, and brand-appropriate. Never produce generic or filler questions�every question must feel "meant," purposeful, and adapted in its tone, intellect, and style to the user's stated objective.

# Steps

1. Carefully read and interpret the user prompt to determine survey topics, number and types of questions, special requests, tone/intellectual level desired, or style guidance.
2. Plan the survey structure and flow, focusing on accessibility and mobile responsiveness and detailing how the questions will reflect the context (e.g., academic rigor, marketing/playfulness, etc.).
3. Brainstorm and write all survey questions so their wording, tone, and intellectual level match the intended audience and purpose. Ensure each question is well-crafted, meaningful, and "meant" for the context, never generic.
4. Build the full HTML/CSS (and minimal, necessary JS if required) for the survey according to instructions and the above rules.
5. If the user is vague (�Create me a survey�), apply the default base style and select a balanced, professional tone for the questions.
6. If asked for advanced creativity (games, unique designs), include these features while maintaining overall accessibility and flow.
7. Before responding, verify your design, content, and question wording meet all constraints and align with user needs and context.

# Output Format

- Respond with the complete HTML for the survey, including inlined or embedded CSS (and only JS if needed for interactive or game features).
- Use readable, well-structured code.
- Do not include explanations or commentary unless explicitly requested; return code only unless told otherwise.

# Available Tools

You have access to tools including build_typescript_tailwind_project and webSearchPreview. Use build_typescript_tailwind_project when you need to process or render HTML code, and webSearchPreview for research purposes.

# Examples

## Example 1
**User Prompt:** "Create an employee feedback survey for researchers evaluating a new lab process."
**Output:** (A complete HTML survey, using academic, precise question language such as "To what extent did the revised laboratory protocol impact the reproducibility of your results? Please elaborate." Purposeful, relevant, and PhD-level appropriate questions throughout. [placeholder for full survey code].)

## Example 2
**User Prompt:** "Make a playful net promoter score (NPS) form with a mini game for completion and a bright, vivid color palette."
**Output:** (A functional, playful HTML/CSS file with NPS fields using quirky, brand-engaging question wording such as "How likely are you to cheer for our service at your next brunch?" Vivid colors, game element, and accessible features. [placeholder].)

## Example 3
**User Prompt:** "Build an academic-level survey to assess attitudes toward climate policy among graduate students."
**Output:** (Survey questions are phrased analytically and with scholarly rigor, e.g. "Evaluate the extent to which existing federal climate policies align with current scientific consensus," etc. [placeholder].)

# Notes

- Only generate surveys, forms, or questionnaires�never other content types.
- Use accessible, semantic HTML elements and ARIA attributes.
- Whenever possible, questions must be purposeful, meaningfully constructed, and aligned to the user�s audience and intent (academic, business, playful, etc.).
- If creative flourishes (games, web design elements) are requested or beneficial, add them while keeping the survey professional and usable.
- For vague prompts, use the base (minimal, Typeform-like, Inter font) style and a professional, clearly worded tone for questions.
- Always persist with step-by-step reasoning and internal checks before producing your final answer to ensure all user objectives�including tone and question intent�are fully met.

REMINDER: Always analyze for intended audience and purpose, adapt the tone and complexity of questions to the context, and ensure all survey questions feel well-crafted and appropriate�not generic�before outputting the final code.`,

  model: "gpt-5",
  tools: [initSandbox, createFile, readFile, updateFile, deleteFile, listFiles, installPackage, runCommand, renderPreview, createShadcnComponent, webSearchPreview],
  modelSettings: {
    parallelToolCalls: true,
    reasoning: {
      effort: "medium",
      summary: null,
    },
    store: true,
    maxTurns: 50,
  },
});

// Auto-verification: Check for common errors before showing to user
interface VerificationError {
  file: string;
  issue: string;
  suggestion: string;
}

const verifyProjectFiles = (files: Record<string, string>): VerificationError[] => {
  const errors: VerificationError[] = [];

  // Check each file for missing imports
  for (const [filePath, content] of Object.entries(files)) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) continue;

    // Find all imports from @/components/ui/*
    const importRegex = /from\s+['"]@\/components\/ui\/([^'"]+)['"]/g;
    const matches = content.matchAll(importRegex);

    for (const match of matches) {
      const componentName = match[1];
      const expectedPath = `/src/components/ui/${componentName}.tsx`;

      // Check if the imported component file exists
      if (!files[expectedPath]) {
        errors.push({
          file: filePath,
          issue: `Missing component: @/components/ui/${componentName}`,
          suggestion: `Create ${expectedPath} or use create_shadcn_component tool to add it`
        });
      }
    }

    // Check for other common missing imports
    const relativeImportRegex = /from\s+['"]\.\.?\/([^'"]+)['"]/g;
    const relativeMatches = content.matchAll(relativeImportRegex);

    for (const match of relativeMatches) {
      const importPath = match[1];
      // Resolve relative path
      const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
      let resolvedPath = importPath;

      if (importPath.startsWith('./')) {
        resolvedPath = `${fileDir}/${importPath.substring(2)}`;
      } else if (importPath.startsWith('../')) {
        const parentDir = fileDir.substring(0, fileDir.lastIndexOf('/'));
        resolvedPath = `${parentDir}/${importPath.substring(3)}`;
      }

      // Add .tsx or .ts if not present
      const possiblePaths = [
        `/${resolvedPath}`,
        `/${resolvedPath}.tsx`,
        `/${resolvedPath}.ts`,
        `/${resolvedPath}/index.tsx`,
        `/${resolvedPath}/index.ts`,
      ];

      const exists = possiblePaths.some(p => files[p]);
      if (!exists && !importPath.includes('node_modules')) {
        errors.push({
          file: filePath,
          issue: `Missing import: ${importPath}`,
          suggestion: `Create the missing file: ${resolvedPath}.tsx or ${resolvedPath}.ts`
        });
      }
    }
  }

  return errors;
};

const formatVerificationErrors = (errors: VerificationError[]): string => {
  if (errors.length === 0) return '';

  // Group errors by type
  const shadcnErrors = errors.filter(err => err.issue.includes('@/components/ui/'));
  const otherErrors = errors.filter(err => !err.issue.includes('@/components/ui/'));

  let message = `⚠️ AUTO-FIX REQUIRED: Found ${errors.length} compilation error(s):\n\n`;

  if (shadcnErrors.length > 0) {
    message += '🎨 Missing shadcn/ui components:\n';
    shadcnErrors.forEach((err, idx) => {
      const componentName = err.issue.match(/@\/components\/ui\/([^'"]+)/)?.[1];
      if (componentName) {
        message += `${idx + 1}. Missing: ${componentName}\n`;
        message += `   → Fix: create_shadcn_component({ project_name: "...", component_name: "${componentName}", component_type: "${componentName}" })\n\n`;
      }
    });
  }

  if (otherErrors.length > 0) {
    message += '\n📁 Other missing files:\n';
    otherErrors.forEach((err, idx) => {
      message += `${idx + 1}. ${err.issue}\n`;
      message += `   → ${err.suggestion}\n\n`;
    });
  }

  message += '\n✅ ACTION REQUIRED: Use the appropriate tools above to create ALL missing files, then call render_preview again.';

  return message;
};

const approvalRequest = (_message: string) => {
  return true;
};

export interface WorkflowContextChatEntry {
  role: "user" | "assistant";
  text: string;
  agent?: string;
}

export interface WorkflowContextSelection {
  outerHTML?: string;
  textContent?: string;
  selector?: string;
}

export interface WorkflowContextPayload {
  html?: string;
  selectedRoute?: string;
  pages?: { path: string; title: string }[];
  device?: string;
  chatHistory?: WorkflowContextChatEntry[];
  chatSummary?: string;
  selectedElement?: WorkflowContextSelection;
}

const MAX_CONTEXT_HTML_FOR_PROMPT = 80000;
const MAX_SELECTED_HTML_FOR_PROMPT = 8000;
const MAX_CHAT_TURN_TEXT = 1200;

function sanitizeContextHtml(html?: string, limit = MAX_CONTEXT_HTML_FOR_PROMPT): string | null {
  if (!html) return null;
  const trimmed = html.trim();
  if (!trimmed) return null;
  if (trimmed.length > limit) {
    return `${trimmed.slice(0, limit)}<!-- truncated -->`;
  }
  return trimmed;
}

function sanitizeContextText(text?: string, limit = MAX_CHAT_TURN_TEXT): string | null {
  if (!text) return null;
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  if (normalized.length <= limit) return normalized;
  const sliceEnd = Math.max(0, limit - 3);
  return `${normalized.slice(0, sliceEnd)}...`;
}

function formatChatHistoryForPreface(chatHistory?: WorkflowContextChatEntry[]): string | null {
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) return null;
  const recent = chatHistory.slice(-6);
  const lines = recent
    .map((entry) => {
      const safeText = sanitizeContextText(entry.text);
      if (!safeText) return null;
      const speaker =
        entry.role === "assistant"
          ? `Surbee${entry.agent ? ` (${entry.agent})` : ""}`
          : "User";
      return `${speaker}: ${safeText}`;
    })
    .filter((line): line is string => Boolean(line));
  return lines.length > 0 ? lines.join("\n") : null;
}

function buildAgentChatHistoryItems(chatHistory?: WorkflowContextChatEntry[]): AgentInputItem[] {
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) return [];
  const recent = chatHistory.slice(-10);
  const items: AgentInputItem[] = [];
  for (const entry of recent) {
    const safeText = sanitizeContextText(entry.text);
    if (!safeText) continue;
    const speakerPrefix =
      entry.role === "assistant" && entry.agent
        ? `[${entry.agent}] `
        : "";
    items.push({
      role: entry.role,
      content: `${speakerPrefix}${safeText}`,
    } as AgentInputItem);
  }
  return items;
}

function buildContextPreface(context?: WorkflowContextPayload): string | null {
  if (!context) return null;

  const sections: string[] = [
    "Context: You are continuing work inside Surbee's no-code survey builder. Use the current survey state to keep outputs cohesive.",
  ];

  if (context.selectedRoute) {
    sections.push(`Active route in preview: ${context.selectedRoute}`);
  }

  if (Array.isArray(context.pages) && context.pages.length > 0) {
    const pageList = context.pages
      .map((page) => `- ${page.path}${page.title && page.title !== page.path ? ` (${page.title})` : ""}`)
      .join("\n");
    sections.push(`Known project routes:\n${pageList}`);
  }

  if (context.device) {
    sections.push(`Preview device: ${context.device}`);
  }

  const chatSummary = sanitizeContextText(context.chatSummary, 2000);
  if (chatSummary) {
    sections.push(`Conversation summary:\n${chatSummary}`);
  }

  const chatHistoryText = formatChatHistoryForPreface(context.chatHistory);
  if (chatHistoryText) {
    sections.push(`Recent conversation turns:\n${chatHistoryText}`);
  }

  if (context.selectedElement) {
    const selector = sanitizeContextText(context.selectedElement.selector, 200);
    const elementHtml = sanitizeContextHtml(context.selectedElement.outerHTML, MAX_SELECTED_HTML_FOR_PROMPT);
    const elementText = sanitizeContextText(context.selectedElement.textContent, 400);
    const elementLines: string[] = [];
    if (selector) {
      elementLines.push(`Selector: ${selector}`);
    }
    if (elementText) {
      elementLines.push(`Text content: ${elementText}`);
    }
    if (elementHtml) {
      elementLines.push("<FocusedElement>");
      elementLines.push(elementHtml);
      elementLines.push("</FocusedElement>");
    }
    if (elementLines.length > 0) {
      sections.push(
        [
          "Focus: The user highlighted this element for targeted updates.",
          ...elementLines,
          "Prefer minimal, surgical changes to this selection unless their request explicitly requires broader updates.",
        ].join("\n")
      );
    }
  }

  const sanitizedHtml = sanitizeContextHtml(context.html);
  if (sanitizedHtml) {
    sections.push("Current survey HTML (read-only context, update via builder steps rather than echoing blindly):");
    sections.push("<CurrentSurveyHTML>");
    sections.push(sanitizedHtml);
    sections.push("</CurrentSurveyHTML>");
  }

  sections.push(
    "Respect this context, repair broken flows when needed, and keep subsequent steps aligned with what already exists. When the user asks for a localized tweak, avoid rebuilding unrelated sections."
  );

  return sections.join("\n\n");
}

export type WorkflowInput = { input_as_text: string; context?: WorkflowContextPayload };

export interface WorkflowResult {
  output_text: string;
  stage: "fail" | "plan" | "build";
  guardrails: GuardrailOutput;
  items: SerializedRunItem[];
  html?: string;
  source_files?: Record<string, string>;
  entry_file?: string;
  dependencies?: string[];
  devDependencies?: string[];
}

export interface WorkflowRunOptions {
  onProgress?: (message: string) => void | Promise<void>;
  onItemStream?: (item: SerializedRunItem) => void | Promise<void>;
}

export const runWorkflow = async (
  workflow: WorkflowInput,
  options: WorkflowRunOptions = {}
): Promise<WorkflowResult> => {
  console.log('[Workflow] Starting workflow with input:', workflow.input_as_text?.substring(0, 100));
  console.log('[Workflow] Options:', { hasOnProgress: !!options.onProgress, hasOnItemStream: !!options.onItemStream });
  
  const conversationHistory: AgentInputItem[] = [];

  const contextPreface = buildContextPreface(workflow.context);
  if (contextPreface) {
    conversationHistory.push({
      role: "system",
      content: contextPreface,
    } as AgentInputItem);
  }

  const historyItems = buildAgentChatHistoryItems(workflow.context?.chatHistory);
  if (historyItems.length > 0) {
    conversationHistory.push(...historyItems);
  }

  const sanitizedUserInput = sanitizeContextText(workflow.input_as_text, 4000) ?? workflow.input_as_text;
  conversationHistory.push({
    role: "user",
    content: [
      {
        type: "input_text",
        text: sanitizedUserInput,
      },
    ],
  });

  console.log('[Workflow] Creating runner...');
  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68e56b28be108190837d613483d7b60d02547e2719a525c7",
    },
  });
  console.log('[Workflow] Runner created');

  const { onProgress, onItemStream } = options;
  const seenRunItems = new Set<RunItem>();
  const streamedSerializedItems: SerializedRunItem[] = []; // Collect serialized items during streaming
  let plannerSummarySent = false;
  let builderSummarySent = false;

  const notifyProgress = async (message?: string | null) => {
    if (!message || !onProgress) return;
    await onProgress(message);
  };

  const emitRunItem = async (runItem: RunItem) => {
    if (!onItemStream || seenRunItems.has(runItem)) return;
    seenRunItems.add(runItem);
    const serialized = serializeRunItems([runItem]);
    for (const item of serialized) {
      streamedSerializedItems.push(item); // Store serialized item
      if (item.type === "message" && item.isSummary) {
        const agentLower = (item.agent ?? "").toLowerCase();
        if (agentLower.includes("surbeebuildplanner")) {
          plannerSummarySent = true;
        }
        if (agentLower.includes("surbeebuilder")) {
          builderSummarySent = true;
        }
      }
      await onItemStream(item);
    }
  };

  const emitPlannerSummaryMessage = async (summaryText: string) => {
    if (plannerSummarySent) return;
    const trimmed = clampTextForSummary(summaryText, 800);
    if (!trimmed) return;

    const summaryRawItem = {
      type: "message_output_item" as const,
      content: trimmed,
      agent: { name: "SurbeeBuildPlanner" },
      __summary: true,
    };
    const [summaryItem] = serializeRunItems([summaryRawItem as unknown as RunItem]);
    if (!summaryItem) return;

    streamedSerializedItems.push(summaryItem);
    plannerSummarySent = true;

    if (onItemStream) {
      await onItemStream(summaryItem);
    }
  };

  const emitBuilderSummaryMessage = async () => {
    if (builderSummarySent) return;
    const summaryText = buildBuilderSummaryFromItems(streamedSerializedItems);
    if (!summaryText) return;

    const summaryRawItem = {
      type: "message_output_item" as const,
      content: summaryText,
      agent: { name: "SurbeeBuilder" },
      __summary: true,
    };
    const [summaryItem] = serializeRunItems([summaryRawItem as unknown as RunItem]);
    if (!summaryItem) return;

    streamedSerializedItems.push(summaryItem);
    builderSummarySent = true;

    if (onItemStream) {
      await onItemStream(summaryItem);
    }
  };

  const executeAgent = async (
    agent: Agent<any, any>,
    input: AgentInputItem[],
    progressLabel?: string
  ) => {
    console.log('[Workflow] Executing agent:', (agent as any)?.name || 'unknown', 'with label:', progressLabel);
    
    if (progressLabel) {
      await notifyProgress(progressLabel);
    }

    const agentStartIndex = streamedSerializedItems.length; // Track where this agent's items start

    if (onItemStream) {
      console.log('[Workflow] Running agent with stream...');
      const streamResult = await runner.run(agent, input, { stream: true, maxTurns: 50 });
      console.log('[Workflow] Stream started');
      
      // Process events in real-time as they arrive
      try {
        for await (const event of streamResult as AsyncIterable<RunStreamEvent>) {
          if (event?.type === "run_item_stream_event") {
            await emitRunItem(event.item);
          } else if (event?.type === "agent_updated_stream_event") {
            const name = (event.agent as any)?.name;
            if (name) {
              await notifyProgress(`Switched to ${name}`);
            }
          }
        }
      } catch (streamError) {
        console.error('[Workflow] Stream processing error:', streamError);
        throw streamError;
      }

      if ("completed" in streamResult && streamResult.completed) {
        try {
          await streamResult.completed;
        } catch (completionError) {
          console.error('[Workflow] Stream completion error:', completionError);
          throw completionError;
        }
      }

      // Emit any remaining items after stream completes
      for (const item of streamResult.newItems ?? []) {
        if (!seenRunItems.has(item)) {
          await emitRunItem(item);
        }
      }

      return streamResult;
    }

    const result = await runner.run(agent, input, { maxTurns: 50 });
    for (const item of result.newItems ?? []) {
      await emitRunItem(item);
    }
    return result;
  };

  // Step 1: Optimize the prompt
  console.log('[Workflow] Step 1: Optimizing prompt...');
  const promptoptimizerResultTemp = await executeAgent(
    promptoptimizer,
    [...conversationHistory]
  );
  conversationHistory.push(...promptoptimizerResultTemp.newItems.map((item) => item.rawItem));

  if (!promptoptimizerResultTemp.finalOutput) {
    throw new Error("PromptOptimizer result is undefined");
  }

  // Step 2: Guardrails check
  const guardrailsInputtext = workflow.input_as_text;
  const guardrailsResult = await runGuardrails(guardrailsInputtext, guardrailsConfig, context);
  const guardrailsHastripwire = guardrailsHasTripwire(guardrailsResult as GuardrailResult[]);
  const guardrailsAnonymizedtext = getGuardrailSafeText(guardrailsResult as GuardrailResult[], guardrailsInputtext);
  const guardrailsOutput: GuardrailOutput = guardrailsHastripwire
    ? buildGuardrailFailOutput((guardrailsResult ?? []) as GuardrailResult[])
    : { safe_text: guardrailsAnonymizedtext ?? guardrailsInputtext };

  if (guardrailsHastripwire) {
    const surbeefailResultTemp = await executeAgent(
      surbeefail,
      [...conversationHistory],
      "Guardrail triggered - responding safely..."
    );
    conversationHistory.push(...surbeefailResultTemp.newItems.map((item) => item.rawItem));

    if (!surbeefailResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    // Use already-serialized items instead of re-serializing
    const failItems = streamedSerializedItems.slice(); // Get all items up to this point
    
    return {
      output_text: surbeefailResultTemp.finalOutput,
      stage: "fail",
      guardrails: guardrailsOutput,
      items: failItems,
    };
  }

  const categorizeResultTemp = await executeAgent(
    categorize,
    [...conversationHistory]
  );
  conversationHistory.push(...categorizeResultTemp.newItems.map((item) => item.rawItem));

  if (!categorizeResultTemp.finalOutput) {
    throw new Error("Agent result is undefined");
  }

  const categorizeResult = {
    output_text: JSON.stringify(categorizeResultTemp.finalOutput),
    output_parsed: categorizeResultTemp.finalOutput,
  };

  const modeRaw = (categorizeResult.output_parsed as any)?.mode;
  const normalizedMode = typeof modeRaw === "string" ? modeRaw.trim().toLowerCase() : "";
  const isBuildMode = ["build", "build mode", "build_mode", "builder", "buildmode"].includes(normalizedMode);
  const isAskMode = ["ask", "ask mode", "ask_mode", "askmode"].includes(normalizedMode);

  if (isBuildMode) {
    // Build mode: first plan, then build
    const surbeebuildplannerResultTemp = await executeAgent(
      surbeebuildplanner,
      [...conversationHistory]
    );
    conversationHistory.push(...surbeebuildplannerResultTemp.newItems.map((item) => item.rawItem));

    if (!surbeebuildplannerResultTemp.finalOutput) {
      throw new Error("SurbeeBuildPlanner result is undefined");
    }

    // Extract and send user_summary as a message if present
    let plannerOutput: unknown = surbeebuildplannerResultTemp.finalOutput;
    if (typeof plannerOutput === "string") {
      try {
        plannerOutput = JSON.parse(plannerOutput);
      } catch {
        // keep as string if JSON parsing fails
      }
    }

    const planOutput = plannerOutput as any;

    const plannerSummaryText = derivePlannerSummary(planOutput, surbeebuildplannerResultTemp.finalOutput);
    if (plannerSummaryText) {
      await emitPlannerSummaryMessage(plannerSummaryText);
    }

    const closeThinkingRawItem = {
      type: "thinking_control_item" as const,
      action: "close" as const,
      agent: { name: "SurbeeBuildPlanner" }
    };
    const [closeThinkingItem] = serializeRunItems([closeThinkingRawItem as unknown as RunItem]);
    if (closeThinkingItem) {
      streamedSerializedItems.push(closeThinkingItem);
      if (onItemStream) {
        await onItemStream(closeThinkingItem);
      }
    }

    if (Array.isArray(planOutput?.reasoning)) {
      for (const reasoningLine of planOutput.reasoning) {
        if (typeof reasoningLine === 'string' && reasoningLine.trim()) {
          const reasoningRawItem = {
            type: "reasoning_item" as const,
            content: [
              {
                type: "input_text" as const,
                text: reasoningLine
              }
            ],
            agent: { name: "SurbeeBuildPlanner" }
          };
          const [reasoningItem] = serializeRunItems([reasoningRawItem as unknown as RunItem]);
          if (reasoningItem) {
            streamedSerializedItems.push(reasoningItem);
            if (onItemStream) {
              await onItemStream(reasoningItem);
            }
          }
        }
      }
    }

    const openThinkingRawItem = {
      type: "thinking_control_item" as const,
      action: "open" as const,
      agent: { name: "SurbeeBuilder" }
    };
    const [openThinkingItem] = serializeRunItems([openThinkingRawItem as unknown as RunItem]);
    if (openThinkingItem) {
      streamedSerializedItems.push(openThinkingItem);
      if (onItemStream) {
        await onItemStream(openThinkingItem);
      }
    }

    let planInputItem: AgentInputItem | null = null;
    if (plannerOutput) {
      const planPayloadText = typeof plannerOutput === 'string'
        ? plannerOutput
        : JSON.stringify(plannerOutput, null, 2);

      if (planPayloadText && planPayloadText.trim().length > 0) {
        planInputItem = {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `SURBEE_BUILD_PLAN\n${planPayloadText}`,
            },
          ],
        };
      }
    }

    const builderInputs = [...conversationHistory];
    if (planInputItem) {
      builderInputs.push(planInputItem);
      conversationHistory.push(planInputItem);
    }

    let surbeebuilderResultTemp = await executeAgent(
      surbeebuilder,
      builderInputs
    );
    conversationHistory.push(...surbeebuilderResultTemp.newItems.map((item) => item.rawItem));
    await emitBuilderSummaryMessage();

    // Auto-verification: Check and fix errors before showing to user
    const MAX_AUTO_FIX_ATTEMPTS = 3;
    let autoFixAttempt = 0;

    while (autoFixAttempt < MAX_AUTO_FIX_ATTEMPTS) {
      const currentSerializedItems = streamedSerializedItems.slice();
      const currentRenderResult = currentSerializedItems
        .filter(
          (item): item is Extract<SerializedRunItem, { type: "tool_result" }> =>
            item.type === "tool_result" && item.name === "render_preview"
        )
        .pop();

      // Check if we have files to verify
      if (currentRenderResult?.files) {
        const verificationErrors = verifyProjectFiles(currentRenderResult.files);

        if (verificationErrors.length > 0) {
          autoFixAttempt++;
          console.log(`[Workflow] Found ${verificationErrors.length} errors, auto-fixing (attempt ${autoFixAttempt}/${MAX_AUTO_FIX_ATTEMPTS})...`);

          await notifyProgress(`Fixing ${verificationErrors.length} issue${verificationErrors.length > 1 ? 's' : ''}...`);

          // Create error fix message
          const errorMessage = formatVerificationErrors(verificationErrors);
          const fixInputItem: AgentInputItem = {
            role: "user",
            content: [
              {
                type: "input_text",
                text: errorMessage,
              },
            ],
          };

          // Retry with error context
          conversationHistory.push(fixInputItem);
          surbeebuilderResultTemp = await executeAgent(
            surbeebuilder,
            [fixInputItem],
            "Auto-fixing errors..."
          );
          conversationHistory.push(...surbeebuilderResultTemp.newItems.map((item) => item.rawItem));
          await emitBuilderSummaryMessage();

          // Continue loop to verify again
          continue;
        }
      }

      // No errors found, break out of loop
      break;
    }

    if (autoFixAttempt >= MAX_AUTO_FIX_ATTEMPTS) {
      console.log('[Workflow] Max auto-fix attempts reached, returning current state');
    } else if (autoFixAttempt > 0) {
      console.log(`[Workflow] Successfully fixed all issues in ${autoFixAttempt} attempt(s)`);
    }

    // Use already-serialized items instead of re-serializing
    const allSerializedItems = streamedSerializedItems.slice(); // Get all streamed items
    
    // For IDE workflow, look for render_preview results instead of build_typescript_tailwind_project
    const latestRenderResult =
      allSerializedItems
        .filter(
          (item): item is Extract<SerializedRunItem, { type: "tool_result" }> =>
            item.type === "tool_result" && item.name === "render_preview"
        )
        .pop();

    const htmlFromTool =
      latestRenderResult?.html ??
      (typeof surbeebuilderResultTemp.finalOutput === "string" && looksLikeHtml(surbeebuilderResultTemp.finalOutput)
        ? surbeebuilderResultTemp.finalOutput
        : undefined);

    if (!surbeebuilderResultTemp.finalOutput) {
      throw new Error("SurbeeBuilder result is undefined");
    }

    return {
      output_text: surbeebuilderResultTemp.finalOutput,
      stage: "build",
      guardrails: guardrailsOutput,
      items: allSerializedItems,
      html: htmlFromTool,
      source_files: latestRenderResult?.files,
      entry_file: latestRenderResult?.entry,
      dependencies: latestRenderResult?.dependencies,
      devDependencies: latestRenderResult?.devDependencies,
    };
  }

  if (isAskMode || (!isBuildMode && !isAskMode)) {
    const surbeeplannerResultTemp = await executeAgent(
      surbeeplanner,
      [...conversationHistory]
    );
    conversationHistory.push(...surbeeplannerResultTemp.newItems.map((item) => item.rawItem));

    if (!surbeeplannerResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    let plannerOutput: unknown = surbeeplannerResultTemp.finalOutput;
    if (typeof plannerOutput === "string") {
      try {
        plannerOutput = JSON.parse(plannerOutput);
      } catch {
        // keep string output if JSON parsing fails
      }
    }

    const plannerSummaryText = derivePlannerSummary(plannerOutput, surbeeplannerResultTemp.finalOutput);
    if (plannerSummaryText) {
      await emitPlannerSummaryMessage(plannerSummaryText);
    }

    const plannerCloseThinkingRawItem = {
      type: "thinking_control_item" as const,
      action: "close" as const,
      agent: { name: "SurbeeBuildPlanner" }
    };
    const [plannerCloseThinkingItem] = serializeRunItems([plannerCloseThinkingRawItem as unknown as RunItem]);
    if (plannerCloseThinkingItem) {
      streamedSerializedItems.push(plannerCloseThinkingItem);
      if (onItemStream) {
        await onItemStream(plannerCloseThinkingItem);
      }
    }

    // Use already-serialized items instead of re-serializing
    const plannerEndIndex = streamedSerializedItems.length;

    if (approvalRequest("Should we proceed with this plan?")) {
      let surbeebuilderResultTemp = await executeAgent(
        surbeebuilder,
        [...conversationHistory]
      );
      conversationHistory.push(...surbeebuilderResultTemp.newItems.map((item) => item.rawItem));
      await emitBuilderSummaryMessage();

      // Auto-verification: Check and fix errors before showing to user
      const MAX_AUTO_FIX_ATTEMPTS = 3;
      let autoFixAttempt = 0;

      while (autoFixAttempt < MAX_AUTO_FIX_ATTEMPTS) {
        const currentSerializedItems = streamedSerializedItems.slice();
        const currentRenderResult = currentSerializedItems
          .filter(
            (item): item is Extract<SerializedRunItem, { type: "tool_result" }> =>
              item.type === "tool_result" && item.name === "render_preview"
          )
          .pop();

        // Check if we have files to verify
        if (currentRenderResult?.files) {
          const verificationErrors = verifyProjectFiles(currentRenderResult.files);

          if (verificationErrors.length > 0) {
            autoFixAttempt++;
            console.log(`[Workflow] Found ${verificationErrors.length} errors, auto-fixing (attempt ${autoFixAttempt}/${MAX_AUTO_FIX_ATTEMPTS})...`);

            await notifyProgress(`Fixing ${verificationErrors.length} issue${verificationErrors.length > 1 ? 's' : ''}...`);

            // Create error fix message
            const errorMessage = formatVerificationErrors(verificationErrors);
            const fixInputItem: AgentInputItem = {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: errorMessage,
                },
              ],
            };

            // Retry with error context
            conversationHistory.push(fixInputItem);
            surbeebuilderResultTemp = await executeAgent(
              surbeebuilder,
              [fixInputItem],
              "Auto-fixing errors..."
            );
            conversationHistory.push(...surbeebuilderResultTemp.newItems.map((item) => item.rawItem));
            await emitBuilderSummaryMessage();

            // Continue loop to verify again
            continue;
          }
        }

        // No errors found, break out of loop
        break;
      }

      if (autoFixAttempt >= MAX_AUTO_FIX_ATTEMPTS) {
        console.log('[Workflow] Max auto-fix attempts reached, returning current state');
      } else if (autoFixAttempt > 0) {
        console.log(`[Workflow] Successfully fixed all issues in ${autoFixAttempt} attempt(s)`);
      }

      // Use already-serialized items instead of re-serializing
      const allItems = streamedSerializedItems.slice(); // Get all items

      // For IDE workflow, look for render_preview results
      const latestRenderResult =
        allItems
          .filter(
            (item): item is Extract<SerializedRunItem, { type: "tool_result" }> =>
              item.type === "tool_result" && item.name === "render_preview"
          )
          .pop();

      const htmlFromTool =
        latestRenderResult?.html ??
        (typeof surbeebuilderResultTemp.finalOutput === "string" && looksLikeHtml(surbeebuilderResultTemp.finalOutput)
          ? surbeebuilderResultTemp.finalOutput
          : undefined);

      if (!surbeebuilderResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      return {
        output_text: surbeebuilderResultTemp.finalOutput,
        stage: "build",
        guardrails: guardrailsOutput,
        items: allItems,
        html: htmlFromTool,
         source_files: latestRenderResult?.files,
         entry_file: latestRenderResult?.entry,
         dependencies: latestRenderResult?.dependencies,
         devDependencies: latestRenderResult?.devDependencies,
      };
    }

    return {
      output_text: surbeeplannerResultTemp.finalOutput,
      stage: "plan",
      guardrails: guardrailsOutput,
      items: streamedSerializedItems.slice(0, plannerEndIndex),
    };
  }

  // Fallback: should not reach here, but handle gracefully
  throw new Error("Unexpected workflow state - mode was neither ASK nor BUILD");
};
