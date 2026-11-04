import type { Persona } from "@/lib/types";
import { DEFAULT_PERSONA_ID } from "@/lib/personas";
import Orb from "./Orb";

/** 기본 상담사 '이음'은 구슬, 다른 캐릭터는 이름 첫 글자 동그라미 */
export default function PersonaAvatar({ persona, size = 40 }: { persona: Persona; size?: number }) {
  if (persona.id === DEFAULT_PERSONA_ID) return <Orb mode={persona.mode} size={size} />;
  return (
    <span
      className="p-avatar"
      data-mode={persona.mode}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden
    >
      {persona.name.slice(0, 1)}
    </span>
  );
}
