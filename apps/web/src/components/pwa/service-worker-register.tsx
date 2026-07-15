"use client";

import { useEffect } from "react";

/**
 * Registers the production service worker only.
 * Dev (`next dev`) skips registration so HMR is never served from a sticky SW cache.
 */
export const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        // Registration failures are non-fatal (install still works via manifest on many platforms).
      });
  }, []);

  return null;
};
