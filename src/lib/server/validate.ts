import type { ApiMessage, Mode } from "../types";
import { CONTEXT_LIMIT } from "../reply";

const MAX_CHARS = 4000;

export function readMode(value: unknown): Mode {
  return value === "T" ? "T" : "F";
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
