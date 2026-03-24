"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Events", description: "Main countdown" },
  {
    href: "/favoritos",
    label: "Favorites",
    description: "Saved to your account",
  },
  {
    href: "/jam-tracks",
    label: "Jam tracks",
    description: "Tracks / Festival",
  },
  { href: "/tienda", label: "Item Shop", description: "Cosmetics and bundles" },
  { href: "/historial", label: "History", description: "Archived events" },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <>
      <nav
        className="col-start-1 row-start-1 flex gap-2 overflow-x-auto border-b border-border/80 bg-card/30 px-3 py-3 backdrop-blur-md lg:hidden"
        aria-label="Sections"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/80 text-secondary-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <aside className="hidden border-r border-border/80 bg-card/40 backdrop-blur-md lg:col-start-1 lg:row-start-1 lg:block lg:w-52 lg:shrink-0">
        <div className="sticky top-0 flex flex-col gap-1 p-4 pt-6">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/15 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <span className="block">{item.label}</span>
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  {item.description}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
};
