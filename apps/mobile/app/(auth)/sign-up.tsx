import { useSSO, useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "@fortnite-live-countdown/ui";

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onEmailSignUp = async () => {
    if (!isLoaded || !signUp || !setActive) return;
    setBusy(true);
    setErr(null);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });
      if (signUp.status === "complete" && signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
        router.replace("/(tabs)");
        return;
      }
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setErr("We sent a code to your email. Open it from your inbox or use Google to sign in now.");
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "errors" in e
          ? String((e as { errors?: { message?: string }[] }).errors?.[0]?.message ?? e)
          : e instanceof Error
            ? e.message
            : "Could not sign up";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (createdSessionId && ssoSetActive) {
        await ssoSetActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.hint}>
        If Clerk requires an email code, complete the flow from your inbox or use Google.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.mutedForeground}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <Pressable
        style={[styles.btn, styles.primary]}
        onPress={() => void onEmailSignUp()}
        disabled={busy || !isLoaded}
      >
        {busy ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={styles.btnPrimaryText}>Sign up</Text>}
      </Pressable>
      <Pressable
        style={[styles.btn, styles.secondary]}
        onPress={() => void onGoogle()}
        disabled={busy}
      >
        <Text style={styles.btnSecondaryText}>Continue with Google</Text>
      </Pressable>
      <Link href="/(auth)/sign-in" style={styles.link}>
        <Text style={styles.linkText}>I already have an account</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 20,
    paddingTop: 48,
    backgroundColor: colors.background,
    gap: 12,
  },
  title: { color: colors.foreground, fontSize: 22, fontWeight: "700", marginBottom: 4 },
  hint: { color: colors.mutedForeground, fontSize: 12, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  err: { color: colors.destructive, fontSize: 13 },
  btn: {
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: { backgroundColor: colors.primary, marginTop: 8 },
  secondary: { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border },
  btnPrimaryText: { color: colors.primaryForeground, fontWeight: "600" },
  btnSecondaryText: { color: colors.foreground, fontWeight: "600" },
  link: { marginTop: 16, alignSelf: "center" },
  linkText: { color: colors.primary, fontSize: 16 },
});
