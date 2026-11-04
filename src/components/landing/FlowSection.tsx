"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MockComposer, MockEmpty, MockHeader, MockReply, MockUser, PhoneFrame } from "./Mocks";

interface Step {
  title: string;
  body: string;
  screen: ReactNode;
}

const STEPS: Step[] = [
  {
    title: "편하게 털어놓으세요",
    body: "예시 문장을 눌러도 되고, 생각나는 대로 적어도 돼요. 반말로 쓰면 반말로, 존댓말로 쓰면 존댓말로 답해요.",
    screen: (
      <>
        <MockHeader />
        <div className="lp-mock-body lp-mock-body--center">
          <MockEmpty />
        </div>
        <MockComposer mode="F" text="연락이 뜸해져서 자꾸 마음이 쓰여요" />
      </>
    ),
  },
  {
    title: "감정과 사실을 나눠 봐요",
    body: "처음 한두 마디에서는 지금 드는 감정과 실제로 있었던 일을 구분해요. 판단에 꼭 필요한 게 빠져 있을 때만 하나 물어봐요.",
    screen: (
      <>
        <MockHeader />
        <div className="lp-mock-body">
          <MockUser>연락이 뜸해져서 자꾸 마음이 쓰여요</MockUser>
          <MockReply
            mode="F"
            title="마음이 쓰이는 지점부터 살펴보기"
            body="그 일이 계속 마음에 남아 있다는 것만으로도 꽤 지쳐 있는 게 느껴져요. 지금 가장 크게 남은 감정이 서운함인지, 불안함인지부터 같이 나눠볼까요?"
            other="같은 일을 내가 했다면, 나는 그걸 어떻게 설명했을까요?"
          />
        </div>
        <MockComposer mode="F" />
      </>
    ),
  },
  {
    title: "드러난 기준을 정리해요",
    body: "이야기가 쌓이면 대화 속에서 보인 내 기준과 선택지를 짚어 줘요. 같은 말을 되풀이하거나 이미 한 제안을 또 꺼내지 않아요.",
    screen: (
      <>
        <MockHeader />
        <div className="lp-mock-body">
          <MockUser>바쁜 건 괜찮은데, 미리 말을 안 해주는 게 싫어요</MockUser>
          <MockReply
            mode="F"
            title="서운함 뒤에 숨은 바람 살펴보기"
            body="연락 횟수보다, 내가 상대의 우선순위 안에 있는지 확인받고 싶은 마음이 더 커 보여요. 그 바람이 채워지는 모습이 나에게는 '미리 알려주는 것'인 거죠."
            other="상대도 같은 기준을 나에게 적용한다면, 나는 지키고 있었을까요?"
          />
        </div>
        <MockComposer mode="F" />
      </>
    ),
  },
  {
    title: "질문 없이 짧게 맺어요",
    body: "'그래야겠다', '고마워' 같은 말이 나오면 더 캐묻지 않아요. 찾은 기준을 한두 문장으로 정리하고, 기억과 기준의 방에 남겨 보자고 권해요.",
    screen: (
      <>
        <MockHeader />
        <div className="lp-mock-body">
          <MockUser>그래야겠다. 고마워요</MockUser>
          <MockReply
            mode="F"
            title="오늘 찾은 기준 정리하기"
            body="바쁜 건 괜찮지만, 미리 말해주는 건 나에게 중요하다는 기준이 보였어요. 기억과 기준의 방에 내 말로 포스트잇을 남겨 보세요."
          />
        </div>
        <MockComposer mode="F" />
      </>
    ),
  },
];

export default function FlowSection() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of stepRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="lp-dark" id="flow" aria-labelledby="flow-title">
      <div className="lp-wrap">
        <header className="lp-dark-head">
          <p className="lp-dark-kicker">대화의 흐름</p>
          <h2 id="flow-title" className="lp-h2">
            몇 마디 나누다 보면, 내 기준이 보여요
          </h2>
        </header>

        <div className="lp-flow">
          <div className="lp-flow-stage" aria-hidden>
            <PhoneFrame label="이음 대화 화면">
              {STEPS.map((s, i) => (
                <div key={s.title} className={`lp-screen${i === active ? " is-active" : ""}`}>
                  {s.screen}
                </div>
              ))}
            </PhoneFrame>
          </div>

          <ol className="lp-flow-steps">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                data-index={i}
                className={`lp-flow-step${i === active ? " is-active" : ""}`}
              >
                <h3 className="lp-flow-title">{s.title}</h3>
                <p className="lp-flow-body">{s.body}</p>
                <div className="lp-flow-inline" aria-hidden>
                  <PhoneFrame label="이음 대화 화면">
                    <div className="lp-screen is-active">{s.screen}</div>
                  </PhoneFrame>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
