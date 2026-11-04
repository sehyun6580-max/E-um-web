"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";
import type { Draft, Note, NoteField } from "@/lib/types";

const FIELDS: { field: NoteField; label: string; placeholder: string; short: string }[] = [
  {
    field: "topic",
    label: "어떤 고민에 대한 기록인가요?",
    placeholder: "예: 연락 문제로 자꾸 서운해지는 마음",
    short: "고민",
  },
  {
    field: "criterion",
    label: "오늘 대화로 찾은 나의 핵심 연애 기준은?",
    placeholder: "예: 바쁜 건 괜찮지만, 미리 말해주는 건 중요해",
    short: "기준",
  },
  {
    field: "conclusion",
    label: "최종 생각 정리 포스트잇",
    placeholder: "스스로 내린 결론을 내 말로 적어 보세요",
    short: "결론",
  },
];

const SHORT: Record<NoteField, string> = { topic: "고민", criterion: "기준", conclusion: "결론" };
const TILTS = [-2.2, 1.6, -0.8, 2.4, -1.5, 0.9, -2.8, 1.2];

interface Props {
  titleRef: RefObject<HTMLHeadingElement | null>;
  draft: Draft;
  notes: Note[];
  drafting: boolean;
  canDraft: boolean;
  notice: string;
  onDraftChange: (field: NoteField, value: string) => void;
  onFillDraft: () => void;
  onAttach: () => void;
  onClear: () => void;
}

export default function PrismPanel({
  titleRef,
  draft,
  notes,
  drafting,
  canDraft,
  notice,
  onDraftChange,
  onFillDraft,
  onAttach,
  onClear,
}: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!confirmClear) return;
    const t = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(t);
  }, [confirmClear]);

  const hasDraft = FIELDS.some((f) => draft[f.field].trim());

  return (
    <section className="card card--prism" aria-labelledby="prism-title">
      <header className="card-head">
        <h2 id="prism-title" ref={titleRef} className="prism-title">
          Mind Prism · 기억과 기준의 방
        </h2>
        <p className="card-sub">대화에서 찾은 기준을 내 말로 남겨요</p>
      </header>

      <form
        className="letter"
        onSubmit={(e) => {
          e.preventDefault();
          onAttach();
        }}
      >
        <h3 className="letter-title">오늘 밤, 당신의 속마음 문자</h3>
        {FIELDS.map((f) => (
          <label key={f.field} className="field" data-field={f.field}>
            <span className="field-label">
              <span className="chip" aria-hidden />
              {f.label}
            </span>
            <textarea
              className="input input-area"
              rows={2}
              placeholder={f.placeholder}
              value={draft[f.field]}
              onChange={(e) => onDraftChange(f.field, e.target.value)}
              maxLength={200}
            />
          </label>
        ))}
        <div className="letter-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onFillDraft}
            disabled={drafting || !canDraft}
            title={canDraft ? undefined : "이음과 대화를 나눈 뒤에 쓸 수 있어요"}
          >
            {drafting ? "대화를 읽는 중…" : "오늘 대화로 초안 채우기"}
          </button>
          <button type="submit" className="btn btn-dark" disabled={!hasDraft}>
            📌 포스트잇 붙이기
          </button>
        </div>
        <p className="prism-notice" role="status">
          {notice}
        </p>
      </form>

      <div className="board">
        {notes.length === 0 ? (
          <div className="board-empty">
            <div className="slots" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="slot" />
              ))}
            </div>
            <p>이곳에 당신의 기준이 채워져요</p>
          </div>
        ) : (
          <>
            <ul className="notes" aria-label="붙인 포스트잇">
              {notes.map((n, i) => (
                <li
                  key={n.id}
                  className="note"
                  data-field={n.field}
                  style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
                >
                  <span className="note-label">{SHORT[n.field]}</span>
                  <p className="note-text">{n.text}</p>
                  <time className="note-date" dateTime={new Date(n.createdAt).toISOString()}>
                    {new Date(n.createdAt).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </li>
              ))}
            </ul>
            <div className="board-foot">
              <button
                type="button"
                className={`link-btn${confirmClear ? " is-confirm" : ""}`}
                onClick={() => {
                  if (!confirmClear) {
                    setConfirmClear(true);
                    return;
                  }
                  setConfirmClear(false);
                  onClear();
                }}
              >
                {confirmClear ? "한 번 더 누르면 모두 떼어져요" : "포스트잇 모두 떼기"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
