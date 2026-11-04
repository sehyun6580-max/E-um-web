/**
 * 상담 캐릭터(페르소나)와 고민 종류.
 * 화면과 서버가 함께 쓴다. 서버는 sanitizePersona로 받은 값을 다시 검사한 뒤 프롬프트에 넣는다.
 */
import type { AgeBand, Gender, Mode, Persona, Relation, Speech, Topic } from "./types";

export const DEFAULT_PERSONA_ID = "eum";
export const MAX_CUSTOM_PERSONAS = 6;
export const MAX_TRAITS = 3;
export const MAX_NAME = 10;

/** 직접 만들기에서 고를 수 있는 성격. 서버는 이 목록에 있는 말만 프롬프트에 넣는다. */
export const TRAITS = [
  "다정한",
  "듬직한",
  "자상한",
  "유쾌한",
  "차분한",
  "직설적인",
  "냉철한",
  "장난스러운",
  "무뚝뚝한",
  "속 깊은",
  "현실적인",
  "수다스러운",
] as const;

export const GENDERS: Gender[] = ["female", "male", "none"];
export const AGES: AgeBand[] = ["20s", "30s", "40s", "50s", "none"];
export const SPEECHES: Speech[] = ["casual", "polite", "auto"];
export const RELATIONS: Relation[] = ["friend", "senior", "sibling", "parent", "counselor"];
export const TOPICS: Topic[] = ["dating", "some", "married"];

export const GENDER_LABEL: Record<Gender, string> = {
  female: "여성",
  male: "남성",
  none: "정하지 않음",
};

export const AGE_LABEL: Record<AgeBand, string> = {
  "20s": "20대",
  "30s": "30대",
  "40s": "40대",
  "50s": "50대 이상",
  none: "정하지 않음",
};

export const SPEECH_LABEL: Record<Speech, string> = {
  casual: "반말",
  polite: "존댓말",
  auto: "내 말투에 맞춤",
};

export const RELATION_LABEL: Record<Relation, string> = {
  friend: "친구",
  senior: "선배",
  sibling: "언니·오빠 같은",
  parent: "부모님 같은",
  counselor: "상담사",
};

export const MODE_SHORT: Record<Mode, string> = { F: "공감", T: "팩폭" };

export const TOPIC_INFO: Record<Topic, { label: string; hint: string }> = {
  dating: { label: "연애", hint: "연인 사이의 고민" },
  some: { label: "썸", hint: "아직 관계가 정해지기 전의 고민" },
  married: { label: "부부", hint: "결혼 생활과 배우자와의 고민" },
};

export const PRESETS: Persona[] = [
  {
    id: "eum",
    name: "이음",
    gender: "none",
    age: "none",
    traits: ["차분한"],
    speech: "auto",
    relation: "counselor",
    mode: "F",
    intro: "기본 상담사예요. 내 말투에 맞춰 차분하게 들어줘요.",
  },
  {
    id: "james",
    name: "제임스",
    gender: "male",
    age: "30s",
    traits: ["듬직한", "자상한", "차분한"],
    speech: "polite",
    relation: "senior",
    mode: "F",
    intro: "듬직하고 자상한 선배예요. 끝까지 들어주고 천천히 정리해 줘요.",
  },
  {
    id: "harin",
    name: "하린",
    gender: "female",
    age: "20s",
    traits: ["다정한", "유쾌한", "수다스러운"],
    speech: "casual",
    relation: "sibling",
    mode: "F",
    intro: "다정한 언니 같은 친구예요. 같이 속상해하다가도 웃게 해 줘요.",
  },
  {
    id: "doyun",
    name: "도윤",
    gender: "male",
    age: "20s",
    traits: ["직설적인", "장난스러운", "현실적인"],
    speech: "casual",
    relation: "friend",
    mode: "T",
    intro: "쿨한 동갑 친구예요. 돌려 말하지 않고 놓친 부분을 짚어 줘요.",
  },
  {
    id: "seojin",
    name: "서진",
    gender: "female",
    age: "30s",
    traits: ["냉철한", "차분한", "현실적인"],
    speech: "polite",
    relation: "senior",
    mode: "T",
    intro: "냉철한 직장 선배예요. 감정과 사실을 깔끔하게 나눠 줘요.",
  },
  {
    id: "dad",
    name: "아빠",
    gender: "male",
    age: "50s",
    traits: ["무뚝뚝한", "속 깊은", "현실적인"],
    speech: "casual",
    relation: "parent",
    mode: "T",
    intro: "말수는 적어도 속 깊은 아빠예요. 짧고 굵게 현실을 짚어 줘요.",
  },
  {
    id: "mom",
    name: "엄마",
    gender: "female",
    age: "50s",
    traits: ["다정한", "속 깊은", "유쾌한"],
    speech: "casual",
    relation: "parent",
    mode: "F",
    intro: "따뜻하지만 할 말은 하는 엄마예요. 마음부터 먼저 챙겨 줘요.",
  },
];

export const DEFAULT_PERSONA = PRESETS[0];

export const isPreset = (id: string) => PRESETS.some((p) => p.id === id);

export function resolvePersona(id: string, customs: Persona[]): Persona {
  return (
    PRESETS.find((p) => p.id === id) ?? customs.find((p) => p.id === id) ?? DEFAULT_PERSONA
  );
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** 프롬프트에 들어가는 이름이라 지시문처럼 쓰일 만한 기호와 줄바꿈을 지운다. */
export function cleanName(value: string): string {
  return value
    .replace(/[<>{}[\]#`"'\\\n\r\t]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME);
}

export function readTopic(value: unknown): Topic {
  return pick(value, TOPICS, "dating");
}

/**
 * 밖에서 들어온 캐릭터 값을 안전한 모양으로 바꾼다.
 * 미리 만든 캐릭터 id면 원본을 돌려줘서 내용을 덮어쓸 수 없게 한다.
 */
export function sanitizePersona(value: unknown): Persona | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  const preset = typeof o.id === "string" ? PRESETS.find((p) => p.id === o.id) : undefined;
  if (preset) return preset;

  const name = typeof o.name === "string" ? cleanName(o.name) : "";
  if (!name) return null;
  const traits = Array.isArray(o.traits)
    ? [...new Set(o.traits)]
        .filter((t): t is string => typeof t === "string" && (TRAITS as readonly string[]).includes(t))
        .slice(0, MAX_TRAITS)
    : [];
  return {
    id:
      typeof o.id === "string" && /^custom:[\w-]{1,40}$/.test(o.id) ? o.id : "custom:unknown",
    name,
    gender: pick(o.gender, GENDERS, "none"),
    age: pick(o.age, AGES, "none"),
    traits,
    speech: pick(o.speech, SPEECHES, "auto"),
    relation: pick(o.relation, RELATIONS, "friend"),
    mode: o.mode === "T" ? "T" : "F",
  };
}

/** "30대 여성 · 공감" 같은 짧은 설명 */
export function personaMeta(p: Persona): string {
  const who = [p.age !== "none" ? AGE_LABEL[p.age] : "", p.gender !== "none" ? GENDER_LABEL[p.gender] : ""]
    .filter(Boolean)
    .join(" ");
  return [who || (p.id === DEFAULT_PERSONA_ID ? "기본" : ""), MODE_SHORT[p.mode]]
    .filter(Boolean)
    .join(" · ");
}

/** 받침이 있으면 true (한글이 아니면 false) */
function hasBatchim(word: string): boolean {
  const ch = word.trim().slice(-1);
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false;
  return code % 28 !== 0;
}

/** 이름 + 이에요/예요, 이야/야 */
export function nameIs(name: string, polite: boolean): string {
  const b = hasBatchim(name);
  return polite ? `${name}${b ? "이에요" : "예요"}` : `${name}${b ? "이야" : "야"}`;
}

/** 빈 화면의 첫인사 */
export function greeting(p: Persona, userName: string): { hello: string; ask: string } {
  if (p.id === DEFAULT_PERSONA_ID) {
    return { hello: `안녕하세요, ${userName}님`, ask: "오늘은 어떤 마음이 쓰이나요?" };
  }
  if (p.id === "dad") return { hello: `${userName}, 왔구나`, ask: "무슨 일 있었니. 아빠한테 얘기해 봐" };
  if (p.id === "mom") return { hello: `우리 ${userName} 왔어?`, ask: "무슨 일 있었어? 엄마한테 다 얘기해 봐" };
  const polite = p.speech !== "casual";
  return polite
    ? { hello: `안녕하세요, ${userName}님. ${nameIs(p.name, true)}`, ask: "오늘은 어떤 마음이 쓰이나요?" }
    : { hello: `안녕, ${userName}! 나 ${nameIs(p.name, false)}`, ask: "오늘은 무슨 일 있었어?" };
}
