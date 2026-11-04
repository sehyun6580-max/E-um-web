export type Mode = "F" | "T";
export type Role = "user" | "assistant";
export type Stage = "explore" | "organize" | "close";

export interface ChatMessage {
  id: string;
  role: Role;
  /** 'flip' = 상대방 입장으로 뒤집어보기 결과. 대화 맥락에는 넣지 않는다. */
  kind?: "reply" | "flip";
  mode?: Mode;
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

export interface UserData {
  messages: ChatMessage[];
  mode: Mode;
  notes: Note[];
  draft: Draft;
}

/** 서버로 보내는 대화 한 줄 */
export interface ApiMessage {
  role: Role;
  content: string;
}
