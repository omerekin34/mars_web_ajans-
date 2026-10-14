import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/admin/rate-limit";
import { adminSessionCookieName, adminSessionMaxAge, createAdminSessionToken } from "@/lib/admin/session";
import { registerAdminListGate, verifyAdminCredentials } from "@/lib/admin/verify-login";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const limited = rateLimit(`admin-login:${clientKey(request)}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Çok fazla deneme yapıldı. Biraz sonra yeniden deneyin." }, { status: 429 });
  }

  let body: { username?: unknown; email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const username =
    typeof body.username === "string"
      ? body.username.trim()
      : typeof body.email === "string"
        ? body.email.trim()
        : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) {
    return NextResponse.json({ error: "E-posta ve şifre gerekli." }, { status: 400 });
  }

  const verified = await verifyAdminCredentials(username, password);
  if (verified.status === "misconfigured") {
    return NextResponse.json({ error: "Supabase yapılandırması eksik." }, { status: 503 });
  }
  if (verified.status !== "ok") {
    await delay(400);
    return NextResponse.json({ error: verified.message }, { status: 401 });
  }

  const token = await createAdminSessionToken(verified.identity);
  if (!token) {
    return NextResponse.json({ error: "Oturum anahtarı oluşturulamadı." }, { status: 503 });
  }

  await registerAdminListGate(verified.identity, password);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: adminSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAge(),
  });
  return response;
}
