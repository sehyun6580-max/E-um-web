import type { ApiMessage, Draft, Mode, Persona } from "../types";
import { CONTEXT_LIMIT } from "../reply";
import { DEFAULT_PERSONA, sanitizePersona } from "../personas";

const MAX_CHARS = 4000;

export function readMode(value: unknown): Mode {
  return value === "T" ? "T" : "F";
}

export function readPersona(value: unknown): Persona {
  return sanitizePersona(value) ?? DEFAULT_PERSONA;
}

/** 짧은 글 한 칸 (기호는 그대로 두고 길이만 자른다) */
export function readText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function readDraft(value: unknown): Draft {
  const o = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    topic: readText(o.topic, 200),
    criterion: readText(o.criterion, 200),
    conclusion: readText(o.conclusion, 200),
  };
}

/** 클라이언트가 보낸 대화를 검사해서 안전한 모양으로 돌려준다. 잘못되면 null. */
export function readMessages(value: unknown): ApiMessage[] | null {
  if (!Array.isArray(value)) return null;
  const out: ApiMessage[] = [];
  for (const item of value.slice(-CONTEXT_LIMIT)) {
    if (!item || typeof item !== "object") return null;
    const { role, content } = item as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    out.push({ role, content: content.slice(0, MAX_CHARS) });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out.length ? out : null;
}

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}
