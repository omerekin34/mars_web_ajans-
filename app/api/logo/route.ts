import type { NextRequest } from "next/server";

const MAX_BYTES = 5 * 1024 * 1024;
const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:)/i;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  let target: URL;
  try {
    target = new URL(raw ?? "");
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (!/^https?:$/.test(target.protocol) || PRIVATE_HOST.test(target.hostname)) {
    return new Response("Forbidden url", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, { redirect: "follow", signal: AbortSignal.timeout(10_000) });
  } catch {
    return new Response("Fetch failed", { status: 502 });
  }
  const type = upstream.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
  if (!upstream.ok || !type.startsWith("image/")) {
    return new Response("Not an image", { status: 415 });
  }
  const body = await upstream.arrayBuffer();
  if (body.byteLength > MAX_BYTES) {
    return new Response("Image too large", { status: 413 });
  }

  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
