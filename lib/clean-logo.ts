export type CleanLogo = { src: string; width: number; height: number };

const MAX_SIDE = 640;
const GROW_STEP = 22;
const BACKGROUND_RANGE = 110;
const EDGE_RANGE = 150;
const MAX_EDGE_NOISE = 14;
const MIN_UNIFORM_BORDER = 0.6;
const DARK_LUMINANCE = 0.22;

const cache = new Map<string, Promise<CleanLogo | null>>();

export function cleanLogo(url: string): Promise<CleanLogo | null> {
  let pending = cache.get(url);
  if (!pending) {
    pending = processLogo(url).catch(() => null);
    cache.set(url, pending);
  }
  return pending;
}

function loadImage(src: string, cors: boolean) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    if (cors) image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/** Tries a direct CORS load first; hosts without CORS headers go through the same-origin proxy. */
async function loadReadableImage(url: string) {
  if (url.startsWith("data:") || url.startsWith("blob:") || (url.startsWith("/") && !url.startsWith("//"))) {
    return loadImage(url, false);
  }
  try {
    return await loadImage(url, true);
  } catch {
    return loadImage(`/api/logo?url=${encodeURIComponent(url)}`, false);
  }
}

async function processLogo(url: string): Promise<CleanLogo | null> {
  const image = await loadReadableImage(url);
  const naturalW = image.naturalWidth || MAX_SIDE;
  const naturalH = image.naturalHeight || MAX_SIDE;
  const scale = Math.min(1, MAX_SIDE / Math.max(naturalW, naturalH));
  const w = Math.max(1, Math.round(naturalW * scale));
  const h = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, w, h);
  const frame = ctx.getImageData(0, 0, w, h);
  const px = frame.data;

  const border = borderIndices(w, h);
  removeBackground(px, w, h, border);
  if (isTransparentEdge(px, border)) lightenDarkInk(px);

  const box = contentBox(px, w, h);
  if (!box) return null;
  ctx.putImageData(frame, 0, 0);

  const out = document.createElement("canvas");
  out.width = box.w;
  out.height = box.h;
  out.getContext("2d")?.drawImage(canvas, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
  return { src: out.toDataURL("image/png"), width: box.w, height: box.h };
}

function borderIndices(w: number, h: number) {
  const indices: number[] = [];
  for (let x = 0; x < w; x++) indices.push(x, (h - 1) * w + x);
  for (let y = 1; y < h - 1; y++) indices.push(y * w, y * w + w - 1);
  return indices;
}

type Rgb = { r: number; g: number; b: number };

function distanceTo(px: Uint8ClampedArray, o: number, c: Rgb) {
  const dr = px[o] - c.r;
  const dg = px[o + 1] - c.g;
  const db = px[o + 2] - c.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function distanceBetween(px: Uint8ClampedArray, o: number, p: number) {
  return distanceTo(px, o, { r: px[p], g: px[p + 1], b: px[p + 2] });
}

/** Average colour jump between neighbouring edge pixels; high for photos, low for flat or gradient fills. */
function edgeNoise(px: Uint8ClampedArray, w: number, h: number) {
  let total = 0;
  let count = 0;
  const step = (a: number, b: number) => {
    total += distanceBetween(px, a * 4, b * 4);
    count++;
  };
  for (let x = 1; x < w; x++) {
    step(x - 1, x);
    step((h - 1) * w + x - 1, (h - 1) * w + x);
  }
  for (let y = 1; y < h; y++) {
    step((y - 1) * w, y * w);
    step((y - 1) * w + w - 1, y * w + w - 1);
  }
  return count ? total / count : 0;
}

/** Median opaque edge colour; null when the edge is already transparent, busy or multi-coloured. */
function backgroundColor(px: Uint8ClampedArray, w: number, h: number, border: number[]): Rgb | null {
  const opaque = border.filter((i) => px[i * 4 + 3] >= 200);
  if (opaque.length < border.length * 0.5) return null;
  if (edgeNoise(px, w, h) > MAX_EDGE_NOISE) return null;

  const median = (channel: number) => {
    const values = opaque.map((i) => px[i * 4 + channel]).sort((a, b) => a - b);
    return values[values.length >> 1];
  };
  const color = { r: median(0), g: median(1), b: median(2) };
  const near = opaque.filter((i) => distanceTo(px, i * 4, color) < BACKGROUND_RANGE).length;
  return near >= opaque.length * MIN_UNIFORM_BORDER ? color : null;
}

/**
 * Grows the background inwards from the edges, comparing each pixel with the neighbour it was reached from,
 * so gradients are followed while enclosed areas of the same colour (e.g. white inside a ring) are kept.
 */
function removeBackground(px: Uint8ClampedArray, w: number, h: number, border: number[]) {
  const bg = backgroundColor(px, w, h, border);
  if (!bg) return;

  const source = px.slice();
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  for (const i of border) {
    const o = i * 4;
    if (source[o + 3] < 16 || distanceTo(source, o, bg) < BACKGROUND_RANGE) {
      visited[i] = 1;
      queue[tail++] = i;
    }
  }

  while (head < tail) {
    const i = queue[head++];
    const o = i * 4;
    px[o + 3] = 0;
    const clearSource = source[o + 3] < 16;
    const x = i % w;
    const y = (i - x) / w;
    const neighbours = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];

    for (const n of neighbours) {
      if (n < 0 || visited[n]) continue;
      const p = n * 4;
      if (source[p + 3] < 16) {
        visited[n] = 1;
        queue[tail++] = n;
        continue;
      }
      const local = clearSource ? bg : { r: source[o], g: source[o + 1], b: source[o + 2] };
      const d = distanceTo(source, p, local);
      if (d < GROW_STEP && distanceTo(source, p, bg) < BACKGROUND_RANGE) {
        visited[n] = 1;
        queue[tail++] = n;
        continue;
      }
      if (clearSource) continue;
      visited[n] = 1;
      if (d < EDGE_RANGE) {
        // Anti-aliased edge: fade it out and un-mix the background colour.
        const keep = d / EDGE_RANGE;
        px[p + 3] = Math.round(source[p + 3] * keep);
        px[p] = clamp((source[p] - local.r * (1 - keep)) / keep);
        px[p + 1] = clamp((source[p + 1] - local.g * (1 - keep)) / keep);
        px[p + 2] = clamp((source[p + 2] - local.b * (1 - keep)) / keep);
      }
    }
  }
}

function clamp(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function isTransparentEdge(px: Uint8ClampedArray, border: number[]) {
  let clear = 0;
  for (const i of border) if (px[i * 4 + 3] < 16) clear++;
  return clear >= border.length * 0.5;
}

function luminanceAt(px: Uint8ClampedArray, o: number) {
  return (0.2126 * px[o] + 0.7152 * px[o + 1] + 0.0722 * px[o + 2]) / 255;
}

/**
 * Near-black ink disappears on the dark cards, so flip its lightness while keeping the hue.
 * Skipped when the logo already has light parts (e.g. white text on a dark badge) that would merge with it.
 */
function lightenDarkInk(px: Uint8ClampedArray) {
  let opaque = 0;
  let dark = 0;
  let light = 0;
  for (let o = 0; o < px.length; o += 4) {
    if (px[o + 3] < 128) continue;
    opaque++;
    const l = luminanceAt(px, o);
    if (l < DARK_LUMINANCE) dark++;
    else if (l > 0.8) light++;
  }
  if (!opaque || dark < opaque * 0.2 || light > opaque * 0.08) return;

  for (let o = 0; o < px.length; o += 4) {
    if (px[o + 3] < 16 || luminanceAt(px, o) >= DARK_LUMINANCE) continue;
    const r = px[o] / 255;
    const g = px[o + 1] / 255;
    const b = px[o + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const target = 1 - lightness * 0.6;
    const shift = target - lightness;
    px[o] = clamp((r + shift) * 255);
    px[o + 1] = clamp((g + shift) * 255);
    px[o + 2] = clamp((b + shift) * 255);
  }
}

function contentBox(px: Uint8ClampedArray, w: number, h: number) {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  return { x, y, w: Math.min(w, maxX + pad + 1) - x, h: Math.min(h, maxY + pad + 1) - y };
}
