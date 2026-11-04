/** 폭력·위협·위기 신호가 있을 때 화해 대신 보여주는 안내 */
export default function SafetyCard({ reason }: { reason: string }) {
  return (
    <div className="safety-card" role="alert">
      <p className="safety-title">지금은 화해보다 안전이 먼저예요</p>
      <p className="safety-reason">{reason}</p>
      <ul className="safety-list">
        <li>
          <a href="tel:112">112</a>
          <span>지금 위험하다면 바로 신고해 주세요</span>
        </li>
        <li>
          <a href="tel:1366">1366</a>
          <span>여성긴급전화. 가정폭력·데이트폭력·스토킹 상담 (24시간)</span>
        </li>
        <li>
          <a href="tel:109">109</a>
          <span>자살예방상담전화. 마음이 무너질 때 (24시간, 무료)</span>
        </li>
      </ul>
    </div>
  );
}
