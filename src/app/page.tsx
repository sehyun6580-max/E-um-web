import type { Metadata } from "next";
import Link from "next/link";
import "./landing.css";
import Orb from "@/components/Orb";
import FlowSection from "@/components/landing/FlowSection";
import { MockFlip, MockReply, NOTE_SAMPLES } from "@/components/landing/Mocks";

export const metadata: Metadata = {
  title: "이음 E-um | 정답 대신 내 기준을 찾는 연애 상담 챗봇",
  description:
    "이음은 헤어지라고도, 만나라고도 말하지 않는 연애 상담 챗봇이에요. 마음은 받아주고, 결론은 당신에게 돌려줘요.",
};

const PRINCIPLES = [
  {
    name: "맞장구만 치지 않아요",
    text: "속상한 마음은 그대로 받아줘요. 하지만 한쪽 이야기만 듣고 ‘걔가 잘못했네’라고 단정하지는 않아요. 마음에 공감하는 것과 사실에 동의하는 건 다른 일이니까요.",
  },
  {
    name: "꼭 필요한 것만 물어봐요",
    text: "판단하는 데 정말 필요한 정보가 빠졌을 때만, 한 번에 하나씩 물어봐요. 질문을 쏟아내면서 취조하듯 대화하지 않아요.",
  },
  {
    name: "결정은 당신 몫이에요",
    text: "‘그냥 헤어질까?’ 하고 물어도 대신 정해주지 않아요. 그 결정에 필요한 내 기준이 무엇인지 같이 들여다봐요.",
  },
  {
    name: "누가 말해도 같은 기준이에요",
    text: "같은 일을 상대가 했든 내가 했든, 똑같은 잣대로 봐요. 말하는 사람에 따라 기준이 바뀌지 않아요.",
  },
  {
    name: "당신 이야기를 따라가요",
    text: "이음이 대화를 끌고 가지 않아요. 당신이 꺼낸 고민에서 출발하고, 정해 둔 방향으로 몰아가지 않아요.",
  },
];

const MODES = [
  {
    mode: "F" as const,
    name: "감성 공감 모드",
    bot: "F봇",
    when: "위로가 먼저 필요한 날",
    split: [
      { label: "마음 받아주기", value: 70 },
      { label: "내 기준 찾기", value: 30 },
    ],
    how: "감정을 해석해서 비춰줘요. 서운함 밑에 어떤 바람이 있는지, ‘나는 왜 서운한가’를 같이 봐요.",
    sample: "서운함 뒤에 숨은 바람 살펴보기",
    never: "무조건 편들기, 해결책 늘어놓기, 훈계",
  },
  {
    mode: "T" as const,
    name: "팩트 폭격 모드",
    bot: "T봇",
    when: "냉정하게 듣고 싶은 날",
    split: [
      { label: "상황 인정", value: 20 },
      { label: "맹점 짚기", value: 80 },
    ],
    how: "놓친 사실이나 이중 잣대를 보여줘요. 입장이나 조건을 바꿔 보면 어떤지 따져봐요.",
    sample: "문제의 핵심은 만남보다 숨김",
    never: "인신공격, 감정 무시하기, ‘둘 다 똑같네’ 식의 양비론",
  },
];

const HOW_TO = [
  {
    title: "이름과 비밀번호로 들어가요",
    text: "처음 적은 이름과 비밀번호로 내 공간이 바로 만들어져요. 다음에도 같은 걸로 들어오면 이어서 볼 수 있어요.",
  },
  {
    title: "모드를 고르고 털어놓아요",
    text: "위로가 필요하면 감성 공감, 냉정한 시선이 필요하면 팩트 폭격을 골라요. 빈 화면의 예시 문장을 눌러 시작해도 돼요.",
  },
  {
    title: "다른 시선으로도 봐요",
    text: "대화 중에 모드를 바꾸거나 🔍를 펼쳐 보세요. 상대 입장이 궁금하면 🔄 상대방 입장으로 뒤집어보기를 눌러요.",
  },
  {
    title: "내 말로 남겨요",
    text: "정리가 되면 ‘오늘 대화로 초안 채우기’로 초안을 받고, 내 말로 고친 뒤 📌 포스트잇 붙이기를 눌러요.",
  },
];

const FAQ = [
  {
    q: "회원가입을 해야 하나요?",
    a: "따로 가입 절차는 없어요. 처음 들어올 때 적은 이름과 비밀번호가 그대로 내 계정이 돼요. 비밀번호는 잊어버리면 되찾을 방법이 없으니 기억하기 쉬운 걸로 정해 주세요.",
  },
  {
    q: "대화 내용은 어디에 저장되나요?",
    a: "대화와 포스트잇은 지금 쓰고 있는 브라우저에만 저장돼요. 서버에 따로 모아 두거나 다른 사람과 공유하지 않아요. 다만 답변을 만들기 위해 대화 내용이 Anthropic(Claude)과 OpenAI로 전달돼요.",
  },
  {
    q: "다른 휴대폰이나 컴퓨터에서도 내 기록이 보이나요?",
    a: "아직은 안 보여요. 기록이 브라우저에 저장되기 때문에, 다른 기기에서는 같은 이름으로 들어와도 빈 화면에서 시작해요.",
  },
  {
    q: "헤어질지 말지 그냥 정해주면 안 되나요?",
    a: "그건 이음이 하지 않기로 한 일이에요. 대신 그 결정에 필요한 내 기준이 뭔지 같이 찾아볼게요. 기준이 분명해지면 결정이 생각보다 쉬워지기도 해요.",
  },
  {
    q: "반말로 써도 되나요?",
    a: "네. 반말로 쓰면 반말로, 존댓말로 쓰면 존댓말로 답해요.",
  },
  {
    q: "상대방 입장 글은 진짜 상대의 생각인가요?",
    a: "아니에요. 내가 말한 사실만 가지고 시점만 바꿔 쓴 글이에요. 상대의 속마음을 추측해서 지어내지 않아요. 진짜 마음은 상대에게 직접 듣는 게 가장 정확해요.",
  },
  {
    q: "어떤 AI가 답하나요?",
    a: "감성 공감 모드는 Anthropic의 Claude Sonnet 5.5가, 팩트 폭격 모드는 OpenAI의 GPT-5.6 Sol이 답해요.",
  },
  {
    q: "휴대폰에서도 쓸 수 있나요?",
    a: "네. 화면이 좁으면 대화창 아래로 기억과 기준의 방이 이어지는 모양으로 바뀌어요. 따로 설치할 건 없어요.",
  },
  {
    q: "새 고민을 처음부터 다시 얘기하고 싶어요",
    a: "대화창 아래 ‘대화 초기화’를 두 번 누르면 대화가 비워져요. 붙여 둔 포스트잇은 그대로 남아요. 포스트잇까지 지우고 싶다면 보드 아래 ‘포스트잇 모두 떼기’를 누르면 돼요.",
  },
];

export default function LandingPage() {
  return (
    <div className="lp">
      <a className="lp-skip" href="#main">
        본문으로 건너뛰기
      </a>

      <header className="lp-header">
        <div className="lp-wrap lp-header-inner">
          <Link href="/" className="lp-logo" aria-label="이음 E-um 처음으로">
            E-um
          </Link>
          <nav className="lp-nav" aria-label="소개 메뉴">
            <a href="#principles">소개</a>
            <a href="#modes">듀얼모드</a>
            <a href="#prism">Mind Prism</a>
            <a href="#how">사용법</a>
            <a href="#faq">자주 묻는 질문</a>
          </nav>
          <Link href="/chat" className="lp-btn lp-btn--dark lp-btn--sm">
            대화 시작하기
          </Link>
        </div>
      </header>

      <main id="main">
        {/* 첫 화면 */}
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero-visual" aria-hidden>
            <div className="lp-hero-orb">
              <Orb mode="F" size={340} />
            </div>
            <div className="lp-hero-card">
              <p className="msg-user">그냥 헤어지는 게 맞겠지?</p>
              <MockReply
                mode="F"
                title="결정 전에, 내 기준부터"
                body="지금 많이 지쳐 있는 게 느껴져요. 헤어질지는 제가 정할 수 없지만, 그 결정에 필요한 내 기준이 뭔지는 같이 찾아볼 수 있어요."
              />
            </div>
          </div>

          <div className="lp-wrap lp-hero-text">
            <p className="lp-tag">연애 상담 챗봇</p>
            <h1 id="hero-title" className="lp-h1">
              헤어지라고도, 만나라고도
              <br />
              말하지 않을게요
            </h1>
            <p className="lp-lede">
              이음은 연애 고민을 들어주는 챗봇이에요. 속상한 마음은 그대로 받아주고, 그다음엔
              내가 무엇을 중요하게 여기는지 같이 찾아봐요. 결론은 당신이 내려요.
            </p>
            <div className="lp-actions">
              <Link href="/chat" className="lp-btn lp-btn--light">
                이음과 대화하기
              </Link>
              <a href="#principles" className="lp-link">
                어떻게 다른지 먼저 볼게요
              </a>
            </div>
            <p className="lp-hero-note">설치 없이 브라우저에서 바로 써요. 휴대폰에서도 돼요.</p>
          </div>
        </section>

        {/* 다섯 가지 원칙 */}
        <section className="lp-section" id="principles" aria-labelledby="principles-title">
          <div className="lp-wrap lp-split">
            <div className="lp-split-head">
              <h2 id="principles-title" className="lp-h2">
                이음이 지키는
                <br />
                다섯 가지
              </h2>
              <p className="lp-p">
                친구한테 고민을 털어놓으면 대부분 내 편을 들어줘요. 고맙긴 한데, 다음 날 다시
                생각해 보면 정리된 건 별로 없을 때가 많죠. 이음은 그 반대로 해 보려고 했어요.
              </p>
            </div>
            <dl className="lp-spec">
              {PRINCIPLES.map((p) => (
                <div key={p.name} className="lp-spec-row">
                  <dt>{p.name}</dt>
                  <dd>{p.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <FlowSection />

        {/* 두 가지 모드 */}
        <section className="lp-section" id="modes" aria-labelledby="modes-title">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2 id="modes-title" className="lp-h2">
                같은 고민, 두 가지 시선
              </h2>
              <p className="lp-p">
                위로가 필요한 날도 있고, 냉정하게 듣고 싶은 날도 있잖아요. 모드는 대화 중에
                언제든 바꿀 수 있고, 앞에서 한 이야기는 그대로 이어져요.
              </p>
            </div>

            <div className="lp-modes">
              {MODES.map((m) => (
                <article key={m.mode} className="lp-mode" data-mode={m.mode}>
                  <div className="lp-mode-top">
                    <span className="bot-avatar lp-mode-avatar" data-mode={m.mode}>
                      {m.bot}
                    </span>
                    <div>
                      <h3 className="lp-h3">{m.name}</h3>
                      <p className="lp-mode-when">{m.when}</p>
                    </div>
                  </div>

                  <div className="lp-ratio" aria-label={m.split.map((s) => `${s.label} ${s.value}%`).join(", ")}>
                    <div className="lp-ratio-bar" aria-hidden>
                      <span style={{ flexBasis: `${m.split[0].value}%` }} />
                      <span style={{ flexBasis: `${m.split[1].value}%` }} />
                    </div>
                    <div className="lp-ratio-legend" aria-hidden>
                      <span>
                        {m.split[0].label} {m.split[0].value}
                      </span>
                      <span>
                        {m.split[1].label} {m.split[1].value}
                      </span>
                    </div>
                  </div>

                  <p className="lp-mode-how">{m.how}</p>

                  <dl className="lp-mode-facts">
                    <div>
                      <dt>답변 제목은 이런 식이에요</dt>
                      <dd>&ldquo;{m.sample}&rdquo;</dd>
                    </div>
                    <div>
                      <dt>이건 하지 않아요</dt>
                      <dd>{m.never}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="lp-anatomy">
              <div className="lp-anatomy-text">
                <h3 className="lp-h3">답변은 늘 같은 모양이에요</h3>
                <ul className="lp-anatomy-list">
                  <li>
                    <b>한 줄 제목</b>
                    이번 답변의 핵심을 30자 안으로 먼저 보여줘요.
                  </li>
                  <li>
                    <b>본문</b>
                    두세 문장, 길어도 다섯 문장 안에서 끝내요.
                  </li>
                  <li>
                    <b>🔍 다른 모드의 시선 보기</b>
                    반대 모드였다면 던졌을 질문 한 줄이 접힌 채로 달려요. 궁금할 때만 펼쳐 보면
                    돼요.
                  </li>
                </ul>
              </div>
              <div className="lp-anatomy-demo" aria-hidden>
                <MockReply
                  mode="T"
                  title="문제의 핵심은 횟수보다 예고"
                  body="불만은 '연락이 적다'보다 '바뀐다는 걸 미리 몰랐다'에 가까워 보여요. 그렇다면 같은 기준을 나에게도 대 볼 수 있어요."
                  other="그 기준이 지켜지지 않았을 때, 나는 어떤 마음이 되는 사람인가요?"
                  open
                />
              </div>
            </div>
          </div>
        </section>

        {/* 뒤집어보기 */}
        <section className="lp-section lp-section--soft" id="flip" aria-labelledby="flip-title">
          <div className="lp-wrap lp-split lp-split--center">
            <div className="lp-split-head">
              <h2 id="flip-title" className="lp-h2">
                🔄 상대방 입장으로
                <br />
                뒤집어보기
              </h2>
              <p className="lp-p">
                대화창 아래 버튼을 누르면, 내가 한 이야기를 상대방 시점의 1인칭 글로 바꿔 써
                줘요.
              </p>
              <p className="lp-p">
                쓰는 재료는 내가 말한 사실뿐이에요. 상대의 속마음은 지어내지 않아요. 그리고 내가
                세운 기준이 그 자리에서도 똑같이 적용되는지 짚어 줘요.
              </p>
            </div>
            <div className="lp-flip-demo" aria-hidden>
              <MockFlip />
            </div>
          </div>
        </section>

        {/* 기억과 기준의 방 */}
        <section className="lp-section" id="prism" aria-labelledby="prism-title">
          <div className="lp-wrap">
            <div className="lp-head">
              <p className="lp-prism-name">Mind Prism · 기억과 기준의 방</p>
              <h2 id="prism-title" className="lp-h2">
                찾은 기준은 내 말로 남겨요
              </h2>
              <p className="lp-p">
                환승연애의 X룸에서 아이디어를 얻었어요. 대화에서 찾은 기준을 &lsquo;오늘 밤,
                당신의 속마음 문자&rsquo; 세 칸에 적으면 보드에 포스트잇으로 붙어요.
              </p>
            </div>

            <ul className="lp-notes">
              {NOTE_SAMPLES.map((n, i) => (
                <li key={n.field} className="lp-note-item">
                  <p className="lp-note-q">{n.question}</p>
                  <div className="note lp-note" data-field={n.field} style={{ ["--tilt" as string]: `${[-2, 1.5, -1][i]}deg` }}>
                    <span className="note-label">{n.short}</span>
                    <p className="note-text">{n.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="lp-prism-foot">
              <p className="lp-p">
                <b>오늘 대화로 초안 채우기</b>를 누르면 이음이 대화를 읽고 앞의 두 칸을 채워 줘요.
                내가 실제로 한 말만 쓰고, 아직 나오지 않은 내용은 비워 둬요.
              </p>
              <p className="lp-p">
                마지막 칸은 일부러 비워 둬요. 결론은 당신이 내리는 거니까요.
              </p>
            </div>
          </div>
        </section>

        {/* 안전 */}
        <section className="lp-safety" aria-labelledby="safety-title">
          <div className="lp-wrap lp-safety-inner">
            <h2 id="safety-title" className="lp-h3">
              마음이 너무 힘들 때는
            </h2>
            <p>
              대화 중에 스스로를 해치고 싶다는 신호가 보이면, 이음은 상담을 멈추고 자살예방상담전화
              109를 먼저 안내해요. 24시간 언제든 무료로 이야기를 들어줘요. 지금 위험하다면 112나
              119에 바로 연락해 주세요.
            </p>
            <a className="lp-btn lp-btn--outline lp-btn--sm" href="tel:109">
              109에 전화하기
            </a>
          </div>
        </section>

        {/* 사용법 */}
        <section className="lp-section" id="how" aria-labelledby="how-title">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2 id="how-title" className="lp-h2">
                처음이라면 이렇게 해 보세요
              </h2>
            </div>
            <ol className="lp-steps">
              {HOW_TO.map((s, i) => (
                <li key={s.title} className="lp-step">
                  <span className="lp-step-num">{i + 1}</span>
                  <h3 className="lp-step-title">{s.title}</h3>
                  <p className="lp-step-text">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 만든 이유 */}
        <section className="lp-section lp-section--soft" aria-labelledby="why-title">
          <div className="lp-wrap lp-why">
            <h2 id="why-title" className="lp-h2">
              왜 만들었냐면요
            </h2>
            <div className="lp-why-text">
              <p>
                연애 고민은 보통 친구한테 털어놓잖아요. 그런데 친구는 내 이야기만 듣고 내 편을
                들어줄 때가 많아요. 그 순간엔 위로가 되는데, 결국 내가 어떻게 하고 싶은지는 여전히
                모르겠더라고요.
              </p>
              <p>
                AI 챗봇에 물어봐도 비슷했어요. 말하는 사람한테 너무 쉽게 맞장구를 치거나, 반대로
                정답인 것처럼 결론을 내려 주곤 했죠. 마음은 받아주되 결론은 나한테 돌려주는 대화
                상대가 있으면 좋겠다고 생각해서 이음을 만들었어요.
              </p>
              <p className="lp-sign">이음을 만든 사람들</p>
            </div>
          </div>
        </section>

        {/* 자주 묻는 질문 */}
        <section className="lp-section" id="faq" aria-labelledby="faq-title">
          <div className="lp-wrap lp-split">
            <div className="lp-split-head">
              <h2 id="faq-title" className="lp-h2">
                자주 묻는 질문
              </h2>
              <p className="lp-p">궁금한 게 있으면 여기부터 봐 주세요.</p>
            </div>
            <div className="lp-faq">
              {FAQ.map((f) => (
                <details key={f.q} className="lp-faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 마지막 안내 */}
        <section className="lp-cta" aria-labelledby="cta-title">
          <div className="lp-wrap lp-cta-inner">
            <Orb mode="F" size={72} />
            <h2 id="cta-title" className="lp-h2">
              오늘 마음에 걸린 일
              <br />
              하나만 꺼내 보세요
            </h2>
            <Link href="/chat" className="lp-btn lp-btn--light">
              이음과 대화하기
            </Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <div>
            <p className="lp-logo lp-logo--light">E-um</p>
            <nav className="lp-footer-nav" aria-label="바닥글 메뉴">
              <Link href="/chat">대화 시작하기</Link>
              <a href="#faq">자주 묻는 질문</a>
            </nav>
          </div>
          <div className="lp-footer-meta">
            <p>힘들 땐 자살예방상담전화 109 (24시간, 무료)</p>
            <p>© 2026 이음 E-um</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
