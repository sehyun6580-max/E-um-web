/**
 * 소개 페이지에 넣는 챗봇 화면 모형.
 * 실제 앱과 같은 클래스(.orb, .msg-user, .bot-avatar …)를 써서 모양이 어긋나지 않게 한다.
 */
import type { ReactNode } from "react";
import type { Mode } from "@/lib/types";
import Orb from "../Orb";

export function PhoneFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="lp-phone" role="img" aria-label={label}>
      <div className="lp-phone-notch" aria-hidden />
      <div className="lp-phone-screen">{children}</div>
    </div>
  );
}

export function MockHeader() {
  return (
    <div className="lp-mock-head">
      <span className="lp-mock-title">
        이음 <span>E-um</span>
      </span>
    </div>
  );
}

export function MockUser({ children }: { children: ReactNode }) {
  return <p className="msg-user">{children}</p>;
}

export function MockReply({
  mode,
  title,
  body,
  other,
  open = false,
}: {
  mode: Mode;
  title: string;
  body: string;
  other?: string;
  open?: boolean;
}) {
  const otherMode: Mode = mode === "F" ? "T" : "F";
  return (
    <div className="msg-bot" data-mode={mode}>
      <span className="bot-avatar">{mode}봇</span>
      <div className="bot-content">
        <p className="reply-title">{title}</p>
        <p className="reply-body">{body}</p>
        {other && (
          <div className={`other lp-other${open ? " is-open" : ""}`} data-mode={otherMode}>
            <span className="lp-other-summary">🔍 다른 모드의 시선 보기</span>
            {open && (
              <p>
                <span className="other-who">{otherMode}봇이라면</span>
                {other}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function MockComposer({ mode, text }: { mode: Mode; text?: string }) {
  return (
    <div className="lp-mock-composer card--eum" data-mode={mode}>
      <p className={text ? "lp-mock-input" : "lp-mock-input is-empty"}>
        {text ?? "마음에 걸리는 일을 편하게 털어놓아 보세요"}
      </p>
      <div className="lp-mock-row">
        <span className="mode-btn" data-mode="F" aria-pressed={mode === "F"}>
          <span className="mode-dot" />
          공감
        </span>
        <span className="mode-btn" data-mode="T" aria-pressed={mode === "T"}>
          <span className="mode-dot" />
          팩폭
        </span>
        <span className="send lp-mock-send" />
      </div>
    </div>
  );
}

export function MockEmpty({ name = "하늘" }: { name?: string }) {
  return (
    <div className="lp-mock-empty">
      <Orb mode="F" size={52} />
      <p className="empty-hello">안녕하세요, {name}님</p>
      <p className="empty-ask">오늘은 어떤 마음이 쓰이나요?</p>
      <ul className="lp-mock-examples">
        <li>
          <b>연락</b> 연락이 뜸해져서 자꾸 마음이 쓰여요
        </li>
        <li>
          <b>기념일</b> 기념일을 잊어버린 애인, 제가 예민한 걸까요?
        </li>
      </ul>
    </div>
  );
}

export function MockFlip() {
  return (
    <div className="flip lp-flip">
      <p className="flip-head">🔄 상대방 입장으로 뒤집어보기</p>
      <p className="reply-title">상대의 자리에서 같은 장면 보기</p>
      <blockquote className="flip-story">
        나는 요즘 예전만큼 연락을 자주 하지 못했다. 바쁜 주에는 미리 말하지 않고 그냥 지나간
        날도 있었다.
      </blockquote>
      <p className="flip-check">
        &lsquo;미리 말해주는 게 중요하다&rsquo;는 기준을 여기에도 대 보면, 나도 상대에게 그 기대를
        말로 전한 적이 있었는지가 다음 질문이 돼요.
      </p>
    </div>
  );
}

export const NOTE_SAMPLES = [
  {
    field: "topic",
    short: "고민",
    question: "어떤 고민에 대한 기록인가요?",
    text: "연락 문제로 자꾸 서운해지는 마음",
  },
  {
    field: "criterion",
    short: "기준",
    question: "오늘 대화로 찾은 나의 핵심 연애 기준은?",
    text: "바쁜 건 괜찮지만, 미리 말해주는 건 중요해",
  },
  {
    field: "conclusion",
    short: "결론",
    question: "최종 생각 정리 포스트잇",
    text: "이번 주말에 내 기준을 차분하게 말해 볼 거야",
  },
] as const;
