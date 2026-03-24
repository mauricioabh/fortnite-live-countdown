import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FavoriteTargetType, FavoritesListResponse } from "@fortnite-live-countdown/types";
import { colors, spacing } from "@fortnite-live-countdown/ui";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { fetchWithAuth } from "@/lib/auth-api";

const FAVORITES_QUERY_KEY = ["favorites"] as const;

async function fetchFavorites(getToken: () => Promise<string | null>): Promise<FavoritesListResponse> {
  const res = await fetchWithAuth("/api/favorites", getToken, { method: "GET" });
  if (res.status === 401) return { items: [] };
  if (!res.ok) throw new Error("Could not load favorites");
  return res.json() as Promise<FavoritesListResponse>;
}

interface FavoriteStarButtonProps {
  targetType: FavoriteTargetType;
  targetKey: string;
}

export const FavoriteStarButton = ({ targetType, targetKey }: FavoriteStarButtonProps) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const q = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => fetchFavorites(getToken),
    staleTime: 20_000,
  });

  const isFavorite =
    q.data?.items.some((i) => i.targetType === targetType && i.targetKey === targetKey) ?? false;

  const mutation = useMutation({
    mutationFn: async (nextFavorite: boolean) => {
      if (nextFavorite) {
        const res = await fetchWithAuth("/api/favorites", getToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetType, targetKey }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(typeof err.error === "string" ? err.error : "Could not save");
        }
        return;
      }
      const params = new URLSearchParams({ targetType, targetKey });
      const res = await fetchWithAuth(`/api/favorites?${params.toString()}`, getToken, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(typeof err.error === "string" ? err.error : "Could not remove");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  const label = isFavorite ? "Remove from favorites" : "Add to favorites";

  return (
    <View style={styles.anchor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: isFavorite }}
        disabled={mutation.isPending}
        onPress={() => {
          mutation.mutate(!isFavorite);
        }}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        {mutation.isPending ? (
          <ActivityIndicator color={colors.foreground} size="small" />
        ) : (
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={colors.foreground} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    zIndex: 20,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(5,5,8,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.88 },
});
