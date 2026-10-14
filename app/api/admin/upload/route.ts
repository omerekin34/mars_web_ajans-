import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { requireAdminSession } from "@/lib/admin/require-session";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/gif"];

export async function POST(request: NextRequest) {
  // Session kontrolü
  const { session, response } = await requireAdminSession();
  if (response) {
    return response;
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase yapılandırması eksik" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya boyutu 5MB'den küçük olmalı" }, { status: 413 });
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Sadece JPEG, PNG, WebP, SVG ve GIF formatları desteklenir" }, { status: 415 });
    }

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split(".").pop();
    const fileName = `${folder}/${timestamp}-${random}.${extension}`;

    // Supabase Storage'a yükle
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: "Yükleme başarısız: " + error.message }, { status: 500 });
    }

    // Public URL oluştur
    const { data: { publicUrl } } = supabase.storage
      .from("images")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl, path: data.path });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
