# Modal Sandbox for Surbee

This directory contains the Modal sandbox app for running Next.js survey previews in isolated containers.

## Setup

1. Install Modal CLI:
```bash
pip install modal
```

2. Authenticate with Modal:
```bash
modal token new
```

3. Deploy the sandbox app:
```bash
cd modal
modal deploy sandbox.py
```

4. After deployment, Modal will output the endpoint URLs. Copy the `create_sandbox_endpoint` URL.

5. Add the endpoint URL to your `.env.local`:
```
MODAL_SANDBOX_ENDPOINT=https://your-username--surbee-sandbox-create-sandbox-endpoint.modal.run
```

## How it works

1. The Next.js app sends survey code to the `/api/sandbox/create` endpoint
2. This endpoint forwards the request to Modal's `create_sandbox_endpoint`
3. Modal creates an isolated container with Node.js and Next.js pre-installed
4. The survey code is written to files in the container
5. Next.js dev server starts and serves the preview
6. A tunnel URL is returned for iframe embedding

## Development

To test locally:
```bash
modal serve sandbox.py
```

This will start the Modal app in development mode with hot-reloading.

## Architecture

- `sandbox.py` - Main Modal app with:
  - Custom Docker image with Node.js 20 and Next.js pre-installed
  - `create_sandbox_endpoint` - HTTP endpoint to create sandboxes
  - `clean_react_code` - Transforms React code for Next.js compatibility
  - Icon components and motion stubs for Lucide/Framer Motion

## Pre-installed Dependencies

The sandbox image includes:
- Node.js 20 LTS
- npm
- Next.js 14.2.0
- React 18.2.0
- react-dom 18.2.0

The `node_modules` are pre-installed in the image, so sandbox creation is fast.
