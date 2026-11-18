// 베이스라인(컨트롤러 없음) 테스트: run_eval.py와 같은 시나리오를 같은 모델·같은 호출 설정으로,
// 이음 규칙 문서 대신 아주 짧은 프롬프트만 넣고 돌린다. 차이가 컨트롤러에서 왔는지 보기 위한 비교군이다.
//
// 모델 API를 직접 부르기 때문에 .env.local에 ANTHROPIC_API_KEY, OPENAI_API_KEY가 있어야 한다.
// 키는 화면이나 결과 파일에 찍지 않는다. 호출 수만큼 비용이 나간다.
//
// 예) node scripts/eval/run_baseline.mjs --set cross --out docs/eval/2026-11-15_cross_baseline.json
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const here = dirname(fileURLToPath(import.meta.url));

// .env.local을 읽는다 (이미 환경 변수에 있으면 그대로 둔다)
try {
  for (const line of readFileSync(join(here, "../../.env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* .env.local이 없으면 환경 변수만 쓴다 */
}

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const SET = args.set;
const OUT = args.out;
const MODES = args.modes ?? "FT";
const RUNS = Number(args.runs ?? 3);
if (!SET || !OUT) {
  console.error("사용법: node scripts/eval/run_baseline.mjs --set <stress4d|cross|criteria|closing> --out <파일> [--modes FT] [--runs 3]");
  process.exit(1);
}
for (const [mode, key] of [["F", "ANTHROPIC_API_KEY"], ["T", "OPENAI_API_KEY"]]) {
  if (MODES.includes(mode) && !process.env[key]) {
    console.error(`${key}가 없어요. .env.local에 넣고 다시 실행해 주세요.`);
    process.exit(1);
  }
}

const SETS = JSON.parse(readFileSync(join(here, "scenarios.json"), "utf8"));
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6-sol";

// 컨트롤러 없음: 역할과 출력 형식만 준다 (이음 답변과 같은 모양으로 비교하려고 태그는 같게 둔다)
const BASELINE_SYSTEM = `너는 연애 상담 챗봇이다. 사용자의 연애 고민을 듣고 도와준다.

# 출력 형식
반드시 아래 세 태그만 순서대로 쓰고, 태그 밖에는 아무것도 쓰지 않는다.
<제목>이번 답변의 핵심을 30자 이내로 요약한 한 줄</제목>
<본문>2~5문장의 간결한 답</본문>
<다른시선>다른 관점에서 던질 질문 한 줄</다른시선>`;

const anthropic = new Anthropic();
const openai = new OpenAI();

// 실제 앱(src/lib/server/llm.ts)과 같은 호출 설정
async function reply(mode, messages) {
  if (mode === "F") {
    const res = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 8000,
      system: BASELINE_SYSTEM,
      messages,
      output_config: { effort: "low" },
    });
    return res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  }
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: "system", content: BASELINE_SYSTEM }, ...messages],
  });
  return res.choices[0]?.message?.content ?? "";
}

const tag = (raw, name) => (raw.match(new RegExp(`<${name}>([\\s\\S]*?)(</${name}>|$)`)) ?? [, ""])[1].trim();

const results = [];
for (const [name, turnsBy] of Object.entries(SETS[SET])) {
  for (const mode of MODES) {
    const turns = Array.isArray(turnsBy) ? turnsBy : turnsBy[mode];
    for (let run = 1; run <= RUNS; run++) {
      const messages = [];
      const log = [];
      for (const [i, user] of turns.entries()) {
        messages.push({ role: "user", content: user });
        const raw = await reply(mode, messages);
        const r = { title: tag(raw, "제목"), body: tag(raw, "본문"), other: tag(raw, "다른시선") };
        log.push({ turn: i + 1, user, ...r });
        messages.push({ role: "assistant", content: `${r.title}\n${r.body}`.trim() });
      }
      results.push({ scenario: name, mode, run, provider: mode === "F" ? "anthropic" : "openai", baseline: true, turns: log });
      console.log(name, mode, run, "done");
      writeFileSync(OUT, JSON.stringify(results, null, 1));
    }
  }
}
console.log("ALL DONE", OUT);
