"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LETTER_MAX,
  NAME_MAX,
  REPLY_LABEL,
  decodePayload,
  letterLink,
  quoteOf,
  type LetterPayload,
  type Payload,
  type ReplyChoice,
  type ReplyPayload,
} from "@/lib/letter";
import LinkBox from "./LinkBox";
import Logo from "./Logo";

type Status = "loading" | "invalid" | "ready";

const dateText = (at: number) =>
  new Date(at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

export default function LetterView({ letterFont }: { letterFont: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const p = await decodePayload(window.location.hash);
      if (!alive) return;
      setPayload(p);
      setStatus(p ? "ready" : "invalid");
    }
    void load();
    window.addEventListener("hashchange", load);
    return () => {
      alive = false;
      window.removeEventListener("hashchange", load);
    };
  }, []);

  return (
    <main className="lv">
      <header className="lv-top">
        <Link href="/" className="lv-brand">
          <Logo size={24} />
          이음
        </Link>
      </header>

      <div className="lv-wrap">
        {status === "loading" && <p className="lv-loading">편지를 여는 중…</p>}
        {status === "invalid" && (
          <section className="lv-empty">
            <h1>편지를 열 수 없어요</h1>
            <p>링크가 중간에 잘렸을 수 있어요. 보낸 사람에게 링크를 통째로 다시 받아 주세요.</p>
            <Link className="btn btn-dark" href="/">
              이음 둘러보기
            </Link>
          </section>
        )}
        {status === "ready" && payload?.kind === "letter" && (
          <LetterRead letter={payload} letterFont={letterFont} />
        )}
        {status === "ready" && payload?.kind === "reply" && (
          <ReplyRead reply={payload} letterFont={letterFont} />
        )}
      </div>

      {status !== "loading" && (
        <footer className="lv-foot">
          <p>
            이음은 정답 대신 내 기준을 찾도록 돕는 연애 상담 챗봇이에요.
            <br />
            이 편지는 링크 안에만 담겨 있고, 이음 서버에는 저장되지 않아요.
          </p>
          <div className="lv-foot-actions">
            <Link className="btn btn-dark" href="/chat">
              나도 이음과 마음 정리하기
            </Link>
            <Link className="btn btn-outline" href="/">
              이음 알아보기
            </Link>
          </div>
          <Link className="lv-privacy" href="/privacy">
            개인정보처리방침
          </Link>
        </footer>
      )}
    </main>
  );
}

function LetterRead({ letter, letterFont }: { letter: LetterPayload; letterFont: string }) {
  const [opened, setOpened] = useState(false);
  const from = letter.from || "보낸 사람";

  if (!opened) {
    return (
      <section className="lv-envelope-wrap" aria-label="도착한 편지">
        <p className="lv-kicker">{from}에게서 편지가 왔어요</p>
        <button
          type="button"
          className="lv-envelope"
          onClick={() => setOpened(true)}
          aria-label={`편지 열기. To. ${letter.to || "당신"}`}
        >
          <span className="lv-flap" aria-hidden />
          <span className={`lv-env-to ${letterFont}`}>To. {letter.to || "당신"}</span>
          <span className="lv-seal" aria-hidden>
            <svg viewBox="-8 -8 16 14" width="22" height="20">
              <path d="M0 5.2C-1.2 4-7 0.3-7-3.4c0-2.3 1.7-4 3.8-4 1.4 0 2.6.8 3.2 1.9.6-1.1 1.8-1.9 3.2-1.9 2.1 0 3.8 1.7 3.8 4C7 .3 1.2 4 0 5.2z" />
            </svg>
          </span>
        </button>
        <p className="lv-open-hint">봉투를 누르면 편지가 열려요</p>
      </section>
    );
  }

  return (
    <>
      <article className={`lv-paper ${letterFont}`}>
        {letter.to && <p className="lv-to">To. {letter.to}</p>}
        <p className="lv-body">{letter.text}</p>
        <p className="lv-from">
          From. {from}
          <time dateTime={new Date(letter.at).toISOString()}>{dateText(letter.at)}</time>
        </p>
      </article>
      <ReplyBox letter={letter} />
    </>
  );
}

const CHOICES: { choice: ReplyChoice; label: string; desc: string }[] = [
  { choice: "talk", label: "나도 얘기하고 싶어", desc: "만나서, 혹은 통화로 이야기를 이어가요" },
  { choice: "time", label: "조금 시간이 필요해", desc: "마음을 정리할 시간이 필요하다고 알려요" },
  { choice: "write", label: "답장 쓰기", desc: "하고 싶은 말을 글로 전해요" },
];

function ReplyBox({ letter }: { letter: LetterPayload }) {
  const [choice, setChoice] = useState<ReplyChoice | null>(null);
  const [text, setText] = useState("");
  const [me, setMe] = useState(letter.to);
  const [link, setLink] = useState("");
  const sender = letter.from || "보낸 사람";
  const ready = choice !== null && (choice !== "write" || text.trim().length > 0);

  async function make() {
    if (!ready || !choice) return;
    setLink(
      await letterLink({
        kind: "reply",
        from: me.trim().slice(0, NAME_MAX),
        to: letter.from,
        choice,
        text: text.trim(),
        quote: quoteOf(letter.text),
        at: Date.now(),
      }),
    );
  }

  return (
    <section className="lv-reply" aria-labelledby="reply-title">
      <h2 id="reply-title" className="lv-reply-title">
        {sender}에게 답하기
      </h2>
      <p className="lv-reply-sub">버튼 하나로도 충분해요. 답장은 링크로 만들어 직접 보내요.</p>

      <fieldset className="lv-choices">
        <legend className="sr-only">답장 종류</legend>
        {CHOICES.map((c) => (
          <label key={c.choice} className="lv-choice">
            <input
              type="radio"
              name="reply-choice"
              checked={choice === c.choice}
              onChange={() => {
                setChoice(c.choice);
                setLink("");
              }}
            />
            <span className="lv-choice-label">{c.label}</span>
            <span className="lv-choice-desc">{c.desc}</span>
          </label>
        ))}
      </fieldset>

      {choice && (
        <div className="lv-reply-form">
          <label className="field">
            <span className="field-label">
              {choice === "write" ? "답장" : "덧붙이고 싶은 말 (선택)"}
            </span>
            <textarea
              className="input input-area"
              rows={choice === "write" ? 6 : 3}
              maxLength={LETTER_MAX}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setLink("");
              }}
              placeholder={
                choice === "time" ? "예: 주말까지만 생각해 보고 연락할게" : "하고 싶은 말을 적어 주세요"
              }
            />
          </label>
          <label className="field">
            <span className="field-label">내 이름 (선택)</span>
            <input
              className="input"
              value={me}
              maxLength={NAME_MAX}
              onChange={(e) => {
                setMe(e.target.value);
                setLink("");
              }}
            />
          </label>
          {link ? (
            <>
              <p className="lv-send-hint">이 링크를 {sender}에게 보내 주세요.</p>
              <LinkBox link={link} shareTitle="이음에서 답장이 왔어요" />
            </>
          ) : (
            <button type="button" className="btn btn-dark btn-block" disabled={!ready} onClick={make}>
              답장 링크 만들기
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function ReplyRead({ reply, letterFont }: { reply: ReplyPayload; letterFont: string }) {
  const from = reply.from || "상대";
  return (
    <article className="lv-paper lv-paper--reply">
      <p className="lv-kicker">{from}에게서 답장이 왔어요</p>
      <p className="lv-answer" data-choice={reply.choice}>
        {REPLY_LABEL[reply.choice]}
      </p>
      {reply.text && <p className={`lv-body ${letterFont}`}>{reply.text}</p>}
      {reply.quote && <p className="lv-quote">내가 보낸 편지: “{reply.quote}”</p>}
      <p className="lv-from">
        From. {from}
        <time dateTime={new Date(reply.at).toISOString()}>{dateText(reply.at)}</time>
      </p>
    </article>
  );
}
