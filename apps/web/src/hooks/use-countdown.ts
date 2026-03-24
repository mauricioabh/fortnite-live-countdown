"use client";

import { countdownPartsFromTarget } from "@fortnite-live-countdown/utils";
import { useEffect, useState } from "react";

export function useCountdown(targetIso: string) {
  const [parts, setParts] = useState(() => countdownPartsFromTarget(targetIso));

  useEffect(() => {
    const tick = () => setParts(countdownPartsFromTarget(targetIso));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetIso]);

  return parts;
}
