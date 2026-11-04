import type { Mode } from "@/lib/types";

export default function Orb({ mode, size = 72 }: { mode: Mode; size?: number }) {
  return (
    <span
      className={`orb orb--${mode}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
