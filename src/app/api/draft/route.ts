import { DRAFT_SYSTEM_PROMPT } from "@/lib/server/prompts";
import { availableProviders, completeJson, describeError } from "@/lib/server/llm";
import { mockDraft } from "@/lib/server/mock";
import { badRequest, readMessages } from "@/lib/server/validate";

const SCHEMA = {
  type: "object",
  properties: {
    topic: { type: "string" },
    criterion: { type: "string" },
  },
  required: ["topic", "criterion"],
  additionalProperties: false,
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return badRequest("요청 형식이 올바르지 않아요.");

  const messages = readMessages(body.messages);
  if (!messages) return badRequest("초안을 만들 대화가 아직 없어요.");

  const p = availableProviders();
  const provider = p.anthropic ? "anthropic" : p.openai ? "openai" : "mock";
  if (provider === "mock") return Response.json({ ...mockDraft(messages), provider });

  const transcript = messages
    .map((m) => `${m.role === "user" ? "사용자" : "이음"}: ${m.content}`)
    .join("\n\n");

  try {
    const result = (await completeJson(provider, DRAFT_SYSTEM_PROMPT, transcript, SCHEMA)) as
      | { topic?: unknown; criterion?: unknown }
      | null;
    return Response.json({
      topic: typeof result?.topic === "string" ? result.topic : "",
      criterion: typeof result?.criterion === "string" ? result.criterion : "",
      provider,
    });
  } catch (err) {
    return Response.json({ error: describeError(err) }, { status: 502 });
  }
}
