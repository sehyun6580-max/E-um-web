export type Mode = "F" | "T";
export type Role = "user" | "assistant";
export type Stage = "explore" | "organize" | "close";

export interface ChatMessage {
  id: string;
  role: Role;
  /** 'flip' = 상대방 입장으로 뒤집어보기 결과. 대화 맥락에는 넣지 않는다. */
  kind?: "reply" | "flip";
  mode?: Mode;
  /** 이 답변을 한 캐릭터. 캐릭터를 지워도 이름은 남도록 함께 저장한다. */
  personaId?: string;
  personaName?: string;
  content: string;
  createdAt: number;
  error?: string;
}

export type NoteField = "topic" | "criterion" | "conclusion";

export interface Note {
  id: string;
  field: NoteField;
  text: string;
  createdAt: number;
}

export interface Draft {
  topic: string;
  criterion: string;
  conclusion: string;
}

/** 고민 종류: 연애 / 썸 / 부부 */
export type Topic = "dating" | "some" | "married";

export type Gender = "male" | "female" | "none";
export type AgeBand = "20s" | "30s" | "40s" | "50s" | "none";
/** auto = 사용자 말투에 맞춤 */
export type Speech = "auto" | "casual" | "polite";
export type Relation = "counselor" | "friend" | "senior" | "sibling" | "parent";

/** 상담 캐릭터. 말투와 분위기만 바꾸고, 다섯 원칙과 안전 규칙은 그대로다. */
export interface Persona {
  id: string;
  name: string;
  gender: Gender;
  age: AgeBand;
  traits: string[];
  speech: Speech;
  relation: Relation;
  /** 이 캐릭터를 고를 때의 기본 상담 스타일 */
  mode: Mode;
  /** 미리 만든 캐릭터의 한 줄 소개 */
  intro?: string;
}

/** 화해 편지 작성 중인 내용 (보내기 전까지 저장) */
export interface LetterDraft {
  to: string;
  text: string;
}

export interface UserData {
  messages: ChatMessage[];
  mode: Mode;
  notes: Note[];
  draft: Draft;
  personaId: string;
  customPersonas: Persona[];
  topic: Topic;
  letter: LetterDraft;
}

/** 서버로 보내는 대화 한 줄 */
export interface ApiMessage {
  role: Role;
  content: string;
}
