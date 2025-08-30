export const COLORS = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "pink",
  "gray",
];

export const getPTag = (repoId: string) => {
  return `<p style="border-radius: 8px; text-align: center; font-size: 12px; color: #fff; margin-top: 16px;position: fixed; left: 8px; bottom: 8px; z-index: 10; background: rgba(0, 0, 0, 0.8); padding: 4px 8px;">Made with <img src="https://enzostvs-deepsite.hf.space/logo.svg" alt="DeepSite Logo" style="width: 16px; height: 16px; vertical-align: middle;display:inline-block;margin-right:3px;filter:brightness(0) invert(1);"><a href="https://enzostvs-deepsite.hf.space" style="color: #fff;text-decoration: underline;" target="_blank" >DeepSite</a> - 🧬 <a href="https://enzostvs-deepsite.hf.space?remix=${repoId}" style="color: #fff;text-decoration: underline;" target="_blank" >Remix</a></p>`;
};

export async function getHuggingFaceUser(token: string) {
  const res = await fetch("https://huggingface.co/api/whoami-v2", {
    headers: { Authorization: `Bearer ${token}` },
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; name: string; email?: string } | null>;
}

export function getAuthTokenFromRequest(req: Request, headersList?: Headers) {
  // Prefer cookie named 'hf_token', fallback to Authorization header and env
  try {
    // @ts-ignore next/headers in route runtime
    const cookieHeader = (req as any).headers?.get("cookie") as string | undefined;
    const cookies = cookieHeader?.split("; ") ?? [];
    const tokenFromCookie = cookies.find((c) => c.startsWith("hf_token="))?.split("=")[1];
    const tokenFromHeader = headersList?.get("Authorization")?.replace("Bearer ", "");
    const token = tokenFromCookie || tokenFromHeader || process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN;
    return token || null;
  } catch {
    return process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN || null;
  }
}


