"""
FastAPI relay server that runs inside each Modal Sandbox on port 8000.

Handles:
- File operations (write, read, delete, list, snapshot)
- Shell command execution (pnpm add, etc.)
- Health checks

All file paths are relative to /root/survey-app/.
The Next.js dev server on port 3000 picks up changes via Fast Refresh.
"""

import asyncio
import os
import time
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path("/root/survey-app")
START_TIME = time.time()

# Directories that should be included in snapshots/file listings
SOURCE_DIRS = ["app", "components", "lib", "public", "styles"]
# File extensions to include in snapshots
SOURCE_EXTENSIONS = {
    ".tsx", ".ts", ".jsx", ".js", ".css", ".json", ".md",
    ".svg", ".png", ".jpg", ".jpeg", ".gif", ".ico",
}
# Paths to exclude from snapshots
EXCLUDED_PATHS = {"node_modules", ".next", ".git", "__pycache__"}


def validate_path(path: str) -> Path:
    """Validate and resolve a relative file path. Prevents path traversal."""
    # Strip leading slashes to ensure relative path
    clean = path.lstrip("/")
    resolved = (PROJECT_ROOT / clean).resolve()

    # Ensure the resolved path is within the project root
    if not str(resolved).startswith(str(PROJECT_ROOT.resolve())):
        raise HTTPException(status_code=400, detail="Path traversal blocked")

    return resolved


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------

@app.get("/heartbeat")
async def heartbeat():
    uptime = int(time.time() - START_TIME)
    return {"status": "ok", "uptime": uptime}


# ---------------------------------------------------------------------------
# File Operations
# ---------------------------------------------------------------------------

class WriteRequest(BaseModel):
    path: str
    content: str


class WriteBatchRequest(BaseModel):
    files: dict[str, str]


class ReadRequest(BaseModel):
    path: str


class DeleteRequest(BaseModel):
    path: str


@app.post("/write")
async def write_file(req: WriteRequest):
    """Write a single file to disk. Creates parent directories as needed."""
    target = validate_path(req.path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(req.content, encoding="utf-8")
    return {"status": "ok", "path": req.path, "bytes": len(req.content.encode("utf-8"))}


@app.post("/write-batch")
async def write_batch(req: WriteBatchRequest):
    """Write multiple files atomically."""
    written = []
    for path, content in req.files.items():
        target = validate_path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        written.append(path)
    return {"status": "ok", "written": len(written), "paths": written}


@app.post("/read")
async def read_file(req: ReadRequest):
    """Read a file from disk."""
    target = validate_path(req.path)
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {req.path}")
    if not target.is_file():
        raise HTTPException(status_code=400, detail=f"Not a file: {req.path}")

    content = target.read_text(encoding="utf-8")
    return {"status": "ok", "path": req.path, "content": content, "size": len(content)}


@app.post("/delete")
async def delete_file(req: DeleteRequest):
    """Delete a file from disk."""
    target = validate_path(req.path)
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {req.path}")
    if target.is_dir():
        import shutil
        shutil.rmtree(target)
    else:
        target.unlink()
    return {"status": "ok", "path": req.path}


@app.get("/files")
async def list_files():
    """List all source files recursively."""
    files = []
    for root, dirs, filenames in os.walk(PROJECT_ROOT):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_PATHS]

        rel_root = Path(root).relative_to(PROJECT_ROOT)

        for filename in filenames:
            ext = Path(filename).suffix
            if ext in SOURCE_EXTENSIONS:
                rel_path = str(rel_root / filename)
                if rel_path.startswith("."):
                    rel_path = rel_path[2:]  # Remove "./" prefix
                files.append(rel_path)

    return {"status": "ok", "files": sorted(files)}


@app.get("/snapshot")
async def snapshot():
    """Return all source files as a JSON bundle (for DB persistence)."""
    files = {}
    for root, dirs, filenames in os.walk(PROJECT_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_PATHS]

        rel_root = Path(root).relative_to(PROJECT_ROOT)

        for filename in filenames:
            ext = Path(filename).suffix
            if ext in SOURCE_EXTENSIONS:
                file_path = Path(root) / filename
                rel_path = str(rel_root / filename)
                if rel_path.startswith("."):
                    rel_path = rel_path[2:]
                try:
                    content = file_path.read_text(encoding="utf-8")
                    files[rel_path] = content
                except (UnicodeDecodeError, PermissionError):
                    pass  # Skip binary or inaccessible files

    return {"status": "ok", "files": files}


# ---------------------------------------------------------------------------
# Command Execution
# ---------------------------------------------------------------------------

class ExecRequest(BaseModel):
    command: str
    timeout: Optional[int] = 30
    cwd: Optional[str] = None


@app.post("/exec")
async def exec_command(req: ExecRequest):
    """Execute a shell command in the sandbox."""
    # Use project root as default cwd
    cwd = str(PROJECT_ROOT)
    if req.cwd:
        cwd_path = validate_path(req.cwd)
        if cwd_path.is_dir():
            cwd = str(cwd_path)

    try:
        process = await asyncio.create_subprocess_shell(
            req.command,
            cwd=cwd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env={
                **os.environ,
                "PATH": f"/root/.local/share/pnpm:{os.environ.get('PATH', '')}",
            },
        )
        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=req.timeout or 30,
        )
        return {
            "status": "ok",
            "stdout": stdout.decode("utf-8", errors="replace"),
            "stderr": stderr.decode("utf-8", errors="replace"),
            "exit_code": process.returncode,
        }
    except asyncio.TimeoutError:
        process.kill()
        return {
            "status": "error",
            "message": f"Command timed out after {req.timeout}s",
            "exit_code": -1,
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "exit_code": -1,
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
