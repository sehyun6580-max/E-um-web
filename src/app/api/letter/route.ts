import { RECONCILE_SYSTEM_PROMPT } from "@/lib/server/prompts";
import { availableProviders, completeJson, describeError } from "@/lib/server/llm";
import { mockLetter } from "@/lib/server/mock";
import { badRequest, readDraft, readMessages, readText } from "@/lib/server/validate";

/** 화해 편지 초안. 편지는 서버에 저장하지 않고 돌려주기만 한다. */
const SCHEMA = {
  type: "object",
  properties: {
    blocked: { type: "boolean" },
    letter: { type: "string" },
    reason: { type: "string" },
  },
  required: ["blocked", "letter", "reason"],
  additionalProperties: false,
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return badRequest("요청 형식이 올바르지 않아요.");

  const messages = readMessages(body.messages);
  if (!messages) return badRequest("편지를 쓸 대화가 아직 없어요.");
  const draft = readDraft(body.draft);
  const to = readText(body.to, 20);

  const p = availableProviders();
  const provider = p.anthropic ? "anthropic" : p.openai ? "openai" : "mock";
  if (provider === "mock") return Response.json({ ...mockLetter(messages, draft, to), provider });

  const transcript = messages
    .map((m) => `${m.role === "user" ? "사용자" : "이음"}: ${m.content}`)
    .join("\n\n");
  const memo = [
    draft.topic && `고민: ${draft.topic}`,
    draft.criterion && `찾은 기준: ${draft.criterion}`,
    draft.conclusion && `최종 생각: ${draft.conclusion}`,
  ]
    .filter(Boolean)
    .join("\n");
  const input = [
    `받는 사람 호칭: ${to || "(정하지 않음)"}`,
    memo ? `기억과 기준의 방 메모\n${memo}` : "",
    `대화\n${transcript}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const result = (await completeJson(provider, RECONCILE_SYSTEM_PROMPT, input, SCHEMA)) as
      | { blocked?: unknown; letter?: unknown; reason?: unknown }
      | null;
    if (!result) {
      return Response.json(
        { error: "이 대화로는 편지 초안을 만들기 어려워요. 직접 써 보세요." },
        { status: 422 },
      );
    }
    const blocked = result.blocked === true;
    return Response.json({
      blocked,
      letter: !blocked && typeof result.letter === "string" ? result.letter.trim() : "",
      reason: typeof result.reason === "string" ? result.reason.trim() : "",
      provider,
    });
  } catch (err) {
    return Response.json({ error: describeError(err) }, { status: 502 });
  }
}
