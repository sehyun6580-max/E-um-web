import type { ApiMessage, ChatMessage, Stage } from "./types";

/** 스트림 안에 섞여 오는 신호 */
export const REFUSAL_MARK = "[[EUM_REFUSAL]]";
export const ERROR_MARK = "[[EUM_ERROR]]";

/** 모델에 넘기는 최근 메시지 수 (기능설명서: 20개) */
export const CONTEXT_LIMIT = 20;

/**
 * 태그 하나의 내용을 꺼낸다. 아직 닫는 태그가 안 온(스트리밍 중) 경우에도
 * 지금까지 온 만큼 돌려주고, 끝에 걸친 반쪽 태그("</본")는 지운다.
 */
export function extractTag(raw: string, tag: string): string {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const i = raw.indexOf(open);
  if (i === -1) return "";
  const start = i + open.length;
  const j = raw.indexOf(close, start);
  if (j !== -1) return raw.slice(start, j).trim();
  return raw
    .slice(start)
    .replace(/<\/?[^>]*$/, "")
    .trim();
}

export interface ParsedReply {
  title: string;
  body: string;
  other: string;
}

export function parseReply(raw: string): ParsedReply {
  const title = extractTag(raw, "제목");
  const body = extractTag(raw, "본문");
  const other = extractTag(raw, "다른시선");
  // 모델이 형식을 무시했을 때: 전체를 본문으로 보여준다.
  if (!title && !body && raw.length > 0 && !raw.trimStart().startsWith("<")) {
    return { title: "", body: raw.trim(), other: "" };
  }
  return { title, body, other };
}

export interface ParsedFlip {
  title: string;
  story: string;
  check: string;
}

export function parseFlip(raw: string): ParsedFlip {
  const title = extractTag(raw, "제목");
  const story = extractTag(raw, "본문");
  const check = extractTag(raw, "점검");
  if (!title && !story && raw.length > 0 && !raw.trimStart().startsWith("<")) {
    return { title: "", story: raw.trim(), check: "" };
  }
  return { title, story, check };
}

/** 사용자 발화 수 → 단계 (1~2 탐색, 3~5 정리, 6~ 마무리) */
export function stageFor(userTurn: number): Stage {
  if (userTurn <= 2) return "explore";
  if (userTurn <= 5) return "organize";
  return "close";
}

export function countUserTurns(messages: ChatMessage[]): number {
  return messages.filter((m) => m.role === "user").length;
}

/**
 * 화면의 메시지를 모델용 대화로 바꾼다.
 * - 뒤집어보기 결과와 오류 메시지는 뺀다.
 * - 답변은 제목+본문만 넘긴다 (다른 모드 질문은 화면용).
 * - 최근 20개, 첫 메시지는 user, 같은 역할이 이어지면 합친다.
 */
export function toApiMessages(messages: ChatMessage[]): ApiMessage[] {
  const cleaned: ApiMessage[] = [];
  for (const m of messages) {
    if (m.kind === "flip" || m.error) continue;
    let content = m.content;
    if (m.role === "assistant") {
      const p = parseReply(m.content);
      content = [p.title, p.body].filter(Boolean).join("\n");
    }
    content = content.trim();
    if (!content) continue;
    const last = cleaned[cleaned.length - 1];
    if (last && last.role === m.role) {
      last.content += "\n" + content;
    } else {
      cleaned.push({ role: m.role, content });
    }
  }
  let recent = cleaned.slice(-CONTEXT_LIMIT);
  while (recent.length && recent[0].role !== "user") recent = recent.slice(1);
  return recent;
}
