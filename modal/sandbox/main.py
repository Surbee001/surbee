"""
Modal app controller for Surbee sandboxes.

Manages sandbox lifecycle: create, update files, check status, terminate.
Uses spawn + poll pattern to avoid Modal's 303 redirect on long-running POST.
Deploy with: cd modal/sandbox && modal deploy main.py
"""

import time

import modal

# ---------------------------------------------------------------------------
# Modal app & images
# ---------------------------------------------------------------------------

app = modal.App(name="surbee-sandbox")

# Image for the sandbox containers (Next.js + relay server)
sandbox_image = (
    modal.Image.from_registry("node:22-slim", add_python="3.12")
    .env(
        {
            "PNPM_HOME": "/root/.local/share/pnpm",
            "PATH": "$PNPM_HOME:$PATH",
            "SHELL": "/bin/bash",
        }
    )
    .run_commands(
        "apt-get update && apt-get install -y curl netcat-openbsd procps net-tools"
    )
    .run_commands(
        "corepack enable && corepack prepare pnpm@latest --activate && pnpm setup"
    )
    .pip_install("fastapi[standard]", "httpx")
    .add_local_dir("survey-app", "/root/survey-app", copy=True)
    .run_commands("cd /root/survey-app && pnpm install --force")
    .add_local_file("startup.sh", "/root/startup.sh", copy=True)
    .run_commands("chmod +x /root/startup.sh")
    .add_local_file("server.py", "/root/server.py", copy=True)
)

# Image for the controller (serves the API, calls sandbox relays)
controller_image = modal.Image.debian_slim().pip_install("fastapi[standard]", "httpx")

# Persistent dict for sandbox metadata
sandbox_registry = modal.Dict.from_name(
    "surbee-sandbox-registry", create_if_missing=True
)


# ---------------------------------------------------------------------------
# Sandbox creation + setup as a separate Modal function
# ---------------------------------------------------------------------------


@app.function(image=sandbox_image, timeout=300)
async def spawn_and_setup(project_id: str, files: dict, entry: str | None) -> dict:
    """
    Create a Modal sandbox, wait for relay, write initial files.
    Runs on sandbox_image so local file mounts resolve correctly.
    Returns full metadata ready for the client.
    """
    import asyncio

    import httpx

    # Create sandbox
    sb = await modal.Sandbox.create.aio(
        "/bin/bash",
        "/root/startup.sh",
        image=sandbox_image,
        app=app,
        timeout=86400,
        encrypted_ports=[8000, 3000],
    )

    tunnels = await sb.tunnels.aio()
    relay_url = tunnels[8000].url
    preview_url = tunnels[3000].url
    sandbox_id = sb.object_id
    print(f"[spawn] Sandbox {sandbox_id} created for {project_id}")

    # Wait for relay to be ready (up to 60s)
    relay_ready = False
    async with httpx.AsyncClient(timeout=10.0) as client:
        for attempt in range(30):
            try:
                resp = await client.get(f"{relay_url}/heartbeat")
                if resp.status_code == 200:
                    relay_ready = True
                    print(f"[spawn] Relay ready after {attempt + 1}s")
                    break
            except Exception:
                pass
            await asyncio.sleep(2)

        if not relay_ready:
            raise RuntimeError("Relay did not become ready in 60s")

        # Write initial files
        resp = await client.post(
            f"{relay_url}/edit",
            json={"files": files, "entry": entry},
            timeout=30.0,
        )
        print(f"[spawn] Files written: {resp.json()}")

    # Store in registry
    metadata = {
        "sandbox_object_id": sandbox_id,
        "relay_url": relay_url,
        "preview_url": preview_url,
        "project_id": project_id,
        "created_at": time.time(),
        "last_heartbeat": time.time(),
    }
    await sandbox_registry.put.aio(project_id, metadata)

    return metadata


# ---------------------------------------------------------------------------
# Mount the FastAPI controller as the ASGI entry point
# ---------------------------------------------------------------------------


@app.function(image=controller_image, timeout=3600, min_containers=1)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def controller():
    import traceback

    import httpx
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel

    web_app = FastAPI(title="Surbee Sandbox Controller")

    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -- Models --

    class CreateRequest(BaseModel):
        project_id: str
        files: dict[str, str]
        entry: str | None = None
        dependencies: list[str] | None = None

    class UpdateRequest(BaseModel):
        project_id: str
        files: dict[str, str]
        entry: str | None = None

    class CreateResponse(BaseModel):
        sandbox_object_id: str
        relay_url: str
        preview_url: str

    class SpawnResponse(BaseModel):
        call_id: str
        status: str = "creating"

    class PollResponse(BaseModel):
        status: str
        sandbox_object_id: str | None = None
        relay_url: str | None = None
        preview_url: str | None = None
        error: str | None = None

    class StatusResponse(BaseModel):
        alive: bool
        preview_url: str | None = None
        relay_url: str | None = None

    # -- Routes --

    @web_app.post("/sandbox/create")
    async def create_sandbox(req: CreateRequest):
        """
        Non-blocking sandbox creation using spawn + poll pattern.
        Returns immediately with a call_id for polling, or reuses an
        existing sandbox if one is alive.
        """
        try:
            # Check if sandbox already exists in registry
            try:
                existing = await sandbox_registry.get.aio(req.project_id)
                if existing:
                    try:
                        async with httpx.AsyncClient(timeout=5.0) as client:
                            resp = await client.get(
                                f"{existing['relay_url']}/heartbeat"
                            )
                            if resp.status_code == 200:
                                # Sandbox alive — update files and return it
                                await client.post(
                                    f"{existing['relay_url']}/edit",
                                    json={"files": req.files, "entry": req.entry},
                                )
                                existing["last_heartbeat"] = time.time()
                                await sandbox_registry.put.aio(
                                    req.project_id, existing
                                )
                                return PollResponse(
                                    status="ready",
                                    sandbox_object_id=existing["sandbox_object_id"],
                                    relay_url=existing["relay_url"],
                                    preview_url=existing["preview_url"],
                                )
                    except Exception:
                        try:
                            await sandbox_registry.pop.aio(req.project_id)
                        except KeyError:
                            pass
            except KeyError:
                pass

            # Spawn sandbox creation in background (returns immediately)
            fc = await spawn_and_setup.spawn.aio(
                req.project_id, req.files, req.entry
            )
            print(f"[create] Spawned sandbox creation for {req.project_id}: {fc.object_id}")
            return SpawnResponse(call_id=fc.object_id)

        except Exception as e:
            tb = traceback.format_exc()
            print(f"[create] ERROR: {e}\n{tb}")
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )

    @web_app.get("/sandbox/poll/{call_id}")
    async def poll_sandbox(call_id: str):
        """
        Poll for sandbox creation progress.
        Returns status: creating | ready | error
        """
        try:
            from modal.functions import FunctionCall

            fc = FunctionCall.from_id(call_id)
            try:
                result = fc.get(timeout=0)
                return PollResponse(
                    status="ready",
                    sandbox_object_id=result["sandbox_object_id"],
                    relay_url=result["relay_url"],
                    preview_url=result["preview_url"],
                )
            except TimeoutError:
                return PollResponse(status="creating")
            except Exception as e:
                return PollResponse(status="error", error=str(e))
        except Exception as e:
            return PollResponse(status="error", error=str(e))

    @web_app.post("/sandbox/update")
    async def update_sandbox(req: UpdateRequest):
        try:
            existing = await sandbox_registry.get.aio(req.project_id)
        except KeyError:
            return {"error": "Sandbox not found", "status": "not_found"}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{existing['relay_url']}/edit",
                    json={"files": req.files, "entry": req.entry},
                )
                result = resp.json()
            existing["last_heartbeat"] = time.time()
            await sandbox_registry.put.aio(req.project_id, existing)
            return result
        except Exception as e:
            return {"error": str(e), "status": "relay_error"}

    @web_app.get("/sandbox/status/{project_id}", response_model=StatusResponse)
    async def sandbox_status(project_id: str):
        try:
            existing = await sandbox_registry.get.aio(project_id)
        except KeyError:
            return StatusResponse(alive=False)

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{existing['relay_url']}/heartbeat")
                alive = resp.status_code == 200
        except Exception:
            alive = False

        if alive:
            existing["last_heartbeat"] = time.time()
            await sandbox_registry.put.aio(project_id, existing)

        return StatusResponse(
            alive=alive,
            preview_url=existing.get("preview_url") if alive else None,
            relay_url=existing.get("relay_url") if alive else None,
        )

    @web_app.delete("/sandbox/{project_id}")
    async def delete_sandbox(project_id: str):
        try:
            existing = await sandbox_registry.get.aio(project_id)
            try:
                sb = await modal.Sandbox.from_id.aio(existing["sandbox_object_id"])
                await sb.terminate.aio()
            except Exception:
                pass
            await sandbox_registry.pop.aio(project_id)
            return {"status": "terminated"}
        except KeyError:
            return {"status": "not_found"}

    return web_app


# ---------------------------------------------------------------------------
# Scheduled cleanup
# ---------------------------------------------------------------------------


@app.function(image=controller_image, schedule=modal.Period(seconds=60))
async def clean_up_dead_sandboxes():
    """Remove sandboxes that haven't had a heartbeat in 2 hours."""
    cutoff = time.time() - 7200

    keys_to_remove = []
    async for key in sandbox_registry.keys.aio():
        try:
            meta = await sandbox_registry.get.aio(key)
            if meta.get("last_heartbeat", 0) < cutoff:
                try:
                    sb = await modal.Sandbox.from_id.aio(meta["sandbox_object_id"])
                    await sb.terminate.aio()
                except Exception:
                    pass
                keys_to_remove.append(key)
        except Exception:
            keys_to_remove.append(key)

    for key in keys_to_remove:
        try:
            await sandbox_registry.pop.aio(key)
        except KeyError:
            pass

    if keys_to_remove:
        print(f"[cleanup] Removed {len(keys_to_remove)} dead sandboxes")
