import path from "node:path";

/**
 * Clerk E2E credentials — supports both naming conventions in .env.local / CI secrets.
 */
export function getE2EClerkEmail(): string | undefined {
  return process.env.E2E_CLERK_USER_EMAIL ?? process.env.CLERK_E2E_USER_EMAIL;
}

export function getE2EClerkPassword(): string | undefined {
  return (
    process.env.E2E_CLERK_USER_PASSWORD ?? process.env.CLERK_E2E_USER_PASSWORD
  );
}

export function loadPlaywrightEnv(appDir: string): void {
  try {
    process.loadEnvFile(path.join(appDir, ".env.local"));
  } catch {
    // CI provides env via workflow
  }

  if (
    !process.env.CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ) {
    process.env.CLERK_PUBLISHABLE_KEY =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  }
}
