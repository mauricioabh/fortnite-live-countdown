import type { NewsItemDTO } from "@fortnite-live-countdown/types";
import type { ReactNode } from "react";

interface NewsCardProps {
  item: NewsItemDTO;
  /** Optional footer slot (e.g. favorite control). */
  action?: ReactNode;
}

function formatPublishedAt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export const NewsCard = ({ item, action }: NewsCardProps) => {
  const published = formatPublishedAt(item.publishedAt);

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/80 shadow-md backdrop-blur-sm">
      {action ? (
        <div className="absolute right-2 top-2 z-10">{action}</div>
      ) : null}
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Fortnite CDN URLs vary
        <img src={item.imageUrl} alt="" className="h-40 w-full object-cover" />
      ) : (
        <div className="h-24 w-full bg-secondary/40" aria-hidden />
      )}
      <div className="flex flex-1 flex-col gap-sm p-lg">
        {item.tabTitle ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.tabTitle}
          </p>
        ) : null}
        <h3 className="pr-10 text-lg font-semibold text-foreground">
          {item.title}
        </h3>
        {item.body ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {item.body}
          </p>
        ) : null}
        {published ? (
          <p className="mt-auto pt-md text-xs text-muted-foreground">
            Feed: {published}
          </p>
        ) : null}
      </div>
    </article>
  );
};
