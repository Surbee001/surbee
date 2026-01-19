"""
FastAPI server that runs inside the Modal sandbox.
Handles file updates and health checks.
"""

import os
import json
import re
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_DIR = "/root/survey-app"


class ComponentUpdate(BaseModel):
    component: str


class FilesUpdate(BaseModel):
    files: dict[str, str]


def clean_react_code(code: str) -> str:
    """Clean React code for Next.js environment."""
    cleaned = code

    # Remove TypeScript type annotations (simplified)
    cleaned = re.sub(r':\s*(string|number|boolean|any|void|null|undefined)(\s*[,)\]=;])', r'\2', cleaned)
    cleaned = re.sub(r'<[A-Z]\w*>', '', cleaned)  # Remove generic type parameters

    # Remove problematic imports
    cleaned = re.sub(r"import\s+.*?from\s+['\"]lucide-react['\"];?\n?", '', cleaned)
    cleaned = re.sub(r"import\s+.*?from\s+['\"]framer-motion['\"];?\n?", '', cleaned)
    cleaned = re.sub(r"import\s+.*?from\s+['\"]@/.*?['\"];?\n?", '', cleaned)
    cleaned = re.sub(r"import\s+.*?from\s+['\"]\.\/.*?['\"];?\n?", '', cleaned)

    # Add React import if not present
    if "import React" not in cleaned and "import { " not in cleaned:
        cleaned = "import React, { useState, useEffect, useRef, useCallback } from 'react';\n" + cleaned

    # Add icon replacements and motion stubs
    icon_replacements = '''
// Inline icon components
const ChevronRight = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>;
const ChevronLeft = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>;
const ChevronUp = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m18 15-6-6-6 6"/></svg>;
const ChevronDown = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>;
const Check = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5"/></svg>;
const X = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const Star = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const Send = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
const ArrowRight = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
const ArrowLeft = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>;
const Plus = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const Minus = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/></svg>;
const Heart = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const ThumbsUp = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>;
const ThumbsDown = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>;
const Loader2 = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const Mail = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const User = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Calendar = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>;
const Circle = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/></svg>;
const CheckCircle = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;

// Motion stubs
const motion = {
  div: ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, ...props }) => <div {...props}>{children}</div>,
  button: ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, ...props }) => <button {...props}>{children}</button>,
  span: ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, ...props }) => <span {...props}>{children}</span>,
  p: ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, ...props }) => <p {...props}>{children}</p>,
  h1: ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, ...props }) => <h1 {...props}>{children}</h1>,
  h2: ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, ...props }) => <h2 {...props}>{children}</h2>,
  input: ({ initial, animate, exit, transition, whileHover, whileTap, variants, ...props }) => <input {...props} />,
  form: ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, ...props }) => <form {...props}>{children}</form>,
  label: ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, ...props }) => <label {...props}>{children}</label>,
};
const AnimatePresence = ({ children }) => children;
const cn = (...classes) => classes.filter(Boolean).join(' ');
'''

    # Insert after imports
    import_end = cleaned.rfind("import")
    if import_end != -1:
        next_newline = cleaned.find("\n", import_end)
        cleaned = cleaned[:next_newline + 1] + icon_replacements + cleaned[next_newline + 1:]
    else:
        cleaned = icon_replacements + cleaned

    return cleaned


@app.get("/heartbeat")
async def heartbeat():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/edit")
async def edit_component(update: ComponentUpdate):
    """Update the main survey component."""
    component = update.component

    if "export default" not in component:
        raise HTTPException(status_code=400, detail="Component must have an export default")

    # Clean the code for Next.js
    cleaned_component = clean_react_code(component)

    # Write to the page file
    page_path = Path(PROJECT_DIR) / "app" / "page.js"
    page_path.parent.mkdir(parents=True, exist_ok=True)

    page_content = f'''"use client";
{cleaned_component}
'''
    page_path.write_text(page_content)

    return {"status": "ok", "message": "Component updated"}


@app.post("/write-files")
async def write_files(update: FilesUpdate):
    """Write multiple files to the project."""
    files = update.files

    for file_path, content in files.items():
        # Normalize path
        normalized_path = file_path.lstrip("/")

        # Determine target path
        if normalized_path in ["App.tsx", "App.jsx", "App.js"]:
            # Main component goes to app/page.js
            target_path = Path(PROJECT_DIR) / "app" / "page.js"
            content = f'''"use client";
{clean_react_code(content)}
'''
        elif normalized_path.endswith(".css"):
            # CSS goes to app/globals.css
            target_path = Path(PROJECT_DIR) / "app" / "globals.css"
            existing = ""
            if target_path.exists():
                existing = target_path.read_text()
            content = existing + "\n" + content
        else:
            # Other files go as-is
            target_path = Path(PROJECT_DIR) / normalized_path

        # Create directory if needed
        target_path.parent.mkdir(parents=True, exist_ok=True)

        # Write file
        target_path.write_text(content)

    return {"status": "ok", "message": f"Wrote {len(files)} files"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
