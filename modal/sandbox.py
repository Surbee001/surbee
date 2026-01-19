"""
Modal Sandbox for running Next.js survey previews.

Architecture:
1. A Modal Class runs a persistent Next.js dev server
2. Files are written via FastAPI endpoint on same container
3. Next.js hot-reload picks up changes automatically
4. Single container handles everything to ensure consistency
"""

import modal
import os
import json
import subprocess
import time
import re

# Create the Modal app
app = modal.App("surbee-sandbox")

# Volume for storing project files persistently
sandbox_volume = modal.Volume.from_name("surbee-sandbox-files", create_if_missing=True)

# Persistent storage for sandbox metadata
sandbox_dict = modal.Dict.from_name("surbee-sandbox-dict", create_if_missing=True)

# Custom image with Node.js 20 and Python
sandbox_image = (
    modal.Image.from_registry("node:20-slim", add_python="3.12")
    .apt_install("curl", "procps")
    .pip_install("fastapi[standard]", "httpx", "uvicorn")
    # Copy the survey app template
    .add_local_dir("sandbox/survey-app", "/root/survey-app", copy=True)
    # Install npm dependencies during image build
    .run_commands("cd /root/survey-app && npm install")
)


def process_for_nextjs(content: str) -> str:
    """Process React code for Next.js compatibility."""
    # Ensure "use client" directive for client components
    if '"use client"' not in content and "'use client'" not in content:
        # Check if it uses client-side features
        client_features = ['useState', 'useEffect', 'useRef', 'useCallback', 'onClick', 'onChange', 'onSubmit']
        if any(feature in content for feature in client_features):
            content = '"use client";\n\n' + content

    # Fix common import issues
    # Remove imports that won't work in Next.js
    content = re.sub(r"import\s+.*?from\s+['\"]\.\/App['\"];?\n?", '', content)
    content = re.sub(r"import\s+.*?from\s+['\"]\.\/index['\"];?\n?", '', content)

    # Ensure React is imported if using hooks
    if ('useState' in content or 'useEffect' in content) and 'import React' not in content:
        if "from 'react'" not in content and 'from "react"' not in content:
            content = 'import React, { useState, useEffect, useCallback, useRef } from "react";\n' + content

    return content


def write_files_to_nextjs(files: dict, sandbox_id: str) -> dict:
    """Write files to the survey-app directory for hot-reload."""
    print(f"[Sandbox] Writing {len(files)} files for sandbox {sandbox_id}...")

    survey_app_dir = "/root/survey-app"
    written_files = []

    for file_path, content in files.items():
        # Normalize path - remove leading slash if present
        normalized_path = file_path.lstrip('/')

        # Map common paths to Next.js app directory structure
        if normalized_path.startswith('src/'):
            # src/Survey.tsx -> app/page.tsx
            if 'Survey' in normalized_path or 'App' in normalized_path or 'Index' in normalized_path:
                target_path = os.path.join(survey_app_dir, "app", "page.tsx")
            else:
                # Other src files go to components
                filename = os.path.basename(normalized_path)
                target_path = os.path.join(survey_app_dir, "components", filename)
        elif normalized_path.endswith('.tsx') or normalized_path.endswith('.jsx'):
            # Root level component -> app/page.tsx
            target_path = os.path.join(survey_app_dir, "app", "page.tsx")
        else:
            # Other files go as-is
            target_path = os.path.join(survey_app_dir, normalized_path)

        # Ensure directory exists
        os.makedirs(os.path.dirname(target_path), exist_ok=True)

        # Process the content for Next.js compatibility
        processed_content = process_for_nextjs(content)

        # Write file
        with open(target_path, 'w') as f:
            f.write(processed_content)

        written_files.append(target_path)
        print(f"[Sandbox] Wrote: {target_path}")

    # Also save to volume for persistence
    sandbox_dir = f"/sandbox-data/{sandbox_id}"
    os.makedirs(sandbox_dir, exist_ok=True)
    for file_path, content in files.items():
        vol_path = os.path.join(sandbox_dir, file_path.lstrip('/'))
        os.makedirs(os.path.dirname(vol_path), exist_ok=True)
        with open(vol_path, 'w') as f:
            f.write(content)

    sandbox_volume.commit()

    return {
        "status": "ok",
        "sandbox_id": sandbox_id,
        "files_written": written_files,
    }


# FastAPI app that runs IN the same container as Next.js
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx

internal_app = FastAPI()

internal_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WriteFilesRequest(BaseModel):
    files: dict
    sandbox_id: str


@internal_app.post("/api/sandbox/write")
async def api_write_files(request: WriteFilesRequest):
    """Write files to Next.js directory."""
    try:
        result = write_files_to_nextjs(request.files, request.sandbox_id)
        # Store sandbox info
        sandbox_dict[request.sandbox_id] = {
            "sandbox_id": request.sandbox_id,
            "status": "running",
            "files": list(request.files.keys()),
        }
        return result
    except Exception as e:
        print(f"[Sandbox] Error writing files: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@internal_app.get("/api/sandbox/health")
async def api_health():
    """Health check endpoint."""
    return {"status": "ok"}


async def _proxy_to_nextjs(request: Request, path: str = ""):
    """Proxy requests to Next.js dev server."""
    try:
        url = f"http://localhost:3000/{path}"
        print(f"[Sandbox] Proxying to: {url}")

        # Build headers for forwarding
        forward_headers = {}
        for k, v in request.headers.items():
            k_lower = k.lower()
            # Skip hop-by-hop headers
            if k_lower not in ["host", "content-length", "transfer-encoding", "connection"]:
                forward_headers[k] = v

        # Create client for this request
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Forward the request
            body = await request.body() if request.method in ["POST", "PUT", "PATCH"] else None

            response = await client.request(
                method=request.method,
                url=url,
                headers=forward_headers,
                content=body,
                params=dict(request.query_params),
            )

            # Read full response content
            content = response.content
            print(f"[Sandbox] Got response: {response.status_code}, {len(content)} bytes")

            # Build response headers
            resp_headers = {
                "content-type": response.headers.get("content-type", "text/html"),
            }

            # Return the proxied response
            return Response(
                content=content,
                status_code=response.status_code,
                headers=resp_headers,
                media_type=response.headers.get("content-type"),
            )
    except Exception as e:
        print(f"[Sandbox] Proxy error: {e}")
        import traceback
        traceback.print_exc()
        return Response(
            content=f"<html><body><h1>Error proxying to Next.js</h1><p>{str(e)}</p></body></html>",
            status_code=502,
            media_type="text/html",
        )


@internal_app.get("/")
async def proxy_root(request: Request):
    """Proxy root path to Next.js."""
    return await _proxy_to_nextjs(request, "")


@internal_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
async def proxy_to_nextjs(request: Request, path: str):
    """Proxy all other requests to Next.js dev server."""
    return await _proxy_to_nextjs(request, path)


# Global state for Next.js process
nextjs_process = None


@app.function(
    image=sandbox_image,
    volumes={"/sandbox-data": sandbox_volume},
    timeout=600,
    cpu=1.0,
    memory=2048,
    scaledown_window=600,  # Keep alive for 10 minutes
    max_containers=1,  # Ensure only one container for consistency
)
@modal.asgi_app()
def sandbox_server():
    """
    Combined sandbox server that:
    1. Starts Next.js dev server
    2. Serves FastAPI endpoints for file management
    3. Proxies web requests to Next.js
    """
    global nextjs_process

    # Start Next.js if not already running
    if nextjs_process is None or nextjs_process.poll() is not None:
        print("[Sandbox] Starting Next.js dev server...")
        env = {**os.environ, "PORT": "3000", "HOSTNAME": "0.0.0.0"}
        nextjs_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd="/root/survey-app",
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        # Wait for server to start
        time.sleep(5)
        print("[Sandbox] Next.js server started on port 3000")

    return internal_app


# External FastAPI endpoints (controller)
controller_image = modal.Image.debian_slim(python_version="3.12").pip_install(
    "fastapi[standard]", "httpx"
)

controller_app = FastAPI()

controller_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateSandboxRequest(BaseModel):
    files: dict
    sandbox_id: str


class UpdateSandboxRequest(BaseModel):
    files: dict


# Store sandbox server URL
SANDBOX_SERVER_URL = "https://cgihadi--surbee-sandbox-sandbox-server.modal.run"


@controller_app.post("/api/sandbox/create")
async def api_create_sandbox(request: CreateSandboxRequest):
    """Create a new sandbox."""
    async with httpx.AsyncClient() as client:
        try:
            # Call the sandbox server to write files
            response = await client.post(
                f"{SANDBOX_SERVER_URL}/api/sandbox/write",
                json={"files": request.files, "sandbox_id": request.sandbox_id},
                timeout=60.0,
            )

            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)

            result = response.json()

            # Return the preview URL
            return {
                "sandbox_id": request.sandbox_id,
                "preview_url": SANDBOX_SERVER_URL,
                "status": "running",
            }
        except httpx.RequestError as e:
            print(f"[Controller] Error creating sandbox: {e}")
            raise HTTPException(status_code=502, detail=str(e))


@controller_app.post("/api/sandbox/{sandbox_id}/update")
async def api_update_sandbox(sandbox_id: str, request: UpdateSandboxRequest):
    """Update files in a sandbox."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SANDBOX_SERVER_URL}/api/sandbox/write",
                json={"files": request.files, "sandbox_id": sandbox_id},
                timeout=60.0,
            )
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=str(e))


@controller_app.get("/api/sandbox/{sandbox_id}")
async def api_get_sandbox(sandbox_id: str):
    """Get sandbox information."""
    if sandbox_id in sandbox_dict:
        info = sandbox_dict[sandbox_id]
        info["preview_url"] = SANDBOX_SERVER_URL
        return info
    return {"error": "Sandbox not found", "sandbox_id": sandbox_id}


@controller_app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.function(image=controller_image)
@modal.asgi_app()
def fastapi_app():
    """Serve the controller FastAPI app."""
    return controller_app


if __name__ == "__main__":
    app.serve()
