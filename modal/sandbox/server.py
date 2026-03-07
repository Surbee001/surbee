"""
FastAPI relay server running inside each Modal sandbox.
Handles multi-file writes and health checks.
Runs on port 8000.
"""

import os
import re
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Surbee Sandbox Relay")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SURVEY_APP_DIR = Path("/root/survey-app")

BASE_PAGE = '''"use client";
export default function Page() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-400 text-sm">Waiting for content...</p>
    </div>
  );
}
'''


class EditRequest(BaseModel):
    files: dict[str, str]
    entry: str | None = None


def _is_config_file(path: str) -> bool:
    """Return True if the path looks like a config/non-component file."""
    name = path.rsplit("/", 1)[-1] if "/" in path else path
    return bool(
        re.match(
            r"^(tailwind|postcss|next|vite|tsconfig|jest|babel|eslint|prettier|webpack)\.(config|setup)\b",
            name,
            re.IGNORECASE,
        )
        or re.match(r"^tsconfig(\.\w+)?\.json$", name, re.IGNORECASE)
        or re.match(r"^package(-lock)?\.json$", name, re.IGNORECASE)
        or re.match(r"^\.env", name, re.IGNORECASE)
        or re.match(r"^globals?\.(css|scss)$", name, re.IGNORECASE)
    )


def generate_entry_page(entry_path: str, user_files: dict[str, str]) -> str:
    """
    Generate an app/page.tsx that imports and renders the user's entry component.
    Handles default exports, named exports, and edge cases.
    """
    normalized = entry_path.lstrip("/")

    # If the entry IS app/page.tsx, no bridge needed
    if normalized in ("app/page.tsx", "app/page.ts", "app/page.jsx", "app/page.js"):
        return BASE_PAGE

    # Reject config files — they aren't React components
    if _is_config_file(normalized):
        return BASE_PAGE

    # Build the import path relative from app/page.tsx
    import_path = "../" + re.sub(r"\.(tsx?|jsx?)$", "", normalized)

    # Get file content — try multiple key formats
    file_content = (
        user_files.get(normalized, "")
        or user_files.get(f"/{normalized}", "")
        or user_files.get(entry_path, "")
    )

    # If no content found, generate a safe dynamic import bridge
    if not file_content:
        return f'''"use client";
import dynamic from "next/dynamic";
const EntryComponent = dynamic(() => import("{import_path}"), {{ ssr: false }});
export default function Page() {{
  return <EntryComponent />;
}}
'''

    has_default_export = bool(re.search(r"export\s+default", file_content))

    if has_default_export:
        return f'''"use client";
import dynamic from "next/dynamic";
const EntryComponent = dynamic(() => import("{import_path}"), {{ ssr: false }});
export default function Page() {{
  return <EntryComponent />;
}}
'''

    # Try named exports
    named_match = re.search(r"export\s+(?:function|const|class)\s+(\w+)", file_content)
    export_name = named_match.group(1) if named_match else "App"

    return f'''"use client";
import dynamic from "next/dynamic";
const EntryComponent = dynamic(
  () => import("{import_path}").then((mod) => mod.{export_name}),
  {{ ssr: false }}
);
export default function Page() {{
  return <EntryComponent />;
}}
'''


_HIDE_DEVTOOLS_BLOCK = """\
/* --- sandbox: hide Next.js dev indicators --- */
[data-nextjs-dialog-overlay],
[data-nextjs-toast],
nextjs-portal,
#__next-build-indicator,
[class*="nextjs-"] { display: none !important; }
/* --- end sandbox overrides --- */
"""


@app.post("/edit")
async def edit_files(req: EditRequest):
    """Write files to the survey app directory and generate entry bridge."""
    files_written = 0

    for rel_path, content in req.files.items():
        # Strip leading slashes
        clean_path = rel_path.lstrip("/")
        full_path = SURVEY_APP_DIR / clean_path

        # If the agent writes globals.css, prepend the dev-indicator hide block
        if clean_path in ("app/globals.css", "globals.css"):
            if "hide Next.js dev indicators" not in content:
                content = _HIDE_DEVTOOLS_BLOCK + "\n" + content

        # Ensure parent directory exists
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content, encoding="utf-8")
        files_written += 1

    # Generate the entry page bridge if needed
    if req.entry:
        has_user_page = any(
            p.lstrip("/") in ("app/page.tsx", "app/page.ts", "app/page.jsx", "app/page.js")
            for p in req.files
        )

        if not has_user_page:
            entry_page = generate_entry_page(req.entry, req.files)
            entry_path = SURVEY_APP_DIR / "app" / "page.tsx"
            entry_path.parent.mkdir(parents=True, exist_ok=True)
            entry_path.write_text(entry_page, encoding="utf-8")
            files_written += 1

    return {"status": "ok", "files_written": files_written}


@app.get("/heartbeat")
async def heartbeat():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/logs")
async def get_logs(lines: int = 100):
    """Return recent Next.js dev server logs (compilation errors, warnings)."""
    nextjs_log = Path("/tmp/nextjs.log")
    fastapi_log = Path("/tmp/fastapi.log")

    result = {"nextjs": [], "errors": [], "warnings": []}

    if nextjs_log.exists():
        content = nextjs_log.read_text(encoding="utf-8", errors="replace")
        all_lines = content.strip().split("\n")[-lines:]
        result["nextjs"] = all_lines

        # Extract errors and warnings
        for line in all_lines:
            lower = line.lower()
            if "error" in lower or "failed" in lower or "cannot find" in lower:
                result["errors"].append(line.strip())
            elif "warning" in lower or "warn" in lower:
                result["warnings"].append(line.strip())

    return {
        "status": "ok",
        "error_count": len(result["errors"]),
        "warning_count": len(result["warnings"]),
        "errors": result["errors"],
        "warnings": result["warnings"],
        "stdout": result["nextjs"][-30:],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
