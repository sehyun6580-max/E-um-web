import type { Metadata } from "next";
import Link from "next/link";
import Orb from "@/components/Orb";
import "./privacy.css";

/**
 * 개인정보처리방침.
 * 저장 위치, 사용하는 AI 회사, 외부 서비스, 로그인 방식이 바뀌면 이 페이지도 같이 고쳐야 해요.
 * 고칠 때는 시행일(EFFECTIVE)을 바꾸고, 바뀐 내용을 '지난 방침'에 한 줄 남겨요.
 */

const EFFECTIVE = "2026년 11월 5일";

/** 개인정보 보호책임자. 사람이나 연락처가 바뀌면 여기만 고치면 돼요. */
const OFFICER = {
  name: "이음 운영팀",
  email: "eum.team@gmail.com",
};

export const metadata: Metadata = {
  title: "이음 | 개인정보처리방침",
  description: "이음이 어떤 정보를 어디에 두고, 어디로 보내는지 정리했어요.",
};

const HOLDINGS = [
  {
    what: "데모 로그인 이름과 비밀번호",
    where: "내 브라우저. 비밀번호는 원래 글자 대신 되돌릴 수 없는 값(해시)으로 바꿔 둬요",
    sent: "보내지 않아요",
  },
  {
    what: "대화, 포스트잇, 마음 정리 초안, 고민 종류",
    where: "내 브라우저",
    sent: "답변, 뒤집어보기, 초안 채우기, 편지 초안을 만들 때 대화와 메모를 보내요",
  },
  {
    what: "고른 캐릭터와 직접 만든 캐릭터",
    where: "내 브라우저",
    sent: "답변을 만들 때 캐릭터 설정(이름, 성격, 말투 등)을 함께 보내요",
  },
  {
    what: "화해 편지 (받는 사람 호칭, 편지 내용, 답장)",
    where: "링크 주소의 # 뒤. 이음 서버에는 저장하지 않아요",
    sent: "편지 초안을 만들 때만 대화, 메모, 받는 사람 호칭을 보내요. 링크를 여는 것만으로는 내용이 서버로 가지 않아요",
  },
  {
    what: "접속 기록 (IP 주소, 접속 시간, 브라우저 종류)",
    where: "사이트를 운영하는 Vercel이 자동으로 기록해요",
    sent: "해당 없음",
  },
];

const RECIPIENTS = [
  {
    name: "Anthropic",
    country: "미국",
    purpose: "감성 공감 모드 답변, 뒤집어보기, 초안 채우기, 화해 편지 초안 만들기",
    items: "대화 내용, 메모, 캐릭터 설정, 고민 종류, 받는 사람 호칭",
    retention:
      "Anthropic 정책상 API로 받은 내용은 보통 30일 안에 지우고, 이용 정책 위반이 의심되면 더 오래 보관할 수 있어요. 받은 내용을 모델 학습에 쓰지 않아요.",
    link: "https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-personal-data",
  },
  {
    name: "OpenAI",
    country: "미국",
    purpose: "팩트 폭격 모드 답변. 설정에 따라 다른 기능도 맡아요",
    items: "대화 내용, 메모, 캐릭터 설정, 고민 종류, 받는 사람 호칭",
    retention:
      "OpenAI 정책상 오남용 감시 기록을 최대 30일 보관하고, 법이나 안전을 위해 필요하면 더 오래 보관할 수 있어요. API로 받은 내용은 기본적으로 모델 학습에 쓰지 않아요.",
    link: "https://developers.openai.com/api/docs/guides/your-data",
  },
  {
    name: "Vercel",
    country: "미국",
    purpose: "사이트 운영(호스팅). 위 두 회사로 가는 요청이 Vercel 서버를 거쳐요",
    items: "접속 기록, 요청 내용(거쳐 가기만 하고 이음은 저장하지 않아요)",
    retention: "접속 기록은 Vercel의 보관 기간에 따라 지워져요.",
    link: "https://vercel.com/legal/privacy-policy",
  },
];

const AGENCIES = [
  { name: "개인정보침해신고센터", contact: "국번 없이 118", url: "https://privacy.kisa.or.kr" },
  { name: "개인정보분쟁조정위원회", contact: "1833-6972", url: "https://www.kopico.go.kr" },
  { name: "대검찰청 사이버수사과", contact: "국번 없이 1301", url: "https://www.spo.go.kr" },
  { name: "경찰청 사이버수사국", contact: "국번 없이 182", url: "https://ecrm.police.go.kr" },
];

export default function PrivacyPage() {
  return (
    <main className="pv">
      <header className="pv-top">
        <Link href="/" className="pv-brand">
          <Orb mode="F" size={22} />
          이음
        </Link>
        <Link href="/chat" className="pv-top-link">
          대화하기
        </Link>
      </header>

      <article className="pv-doc">
        <h1>개인정보처리방침</h1>
        <p className="pv-date">시행일 {EFFECTIVE}</p>

        <section className="pv-summary" aria-label="한눈에 보기">
          <ul>
            <li>대화와 기록은 지금 쓰는 브라우저에만 저장돼요. 이음 서버에는 모아 두지 않아요.</li>
            <li>답변을 만들 때만 대화 내용이 AI 회사(Anthropic, OpenAI)로 전달돼요.</li>
            <li>광고나 방문 분석 도구를 쓰지 않아요.</li>
            <li>기록은 브라우저에서 직접 지울 수 있어요.</li>
          </ul>
        </section>

        <section>
          <h2>1. 이음이 다루는 정보와 저장 위치</h2>
          <p>
            이음은 회원 정보를 서버에 모으지 않아요. 아래 정보는 사용자가 직접 입력한 것이고, 대부분 지금 쓰는
            브라우저에만 남아요.
          </p>
          <div className="pv-table-wrap">
            <table className="pv-table">
              <thead>
                <tr>
                  <th scope="col">정보</th>
                  <th scope="col">저장 위치</th>
                  <th scope="col">서버로 보내는 때</th>
                </tr>
              </thead>
              <tbody>
                {HOLDINGS.map((h) => (
                  <tr key={h.what}>
                    <th scope="row">{h.what}</th>
                    <td>{h.where}</td>
                    <td>{h.sent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>2. 정보를 쓰는 목적</h2>
          <ul>
            <li>고민에 맞는 상담 답변을 만들어요.</li>
            <li>상대방 입장으로 뒤집어보기, 마음 정리 초안, 화해 편지 초안을 만들어요.</li>
            <li>폭력이나 위기 신호가 보이면 안전 안내(112, 1366, 109)를 보여줘요.</li>
          </ul>
          <p>이 밖의 목적(광고, 판매, AI 학습 등)으로는 쓰지 않아요.</p>
        </section>

        <section>
          <h2>3. 보관 기간과 지우는 시점</h2>
          <ul>
            <li>
              <strong>이음 서버</strong>: 답변을 만드는 동안만 다루고, 끝나면 저장하지 않아요. 대화 내용을 서버 기록(로그)에
              남기지도 않아요.
            </li>
            <li>
              <strong>내 브라우저</strong>: 사용자가 지울 때까지 남아요. 지우는 방법은 6번에 있어요.
            </li>
            <li>
              <strong>AI 회사와 Vercel</strong>: 각 회사의 정책에 따라 보관하고 지워요. 자세한 내용은 4번에 있어요.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. 처리를 맡기는 곳과 국외 이전</h2>
          <p>
            답변을 만들고 사이트를 운영하기 위해 아래 회사에 처리를 맡겨요. 모두 미국에 있는 회사라서, 기능을 쓸 때 정보가
            국외로 전달돼요.
          </p>
          <ul className="pv-recipients">
            {RECIPIENTS.map((r) => (
              <li key={r.name} className="pv-recipient">
                <h3>
                  {r.name} <span>{r.country}</span>
                </h3>
                <dl>
                  <dt>맡기는 일</dt>
                  <dd>{r.purpose}</dd>
                  <dt>전달하는 정보</dt>
                  <dd>{r.items}</dd>
                  <dt>보관 기간</dt>
                  <dd>
                    {r.retention}{" "}
                    <a href={r.link} target="_blank" rel="noreferrer">
                      {r.name} 정책 보기
                    </a>
                  </dd>
                </dl>
              </li>
            ))}
          </ul>
          <p>
            <strong>전달 시점과 방법</strong>: 사용자가 메시지를 보내거나 기능 버튼을 누를 때, 암호화된 인터넷 연결(HTTPS)로
            전달해요. AI 키가 설정되지 않은 환경에서는 예시 답변을 쓰고 아무 데도 보내지 않아요.
          </p>
          <p>
            <strong>원하지 않는다면</strong>: 메시지를 보내지 않으면 아무 정보도 전달되지 않아요. 다만 그러면 상담 답변을 받을 수
            없어요.
          </p>
        </section>

        <section>
          <h2>5. 민감한 이야기와 상대방 정보</h2>
          <ul>
            <li>
              연애와 성생활, 건강에 관한 정보는 법에서 특히 보호하는 민감정보예요. 이음은 이런 정보를 따로 묻거나 저장하지
              않지만, 대화에 적으면 답변을 만들기 위해 AI 회사로 전달돼요. 꼭 필요한 만큼만 적어 주세요.
            </li>
            <li>
              대화와 편지에는 상대방 이야기가 들어가요. 실명, 전화번호, 주소처럼 누군지 알 수 있는 정보 대신 호칭을 써 주세요.
            </li>
            <li>화해 편지 링크는 가진 사람이면 누구나 읽을 수 있어요. 받는 사람에게만 보내 주세요.</li>
          </ul>
        </section>

        <section>
          <h2>6. 내 기록 지우기와 이용자 권리</h2>
          <p>
            이음 서버에는 사용자 기록이 없어서, 열람하거나 지울 서버 기록도 없어요. 기록은 브라우저에서 직접 지울 수 있어요.
          </p>
          <ul>
            <li>
              <strong>대화만 지우기</strong>: 대화 화면의 &lsquo;대화 초기화&rsquo; 버튼을 두 번 눌러요. 포스트잇과 캐릭터는 남아요.
            </li>
            <li>
              <strong>전부 지우기</strong>: 브라우저 설정에서 이 사이트의 데이터(쿠키 및 사이트 데이터)를 삭제해요. 로그인 정보,
              포스트잇, 캐릭터까지 모두 지워져요.
            </li>
            <li>
              <strong>화해 편지</strong>: 링크 안에만 있으니, 링크를 보낸 메신저에서 메시지를 지워요.
            </li>
          </ul>
          <p>
            AI 회사에 이미 전달된 내용은 4번의 각 회사 정책에 따라 지워져요. 그 밖에 궁금한 점이나 요청은 아래 보호책임자에게
            보내 주세요.
          </p>
        </section>

        <section>
          <h2>7. 만 14세 미만</h2>
          <p>이음은 만 14세 이상을 위한 서비스예요. 만 14세 미만은 이용할 수 없어요.</p>
        </section>

        <section>
          <h2>8. 쿠키와 분석 도구</h2>
          <p>
            광고나 방문 분석 도구를 쓰지 않고, 사용자를 따라다니는 쿠키를 만들지 않아요. 기록은 브라우저 저장소(localStorage)에
            보관해요. 화면 글꼴은 jsDelivr에서 받아 오는데, 이때 IP 주소 같은 기본 접속 정보가 전달될 수 있어요.
          </p>
        </section>

        <section>
          <h2>9. 안전을 위해 하는 일</h2>
          <ul>
            <li>모든 연결은 암호화(HTTPS)돼요.</li>
            <li>AI 키는 서버에만 두고 브라우저에 보내지 않아요.</li>
            <li>대화 내용을 서버에 저장하거나 로그로 남기지 않아요.</li>
            <li>한 번에 보낼 수 있는 대화의 양을 제한해요.</li>
          </ul>
          <p className="pv-note">
            지금의 로그인은 데모용이라, 같은 기기를 쓰는 사람은 브라우저에 저장된 기록을 볼 수 있어요. 공용 기기나 다른 사람과
            같이 쓰는 기기에서는 이용한 뒤 6번의 &lsquo;전부 지우기&rsquo;를 해 주세요.
          </p>
        </section>

        <section>
          <h2>10. 개인정보 보호책임자</h2>
          <dl className="pv-officer">
            <dt>담당</dt>
            <dd>{OFFICER.name}</dd>
            <dt>연락처</dt>
            <dd>
              <a href={`mailto:${OFFICER.email}`}>{OFFICER.email}</a>
            </dd>
          </dl>
          <p>개인정보 침해로 도움이 필요하면 아래 기관에도 문의할 수 있어요.</p>
          <ul className="pv-agencies">
            {AGENCIES.map((a) => (
              <li key={a.name}>
                <a href={a.url} target="_blank" rel="noreferrer">
                  {a.name}
                </a>
                <span>{a.contact}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>11. 방침이 바뀌면</h2>
          <p>내용이 바뀌면 이 페이지에 새 시행일과 함께 알려요.</p>
          <p className="pv-history">지난 방침: 없음 (처음 만든 방침이에요)</p>
        </section>
      </article>

      <footer className="pv-foot">
        <Link href="/">이음 소개</Link>
        <Link href="/chat">대화하기</Link>
      </footer>
    </main>
  );
}
