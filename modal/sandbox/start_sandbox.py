"""
Helper for creating Modal sandboxes with encrypted tunnels.
"""

import modal


async def create_sandbox_with_tunnels(
    app: modal.App,
    image: modal.Image,
) -> tuple[str, str, str]:
    """
    Create a Modal sandbox running the survey-app stack.

    Returns:
        (sandbox_object_id, relay_url, preview_url)
        - relay_url: HTTPS URL for the FastAPI relay on port 8000
        - preview_url: HTTPS URL for the Next.js dev server on port 3000
    """
    sb = await modal.Sandbox.create.aio(
        "/bin/bash",
        "/root/startup.sh",
        image=image,
        app=app,
        timeout=86400,  # 24 hours
        encrypted_ports=[8000, 3000],
    )

    tunnels = await sb.tunnels.aio()
    relay_url = tunnels[8000].url
    preview_url = tunnels[3000].url

    return sb.object_id, relay_url, preview_url
