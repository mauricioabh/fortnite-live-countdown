"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  FavoriteTargetType,
  FavoritesListResponse,
} from "@fortnite-live-countdown/types";

const FAVORITES_QUERY_KEY = ["favorites"] as const;

async function fetchFavorites(): Promise<FavoritesListResponse> {
  const res = await fetch("/api/favorites", { credentials: "include" });
  if (res.status === 401) return { items: [] };
  if (!res.ok) throw new Error("Could not load favorites");
  return res.json() as Promise<FavoritesListResponse>;
}

interface FavoriteStarButtonProps {
  targetType: FavoriteTargetType;
  targetKey: string;
  /** Button position (corner overlay on the card). */
  className?: string;
  labels?: {
    add: string;
    remove: string;
  };
}

export const FavoriteStarButton = ({
  targetType,
  targetKey,
  className = "absolute right-2 top-2 z-20",
  labels = { add: "Add to favorites", remove: "Remove from favorites" },
}: FavoriteStarButtonProps) => {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: fetchFavorites,
    staleTime: 20_000,
  });

  const isFavorite =
    q.data?.items.some(
      (i) => i.targetType === targetType && i.targetKey === targetKey,
    ) ?? false;

  const mutation = useMutation({
    mutationFn: async (nextFavorite: boolean) => {
      if (nextFavorite) {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ targetType, targetKey }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            typeof err.error === "string" ? err.error : "Could not save",
          );
        }
        return;
      }
      const params = new URLSearchParams({
        targetType,
        targetKey,
      });
      const res = await fetch(`/api/favorites?${params.toString()}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err.error === "string" ? err.error : "Could not remove",
        );
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  const label = isFavorite ? labels.remove : labels.add;

  return (
    <button
      type="button"
      className={`${className} inline-flex size-10 items-center justify-center rounded-full border border-border/80 bg-background/85 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50`}
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
      disabled={mutation.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutation.mutate(!isFavorite);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
};
