import { NextRequest, NextResponse } from "next/server";
import { RepoDesignation, spaceInfo, uploadFile } from "@huggingface/hub";
import { getPTag, getHuggingFaceUser, getAuthTokenFromRequest } from "@/lib/website-builder/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ namespace: string; repoId: string }> }) {
  const token = getAuthTokenFromRequest(req, await import("next/headers").then(m=>m.headers()));
  if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { namespace, repoId } = await params;

  const user = await getHuggingFaceUser(token);
  if (!user?.name) return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });

  const space = await spaceInfo({ name: `${namespace}/${repoId}`, accessToken: token, additionalFields: ["author"] });
  if (!space || space.sdk !== "static") return NextResponse.json({ ok: false, error: "Space is not static" }, { status: 404 });
  if (space.author !== user.name) return NextResponse.json({ ok: false, error: "Space does not belong to user" }, { status: 403 });

  const spaceUrl = `https://huggingface.co/spaces/${namespace}/${repoId}/raw/main/index.html`;
  const res = await fetch(spaceUrl);
  if (!res.ok) return NextResponse.json({ ok: false, error: "Failed to fetch space HTML" }, { status: 404 });
  let html = await res.text();
  html = html.replace(getPTag(`${namespace}/${repoId}`), "");
  return NextResponse.json({ ok: true, project: { space_id: `${namespace}/${repoId}`, html } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ namespace: string; repoId: string }> }) {
  const token = getAuthTokenFromRequest(req, await import("next/headers").then(m=>m.headers()));
  if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { namespace, repoId } = await params;
  const { html, prompts = [] } = await req.json();

  const user = await getHuggingFaceUser(token);
  if (!user?.name) return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });

  const space = await spaceInfo({ name: `${namespace}/${repoId}`, accessToken: token, additionalFields: ["author"] });
  if (!space || space.sdk !== "static") return NextResponse.json({ ok: false, error: "Space is not static" }, { status: 404 });
  if (space.author !== user.name) return NextResponse.json({ ok: false, error: "Space does not belong to user" }, { status: 403 });

  const repo: RepoDesignation = { type: "space", name: `${namespace}/${repoId}` };
  const instrumentedHtml = (html as string).replace(/<\/body>/, `${getPTag(repo.name)}</body>`);
  const file = new File([instrumentedHtml], "index.html", { type: "text/html" });
  await uploadFile({ repo, file, accessToken: token, commitTitle: `${prompts[prompts.length - 1] || 'Update'} - Follow Up Deployment` });
  return NextResponse.json({ ok: true });
}


