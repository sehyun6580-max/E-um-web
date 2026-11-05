/**
 * 이음 로고: 말풍선 두 개가 대각선으로 겹친 모양이에요.
 * 위 말풍선은 와인색(꼬리가 왼쪽 아래), 아래 말풍선은 라벤더(꼬리가 오른쪽 위),
 * 겹친 자리는 플럼색이에요. 탭 아이콘(src/app/icon.svg 등)도 같은 모양과 색을 써요.
 *
 * tile을 켜면 크림색 둥근 바탕을 깔아요. 어두운 바탕(바닥글)에서는 꼭 켜 주세요.
 * 와인색이 어두운 바탕에 묻혀 모양이 반만 보이기 때문이에요.
 */
export const LOGO_COLORS = {
  wine: "#80353D",
  lavender: "#ACA8D6",
  plum: "#462544",
  cream: "#F5F1E8",
} as const;

// 164×164 좌표. 말풍선은 지름 104인 원에 모서리 하나만 각진 모양이에요.
const TOP = "M0 104V52a52 52 0 0 1 104 0a52 52 0 0 1-52 52Z";
const BOTTOM = "M164 60v52a52 52 0 0 1-52 52a52 52 0 0 1-52-52a52 52 0 0 1 52-52Z";
// 두 원이 겹치는 렌즈 모양 (원의 중심 (52,52)와 (112,112), 반지름 52)
const OVERLAP = "M103.26 60.74A52 52 0 0 1 60.74 103.26A52 52 0 0 1 103.26 60.74Z";

type Props = {
  size?: number;
  tile?: boolean;
  /** 로고만 단독으로 쓸 때 읽어 줄 이름. 옆에 글자가 있으면 비워 두세요. */
  label?: string;
};

export default function Logo({ size = 28, tile = false, label }: Props) {
  return (
    <svg
      className="logo"
      width={size}
      height={size}
      viewBox={tile ? "-26 -26 216 216" : "0 0 164 164"}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {tile && <rect x="-26" y="-26" width="216" height="216" rx="50" fill={LOGO_COLORS.cream} />}
      <path d={TOP} fill={LOGO_COLORS.wine} />
      <path d={BOTTOM} fill={LOGO_COLORS.lavender} />
      <path d={OVERLAP} fill={LOGO_COLORS.plum} />
    </svg>
  );
}
