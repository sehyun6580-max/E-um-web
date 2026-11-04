"use client";

import { useState } from "react";
import type { ApiMessage, Draft, LetterDraft } from "@/lib/types";
import { LETTER_MAX, NAME_MAX, letterLink } from "@/lib/letter";
import Sheet from "./Sheet";
import LinkBox from "./LinkBox";
import SafetyCard from "./SafetyCard";

interface Props {
  open: boolean;
  onClose: () => void;
  fromName: string;
  letter: LetterDraft;
  onLetter: (patch: Partial<LetterDraft>) => void;
  messages: ApiMessage[];
  memo: Draft;
  busy: boolean;
}

export default function LetterSheet({
  open,
  onClose,
  fromName,
  letter,
  onLetter,
  messages,
  memo,
  busy,
}: Props) {
  const [from, setFrom] = useState(fromName);
  const [drafting, setDrafting] = useState(false);
  const [notice, setNotice] = useState("");
  const [safety, setSafety] = useState("");
  const [link, setLink] = useState("");

  const canDraft = messages.length > 0 && !busy;

  async function draftWithEum() {
    setDrafting(true);
    setNotice("");
    setSafety("");
    setLink("");
    try {
      const res = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, draft: memo, to: letter.to }),
      });
      const json = (await res.json()) as {
        blocked?: boolean;
        letter?: string;
        reason?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "초안을 만들지 못했어요.");
      if (json.blocked) {
        setSafety(json.reason || "대화에 안전이 걱정되는 이야기가 있어서, 지금은 편지보다 안전을 먼저 챙기면 좋겠어요.");
        return;
      }
      if (!json.letter) throw new Error("아직 편지로 옮길 내용이 적어요. 조금 더 이야기해 보세요.");
      onLetter({ text: json.letter.slice(0, LETTER_MAX) });
      setNotice("초안을 썼어요. 내 말투로 고친 뒤 링크를 만들어 보세요.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "초안을 만들지 못했어요.");
    } finally {
      setDrafting(false);
    }
  }

  async function makeLink() {
    const text = letter.text.trim();
    if (!text) return;
    setLink(
      await letterLink({
        kind: "letter",
        from: from.trim().slice(0, NAME_MAX),
        to: letter.to.trim().slice(0, NAME_MAX),
        text,
        at: Date.now(),
      }),
    );
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="화해 편지 쓰기"
      sub="오늘 정리한 마음을 상대에게 전해요. 보내기 전에 꼭 내 말로 고쳐 주세요."
    >
      <div className="lt-names">
        <label className="field">
          <span className="field-label">받는 사람</span>
          <input
            className="input"
            value={letter.to}
            maxLength={NAME_MAX}
            placeholder="예: 지민아, 여보"
            onChange={(e) => {
              onLetter({ to: e.target.value });
              setLink("");
            }}
          />
        </label>
        <label className="field">
          <span className="field-label">보내는 사람</span>
          <input
            className="input"
            value={from}
            maxLength={NAME_MAX}
            onChange={(e) => {
              setFrom(e.target.value);
              setLink("");
            }}
          />
        </label>
      </div>

      <div className="lt-ai">
        <button
          type="button"
          className="btn btn-outline"
          onClick={draftWithEum}
          disabled={!canDraft || drafting}
          title={canDraft ? undefined : "이음과 대화를 나눈 뒤에 쓸 수 있어요"}
        >
          {drafting ? "대화를 읽는 중…" : letter.text.trim() ? "이음과 다시 쓰기" : "오늘 대화로 초안 쓰기"}
        </button>
        <p className="lt-hint">
          있었던 일, 내 감정, 바랐던 것, 제안 순서로 상대를 탓하지 않게 써 줘요.
        </p>
      </div>

      {safety && <SafetyCard reason={safety} />}

      <label className="field">
        <span className="field-label">
          편지
          <span className="lt-count">
            {letter.text.length}/{LETTER_MAX}
          </span>
        </span>
        <textarea
          className="input input-area lt-text"
          rows={8}
          maxLength={LETTER_MAX}
          placeholder="직접 써도 되고, 위 버튼으로 초안을 받은 뒤 고쳐도 돼요."
          value={letter.text}
          onChange={(e) => {
            onLetter({ text: e.target.value });
            setLink("");
          }}
        />
      </label>

      <p className="prism-notice" role="status">
        {notice}
      </p>

      {link ? (
        <LinkBox link={link} shareTitle="이음에서 편지가 왔어요" />
      ) : (
        <button
          type="button"
          className="btn btn-dark btn-block"
          onClick={makeLink}
          disabled={!letter.text.trim()}
        >
          💌 편지 링크 만들기
        </button>
      )}
    </Sheet>
  );
}
