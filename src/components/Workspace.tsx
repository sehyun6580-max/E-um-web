"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Account } from "@/lib/storage";
import { loadData, saveData } from "@/lib/storage";
import type { ChatMessage, Mode, Note, NoteField, UserData } from "@/lib/types";
import { ERROR_MARK, REFUSAL_MARK, countUserTurns, toApiMessages } from "@/lib/reply";
import ChatPanel from "./ChatPanel";
import PrismPanel from "./PrismPanel";
import LoveLetter, { LetterDrop } from "./LoveLetter";
import Orb from "./Orb";

const uid = () => crypto.randomUUID();

const REFUSAL_REPLY =
  "<제목>이 이야기는 여기서 이어가기 어려워요</제목>\n<본문>방금 내용은 이음이 답하기 어려운 주제로 분류됐어요. 표현을 조금 바꿔서 다시 들려주시면 이어서 같이 볼게요.</본문>\n<다른시선></다른시선>";

type Busy = null | "chat" | "flip";

export default function Workspace({
  account,
  onLogout,
}: {
  account: Account;
  onLogout: () => void;
}) {
  const [data, setData] = useState<UserData>(() => loadData(account.id));
  const [busy, setBusy] = useState<Busy>(null);
  const [drafting, setDrafting] = useState(false);
  const [prismNotice, setPrismNotice] = useState("");
  const [providers, setProviders] = useState<{ anthropic: boolean; openai: boolean } | null>(
    null,
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const eumTitleRef = useRef<HTMLHeadingElement>(null);
  const prismTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    saveData(account.id, data);
  }, [account.id, data]);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setProviders)
      .catch(() => setProviders(null));
  }, []);

  const patchMessage = (id: string, patch: Partial<ChatMessage>) =>
    setData((d) => ({
      ...d,
      messages: d.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));

  async function runStream(url: string, payload: unknown, msgId: string) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error || "답변을 받지 못했어요. 다시 시도해 주세요.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        patchMessage(msgId, { content: acc.split(ERROR_MARK)[0].replace(REFUSAL_MARK, "") });
      }
      acc += decoder.decode();
      if (acc.includes(ERROR_MARK)) {
        patchMessage(msgId, { error: acc.split(ERROR_MARK)[1] || "답변이 중간에 끊겼어요." });
      } else if (acc.includes(REFUSAL_MARK)) {
        patchMessage(msgId, { content: REFUSAL_REPLY });
      } else if (!acc.trim()) {
        patchMessage(msgId, { error: "빈 답변이 왔어요. 다시 시도해 주세요." });
      }
    } catch (e) {
      patchMessage(msgId, {
        error: e instanceof Error ? e.message : "연결이 끊겼어요. 다시 시도해 주세요.",
      });
    }
  }

  async function askChat(history: ChatMessage[], mode: Mode, botId: string) {
    setBusy("chat");
    await runStream(
      "/api/chat",
      { mode, messages: toApiMessages(history), userTurn: countUserTurns(history) },
      botId,
    );
    setBusy(null);
  }

  async function askFlip(history: ChatMessage[], mode: Mode, flipId: string) {
    setBusy("flip");
    await runStream("/api/flip", { mode, messages: toApiMessages(history) }, flipId);
    setBusy(null);
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const now = Date.now();
    const userMsg: ChatMessage = { id: uid(), role: "user", content, createdAt: now };
    const botMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      kind: "reply",
      mode: data.mode,
      content: "",
      createdAt: now,
    };
    const history = [...data.messages, userMsg];
    setData((d) => ({ ...d, messages: [...d.messages, userMsg, botMsg] }));
    void askChat(history, data.mode, botMsg.id);
  }

  function flip() {
    if (busy || toApiMessages(data.messages).length === 0) return;
    const flipMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      kind: "flip",
      mode: data.mode,
      content: "",
      createdAt: Date.now(),
    };
    const history = data.messages;
    setData((d) => ({ ...d, messages: [...d.messages, flipMsg] }));
    void askFlip(history, data.mode, flipMsg.id);
  }

  function retry(id: string) {
    if (busy) return;
    const idx = data.messages.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const target = data.messages[idx];
    const history = data.messages.slice(0, idx);
    const fresh: ChatMessage = {
      ...target,
      id: uid(),
      content: "",
      error: undefined,
      createdAt: Date.now(),
    };
    setData((d) => ({ ...d, messages: [...history, fresh] }));
    const mode = target.mode ?? data.mode;
    if (target.kind === "flip") void askFlip(history, mode, fresh.id);
    else void askChat(history, mode, fresh.id);
  }

  function resetChat() {
    if (busy) return;
    setData((d) => ({ ...d, messages: [] }));
  }

  function setMode(mode: Mode) {
    setData((d) => ({ ...d, mode }));
  }

  function setDraftField(field: NoteField, value: string) {
    setData((d) => ({ ...d, draft: { ...d.draft, [field]: value } }));
  }

  async function fillDraft() {
    const messages = toApiMessages(data.messages);
    if (messages.length === 0) {
      setPrismNotice("먼저 왼쪽에서 이음과 이야기를 나눠 주세요.");
      return;
    }
    setDrafting(true);
    setPrismNotice("");
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const json = (await res.json()) as { topic?: string; criterion?: string; error?: string };
      if (!res.ok) throw new Error(json.error || "초안을 만들지 못했어요.");
      const topic = json.topic?.trim() ?? "";
      const criterion = json.criterion?.trim() ?? "";
      setData((d) => ({
        ...d,
        draft: {
          ...d.draft,
          topic: topic || d.draft.topic,
          criterion: criterion || d.draft.criterion,
        },
      }));
      setPrismNotice(
        topic || criterion
          ? criterion
            ? "초안을 채웠어요. 내 말로 고친 뒤 붙여 보세요."
            : "아직 기준은 드러나지 않아 주제만 채웠어요. 내 말로 고친 뒤 붙여 보세요."
          : "아직 대화에서 드러난 내용이 적어요. 조금 더 이야기해 보세요.",
      );
    } catch (e) {
      setPrismNotice(e instanceof Error ? e.message : "초안을 만들지 못했어요.");
    } finally {
      setDrafting(false);
    }
  }

  function attachNotes() {
    const fields: NoteField[] = ["topic", "criterion", "conclusion"];
    const now = Date.now();
    const created: Note[] = fields
      .filter((f) => data.draft[f].trim())
      .map((f) => ({ id: uid(), field: f, text: data.draft[f].trim(), createdAt: now }));
    if (created.length === 0) {
      setPrismNotice("세 칸 중 하나 이상 채워야 붙일 수 있어요.");
      return;
    }
    setData((d) => ({
      ...d,
      notes: [...d.notes, ...created],
      draft: { topic: "", criterion: "", conclusion: "" },
    }));
    setPrismNotice(`포스트잇 ${created.length}장을 붙였어요.`);
  }

  function clearNotes() {
    setData((d) => ({ ...d, notes: [] }));
    setPrismNotice("포스트잇을 모두 뗐어요.");
  }

  const demo = providers !== null && !providers.anthropic && !providers.openai;
  const partial = providers !== null && providers.anthropic !== providers.openai;

  return (
    <div className="app">
      <div className="frame">
        <header className="topbar">
          <Link href="/" className="brand" title="이음 소개 페이지로">
            <Orb mode={data.mode} size={26} />
            <span className="brand-name">이음</span>
          </Link>
          <div className="topbar-right">
            {demo && (
              <span
                className="badge"
                title="API 키가 연결되지 않아 미리 준비한 예시 답변이 나와요."
              >
                예시 답변 모드
              </span>
            )}
            {partial && (
              <span
                className="badge"
                title={
                  providers?.anthropic
                    ? "OpenAI 키가 없어 팩폭 모드도 Claude로 답해요."
                    : "Anthropic 키가 없어 공감 모드도 OpenAI로 답해요."
                }
              >
                한 모델로 운영 중
              </span>
            )}
            <span className="user-chip">
              <span className="user-avatar" aria-hidden>
                {account.name.slice(0, 1)}
              </span>
              <span className="user-name">{account.name}</span>
            </span>
            <button className="btn btn-outline btn-sm" type="button" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </header>

        <div className="stage" ref={stageRef}>
          <ChatPanel
            titleRef={eumTitleRef}
            userName={account.name}
            messages={data.messages}
            mode={data.mode}
            busy={busy}
            onMode={setMode}
            onSend={send}
            onFlip={flip}
            onReset={resetChat}
            onRetry={retry}
          />
          <LetterDrop />
          <PrismPanel
            titleRef={prismTitleRef}
            draft={data.draft}
            notes={data.notes}
            drafting={drafting}
            canDraft={toApiMessages(data.messages).length > 0 && !busy}
            notice={prismNotice}
            onDraftChange={setDraftField}
            onFillDraft={fillDraft}
            onAttach={attachNotes}
            onClear={clearNotes}
          />
          <LoveLetter stageRef={stageRef} fromRef={eumTitleRef} toRef={prismTitleRef} />
        </div>
      </div>
    </div>
  );
}
