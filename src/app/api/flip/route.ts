import { FLIP_SYSTEM_PROMPT } from "@/lib/server/prompts";
import { pickProvider, streamFromModel, textStreamResponse } from "@/lib/server/llm";
import { mockFlip, typeOut } from "@/lib/server/mock";
import { badRequest, readMessages, readMode } from "@/lib/server/validate";
import type { ApiMessage } from "@/lib/types";

function transcript(messages: ApiMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "사용자" : "이음"}: ${m.content}`)
    .join("\n\n");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return badRequest("요청 형식이 올바르지 않아요.");

  const messages = readMessages(body.messages);
  if (!messages) return badRequest("뒤집어볼 대화가 아직 없어요.");
  const provider = pickProvider(readMode(body.mode));

  if (provider === "mock") {
    return textStreamResponse(typeOut(mockFlip(messages)), provider);
  }
  const prompt = `다음 대화를 상대방 시점으로 뒤집어 줘.\n\n${transcript(messages)}`;
  return textStreamResponse(
    streamFromModel(provider, FLIP_SYSTEM_PROMPT, [{ role: "user", content: prompt }]),
    provider,
  );
}
