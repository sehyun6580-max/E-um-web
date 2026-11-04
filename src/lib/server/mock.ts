/**
 * API 키가 없을 때 쓰는 데모 응답.
 * 실제 모델처럼 글자가 조금씩 나오게 해서 화면 흐름을 확인할 수 있게 한다.
 */
import type { ApiMessage, Mode, Stage } from "../types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function* typeOut(text: string): AsyncGenerator<string> {
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i += 3) {
    yield chars.slice(i, i + 3).join("");
    await sleep(18);
  }
}

const CRISIS = /죽고\s*싶|자살|자해|사라지고\s*싶|살기\s*싫|목숨/;
const CLOSING = /그래야겠|얘기해\s*볼|말해\s*볼|고마워|고맙|감사|ㅇㅇ\s*$/;

function isPolite(text: string): boolean {
  return /(요|니다|세요|까요)[.?!~\s]*$/.test(text.trim());
}

function tagged(title: string, body: string, other: string) {
  return `<제목>${title}</제목>\n<본문>${body}</본문>\n<다른시선>${other}</다른시선>`;
}

type Variant = { polite: [string, string, string]; casual: [string, string, string] };

const REPLIES: Record<Mode, Record<Stage, Variant>> = {
  F: {
    explore: {
      polite: [
        "마음이 쓰이는 지점부터 살펴보기",
        "그 일이 계속 마음에 남아 있다는 것만으로도 지금 많이 지쳐 있다는 게 느껴져요. 서운함은 대개 '이 정도는 챙겨주길 바랐다'는 기대가 어긋날 때 생기더라고요. 지금 가장 크게 남아 있는 감정이 서운함인지, 불안함인지부터 같이 나눠볼까요?",
        "같은 일을 상대가 아니라 내가 했다면, 나는 그걸 어떻게 설명했을까요?",
      ],
      casual: [
        "마음이 쓰이는 지점부터 살펴보기",
        "그 일이 계속 마음에 남아 있다는 것만으로도 지금 꽤 지쳐 있는 게 느껴져. 서운함은 보통 '이 정도는 챙겨주길 바랐다'는 기대가 어긋날 때 생기더라. 지금 제일 크게 남은 감정이 서운함인지, 불안함인지부터 같이 나눠볼래?",
        "같은 일을 상대가 아니라 내가 했다면, 나는 그걸 어떻게 설명했을까?",
      ],
    },
    organize: {
      polite: [
        "서운함 뒤에 숨은 바람 살펴보기",
        "이야기를 들어보면 연락 횟수 자체보다, 내가 상대의 우선순위 안에 있는지 확인받고 싶은 마음이 더 커 보여요. 그 바람이 채워지는 방식은 사람마다 달라서, 나에게 그게 어떤 모습인지 아는 게 중요해요. 어떤 순간에 '아, 나를 생각하고 있구나' 하고 느끼셨는지 떠올려 보시겠어요?",
        "상대도 같은 기준을 나에게 적용한다면, 나는 그 기준을 지키고 있었을까요?",
      ],
      casual: [
        "서운함 뒤에 숨은 바람 살펴보기",
        "얘기를 들어보면 연락 횟수 자체보다, 내가 상대의 우선순위 안에 있는지 확인받고 싶은 마음이 더 커 보여. 그 바람이 채워지는 방식은 사람마다 달라서, 나한테는 그게 어떤 모습인지 아는 게 중요해. 어떤 순간에 '아, 날 생각하고 있구나' 하고 느꼈는지 떠올려 볼래?",
        "상대도 같은 기준을 나한테 적용한다면, 나는 그 기준을 지키고 있었을까?",
      ],
    },
    close: {
      polite: [
        "오늘 찾은 기준 정리하기",
        "오늘 이야기에서 드러난 건, 바쁜 건 괜찮지만 미리 말해주는 건 나에게 중요하다는 기준이에요. 이 기준은 상대를 평가하는 잣대이기 전에 나를 설명해 주는 말이기도 해요. 오른쪽 '기억과 기준의 방'에 내 말로 포스트잇을 남겨 보세요.",
        "이 기준을 상대에게 전한다면, 어떤 상황을 예로 들면 가장 정확할까요?",
      ],
      casual: [
        "오늘 찾은 기준 정리하기",
        "오늘 얘기에서 드러난 건, 바쁜 건 괜찮지만 미리 말해주는 건 나한테 중요하다는 기준이야. 이 기준은 상대를 평가하는 잣대이기 전에 나를 설명해 주는 말이기도 해. 오른쪽 '기억과 기준의 방'에 내 말로 포스트잇을 남겨 봐.",
        "이 기준을 상대한테 전한다면, 어떤 상황을 예로 들면 가장 정확할까?",
      ],
    },
  },
  T: {
    explore: {
      polite: [
        "판단 전에 빠진 사실 하나",
        "속상한 상황인 건 맞아요. 다만 지금 이야기에는 상대가 그때 어떤 상황이었는지가 빠져 있어서, 이대로면 내 해석이 사실처럼 굳어질 수 있어요. 상대에게 그 일에 대해 직접 들어본 설명이 있었나요?",
        "그 일이 있었을 때, 내 마음속에서 가장 먼저 올라온 감정은 무엇이었나요?",
      ],
      casual: [
        "판단 전에 빠진 사실 하나",
        "속상한 상황인 건 맞아. 다만 지금 얘기에는 상대가 그때 어떤 상황이었는지가 빠져 있어서, 이대로면 내 해석이 사실처럼 굳어질 수 있어. 상대한테 그 일에 대해 직접 들어본 설명이 있었어?",
        "그 일이 있었을 때, 내 마음속에서 제일 먼저 올라온 감정은 뭐였어?",
      ],
    },
    organize: {
      polite: [
        "문제의 핵심은 횟수보다 예고",
        "정리해 보면 불만은 '연락이 적다'가 아니라 '바뀐다는 걸 미리 몰랐다'에 가까워요. 그렇다면 같은 기준을 나에게도 적용해 볼 수 있어요. 내가 바빴던 주에 상대에게 미리 알린 적이 있었는지 떠올려 보면, 이 기준이 공정한지 확인할 수 있어요.",
        "그 기준이 지켜지지 않았을 때, 나는 어떤 마음이 되는 사람인가요?",
      ],
      casual: [
        "문제의 핵심은 횟수보다 예고",
        "정리해 보면 불만은 '연락이 적다'가 아니라 '바뀐다는 걸 미리 몰랐다'에 가까워. 그럼 같은 기준을 나한테도 적용해 볼 수 있어. 내가 바빴던 주에 상대한테 미리 알린 적이 있었는지 떠올려 보면, 이 기준이 공정한지 확인할 수 있어.",
        "그 기준이 안 지켜졌을 때, 나는 어떤 마음이 되는 사람이야?",
      ],
    },
    close: {
      polite: [
        "같은 잣대로 남는 기준 하나",
        "오늘 확인한 건 '바쁜 건 괜찮지만, 미리 말해주는 건 중요하다'는 기준이고, 이건 나에게도 똑같이 적용돼요. 이 기준으로 관계를 어떻게 할지는 직접 정하시면 돼요. 오른쪽 '기억과 기준의 방'에 내 말로 남겨 두세요.",
        "이 기준을 떠올리면, 지금 마음은 어느 쪽으로 기울어 있나요?",
      ],
      casual: [
        "같은 잣대로 남는 기준 하나",
        "오늘 확인한 건 '바쁜 건 괜찮지만, 미리 말해주는 건 중요하다'는 기준이고, 이건 나한테도 똑같이 적용돼. 이 기준으로 관계를 어떻게 할지는 네가 정하면 돼. 오른쪽 '기억과 기준의 방'에 내 말로 남겨 둬.",
        "이 기준을 떠올리면, 지금 마음은 어느 쪽으로 기울어 있어?",
      ],
    },
  },
};

export function mockChat(mode: Mode, stage: Stage, messages: ApiMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const polite = isPolite(last);

  if (CRISIS.test(last)) {
    return tagged(
      polite ? "지금은 당신의 안전이 먼저예요" : "지금은 네 안전이 먼저야",
      polite
        ? "그런 마음이 들 만큼 많이 힘드셨군요. 지금 이 고민은 잠시 내려놓고, 자살예방상담전화 109에 연락해 보세요. 24시간 언제든 무료로 이야기를 들어줘요. 당장 위험하다고 느껴지면 112나 119에 바로 연락해 주세요."
        : "그런 마음이 들 만큼 많이 힘들었구나. 지금 이 고민은 잠깐 내려놓고, 자살예방상담전화 109에 연락해 봐. 24시간 언제든 무료로 이야기를 들어줘. 당장 위험하다고 느껴지면 112나 119에 바로 연락해 줘.",
      "",
    );
  }

  const effectiveStage: Stage = CLOSING.test(last) ? "close" : stage;
  const [title, body, other] = REPLIES[mode][effectiveStage][polite ? "polite" : "casual"];
  return tagged(title, body, other);
}

export function mockFlip(messages: ApiMessage[]): string {
  const first = messages.find((m) => m.role === "user")?.content ?? "";
  const polite = isPolite(first);
  return [
    "<제목>상대의 자리에서 같은 장면 보기</제목>",
    "<본문>나는 요즘 예전만큼 연락을 자주 하지 못했다. 그 사이에 연인이 마음을 쓰고 있었다는 건 오늘 대화에서 처음 전해 들었다. 나는 바쁘다는 이유로 미리 말하지 않았고, 그게 어떻게 보였을지는 따로 생각해 보지 않았다.</본문>",
    polite
      ? "<점검>'미리 말해주는 게 중요하다'는 기준을 이 시점에도 그대로 대 보면, 상대에게도 같은 기대를 전한 적이 있었는지가 다음 질문이 돼요. (데모 응답이에요. API 키를 연결하면 실제 대화 내용으로 바뀌어요.)</점검>"
      : "<점검>'미리 말해주는 게 중요하다'는 기준을 이 시점에도 그대로 대 보면, 상대한테도 같은 기대를 전한 적이 있었는지가 다음 질문이 돼. (데모 응답이야. API 키를 연결하면 실제 대화 내용으로 바뀌어.)</점검>",
  ].join("\n");
}

export function mockDraft(messages: ApiMessage[]): { topic: string; criterion: string } {
  const users = messages.filter((m) => m.role === "user").map((m) => m.content.trim());
  if (users.length === 0) return { topic: "", criterion: "" };
  const first = users[0].replace(/\s+/g, " ");
  const topic = first.length > 28 ? first.slice(0, 27) + "…" : first;
  const criterionSource = [...users]
    .reverse()
    .find((u) => /중요|괜찮|싫|좋|바라|원해|필요/.test(u));
  const criterion =
    users.length >= 2 && criterionSource
      ? criterionSource.length > 40
        ? criterionSource.slice(0, 39) + "…"
        : criterionSource
      : "";
  return { topic, criterion };
}
