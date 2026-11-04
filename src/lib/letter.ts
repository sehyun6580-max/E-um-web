/**
 * 화해 편지 링크.
 * 편지 내용은 주소의 # 뒤에만 들어간다. # 뒤는 브라우저가 서버로 보내지 않아서
 * 이음 서버와 Vercel 로그 어디에도 남지 않는다. 링크를 가진 사람은 누구나 읽을 수 있다.
 */

export const LETTER_MAX = 1000;
export const NAME_MAX = 20;
const QUOTE_MAX = 60;

export type ReplyChoice = "talk" | "time" | "write";

export const REPLY_LABEL: Record<ReplyChoice, string> = {
  talk: "나도 얘기하고 싶어",
  time: "조금 시간이 필요해",
  write: "답장을 썼어",
};

export interface LetterPayload {
  kind: "letter";
  from: string;
  to: string;
  text: string;
  at: number;
}

export interface ReplyPayload {
  kind: "reply";
  from: string;
  to: string;
  choice: ReplyChoice;
  text: string;
  /** 처음 편지의 앞부분 (무엇에 대한 답장인지 보여주기용) */
  quote: string;
  at: number;
}

export type Payload = LetterPayload | ReplyPayload;

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function quoteOf(text: string): string {
  const one = text.replace(/\s+/g, " ").trim();
  return one.length > QUOTE_MAX ? one.slice(0, QUOTE_MAX - 1) + "…" : one;
}

/** 링크에서 꺼낸 값을 검사한다. 모양이 이상하면 null. */
export function readPayload(value: unknown): Payload | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  const at = typeof o.at === "number" && Number.isFinite(o.at) ? o.at : Date.now();
  const from = clip(o.from, NAME_MAX);
  const to = clip(o.to, NAME_MAX);
  const text = clip(o.text, LETTER_MAX);
  if (o.kind === "letter") {
    return text ? { kind: "letter", from, to, text, at } : null;
  }
  if (o.kind === "reply") {
    const choice: ReplyChoice | null =
      o.choice === "talk" || o.choice === "time" || o.choice === "write" ? o.choice : null;
    if (!choice || (choice === "write" && !text)) return null;
    return { kind: "reply", from, to, choice, text, quote: clip(o.quote, QUOTE_MAX), at };
  }
  return null;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const piped = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(piped).arrayBuffer());
}

const canCompress = () =>
  typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

/** 편지 → 링크용 문자열. 앞 두 글자는 형식 표시 (1z = 압축, 1p = 압축 안 함) */
export async function encodePayload(payload: Payload): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  if (canCompress()) {
    try {
      return "1z" + toBase64Url(await pipe(bytes, new CompressionStream("deflate-raw")));
    } catch {
      /* 압축이 안 되면 그대로 담는다 */
    }
  }
  return "1p" + toBase64Url(bytes);
}

export async function decodePayload(token: string): Promise<Payload | null> {
  try {
    const t = decodeURIComponent(token.replace(/^#/, "").trim());
    let bytes: Uint8Array;
    if (t.startsWith("1z")) {
      if (!canCompress()) return null;
      bytes = await pipe(fromBase64Url(t.slice(2)), new DecompressionStream("deflate-raw"));
    } else if (t.startsWith("1p")) {
      bytes = fromBase64Url(t.slice(2));
    } else {
      return null;
    }
    return readPayload(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}

export async function letterLink(payload: Payload): Promise<string> {
  return `${window.location.origin}/letter#${await encodePayload(payload)}`;
}
