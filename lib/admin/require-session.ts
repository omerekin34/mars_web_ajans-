import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminSessionCookieName, readAdminSession } from "@/lib/admin/session";

export async function requireAdminSession() {
  const jar = await cookies();
  const session = await readAdminSession(jar.get(adminSessionCookieName())?.value);
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Oturum gerekli." }, { status: 401 }),
    };
  }
  return { session, response: null };
}
