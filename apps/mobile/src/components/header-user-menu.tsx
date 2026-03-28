import { useClerk, useUser } from "@clerk/clerk-expo";
import { colors, spacing } from "@fortnite-live-countdown/ui";
import { useCallback, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HeaderUserMenu = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const onSignOut = useCallback(() => {
    close();
    void signOut();
  }, [close, signOut]);

  const uri = user?.imageUrl;
  const label = user?.firstName?.[0] ?? user?.username?.[0] ?? "?";
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open account menu"
        style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarLetter}>{label.toUpperCase()}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={close}
        statusBarTranslucent
      >
        <View style={[styles.modalOuter, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <Pressable
            style={styles.backdrop}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close account menu"
          />
          <View style={styles.modalCenter} pointerEvents="box-none">
            <View style={styles.panel} accessibilityViewIsModal>
              <View style={styles.panelAccent} />
              <Text style={styles.kicker}>Signed in</Text>
              <Text style={styles.panelTitle}>Account</Text>

              <View style={styles.identity}>
                {uri ? (
                  <Image source={{ uri }} style={styles.panelAvatar} />
                ) : (
                  <View style={[styles.panelAvatar, styles.avatarFallback]}>
                    <Text style={styles.panelAvatarLetter}>{label.toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.identityText}>
                  {displayName ? <Text style={styles.displayName}>{displayName}</Text> : null}
                  {email ? (
                    <Text style={styles.email} numberOfLines={2}>
                      {email}
                    </Text>
                  ) : (
                    <Text style={styles.emailMuted}>No email on file</Text>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <Pressable
                onPress={onSignOut}
                style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutPressed]}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
              >
                <Text style={styles.signOutLabel}>Sign out</Text>
              </Pressable>

              <Pressable
                onPress={close}
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryPressed]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.secondaryLabel}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrap: { marginRight: spacing.sm },
  pressed: { opacity: 0.85 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarFallback: {
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: colors.foreground, fontWeight: "700", fontSize: 14 },

  modalOuter: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  modalCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  panel: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(12,12,15,0.94)",
    padding: spacing.lg,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  /** Thin glow strip — same vibe as countdown / heat accent on web cards */
  panelAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    opacity: 0.85,
  },
  kicker: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.foreground,
    letterSpacing: -0.3,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  panelAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(59,130,246,0.45)",
  },
  panelAvatarLetter: { color: colors.foreground, fontWeight: "800", fontSize: 22 },
  identityText: { flex: 1, minWidth: 0, gap: 4 },
  displayName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.foreground,
  },
  email: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  emailMuted: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(39,39,42,0.9)",
    marginVertical: spacing.lg,
  },
  signOutBtn: {
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.18)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.45)",
    marginBottom: spacing.sm,
  },
  signOutPressed: {
    backgroundColor: "rgba(239,68,68,0.28)",
    opacity: 0.95,
  },
  signOutLabel: {
    color: colors.destructive,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(24,24,27,0.9)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryPressed: {
    backgroundColor: "rgba(39,39,42,0.95)",
  },
  secondaryLabel: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },
});
