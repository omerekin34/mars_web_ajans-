import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-session";
import { clientKey, rateLimit } from "@/lib/admin/rate-limit";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";
const MAX_CHUNK_BYTES = 440;
const MAX_ITEMS = 60;
const MAX_ITEM_CHARS = 30000;

type Piece = { text: string; separator: string };

function utf8Length(value: string) {
  return Buffer.byteLength(value, "utf8");
}

// Metni UTF-8 bayt sınırını aşmadan, önce satır sonu, sonra cümle ve kelime
// sınırından böler. Her parçanın ardından gelen ayraç korunur ki çeviriler
// birleştirildiğinde satır/paragraf yapısı bozulmasın.
function splitIntoPieces(text: string): Piece[] {
  const pieces: Piece[] = [];
  let rest = text;
  while (utf8Length(rest) > MAX_CHUNK_BYTES) {
    let lo = 0;
    let hi = Math.min(rest.length, MAX_CHUNK_BYTES);
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (utf8Length(rest.slice(0, mid)) <= MAX_CHUNK_BYTES) lo = mid;
      else hi = mid - 1;
    }
    const window = rest.slice(0, lo);
    const newline = window.lastIndexOf("\n");
    let cut: number;
    let separatorLength: number;
    if (newline > 0) {
      cut = newline;
      separatorLength = 1;
      while (rest[cut + separatorLength] === "\n") separatorLength += 1;
    } else {
      const sentence = Math.max(
        window.lastIndexOf(". "),
        window.lastIndexOf("! "),
        window.lastIndexOf("? "),
        window.lastIndexOf(": "),
        window.lastIndexOf("; "),
      );
      if (sentence > 0) {
        cut = sentence + 1;
        separatorLength = 1;
      } else {
        const space = window.lastIndexOf(" ");
        if (space > 0) {
          cut = space;
          separatorLength = 1;
        } else {
          cut = lo;
          separatorLength = 0;
        }
      }
    }
    pieces.push({ text: rest.slice(0, cut), separator: rest.slice(cut, cut + separatorLength) });
    rest = rest.slice(cut + separatorLength);
  }
  pieces.push({ text: rest, separator: "" });
  return pieces;
}

async function translateChunk(text: string): Promise<string> {
  const url = new URL(MYMEMORY_URL);
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", "tr|en");
  const email = process.env.MYMEMORY_EMAIL?.trim();
  if (email) url.searchParams.set("de", email);

  const response = await fetch(url, {
    method: "GET",
    headers: { "User-Agent": "mars-web-admin-translate/1.0" },
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as {
    responseStatus?: number | string;
    responseData?: { translatedText?: string };
    responseDetails?: string;
  } | null;

  const status = Number(data?.responseStatus ?? response.status);
  const translated = data?.responseData?.translatedText ?? "";
  if (!response.ok || !data || status !== 200 || !translated) {
    const detail = String(data?.responseDetails ?? "");
    if (/quota|limit|429|403/i.test(detail) || status === 429 || status === 403) {
      throw new Error("Ücretsiz çeviri limiti doldu. Birkaç saat sonra yeniden deneyin.");
    }
    throw new Error("Çeviri servisi yanıt vermedi.");
  }
  return translated;
}

async function translateText(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const pieces = splitIntoPieces(text);
  const translated: string[] = [];
  for (const piece of pieces) {
    const body = piece.text.trim() ? await translateChunk(piece.text) : piece.text;
    translated.push(body + piece.separator);
  }
  return translated.join("");
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const limited = rateLimit(`translate:${clientKey(request)}`, 30, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Çok fazla çeviri isteği. ${limited.retryAfter} saniye sonra deneyin.` },
      { status: 429 },
    );
  }

  let body: { texts?: unknown; text?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const texts = Array.isArray(body.texts)
    ? body.texts
    : typeof body.text === "string"
      ? [body.text]
      : null;
  if (!texts || texts.length === 0 || texts.length > MAX_ITEMS || texts.some((item) => typeof item !== "string")) {
    return NextResponse.json({ error: "Geçersiz metin listesi." }, { status: 400 });
  }
  if ((texts as string[]).some((item) => item.length > MAX_ITEM_CHARS)) {
    return NextResponse.json({ error: "Metin çok uzun." }, { status: 413 });
  }

  try {
    const translations: string[] = [];
    for (const text of texts as string[]) {
      translations.push(await translateText(text));
    }
    return NextResponse.json({ translations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Çeviri başarısız.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
