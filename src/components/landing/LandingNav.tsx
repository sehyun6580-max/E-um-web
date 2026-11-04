"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  { id: "principles", label: "소개" },
  { id: "modes", label: "듀얼모드" },
  { id: "characters", label: "캐릭터" },
  { id: "prism", label: "Mind Prism" },
  { id: "letter", label: "화해 편지" },
  { id: "how", label: "사용법" },
  { id: "faq", label: "자주 묻는 질문" },
];

/** 머리글 아래(64px)에서 화면 높이의 1/3쯤 내려온 선을 지난 마지막 섹션을 '지금 보는 곳'으로 친다. */
function findActive(): string | null {
  const line = 64 + window.innerHeight / 3;
  let active: string | null = null;
  for (const { id } of ITEMS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= line) active = id;
  }
  return active;
}

export default function LandingNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(findActive()));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <nav className="lp-nav" aria-label="소개 메뉴">
      {ITEMS.map(({ id, label }) => (
        <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}>
          {label}
        </a>
      ))}
    </nav>
  );
}
