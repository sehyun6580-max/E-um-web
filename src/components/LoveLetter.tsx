"use client";

import { useEffect, useState, type RefObject } from "react";

/** ♥ 모양 (중심 0,0) */
const HEART = "M0 5.2C-1.2 4-7 0.3-7-3.4c0-2.3 1.7-4 3.8-4 1.4 0 2.6.8 3.2 1.9.6-1.1 1.8-1.9 3.2-1.9 2.1 0 3.8 1.7 3.8 4C7 .3 1.2 4 0 5.2z";

const SPARKS = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
  return { dx: Math.cos(angle) * 18, dy: Math.sin(angle) * 18 };
});

const DUR = "5.2s";

interface Geo {
  w: number;
  h: number;
  x0: number;
  y0: number;
  cx: number;
  cy: number;
  x1: number;
  y1: number;
}

/**
 * 넓은 화면: '이음' 제목에서 'Mind Prism' 제목까지 💌가 점선 곡선을 따라 날아가고,
 * 도착하면 ♥가 터진다 (5.2초 반복). '동작 줄이기'가 켜져 있으면 멈춘 채로 보인다.
 */
export default function LoveLetter({
  stageRef,
  fromRef,
  toRef,
}: {
  stageRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
}) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(mq.matches);
    onMotion();
    mq.addEventListener("change", onMotion);

    const measure = () => {
      const stage = stageRef.current;
      const from = fromRef.current;
      const to = toRef.current;
      if (!stage || !from || !to || window.innerWidth < 640) {
        setGeo(null);
        return;
      }
      const s = stage.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const x0 = a.right - s.left + 18;
      const y0 = a.top - s.top + a.height / 2;
      const x1 = b.left - s.left - 14;
      const y1 = b.top - s.top + b.height / 2;
      if (x1 - x0 < 80) {
        setGeo(null);
        return;
      }
      setGeo({
        w: s.width,
        h: s.height,
        x0,
        y0,
        cx: (x0 + x1) / 2,
        cy: Math.min(y0, y1) - 52,
        x1,
        y1,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    for (const el of [stageRef.current, fromRef.current, toRef.current]) if (el) ro.observe(el);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      mq.removeEventListener("change", onMotion);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stageRef, fromRef, toRef]);

  if (!geo) return null;
  const { w, h, x0, y0, cx, cy, x1, y1 } = geo;
  const d = `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`;
  // 정지 상태일 때 💌를 둘 곡선의 가운데 (t = 0.5)
  const midX = 0.25 * x0 + 0.5 * cx + 0.25 * x1;
  const midY = 0.25 * y0 + 0.5 * cy + 0.25 * y1;

  return (
    <svg
      className="letter-overlay"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
      focusable="false"
    >
      <path id="eum-letter-path" d={d} className="letter-trail" />
      {reduced ? (
        <text x={midX} y={midY} className="letter-emoji">
          💌
        </text>
      ) : (
        <>
          <g>
            <text className="letter-emoji">💌</text>
            <animateMotion
              dur={DUR}
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.72;1"
              calcMode="spline"
              keySplines="0.45 0.05 0.35 1;0 0 1 1"
            >
              <mpath href="#eum-letter-path" />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;1;1;0;0"
              keyTimes="0;0.08;0.7;0.74;1"
              dur={DUR}
              repeatCount="indefinite"
            />
          </g>
          <g transform={`translate(${x1} ${y1})`}>
            <g>
              <path d={HEART} className="letter-heart" />
              <animate
                attributeName="opacity"
                values="0;0;1;1;0;0"
                keyTimes="0;0.71;0.75;0.84;0.94;1"
                dur={DUR}
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="scale"
                values="0.3;0.3;1.35;1.05;1.05"
                keyTimes="0;0.71;0.77;0.84;1"
                dur={DUR}
                repeatCount="indefinite"
              />
            </g>
            {SPARKS.map((s, i) => (
              <circle key={i} r="2.2" className="letter-spark">
                <animate
                  attributeName="cx"
                  values={`0;0;${s.dx};${s.dx}`}
                  keyTimes="0;0.72;0.9;1"
                  dur={DUR}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values={`0;0;${s.dy};${s.dy}`}
                  keyTimes="0;0.72;0.9;1"
                  dur={DUR}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0;1;0;0"
                  keyTimes="0;0.72;0.76;0.9;1"
                  dur={DUR}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        </>
      )}
    </svg>
  );
}

/** 좁은 화면(640px 미만): 두 카드 사이로 💌가 세로로 떨어진다. */
export function LetterDrop() {
  return (
    <div className="letter-drop" aria-hidden>
      <span className="drop-line" />
      <span className="drop-letter">💌</span>
      <svg className="drop-heart" viewBox="-8 -8 16 14" width="16" height="14">
        <path d={HEART} />
      </svg>
    </div>
  );
}
