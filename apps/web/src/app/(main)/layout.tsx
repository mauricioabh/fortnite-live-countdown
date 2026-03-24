import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default function MainAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-zinc-950 via-red-900 to-blue-900"
        aria-hidden
      />
      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-[13rem_1fr] lg:grid-rows-1">
        <DashboardSidebar />
        <main className="col-span-1 row-start-2 min-w-0 px-3 py-6 sm:px-5 md:px-6 lg:col-start-2 lg:row-start-1 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto w-full max-w-[min(100%,96rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
