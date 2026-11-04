"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { ChatMessage, Mode } from "@/lib/types";
import { parseFlip, parseReply } from "@/lib/reply";
import Orb from "./Orb";

const EXAMPLES = [
  { topic: "연락", text: "연락이 뜸해져서 자꾸 마음이 쓰여요" },
  { topic: "기념일", text: "기념일을 잊어버린 애인, 제가 예민한 걸까요?" },
  { topic: "이성 친구", text: "애인이 이성 친구랑 단둘이 여행을 간대요" },
];

const MODE_LABEL: Record<Mode, string> = { F: "감성 공감 모드", T: "팩트 폭격 모드" };
const PLACEHOLDER: Record<Mode, string> = {
  F: "마음에 걸리는 일을 편하게 털어놓아 보세요",
  T: "있었던 일을 있는 그대로 적어 주세요",
};

interface Props {
  titleRef: RefObject<HTMLHeadingElement | null>;
  userName: string;
  messages: ChatMessage[];
  mode: Mode;
  busy: null | "chat" | "flip";
  onMode: (mode: Mode) => void;
  onSend: (text: string) => void;
  onFlip: () => void;
  onReset: () => void;
  onRetry: (id: string) => void;
}

export default function ChatPanel({
  titleRef,
  userName,
  messages,
  mode,
  busy,
  onMode,
  onSend,
  onFlip,
  onReset,
  onRetry,
}: Props) {
  const [input, setInput] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickRef = useRef(true);

  const hasUserTurn = messages.some((m) => m.role === "user");

  useEffect(() => {
    const el = logRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!confirmReset) return;
    const t = setTimeout(() => setConfirmReset(false), 3000);
    return () => clearTimeout(t);
  }, [confirmReset]);

  function onScroll() {
    const el = logRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  function autoSize() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  function submit() {
    if (!input.trim() || busy) return;
    stickRef.current = true;
    onSend(input);
    setInput("");
    requestAnimationFrame(autoSize);
  }

  function pickExample(text: string) {
    setInput(text);
    requestAnimationFrame(() => {
      autoSize();
      inputRef.current?.focus();
    });
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    onReset();
  }

  return (
    <section className="card card--eum" data-mode={mode} aria-labelledby="eum-title">
      <header className="card-head">
        <h1 id="eum-title" ref={titleRef} className="eum-title">
          이음 <span className="eum-title-en">E-um</span>
        </h1>
        <p className="card-sub">정답 대신, 당신의 기준을 함께 찾아요</p>
      </header>

      <div
        className="chat-log"
        ref={logRef}
        onScroll={onScroll}
        aria-live="polite"
        aria-label="대화 내용"
      >
        {messages.length === 0 ? (
          <div className="empty">
            <Orb mode={mode} size={64} />
            <p className="empty-hello">안녕하세요, {userName}님</p>
            <p className="empty-ask">오늘은 어떤 마음이 쓰이나요?</p>
            <ul className="examples">
              {EXAMPLES.map((ex) => (
                <li key={ex.text}>
                  <button type="button" className="example" onClick={() => pickExample(ex.text)}>
                    <span className="example-topic">{ex.topic}</span>
                    <span className="example-text">{ex.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="thread">
            {messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              if (m.role === "user") {
                return (
                  <p key={m.id} className="msg-user">
                    {m.content}
                  </p>
                );
              }
              if (m.kind === "flip") {
                return (
                  <FlipCard
                    key={m.id}
                    msg={m}
                    streaming={isLast && busy === "flip"}
                    canRetry={isLast && !busy}
                    onRetry={() => onRetry(m.id)}
                  />
                );
              }
              return (
                <BotReply
                  key={m.id}
                  msg={m}
                  streaming={isLast && busy === "chat"}
                  canRetry={isLast && !busy}
                  onRetry={() => onRetry(m.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="sr-only" htmlFor="eum-input">
          고민 입력
        </label>
        <textarea
          id="eum-input"
          ref={inputRef}
          className="composer-input"
          rows={1}
          placeholder={PLACEHOLDER[mode]}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoSize();
          }}
          onKeyDown={(e) => {
            const composing = e.nativeEvent.isComposing || e.keyCode === 229;
            if (e.key === "Enter" && !e.shiftKey && !composing) {
              e.preventDefault();
              submit();
            }
          }}
          maxLength={2000}
        />
        <div className="composer-row">
          <div className="mode-toggle" role="group" aria-label="대화 모드">
            {(["F", "T"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                className="mode-btn"
                data-mode={m}
                aria-pressed={mode === m}
                onClick={() => onMode(m)}
              >
                <span className="mode-dot" aria-hidden />
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="send"
            aria-label="보내기"
            disabled={!input.trim() || Boolean(busy)}
          >
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden>
              <path
                d="M10 15.5V4.5M10 4.5L5 9.5M10 4.5l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="composer-foot">
          <button
            type="button"
            className="link-btn"
            onClick={onFlip}
            disabled={!hasUserTurn || Boolean(busy)}
            title={hasUserTurn ? undefined : "고민을 한 번 이상 이야기한 뒤에 쓸 수 있어요"}
          >
            🔄 상대방 입장으로 뒤집어보기
          </button>
          <button
            type="button"
            className={`btn btn-outline btn-sm${confirmReset ? " is-confirm" : ""}`}
            onClick={handleReset}
            disabled={messages.length === 0 || Boolean(busy)}
          >
            {confirmReset ? "한 번 더 누르면 지워져요" : "대화 초기화"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Typing() {
  return (
    <span className="typing" aria-label="답변을 쓰는 중">
      <i />
      <i />
      <i />
    </span>
  );
}

function ErrorRow({
  message,
  canRetry,
  onRetry,
}: {
  message: string;
  canRetry: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="error-row" role="alert">
      <span>{message}</span>
      {canRetry && (
        <button type="button" className="link-btn" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}

function BotReply({
  msg,
  streaming,
  canRetry,
  onRetry,
}: {
  msg: ChatMessage;
  streaming: boolean;
  canRetry: boolean;
  onRetry: () => void;
}) {
  const mode = msg.mode ?? "F";
  const other: Mode = mode === "F" ? "T" : "F";
  const { title, body, other: otherQuestion } = parseReply(msg.content);
  const empty = !title && !body;

  return (
    <article className="msg-bot" data-mode={mode}>
      <span className="bot-avatar" aria-label={`${mode}봇`}>
        {mode}봇
      </span>
      <div className="bot-content">
        {title && <h3 className="reply-title">{title}</h3>}
        {body && <p className="reply-body">{body}</p>}
        {empty && !msg.error && <Typing />}
        {otherQuestion && !streaming && (
          <details className="other" data-mode={other}>
            <summary>🔍 다른 모드의 시선 보기</summary>
            <p>
              <span className="other-who">{other}봇이라면</span>
              {otherQuestion}
            </p>
          </details>
        )}
        {msg.error && <ErrorRow message={msg.error} canRetry={canRetry} onRetry={onRetry} />}
      </div>
    </article>
  );
}

function FlipCard({
  msg,
  streaming,
  canRetry,
  onRetry,
}: {
  msg: ChatMessage;
  streaming: boolean;
  canRetry: boolean;
  onRetry: () => void;
}) {
  const { title, story, check } = parseFlip(msg.content);
  const empty = !title && !story;
  return (
    <article className="flip" aria-label="상대방 입장으로 뒤집어본 글">
      <p className="flip-head">🔄 상대방 입장으로 뒤집어보기</p>
      {title && <h3 className="reply-title">{title}</h3>}
      {story && <blockquote className="flip-story">{story}</blockquote>}
      {check && !streaming && <p className="flip-check">{check}</p>}
      {empty && !msg.error && <Typing />}
      {msg.error && <ErrorRow message={msg.error} canRetry={canRetry} onRetry={onRetry} />}
    </article>
  );
}
