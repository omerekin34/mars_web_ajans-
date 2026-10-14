import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-session";
import { normalizeAdminUser } from "@/lib/admin/users";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function listSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
}

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false } });
}

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase yapılandırması eksik." }, { status: 503 });
  }

  const secret = listSecret();
  if (!secret) {
    return NextResponse.json({ error: "Oturum anahtarı eksik." }, { status: 503 });
  }

  const listed = await supabase.rpc("list_site_users", { p_secret: secret });
  if (listed.error) {
    return NextResponse.json(
      {
        error:
          "Kullanıcı listesi alınamadı. Supabase SQL Editor'da users.sql dosyasını çalıştırıp panele yeniden giriş yapın.",
      },
      { status: 503 },
    );
  }

  const users = ((listed.data ?? []) as Record<string, unknown>[]).map(normalizeAdminUser);
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase yapılandırması eksik." }, { status: 503 });
  }

  const serviceClient = getServiceRoleClient();
  if (!serviceClient) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY environment variable eksik." }, { status: 503 });
  }

  let body: { email?: unknown; password?: unknown; displayName?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; password?: unknown; displayName?: unknown };
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";

  if (!email || !password) {
    return NextResponse.json({ error: "E-posta ve şifre gerekli." }, { status: 400 });
  }

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Geçersiz e-posta adresi." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
  }

  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: displayName ? { display_name: displayName } : undefined,
  });

  if (error) {
    return NextResponse.json({ error: error.message || "Kullanıcı oluşturulamadı." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user: { id: data.user.id, email: data.user.email } });
}
