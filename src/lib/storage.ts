/**
 * 데모용 로그인·저장소.
 * 계정과 기록은 이 브라우저(localStorage)에만 저장된다. 기기를 바꾸면 보이지 않는다.
 * 실제 서비스로 옮길 때는 서버 DB(예: Supabase, Vercel Postgres)로 바꾼다.
 */
import type { UserData } from "./types";

export interface Account {
  id: string;
  name: string;
  salt: string;
  hash: string;
  createdAt: number;
}

const ACCOUNTS_KEY = "eum:accounts";
const SESSION_KEY = "eum:session";
const dataKey = (id: string) => `eum:data:${id}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* 저장소를 못 쓰는 환경이면 무시 */
  }
}

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const normalizeId = (name: string) => name.trim().toLowerCase();

export type LoginResult =
  | { ok: true; account: Account; created: boolean }
  | { ok: false; error: string; nameTaken?: boolean };

/**
 * 이름과 비밀번호가 둘 다 맞는 계정으로 들어간다.
 * 같은 이름(동명이인)이 이미 있는데 비밀번호가 다르면, 바로 만들지 않고 nameTaken으로 알린다.
 * 사용자가 확인하면 createNew로 다시 불러 같은 이름의 새 공간을 만든다.
 */
export async function login(
  name: string,
  password: string,
  { createNew = false }: { createNew?: boolean } = {},
): Promise<LoginResult> {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: "이름은 두 글자 이상 적어 주세요." };
  if (password.length < 4) return { ok: false, error: "비밀번호는 네 글자 이상이어야 해요." };

  const base = normalizeId(trimmed);
  const accounts = read<Record<string, Account>>(ACCOUNTS_KEY, {});
  const sameName = Object.values(accounts).filter((a) => normalizeId(a.name) === base);

  for (const existing of sameName) {
    if ((await sha256(existing.salt + password)) === existing.hash) {
      write(SESSION_KEY, existing.id);
      return { ok: true, account: existing, created: false };
    }
  }

  if (sameName.length > 0 && !createNew) {
    return {
      ok: false,
      nameTaken: true,
      error: "이 이름으로 만든 공간이 이미 있는데, 비밀번호가 맞지 않아요. 내 공간이라면 처음 만든 비밀번호를 적어 주세요.",
    };
  }

  // 처음 쓰는 이름은 예전처럼 이름 그대로를 id로 쓰고, 동명이인은 뒤에 짧은 꼬리표를 붙인다.
  let id = base;
  while (accounts[id]) id = `${base}#${crypto.randomUUID().slice(0, 8)}`;

  const salt = crypto.randomUUID();
  const account: Account = {
    id,
    name: trimmed,
    salt,
    hash: await sha256(salt + password),
    createdAt: Date.now(),
  };
  accounts[id] = account;
  if (!write(ACCOUNTS_KEY, accounts)) {
    return { ok: false, error: "이 브라우저에서는 저장소를 쓸 수 없어요. 시크릿 창이라면 일반 창으로 열어 주세요." };
  }
  write(SESSION_KEY, id);
  return { ok: true, account, created: true };
}

export function currentAccount(): Account | null {
  const id = read<string | null>(SESSION_KEY, null);
  if (!id) return null;
  return read<Record<string, Account>>(ACCOUNTS_KEY, {})[id] ?? null;
}

export function logout() {
  remove(SESSION_KEY);
}

export const emptyData = (): UserData => ({
  messages: [],
  mode: "F",
  notes: [],
  draft: { topic: "", criterion: "", conclusion: "" },
});

export function loadData(id: string): UserData {
  const saved = read<Partial<UserData> | null>(dataKey(id), null);
  if (!saved) return emptyData();
  const base = emptyData();
  return {
    messages: Array.isArray(saved.messages) ? saved.messages : base.messages,
    mode: saved.mode === "T" ? "T" : "F",
    notes: Array.isArray(saved.notes) ? saved.notes : base.notes,
    draft: { ...base.draft, ...(saved.draft ?? {}) },
  };
}

export function saveData(id: string, data: UserData) {
  write(dataKey(id), data);
}
