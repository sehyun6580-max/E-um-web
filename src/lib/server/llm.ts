import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ApiMessage, Mode } from "../types";
import { ERROR_MARK, REFUSAL_MARK } from "../reply";

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6-sol";

export type Provider = "anthropic" | "openai" | "mock";

export function availableProviders() {
  return {
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
  };
}

/**
 * 공감 모드는 Claude, 팩폭 모드는 OpenAI.
 * 키가 하나만 있으면 그 모델로 두 모드를 모두 돌리고, 둘 다 없으면 데모 응답을 쓴다.
 */
export function pickProvider(mode: Mode): Provider {
  const p = availableProviders();
  if (mode === "F") return p.anthropic ? "anthropic" : p.openai ? "openai" : "mock";
  return p.openai ? "openai" : p.anthropic ? "anthropic" : "mock";
}

export async function* streamFromModel(
  provider: Exclude<Provider, "mock">,
  system: string,
  messages: ApiMessage[],
): AsyncGenerator<string> {
  if (provider === "anthropic") {
    const client = new Anthropic();
    const stream = client.messages.stream({
      model: ANTHROPIC_MODEL,
      max_tokens: 8000,
      system,
      messages,
      // 짧은 상담 답변이라 effort는 낮게 둔다 (Sonnet 5.5 기본값은 high).
      output_config: { effort: "low" },
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") yield REFUSAL_MARK;
    return;
  }

  const client = new OpenAI();
  const stream = await client.chat.completions.create({
    model: OPENAI_MODEL,
    stream: true,
    messages: [{ role: "system", content: system }, ...messages],
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

/** 한 번에 끝나는 JSON 응답 (초안 채우기용) */
export async function completeJson(
  provider: Exclude<Provider, "mock">,
  system: string,
  user: string,
  schema: Record<string, unknown>,
): Promise<unknown> {
  if (provider === "anthropic") {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: user }],
      output_config: { effort: "low", format: { type: "json_schema", schema } },
    });
    if (res.stop_reason === "refusal") return null;
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    return JSON.parse(text);
  }

  const client = new OpenAI();
  const res = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "draft", schema, strict: true },
    },
  });
  return JSON.parse(res.choices[0]?.message?.content || "null");
}

/** 텍스트 제너레이터 → 스트리밍 Response */
export function textStreamResponse(
  gen: AsyncGenerator<string>,
  provider: Provider,
): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const piece of gen) controller.enqueue(encoder.encode(piece));
      } catch (err) {
        controller.enqueue(encoder.encode(ERROR_MARK + describeError(err)));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Eum-Provider": provider,
    },
  });
}

export function describeError(err: unknown): string {
  if (err instanceof Anthropic.APIError || err instanceof OpenAI.APIError) {
    if (err.status === 401) return "API 키가 올바르지 않아요. 환경변수를 확인해 주세요.";
    if (err.status === 429) return "요청이 몰려 잠시 막혔어요. 조금 뒤에 다시 보내 주세요.";
    if (err.status === 404) return "설정된 모델을 찾을 수 없어요. 모델 이름을 확인해 주세요.";
    return `모델 호출이 실패했어요 (${err.status ?? "연결 오류"}).`;
  }
  return "답변을 만드는 중에 문제가 생겼어요. 다시 보내 주세요.";
}
