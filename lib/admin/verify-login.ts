import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminVerifyResult =
  | { status: "ok"; identity: string }
  | { status: "denied"; message: string }
  | { status: "misconfigured" };

function allowedEmails() {
  const raw = process.env.ADMIN_ALLOWED_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedIdentity(identity: string) {
  const allow = allowedEmails();
  if (allow.length === 0) return true;
  return allow.includes(identity.trim().toLowerCase());
}

function authErrorMessage(message: string | undefined) {
  const text = (message || "").toLowerCase();
  if (text.includes("email not confirmed") || text.includes("not confirmed")) {
    return "E-posta henüz doğrulanmamış. Authentication > Users içinden kullanıcıyı onaylayın veya Confirm email ayarını kapatın.";
  }
  if (text.includes("invalid login") || text.includes("invalid") || text.includes("credentials")) {
    return "E-posta veya şifre hatalı.";
  }
  return "E-posta veya şifre hatalı.";
}

async function verifyWithAuth(email: string, password: string): Promise<AdminVerifyResult | null> {
  if (!email.includes("@")) return null;

  const supabase = createSupabaseServerClient();
  if (!supabase) return { status: "misconfigured" };

  const result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error || !result.data.user) {
    if (result.error) return { status: "denied", message: authErrorMessage(result.error.message) };
    return null;
  }

  await supabase.auth.signOut().catch(() => undefined);

  const identity = (result.data.user.email || email).trim().toLowerCase();
  if (!isAllowedIdentity(identity)) {
    return { status: "denied", message: "Bu hesap yönetim paneline kayıtlı değil." };
  }

  return { status: "ok", identity };
}

async function verifyWithPanelTable(username: string, password: string): Promise<AdminVerifyResult | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { status: "misconfigured" };

  const rpc = await supabase.rpc("verify_admin_user", {
    p_username: username,
    p_password: password,
  });

  if (rpc.error || rpc.data !== true) return null;
  if (!isAllowedIdentity(username) && username.includes("@")) {
    return { status: "denied", message: "Bu hesap yönetim paneline kayıtlı değil." };
  }
  return { status: "ok", identity: username.trim().toLowerCase() };
}

export async function verifyAdminCredentials(usernameInput: string, password: string): Promise<AdminVerifyResult> {
  const username = usernameInput.trim();
  if (!username || !password) return { status: "denied", message: "E-posta ve şifre gerekli." };

  const fromAuth = await verifyWithAuth(username, password);
  if (fromAuth?.status === "ok" || fromAuth?.status === "misconfigured") return fromAuth;
  if (fromAuth?.status === "denied" && fromAuth.message.includes("doğrulanmamış")) return fromAuth;

  const fromTable = await verifyWithPanelTable(username, password);
  if (fromTable) return fromTable;

  return fromAuth ?? { status: "denied", message: "E-posta veya şifre hatalı." };
}

export async function registerAdminListGate(username: string, password: string) {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  if (!secret) return;

  const supabase = createSupabaseServerClient();
  if (!supabase) return;

  await supabase.rpc("register_admin_gate", {
    p_username: username.trim(),
    p_password: password,
    p_secret: secret,
  });
}
