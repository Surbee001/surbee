"""
Modal Sandbox for survey previews.

Each project gets ONE sandbox running:
- FastAPI relay server (port 8000) for agent file operations
- Next.js dev server (port 3000) for live preview with Fast Refresh

Architecture based on https://github.com/modal-labs/modal-vibe
"""

import modal
import os
import json
import hmac
import hashlib
import asyncio
import base64
from datetime import datetime, timezone
from typing import Optional
from pathlib import Path

# Create the Modal app
app = modal.App("surbee-sandbox")

# Security
sandbox_secret = modal.Secret.from_name(
    "surbee-sandbox-secret",
    required_keys=["SANDBOX_API_KEY", "SANDBOX_SIGNING_SECRET"],
)

# Persistent registry for sandbox metadata
sandbox_registry = modal.Dict.from_name("surbee-sandbox-registry", create_if_missing=True)

SANDBOX_TIMEOUT = 3600  # 1 hour

# Read relay server and startup script at module load time, base64-encode for
# embedding in the sandbox image.  Using __file__ to resolve paths ensures this
# works no matter which directory `modal deploy` is run from.
_HERE = Path(__file__).resolve().parent
_SERVER_PY_B64 = base64.b64encode((_HERE / "sandbox_server.py").read_bytes()).decode()
_STARTUP_SH_B64 = base64.b64encode((_HERE / "sandbox_startup.sh").read_bytes()).decode()

ALLOWED_ORIGINS = [
    "https://surbee.dev",
    "https://www.surbee.dev",
    "https://app.surbee.dev",
    "http://localhost:3000",
    "http://localhost:3001",
]

MAX_REQUEST_AGE_SECONDS = 300

# ---------------------------------------------------------------------------
# Sandbox Image: Node.js 22 + Python 3.12 + Next.js survey template
# ---------------------------------------------------------------------------

sandbox_image = (
    modal.Image.from_registry("node:22-slim", add_python="3.12")
    .env({
        "PNPM_HOME": "/root/.local/share/pnpm",
        "PATH": "/root/.local/share/pnpm:$PATH",
        "SHELL": "/bin/bash",
    })
    .run_commands(
        "apt-get update && apt-get install -y curl procps net-tools"
    )
    .run_commands(
        "corepack enable && corepack prepare pnpm@latest --activate && pnpm setup"
    )
    .pip_install("fastapi[standard]", "uvicorn")
    # Create the Next.js survey template inline using base64 encoding.
    # This avoids add_local_dir which fails when Sandbox.create() tries to
    # resolve the image recipe from within a Modal cloud function.
    .run_commands(
        "mkdir -p /root/survey-app/app",
        # package.json
        "echo "
        + base64.b64encode(json.dumps({
            "name": "surbee-survey-preview",
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "next dev --turbopack --hostname 0.0.0.0 -p 3000",
                "build": "next build",
                "start": "next start",
            },
            "dependencies": {
                "next": "^15.3.3",
                "react": "^19.1.0",
                "react-dom": "^19.1.0",
                "tailwindcss": "^4.1.8",
                "@tailwindcss/postcss": "^4.1.8",
                "lucide-react": "^0.454.0",
                "framer-motion": "^12.12.2",
            },
            "devDependencies": {
                "@types/node": "^22",
                "@types/react": "^19",
                "@types/react-dom": "^19",
                "typescript": "^5",
            },
        }, indent=2).encode()).decode()
        + " | base64 -d > /root/survey-app/package.json",
    )
    .run_commands(
        "echo "
        + base64.b64encode(
            b'import type { NextConfig } from "next";\n'
            b'const nextConfig: NextConfig = {\n'
            b'  reactStrictMode: true,\n'
            b'  allowedDevOrigins: ["*.modal.run"],\n'
            b'};\n'
            b'export default nextConfig;\n'
        ).decode()
        + " | base64 -d > /root/survey-app/next.config.ts",
    )
    .run_commands(
        "echo "
        + base64.b64encode(
            b'const config = { plugins: { "@tailwindcss/postcss": {} } };\n'
            b'export default config;\n'
        ).decode()
        + " | base64 -d > /root/survey-app/postcss.config.mjs",
    )
    .run_commands(
        "echo "
        + base64.b64encode(json.dumps({
            "compilerOptions": {
                "lib": ["dom", "dom.iterable", "esnext"],
                "allowJs": True, "skipLibCheck": True, "strict": True, "noEmit": True,
                "esModuleInterop": True, "module": "esnext", "moduleResolution": "bundler",
                "resolveJsonModule": True, "isolatedModules": True, "jsx": "preserve",
                "incremental": True, "plugins": [{"name": "next"}],
                "paths": {"@/*": ["./*"]},
            },
            "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            "exclude": ["node_modules"],
        }, indent=2).encode()).decode()
        + " | base64 -d > /root/survey-app/tsconfig.json",
    )
    .run_commands(
        "echo "
        + base64.b64encode(b'@import "tailwindcss";\n').decode()
        + " | base64 -d > /root/survey-app/app/globals.css",
    )
    .run_commands(
        "echo "
        + base64.b64encode(
            b'import "./globals.css";\n'
            b'export const metadata = { title: "Survey Preview" };\n'
            b'export default function RootLayout({ children }: { children: React.ReactNode }) {\n'
            b'  return (\n'
            b'    <html lang="en">\n'
            b'      <body className="antialiased">{children}</body>\n'
            b'    </html>\n'
            b'  );\n'
            b'}\n'
        ).decode()
        + " | base64 -d > /root/survey-app/app/layout.tsx",
    )
    .run_commands(
        "echo "
        + base64.b64encode(
            b'"use client";\n'
            b'export default function Page() {\n'
            b'  return (\n'
            b'    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">\n'
            b'      <div className="text-center">\n'
            b'        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />\n'
            b'        <p className="text-white/40 text-sm">Loading preview...</p>\n'
            b'      </div>\n'
            b'    </div>\n'
            b'  );\n'
            b'}\n'
        ).decode()
        + " | base64 -d > /root/survey-app/app/page.tsx",
    )
    .run_commands("cd /root/survey-app && pnpm install --force")
    # Relay server and startup script — base64-encoded to avoid 'local file missing'
    # errors when Modal resolves the image recipe in the cloud.
    .run_commands(
        f"echo {_SERVER_PY_B64} | base64 -d > /root/server.py",
    )
    .run_commands(
        f"echo {_STARTUP_SH_B64} | base64 -d > /root/startup.sh",
        "chmod +x /root/startup.sh",
    )
)

# Controller image: runs the FastAPI controller
controller_image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install("fastapi[standard]", "httpx")
)


# ---------------------------------------------------------------------------
# Force sandbox image pre-build at deploy time
# ---------------------------------------------------------------------------

@app.function(image=sandbox_image, timeout=600)
def prebuild_sandbox_image():
    """Dummy function to force sandbox image build during `modal deploy`."""
    import subprocess
    result = subprocess.run(["node", "--version"], capture_output=True, text=True)
    return {"node_version": result.stdout.strip(), "status": "image_ready"}


# ---------------------------------------------------------------------------
# Sandbox Creation
# ---------------------------------------------------------------------------

@app.function(
    image=sandbox_image,
    secrets=[sandbox_secret],
    timeout=600,
)
async def create_sandbox_remote(sandbox_id: str, files: dict) -> dict:
    """Create a Modal Sandbox with dual encrypted tunnels and push initial files.

    Runs on sandbox_image so Modal pre-resolves and caches the image at deploy
    time — avoids 'local dir missing' errors when creating sandboxes in the cloud.
    """
    import httpx

    # Create the sandbox with two ports:
    # - Port 8000: FastAPI relay for agent file operations
    # - Port 3000: Next.js dev server for live preview
    sb = await modal.Sandbox.create.aio(
        "/bin/bash", "/root/startup.sh",
        image=sandbox_image,
        app=app,
        timeout=SANDBOX_TIMEOUT,
        encrypted_ports=[8000, 3000],
    )

    # Get tunnel URLs
    tunnels = await sb.tunnels.aio()
    relay_tunnel = tunnels[8000]
    preview_tunnel = tunnels[3000]
    relay_url = relay_tunnel.url
    preview_url = preview_tunnel.url

    print(f"[Sandbox {sandbox_id}] Relay:   {relay_url}")
    print(f"[Sandbox {sandbox_id}] Preview: {preview_url}")

    # Wait for relay server to be healthy
    async with httpx.AsyncClient() as client:
        healthy = False
        for attempt in range(30):
            try:
                resp = await client.get(f"{relay_url}/heartbeat", timeout=5.0)
                if resp.status_code == 200:
                    healthy = True
                    print(f"[Sandbox {sandbox_id}] Relay healthy after {attempt + 1}s")
                    break
            except Exception:
                pass
            await asyncio.sleep(1)

        if not healthy:
            print(f"[Sandbox {sandbox_id}] Relay failed health check")
            return {
                "sandbox_id": sandbox_id,
                "relay_url": None,
                "preview_url": None,
                "status": "error",
                "error": "Sandbox relay failed to start",
            }

        # Push initial files if provided
        if files:
            try:
                resp = await client.post(
                    f"{relay_url}/write-batch",
                    json={"files": files},
                    timeout=30.0,
                )
                resp.raise_for_status()
                print(f"[Sandbox {sandbox_id}] Pushed {len(files)} files")
            except Exception as e:
                print(f"[Sandbox {sandbox_id}] Failed to push files: {e}")

    # Store in registry
    sandbox_registry[sandbox_id] = {
        "relay_url": relay_url,
        "preview_url": preview_url,
        "sandbox_object_id": sb.object_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "running",
    }

    return {
        "sandbox_id": sandbox_id,
        "relay_url": relay_url,
        "preview_url": preview_url,
        "status": "running",
    }


# ---------------------------------------------------------------------------
# FastAPI Controller
# ---------------------------------------------------------------------------

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware

controller_app = FastAPI()

controller_app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


async def verify_request(
    request: Request,
    x_api_key: Optional[str] = Header(None),
    x_signature: Optional[str] = Header(None),
    x_timestamp: Optional[str] = Header(None),
) -> bool:
    """Verify incoming request with HMAC signature."""
    expected_key = os.environ.get("SANDBOX_API_KEY")
    if not expected_key:
        raise HTTPException(status_code=500, detail="Server misconfigured")

    if not x_api_key or not hmac.compare_digest(x_api_key, expected_key):
        raise HTTPException(status_code=401, detail="Invalid API key")

    if not x_timestamp:
        raise HTTPException(status_code=401, detail="Missing timestamp")

    try:
        request_time = int(x_timestamp)
        current_time = int(datetime.now(timezone.utc).timestamp())
        if abs(current_time - request_time) > MAX_REQUEST_AGE_SECONDS:
            raise HTTPException(status_code=401, detail="Request expired")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid timestamp")

    signing_secret = os.environ.get("SANDBOX_SIGNING_SECRET")
    if not signing_secret or not x_signature:
        raise HTTPException(status_code=401, detail="Missing signature")

    body = await request.body()
    payload = f"{x_timestamp}.{body.decode('utf-8') if body else ''}"
    expected_signature = hmac.new(
        signing_secret.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(x_signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    return True


@controller_app.post("/api/sandbox/create")
async def api_create_sandbox(
    request: Request,
    x_api_key: Optional[str] = Header(None),
    x_signature: Optional[str] = Header(None),
    x_timestamp: Optional[str] = Header(None),
):
    """Create a new sandbox with dual encrypted tunnel URLs."""
    await verify_request(request, x_api_key, x_signature, x_timestamp)

    body = await request.body()
    try:
        data = json.loads(body)
        files = data.get("files", {})
        sandbox_id = data.get("sandbox_id", "")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    if not sandbox_id:
        raise HTTPException(status_code=400, detail="Missing sandbox_id")

    # Check if sandbox already exists and is alive
    if sandbox_id in sandbox_registry:
        import httpx
        info = sandbox_registry[sandbox_id]
        relay_url = info.get("relay_url")
        if relay_url:
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(f"{relay_url}/heartbeat", timeout=5.0)
                    if resp.status_code == 200:
                        return {
                            "sandbox_id": sandbox_id,
                            "relay_url": relay_url,
                            "preview_url": info.get("preview_url"),
                            "status": "running",
                        }
            except Exception:
                pass
        # Stale entry — remove and recreate
        print(f"[Controller] Stale sandbox {sandbox_id}, recreating...")
        del sandbox_registry[sandbox_id]

    # Create new sandbox
    try:
        result = await create_sandbox_remote.remote.aio(sandbox_id, files)
        return result
    except Exception as e:
        print(f"[Controller] Error creating sandbox: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@controller_app.post("/api/sandbox/{sandbox_id}/write")
async def api_write_file(
    sandbox_id: str,
    request: Request,
    x_api_key: Optional[str] = Header(None),
):
    """Proxy a file write to the sandbox relay."""
    expected_key = os.environ.get("SANDBOX_API_KEY")
    if not expected_key or not x_api_key or not hmac.compare_digest(x_api_key, expected_key):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if sandbox_id not in sandbox_registry:
        raise HTTPException(status_code=404, detail="Sandbox not found")

    info = sandbox_registry[sandbox_id]
    relay_url = info.get("relay_url")
    if not relay_url:
        raise HTTPException(status_code=500, detail="Sandbox has no relay URL")

    body = await request.body()
    data = json.loads(body)

    import httpx
    async with httpx.AsyncClient() as client:
        if "files" in data:
            resp = await client.post(f"{relay_url}/write-batch", json={"files": data["files"]}, timeout=30.0)
        elif "path" in data and "content" in data:
            resp = await client.post(f"{relay_url}/write", json={"path": data["path"], "content": data["content"]}, timeout=30.0)
        else:
            raise HTTPException(status_code=400, detail="Missing path/content or files")
        resp.raise_for_status()
        return resp.json()


@controller_app.post("/api/sandbox/{sandbox_id}/exec")
async def api_exec_command(
    sandbox_id: str,
    request: Request,
    x_api_key: Optional[str] = Header(None),
):
    """Proxy command execution to the sandbox relay."""
    expected_key = os.environ.get("SANDBOX_API_KEY")
    if not expected_key or not x_api_key or not hmac.compare_digest(x_api_key, expected_key):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if sandbox_id not in sandbox_registry:
        raise HTTPException(status_code=404, detail="Sandbox not found")

    info = sandbox_registry[sandbox_id]
    relay_url = info.get("relay_url")
    if not relay_url:
        raise HTTPException(status_code=500, detail="Sandbox has no relay URL")

    body = await request.body()
    data = json.loads(body)

    import httpx
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{relay_url}/exec",
            json=data,
            timeout=data.get("timeout", 30) + 5,  # Extra buffer for network
        )
        resp.raise_for_status()
        return resp.json()


@controller_app.get("/api/sandbox/{sandbox_id}/heartbeat")
async def api_heartbeat(
    sandbox_id: str,
    x_api_key: Optional[str] = Header(None),
):
    """Check if a sandbox is alive."""
    expected_key = os.environ.get("SANDBOX_API_KEY")
    if not expected_key or not x_api_key or not hmac.compare_digest(x_api_key, expected_key):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if sandbox_id not in sandbox_registry:
        return {"sandbox_id": sandbox_id, "alive": False, "reason": "not_found"}

    info = sandbox_registry[sandbox_id]
    relay_url = info.get("relay_url")
    if not relay_url:
        return {"sandbox_id": sandbox_id, "alive": False, "reason": "no_relay_url"}

    import httpx
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{relay_url}/heartbeat", timeout=5.0)
            if resp.status_code == 200:
                return {
                    "sandbox_id": sandbox_id,
                    "alive": True,
                    "relay_url": relay_url,
                    "preview_url": info.get("preview_url"),
                }
    except Exception:
        pass

    return {"sandbox_id": sandbox_id, "alive": False, "reason": "unreachable"}


@controller_app.get("/api/sandbox/{sandbox_id}/snapshot")
async def api_snapshot(
    sandbox_id: str,
    x_api_key: Optional[str] = Header(None),
):
    """Get all source files from a sandbox (for DB persistence)."""
    expected_key = os.environ.get("SANDBOX_API_KEY")
    if not expected_key or not x_api_key or not hmac.compare_digest(x_api_key, expected_key):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if sandbox_id not in sandbox_registry:
        raise HTTPException(status_code=404, detail="Sandbox not found")

    info = sandbox_registry[sandbox_id]
    relay_url = info.get("relay_url")
    if not relay_url:
        raise HTTPException(status_code=500, detail="Sandbox has no relay URL")

    import httpx
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{relay_url}/snapshot", timeout=30.0)
        resp.raise_for_status()
        return resp.json()


@controller_app.get("/api/sandbox/{sandbox_id}")
async def api_get_sandbox(
    sandbox_id: str,
    x_api_key: Optional[str] = Header(None),
):
    """Get sandbox metadata."""
    expected_key = os.environ.get("SANDBOX_API_KEY")
    if not expected_key or not x_api_key or not hmac.compare_digest(x_api_key, expected_key):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if sandbox_id in sandbox_registry:
        info = sandbox_registry[sandbox_id]
        return {
            "sandbox_id": sandbox_id,
            "relay_url": info.get("relay_url"),
            "preview_url": info.get("preview_url"),
            "status": info.get("status", "unknown"),
        }

    return {"error": "Sandbox not found", "sandbox_id": sandbox_id}


@controller_app.get("/health")
async def health():
    return {"status": "ok"}


@app.function(image=controller_image, secrets=[sandbox_secret])
@modal.asgi_app()
def fastapi_app():
    """Serve the controller."""
    return controller_app
