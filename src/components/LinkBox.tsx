"use client";

import { useEffect, useRef, useState } from "react";

/** 만든 편지 링크를 복사·공유하는 상자 */
export default function LinkBox({ link, shareTitle }: { link: string; shareTitle: string }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // 복사 권한이 없으면 직접 복사할 수 있게 선택해 둔다
      inputRef.current?.select();
    }
  }

  return (
    <div className="linkbox">
      <label className="sr-only" htmlFor="letter-link">
        편지 링크
      </label>
      <input
        id="letter-link"
        ref={inputRef}
        className="input linkbox-input"
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
      />
      <div className="linkbox-actions">
        <button type="button" className="btn btn-dark btn-sm" onClick={copy}>
          {copied ? "복사했어요" : "링크 복사"}
        </button>
        {canShare && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigator.share({ title: shareTitle, url: link }).catch(() => {})}
          >
            공유하기
          </button>
        )}
        <a className="btn btn-outline btn-sm" href={link} target="_blank" rel="noopener noreferrer">
          미리 보기
        </a>
      </div>
      <p className="linkbox-note" role="status">
        {copied ? "카카오톡이나 문자에 붙여 넣어 보내 주세요. " : ""}
        링크를 가진 사람은 누구나 읽을 수 있어요. 편지 내용은 링크 안에만 있고 이음 서버에는 저장되지 않아요.
      </p>
    </div>
  );
}
