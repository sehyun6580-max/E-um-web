import type { Metadata } from "next";
import LetterView from "@/components/LetterView";
import { letterFont } from "@/lib/fonts";
import "./letter.css";

// 미리보기 카드에는 편지 내용이 나오지 않는다 (내용은 주소의 # 뒤에만 있다).
export const metadata: Metadata = {
  title: "이음 | 마음을 담은 편지가 도착했어요",
  description: "이음에서 마음을 정리하고 쓴 편지예요. 링크를 열어 읽어 보세요.",
  robots: { index: false, follow: false },
};

export default function LetterPage() {
  return <LetterView letterFont={letterFont.className} />;
}
