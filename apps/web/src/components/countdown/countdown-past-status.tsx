import type { CountdownPastSurfaceKind } from "@fortnite-live-countdown/utils";
import { getCountdownPastStatusText } from "@fortnite-live-countdown/utils";

interface CountdownPastStatusProps {
  kind: CountdownPastSurfaceKind;
  targetIso: string;
  className?: string;
}

export function CountdownPastStatus({
  kind,
  targetIso,
  className,
}: CountdownPastStatusProps) {
  const base = "font-mono text-sm text-muted-foreground";
  return (
    <p className={className ? `${base} ${className}` : `${base} mt-2`}>
      {getCountdownPastStatusText(kind, targetIso)}
    </p>
  );
}
