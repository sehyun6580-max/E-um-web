"use client";

import { useState } from "react";
import { REPLY_LABEL, type ReplyChoice } from "@/lib/letter";

/**
 * 소개 페이지 편지 예시의 답장 고르기.
 * 고르면 편지를 보낸 사람이 받게 될 답장을 보여 줘요. 실제 답장 화면(LetterView의 ReplyRead)과
 * 같은 문구를 써요. 예시 문장은 page.tsx의 편지(서연 → 지민)에 맞춘 거예요.
 */
const REPLIES: { choice: ReplyChoice; label: string; text: string }[] = [
  {
    choice: "talk",
    label: "나도 얘기하고 싶어",
    text: "나도 그 일이 계속 마음에 걸렸어. 이번 주말에 만나서 얘기하자.",
  },
  {
    choice: "time",
    label: "조금 시간이 필요해",
    text: "편지 고마워. 주말까지만 생각해 보고 연락할게.",
  },
  {
    choice: "write",
    label: "답장 쓰기",
    text: "서연아, 편지 고마워. 미리 말하지 못해서 미안해. 다음부터는 일정이 바뀌면 바로 연락할게.",
  },
];

export default function LetterReplyDemo({ letterFont }: { letterFont: string }) {
  const [choice, setChoice] = useState<ReplyChoice>("talk");

  return (
    <>
      <fieldset className="lp-letter-replies">
        <legend>지민의 답장을 골라 보세요</legend>
        <div className="lp-letter-chips">
          {REPLIES.map((r) => (
            <label key={r.choice} className="lp-letter-chip">
              <input
                type="radio"
                name="letter-reply-demo"
                checked={choice === r.choice}
                onChange={() => setChoice(r.choice)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 세 장을 같은 자리에 겹쳐 두고 고른 것만 보여 줘요. 답을 바꿔도 화면 높이가 흔들리지 않아요. */}
      <div className="lp-letter-answers">
        {REPLIES.map((r) => (
          <div key={r.choice} className="lp-letter-answer" data-active={choice === r.choice}>
            <p className="lp-letter-answer-kicker">지민에게서 답장이 왔어요</p>
            <p className="lp-letter-answer-title">{REPLY_LABEL[r.choice]}</p>
            <p className={`lp-letter-answer-text ${letterFont}`}>{r.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}
