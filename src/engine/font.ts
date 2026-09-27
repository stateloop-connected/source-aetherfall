/**
 * Hand-made proportional bitmap font (cap height 7px, descenders to 9px) plus a
 * tiny markup language for colored text:  "Take the {gold}Aether Shard{/}."
 *
 * Text is rendered from a white glyph atlas that is tinted & cached per color, so
 * it stays perfectly crisp on the low-resolution game canvas. Other text styles
 * (smaller bitmap glyphs, a smooth font, high contrast) are chosen in Settings.
 */
import { ELEMENT_COLORS, PAL, RARITY_COLORS } from '../art/palette';

const GLYPHS: Record<string, string> = {
  A: '.##.|#..#|#..#|####|#..#|#..#|#..#',
  B: '###.|#..#|#..#|###.|#..#|#..#|###.',
  C: '.##.|#..#|#...|#...|#...|#..#|.##.',
  D: '###.|#..#|#..#|#..#|#..#|#..#|###.',
  E: '####|#...|#...|###.|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...',
  G: '.##.|#..#|#...|#.##|#..#|#..#|.###',
  H: '#..#|#..#|#..#|####|#..#|#..#|#..#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###',
  J: '..##|...#|...#|...#|#..#|#..#|.##.',
  K: '#..#|#..#|#.#.|##..|#.#.|#..#|#..#',
  L: '#...|#...|#...|#...|#...|#...|####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#..#|##.#|##.#|#.##|#.##|#..#|#..#',
  O: '.##.|#..#|#..#|#..#|#..#|#..#|.##.',
  P: '###.|#..#|#..#|###.|#...|#...|#...',
  Q: '.##.|#..#|#..#|#..#|#..#|#.#.|.#.#',
  R: '###.|#..#|#..#|###.|#.#.|#..#|#..#',
  S: '.###|#...|#...|.##.|...#|...#|###.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#..#|#..#|#..#|#..#|#..#|#..#|.##.',
  V: '#...#|#...#|#...#|#...#|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '####|...#|...#|..#.|.#..|#...|####',
  a: '....|....|.###|#..#|#..#|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|###.',
  c: '...|...|.##|#..|#..|#..|.##',
  d: '...#|...#|.###|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#',
  j: '.#|..|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#',
  l: '#.|#.|#.|#.|#.|#.|.#',
  m: '.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#',
  n: '....|....|###.|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|.###|...#|...#',
  r: '...|...|#.#|##.|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|###.',
  t: '.#.|.#.|###|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..',
  w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  x: '....|....|#..#|#..#|.##.|#..#|#..#',
  y: '....|....|#..#|#..#|#..#|#..#|.###|...#|.##.',
  z: '....|....|####|...#|.##.|#...|####',
  '0': '.##.|#..#|#.##|##.#|#..#|#..#|.##.',
  '1': '.#.|##.|.#.|.#.|.#.|.#.|###',
  '2': '.##.|#..#|...#|..#.|.#..|#...|####',
  '3': '###.|...#|...#|.##.|...#|...#|###.',
  '4': '#..#|#..#|#..#|####|...#|...#|...#',
  '5': '####|#...|#...|###.|...#|...#|###.',
  '6': '.##.|#...|#...|###.|#..#|#..#|.##.',
  '7': '####|...#|...#|..#.|.#..|.#..|.#..',
  '8': '.##.|#..#|#..#|.##.|#..#|#..#|.##.',
  '9': '.##.|#..#|#..#|.###|...#|...#|.##.',
  '.': '.|.|.|.|.|.|#',
  ',': '..|..|..|..|..|.#|.#|#.',
  '!': '#|#|#|#|#|.|#',
  '?': '.##.|#..#|...#|..#.|.#..|....|.#..',
  ':': '.|.|#|.|.|.|#',
  ';': '..|..|.#|..|..|..|.#|#.',
  "'": '#|#|.|.|.|.|.',
  '`': '#.|.#|..|..|..|..|..',
  '"': '#.#|#.#|...|...|...|...|...',
  '-': '...|...|...|###|...|...|...',
  '+': '...|...|.#.|###|.#.|...|...',
  '=': '...|...|###|...|###|...|...',
  '/': '..#|..#|.#.|.#.|.#.|#..|#..',
  '\\': '#..|#..|.#.|.#.|.#.|..#|..#',
  '(': '.#|#.|#.|#.|#.|#.|.#',
  ')': '#.|.#|.#|.#|.#|.#|#.',
  '[': '##|#.|#.|#.|#.|#.|##',
  ']': '##|.#|.#|.#|.#|.#|##',
  '%': '##...|##..#|...#.|..#..|.#...|#..##|...##',
  '*': '...|#.#|.#.|#.#|...|...|...',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  '<': '...|..#|.#.|#..|.#.|..#|...',
  '>': '...|#..|.#.|..#|.#.|#..|...',
  _: '....|....|....|....|....|....|####',
  '&': '.#...|#.#..|.#...|#.#.#|#..#.|#..#.|.##.#',
  '^': '.#.|#.#|...|...|...|...|...',
  '|': '#|#|#|#|#|#|#',
  '~': '....|....|.#.#|#.#.|....|....|....',
  $: '.#.|###|#..|###|..#|###|.#.',
  '@': '.###.|#...#|#.###|#.#.#|#.###|#....|.###.',
  // special symbols (mapped from unicode below)
  '♥': '.....|##.##|#####|#####|.###.|..#..|.....', // ♥
  '★': '..#..|..#..|#####|.###.|.#.#.|#...#|.....', // ★
  '→': '.....|..#..|...#.|#####|...#.|..#..|.....', // →
  '←': '.....|..#..|.#...|#####|.#...|..#..|.....', // ←
  '↑': '..#..|.###.|#.#.#|..#..|..#..|..#..|.....', // ↑
  '↓': '..#..|..#..|..#..|#.#.#|.###.|..#..|.....', // ↓
  '▲': '.....|..#..|.###.|#####|.....|.....|.....', // ▲
  '▼': '.....|#####|.###.|..#..|.....|.....|.....', // ▼
  '▶': '#...|##..|###.|####|###.|##..|#...', // ▶
  '•': '..|..|##|##|..|..|..', // •
  '×': '...|...|#.#|.#.|#.#|...|...', // ×
  '◆': '.....|..#..|.###.|#####|.###.|..#..|.....', // ◆ filled socket
  '◇': '.....|..#..|.#.#.|#...#|.#.#.|..#..|.....', // ◇ empty socket
};

const ALIASES: Record<string, string> = {
  '’': "'",
  '‘': "'",
  '“': '"',
  '”': '"',
  '—': '-',
  '–': '-',
  '…': '...',
};

export const FONT_CAP = 7;
export const LINE_HEIGHT = 10;
const ATLAS_H = 9;
const SPACE_W = 3;
const LETTER_SPACING = 1;

interface GlyphMetrics {
  x: number;
  w: number;
}

let atlas: HTMLCanvasElement | null = null;
const metrics = new Map<string, GlyphMetrics>();
const tinted = new Map<string, HTMLCanvasElement>();

function buildAtlas(): HTMLCanvasElement {
  const entries = Object.entries(GLYPHS);
  let totalW = 0;
  for (const [, def] of entries) totalW += def.split('|')[0].length + 1;
  const c = document.createElement('canvas');
  c.width = totalW;
  c.height = ATLAS_H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  let x = 0;
  for (const [ch, def] of entries) {
    const rows = def.split('|');
    const w = rows[0].length;
    rows.forEach((row, y) => {
      for (let i = 0; i < row.length; i++) if (row[i] === '#') ctx.fillRect(x + i, y, 1, 1);
    });
    metrics.set(ch, { x, w });
    x += w + 1;
  }
  return c;
}

function getAtlas(color: string): HTMLCanvasElement {
  if (!atlas) atlas = buildAtlas();
  const key = color.toLowerCase();
  let t = tinted.get(key);
  if (!t) {
    t = document.createElement('canvas');
    t.width = atlas.width;
    t.height = atlas.height;
    const ctx = t.getContext('2d')!;
    ctx.drawImage(atlas, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, t.width, t.height);
    tinted.set(key, t);
  }
  return t;
}

/** Named colors usable in markup, e.g. {gold}...{/}. Any #hex also works: {#ff0044}. */
export const TEXT_COLORS: Record<string, string> = {
  white: PAL.white,
  gray: PAL.gray,
  light: PAL.lightGray,
  dark: PAL.slate,
  gold: PAL.gold,
  yellow: PAL.yellow,
  red: PAL.red,
  green: PAL.green,
  blue: PAL.sky,
  cyan: PAL.cyan,
  purple: PAL.magenta,
  orange: PAL.orange,
  pink: PAL.pink,
  common: PAL.lightGray,
  uncommon: PAL.green,
  rare: PAL.sky,
  epic: PAL.magenta,
  legendary: PAL.orange,
  set: RARITY_COLORS.set,
  abyssal: PAL.hotPink,
  physical: ELEMENT_COLORS.physical,
  fire: ELEMENT_COLORS.fire,
  ice: ELEMENT_COLORS.ice,
  lightning: ELEMENT_COLORS.lightning,
  poison: ELEMENT_COLORS.poison,
};

export interface TextRun {
  text: string;
  color: string | null; // null = default color
}

function normalizeChars(s: string): string {
  let out = '';
  for (const ch of s) out += ALIASES[ch] ?? ch;
  return out;
}

/** Split markup into colored runs. */
export function parseMarkup(src: string): TextRun[] {
  const runs: TextRun[] = [];
  let color: string | null = null;
  let buf = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') {
      const end = src.indexOf('}', i);
      if (end > i) {
        const tag = src.slice(i + 1, end);
        const resolved = tag === '/' ? null : tag.startsWith('#') ? tag : (TEXT_COLORS[tag] ?? undefined);
        if (resolved !== undefined) {
          if (buf) runs.push({ text: normalizeChars(buf), color });
          buf = '';
          color = resolved;
          i = end + 1;
          continue;
        }
      }
    }
    buf += ch;
    i++;
  }
  if (buf) runs.push({ text: normalizeChars(buf), color });
  return runs;
}

/** Removes markup tags. */
export function stripMarkup(src: string): string {
  return parseMarkup(src)
    .map((r) => r.text)
    .join('');
}

function charWidth(ch: string): number {
  if (ch === ' ') return SPACE_W;
  const m = metrics.get(ch) ?? metrics.get('?');
  return m ? m.w : 4;
}

function ensureMetrics(): void {
  if (!atlas) atlas = buildAtlas();
}

// ------------------------------------------------------------- text styles ----

/**
 * Text styles (Settings → Text Style).
 * - classic: the bitmap font on the low-resolution canvas (the original look).
 * - crisp: the same bitmap font drawn with smaller, finer pixels.
 * - clean: a smooth system font.
 * - contrast: the classic font with outlines and brighter secondary text.
 * Crisp and Clean draw text finer than one game pixel, so they need the canvas at
 * full screen resolution (see Screen.setFullResolution).
 */
export type TextStyle = 'classic' | 'crisp' | 'clean' | 'contrast';
export const TEXT_STYLES: readonly TextStyle[] = ['classic', 'crisp', 'clean', 'contrast'];
export const TEXT_STYLE_INFO: Record<TextStyle, { label: string; desc: string }> = {
  classic: { label: 'Classic', desc: 'The original chunky pixel font.' },
  crisp: {
    label: 'Crisp',
    desc: 'The pixel font drawn smaller and sharper, so menus and tooltips fit more and feel less cramped.',
  },
  clean: {
    label: 'Clean',
    desc: 'A smooth, modern font at full screen resolution: the easiest to read, and smaller in menus.',
  },
  contrast: {
    label: 'High Contrast',
    desc: 'The pixel font at its original size, outlined on a dark backing so it stands out anywhere, with brighter grey text and solid panels.',
  },
};

let style: TextStyle = 'classic';
/** Device pixels per game pixel on the canvas (1 unless it renders at full resolution). */
let res = 1;

export const textStyle = (): TextStyle => style;
export const needsFullResolution = (s: TextStyle): boolean => s === 'crisp' || s === 'clean';

/** Switch the text style. `deviceRes` is the canvas's device pixels per game pixel. */
export function setTextStyle(s: TextStyle, deviceRes: number): void {
  style = TEXT_STYLES.includes(s) ? s : 'classic';
  res = Math.max(1, deviceRes);
  const contrast = style === 'contrast';
  TEXT_COLORS.gray = contrast ? PAL.lightGray : PAL.gray;
  TEXT_COLORS.dark = contrast ? PAL.gray : PAL.slate;
  widths.clear();
}

/** Crisp: game pixels per font pixel. Whole device pixels, about two thirds of Classic. */
function crispScale(): number {
  if (style !== 'crisp' || res < 3) return 1;
  return Math.max(2, Math.round(res * 0.66)) / res;
}

const CLEAN_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
/** Clean font size (em) in game pixels, and its cap height as a fraction of the em. */
const CLEAN_EM = 7.4;
const CLEAN_CAP = 0.7;
const cleanFont = (scale: number): string => `600 ${CLEAN_EM * scale}px ${CLEAN_FAMILY}`;
let measureCtx: CanvasRenderingContext2D | null = null;
const widths = new Map<string, number>();

/** Width of plain text (no markup) in game pixels at text scale 1. */
function plainWidth(text: string): number {
  if (style === 'clean') {
    let w = widths.get(text);
    if (w === undefined) {
      measureCtx ??= document.createElement('canvas').getContext('2d')!;
      measureCtx.font = cleanFont(1);
      w = measureCtx.measureText(text).width;
      if (widths.size > 4000) widths.clear();
      widths.set(text, w);
    }
    return w;
  }
  ensureMetrics();
  let w = 0;
  for (let i = 0; i < text.length; i++) w += charWidth(text[i]) + (i > 0 ? LETTER_SPACING : 0);
  return w * crispScale();
}

/** Line spacing for the active text style. */
export function lineHeight(): number {
  if (style === 'clean') return Math.round(8.5 * res) / res;
  if (style === 'crisp') return Math.round(LINE_HEIGHT * crispScale() * res) / res;
  return LINE_HEIGHT;
}

/** Width in pixels of text (markup-aware) at scale 1. */
export function measureText(src: string): number {
  return plainWidth(stripMarkup(src));
}

/** Count of visible characters (markup removed). */
export function visibleLength(src: string): number {
  return stripMarkup(src).length;
}

export interface TextOptions {
  color?: string;
  align?: 'left' | 'center' | 'right';
  /** Drop shadow color (1px down-right); false disables. Default: dark shadow. */
  shadow?: string | false;
  /** 1px outline in this color (heavier than shadow). */
  outline?: string;
  scale?: number;
  /** Only draw the first N visible characters (typewriter effect). */
  maxChars?: number;
  alpha?: number;
}

/** Bitmap font glyphs; `k` is game pixels per font pixel. */
function drawRuns(
  ctx: CanvasRenderingContext2D,
  runs: TextRun[],
  x: number,
  y: number,
  defColor: string,
  k: number,
  maxChars: number,
  forceColor?: string,
): void {
  let cx = x;
  let n = 0;
  for (const run of runs) {
    const sheet = getAtlas(forceColor ?? run.color ?? defColor);
    for (const ch of run.text) {
      if (n >= maxChars) return;
      n++;
      if (ch === ' ') {
        cx += (SPACE_W + LETTER_SPACING) * k;
        continue;
      }
      const m = metrics.get(ch) ?? metrics.get('?')!;
      ctx.drawImage(sheet, m.x, 0, m.w, ATLAS_H, cx, y, m.w * k, ATLAS_H * k);
      cx += (m.w + LETTER_SPACING) * k;
    }
  }
}

/** The Clean style: a smooth font, vertically centred where the pixel font's capitals sit. */
function drawClean(
  ctx: CanvasRenderingContext2D,
  runs: TextRun[],
  x: number,
  y: number,
  color: string,
  scale: number,
  maxChars: number,
  outline: string | undefined,
  shadow: string | false | undefined,
): void {
  ctx.font = cleanFont(scale);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const base = y + (FONT_CAP * scale + CLEAN_CAP * CLEAN_EM * scale) / 2;
  const pieces: { text: string; color: string; x: number }[] = [];
  let cx = x;
  let n = 0;
  for (const run of runs) {
    if (n >= maxChars) break;
    const text = run.text.slice(0, Math.max(0, maxChars - n));
    n += text.length;
    pieces.push({ text, color: run.color ?? color, x: cx });
    cx += plainWidth(text) * scale;
  }
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = (2.4 * scale) / res;
    ctx.lineJoin = 'round';
    for (const p of pieces) ctx.strokeText(p.text, p.x, base);
  } else if (shadow !== false) {
    const o = Math.max(1, Math.round(res * 0.3 * scale)) / res;
    ctx.fillStyle = shadow ?? PAL.black;
    for (const p of pieces) ctx.fillText(p.text, p.x + o, base + o);
  }
  for (const p of pieces) {
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, base);
  }
}

/** Draw a single line of (markup) text. Returns the drawn width. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  opts: TextOptions = {},
): number {
  ensureMetrics();
  const scale = opts.scale ?? 1;
  const color = opts.color ?? PAL.white;
  const w = measureText(src) * scale;
  // snap to whole device pixels so glyphs stay sharp
  const snap = (v: number): number => Math.round(v * res) / res;
  let dx = snap(x);
  if (opts.align === 'center') dx = snap(x - w / 2);
  else if (opts.align === 'right') dx = snap(x - w);
  const dy = snap(y);
  const runs = parseMarkup(src);
  const maxChars = opts.maxChars ?? Infinity;
  const prevAlpha = ctx.globalAlpha;
  if (opts.alpha !== undefined) ctx.globalAlpha = prevAlpha * opts.alpha;
  // High Contrast: a dark plate behind the text and a full outline instead of a drop shadow
  let outline = opts.outline;
  if (style === 'contrast' && opts.shadow !== false) {
    outline ??= opts.shadow || PAL.black;
    const visible =
      opts.maxChars === undefined ? w : measureText(stripMarkup(src).slice(0, maxChars)) * scale;
    if (visible > 0) {
      ctx.fillStyle = 'rgba(14,12,24,0.6)';
      ctx.fillRect(dx - 2 * scale, dy - scale, visible + 4 * scale, LINE_HEIGHT * scale);
    }
  }
  if (style === 'clean') {
    drawClean(ctx, runs, dx, dy, color, scale, maxChars, outline, opts.shadow);
    ctx.globalAlpha = prevAlpha;
    return w;
  }
  const k = scale * crispScale();
  // smaller glyphs sit centred where the classic capitals would be
  const ty = snap(dy + (FONT_CAP * (scale - k)) / 2);
  if (outline) {
    for (const [ox, oy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [1, 1],
    ] as const) {
      drawRuns(ctx, runs, dx + ox * k, ty + oy * k, color, k, maxChars, outline);
    }
  } else if (opts.shadow !== false) {
    drawRuns(ctx, runs, dx + k, ty + k, color, k, maxChars, opts.shadow ?? PAL.black);
  }
  drawRuns(ctx, runs, dx, ty, color, k, maxChars);
  ctx.globalAlpha = prevAlpha;
  return w;
}

/**
 * Word-wrap markup text to a pixel width. Color state carries across lines
 * (each wrapped line re-opens the active color tag).
 */
export function wrapText(src: string, maxWidth: number): string[] {
  ensureMetrics();
  const out: string[] = [];
  // the gap a space adds between two words
  const spaceW = plainWidth('a a') - 2 * plainWidth('a');
  for (const paragraph of src.split('\n')) {
    const runs = parseMarkup(paragraph);
    // tokenise into words carrying color
    interface Word {
      parts: TextRun[];
      width: number;
    }
    const words: Word[] = [];
    let cur: Word = { parts: [], width: 0 };
    const pushChar = (ch: string, color: string | null): void => {
      const last = cur.parts[cur.parts.length - 1];
      if (last && last.color === color) last.text += ch;
      else cur.parts.push({ text: ch, color });
    };
    const endWord = (): void => {
      if (!cur.parts.length) return;
      cur.width = plainWidth(cur.parts.map((p) => p.text).join(''));
      words.push(cur);
    };
    for (const run of runs) {
      for (const ch of run.text) {
        if (ch === ' ') {
          endWord();
          cur = { parts: [], width: 0 };
        } else pushChar(ch, run.color);
      }
    }
    endWord();

    let line: TextRun[] = [];
    let lineW = 0;
    const flush = (): void => {
      out.push(runsToMarkup(line));
      line = [];
      lineW = 0;
    };
    for (const w of words) {
      const add = (lineW > 0 ? spaceW : 0) + w.width;
      if (lineW > 0 && lineW + add > maxWidth) flush();
      if (lineW > 0) {
        const last = line[line.length - 1];
        last.text += ' ';
      }
      for (const p of w.parts) {
        const last = line[line.length - 1];
        if (last && last.color === p.color) last.text += p.text;
        else line.push({ ...p });
      }
      lineW += (lineW > 0 ? spaceW : 0) + w.width;
    }
    flush();
  }
  return out;
}

function runsToMarkup(runs: TextRun[]): string {
  let s = '';
  for (const r of runs) {
    const safe = r.text.replace(/\{/g, '(').replace(/\}/g, ')');
    s += r.color ? `{${r.color}}${safe}{/}` : safe;
  }
  return s;
}

/** Draw pre-wrapped lines with a shared typewriter budget. Returns chars consumed. */
export function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  opts: TextOptions & { lineHeight?: number } = {},
): number {
  let budget = opts.maxChars ?? Infinity;
  const lh = opts.lineHeight ?? lineHeight();
  let used = 0;
  lines.forEach((line, i) => {
    if (budget <= 0) return;
    drawText(ctx, line, x, y + i * lh * (opts.scale ?? 1), { ...opts, maxChars: budget });
    const len = visibleLength(line);
    budget -= len;
    used += Math.min(len, len + budget);
  });
  return used;
}
