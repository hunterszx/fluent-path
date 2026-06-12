import { Sparkles } from "lucide-react";

export function LunariLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-2xl gradient-brand glow-brand shrink-0"
      style={{ width: size, height: size }}
    >
      <Sparkles className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2.25} />
    </div>
  );
}