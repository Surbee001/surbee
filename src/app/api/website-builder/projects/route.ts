import { NextRequest, NextResponse } from "next/server";
import { createRepo, RepoDesignation, uploadFiles } from "@huggingface/hub";
import { COLORS, getPTag, getHuggingFaceUser, getAuthTokenFromRequest } from "@/lib/website-builder/utils";

export async function GET(request: NextRequest) {
  const token = getAuthTokenFromRequest(request, await import("next/headers").then(m=>m.headers()));
  if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  // No DB; return empty list placeholder
  return NextResponse.json({ ok: true, projects: [] });
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request, await import("next/headers").then(m=>m.headers()));
    if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, html, prompts = [] } = body as { title: string; html: string; prompts?: string[] };
    if (!title || !html) {
      return NextResponse.json({ ok: false, message: "Title and HTML are required" }, { status: 400 });
    }

    const user = await getHuggingFaceUser(token);
    if (!user?.name) return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .split("-")
      .filter(Boolean)
      .join("-")
      .slice(0, 96);

    const repo: RepoDesignation = { type: "space", name: `${user.name}/${slug}` };
    const { repoUrl } = await createRepo({ repo, accessToken: token });

    const colorFrom = COLORS[Math.floor(Math.random() * COLORS.length)];
    const colorTo = COLORS[Math.floor(Math.random() * COLORS.length)];
    const readme = `---
title: ${slug}
emoji: 🧬
colorFrom: ${colorFrom}
colorTo: ${colorTo}
sdk: static
pinned: false
tags:
  - deepsite
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference`;
    const instrumentedHtml = html.replace(/<\/body>/, `${getPTag(repo.name)}</body>`);

    const indexFile = new File([instrumentedHtml], "index.html", { type: "text/html" });
    const readmeFile = new File([readme], "README.md", { type: "text/markdown" });
    await uploadFiles({ repo, files: [indexFile, readmeFile], accessToken: token, commitTitle: `${prompts[prompts.length-1] || 'Initial'} - Initial Deployment` });

    const path = repoUrl.split("/").slice(-2).join("/");
    return NextResponse.json({ ok: true, path, project: { space_id: path, prompts } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to create project" }, { status: 500 });
  }
}


