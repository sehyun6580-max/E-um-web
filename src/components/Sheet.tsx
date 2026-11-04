"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * 가운데(휴대폰에서는 아래)에 뜨는 창. 브라우저 기본 <dialog>라서
 * Esc로 닫히고, 열려 있는 동안 뒤쪽 화면으로 포커스가 빠지지 않는다.
 */
export default function Sheet({
  open,
  onClose,
  title,
  sub,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`sheet${wide ? " sheet--wide" : ""}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // 바깥(어두운 배경)을 누르면 닫는다
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="sheet-inner">
        <header className="sheet-head">
          <div>
            <h2 id={titleId} className="sheet-title">
              {title}
            </h2>
            {sub && <p className="sheet-sub">{sub}</p>}
          </div>
          <button type="button" className="sheet-x" aria-label="닫기" onClick={onClose}>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        {open && <div className="sheet-body">{children}</div>}
      </div>
    </dialog>
  );
}
