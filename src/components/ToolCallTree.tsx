"use client";

// Quirky verbs for tool call actions
const QUIRKY_VERBS = [
  "Doodling",
  "Tinkering",
  "Sprinkling",
  "Crafting",
  "Brewing",
  "Conjuring",
  "Weaving",
  "Sculpting",
  "Polishing",
  "Sketching",
  "Assembling",
  "Orchestrating",
  "Composing",
  "Mixing",
  "Forging",
  "Bedazzling",
  "Whisking",
  "Knitting",
  "Molding",
  "Designing",
  "Piecing",
  "Stitching",
  "Fusing",
  "Blending",
  "Shaping",
];

// Counter to ensure different verbs for each tool call instance
let verbCounter = 0;

function getQuirkyVerb(): string {
  // Get a different verb each time by using counter + random offset
  const index = (verbCounter + Math.floor(Math.random() * 5)) % QUIRKY_VERBS.length;
  verbCounter = (verbCounter + 1) % QUIRKY_VERBS.length;
  return QUIRKY_VERBS[index];
}

function countEdits(output: any): number {
  if (!output) return 0;

  // Count source_files as edits
  if (output.source_files && typeof output.source_files === 'object') {
    return Object.keys(output.source_files).length;
  }

  // Count other edit-like structures
  if (Array.isArray(output.edits)) {
    return output.edits.length;
  }

  return 0;
}

function getEditedFiles(output: any): string[] {
  if (!output) return [];

  if (output.source_files && typeof output.source_files === 'object') {
    return Object.keys(output.source_files);
  }

  if (Array.isArray(output.edits)) {
    return output.edits.map((e: any, i: number) => e.file || e.target || `Edit ${i + 1}`);
  }

  return [];
}

interface ToolCallTreeProps {
  toolName: string;
  output: any;
  isActive: boolean;
}

export function ToolCallTree({ toolName, output, isActive }: ToolCallTreeProps) {
  // Generate verb deterministically based on toolName to keep it consistent
  const quirkyVerb = QUIRKY_VERBS[toolName.length % QUIRKY_VERBS.length];
  const editCount = countEdits(output);
  const editedFiles = getEditedFiles(output);

  return (
    <div className="flex flex-col text-muted-foreground">
      <div
        className="flex h-6 items-center whitespace-nowrap text-base font-medium md:text-sm"
        style={{ fontSize: '14px' }}
      >
        {/* Edit Icon */}
        <div className="mb-px mr-1.5 flex shrink-0 items-center">
          <svg
            className="shrink-0 h-4 w-4"
            height="100%"
            width="100%"
            fill="currentColor"
            viewBox="0 -960 960 960"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M560-110v-81q0-5.57 2-10.78 2-5.22 7-10.22l211.61-210.77q9.11-9.12 20.25-13.18Q812-440 823-440q12 0 23 4.5t20 13.5l37 37q9 9 13 20t4 22-4.5 22.5-13.58 20.62L692-89q-5 5-10.22 7-5.21 2-10.78 2h-81q-12.75 0-21.37-8.63Q560-97.25 560-110m300-233-37-37zM620-140h38l121-122-37-37-122 121zM220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h315q12.44 0 23.72 5T578-862l204 204q8 8 13 19.28t5 23.72v71q0 12.75-8.68 21.37-8.67 8.63-21.5 8.63-12.82 0-21.32-8.63-8.5-8.62-8.5-21.37v-56H550q-12.75 0-21.37-8.63Q520-617.25 520-630v-190H220v680h250q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32Q482.75-80 470-80zm0-60v-680zm541-141-19-18 37 37z" />
          </svg>
        </div>

        {/* Quirky verb with shimmer effect when active */}
        <span className={`flex-shrink-0 font-normal ${isActive ? 'animate-shimmer bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent' : ''}`}>
          {isActive ? `${quirkyVerb}...` : `${quirkyVerb}`}
        </span>

        {!isActive && editCount > 0 && (
          <span className="ml-2 text-xs opacity-70">
            {editCount} {editCount === 1 ? 'edit' : 'edits'} made
          </span>
        )}
      </div>

      {/* Show edited files when not active and files exist */}
      {!isActive && editedFiles.length > 0 && (
        <div className="mt-2 ml-6 space-y-1">
          {editedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center text-sm">
              <span className="text-muted-foreground">Edited</span>
              <span
                className="relative ml-1 w-fit max-w-xs truncate rounded-md bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground"
                title={file}
              >
                {file}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
