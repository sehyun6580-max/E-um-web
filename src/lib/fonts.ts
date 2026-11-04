import { Gowun_Batang } from "next/font/google";

/**
 * 편지 본문 글꼴. 한글 글자는 여러 조각으로 나뉘어 있어 미리 불러오지 않고,
 * 화면에 나온 글자에 필요한 조각만 받는다.
 */
export const letterFont = Gowun_Batang({ weight: ["400", "700"], preload: false, display: "swap" });
