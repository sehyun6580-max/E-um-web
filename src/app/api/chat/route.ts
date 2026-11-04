import { chatSystemPrompt } from "@/lib/server/prompts";
import { pickProvider, streamFromModel, textStreamResponse } from "@/lib/server/llm";
import { mockChat, typeOut } from "@/lib/server/mock";
import { badRequest, readMessages, readMode } from "@/lib/server/validate";
import { stageFor } from "@/lib/reply";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return badRequest("요청 형식이 올바르지 않아요.");

  const mode = readMode(body.mode);
  const messages = readMessages(body.messages);
  if (!messages) return badRequest("대화 내용이 비어 있어요.");

  const userTurn =
    typeof body.userTurn === "number" && body.userTurn > 0
      ? Math.floor(body.userTurn)
      : messages.filter((m) => m.role === "user").length;
  const stage = stageFor(userTurn);
  const provider = pickProvider(mode);

  if (provider === "mock") {
    return textStreamResponse(typeOut(mockChat(mode, stage, messages)), provider);
  }
  const system = chatSystemPrompt(mode, stage, userTurn);
  return textStreamResponse(streamFromModel(provider, system, messages), provider);
}
