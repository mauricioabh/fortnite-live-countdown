import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";

import { QueryProvider } from "@/components/providers/query-provider";

import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const clerkAppearance = {
  variables: {
    colorBackground: "#0c0c0f",
    colorInputBackground: "#050508",
    colorInputText: "#f4f4f5",
    colorText: "#f4f4f5",
    colorTextSecondary: "#a1a1aa",
    colorPrimary: "#3b82f6",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    colorNeutral: "#27272a",
    borderRadius: "0.5rem",
  },
  elements: {
    card: "bg-card border border-border shadow-none",
    footer: "bg-card border-t border-border",
    footerActionText: "text-muted-foreground",
    footerActionLink: "text-primary hover:text-primary",
    socialButtonsBlockButton:
      "border border-border bg-background text-foreground hover:bg-secondary",
    socialButtonsBlockButtonText: "text-foreground",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
    formFieldLabel: "text-foreground",
    formFieldInput:
      "border border-input bg-background text-foreground focus:border-primary focus:ring-primary",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-none",
  },
};

const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to Live countdown: for fortnite fans",
      subtitle: "Welcome back! Please sign in to continue",
    },
  },
  signUp: {
    start: {
      title: "Sign up for Live countdown: for fortnite fans",
      subtitle: "Create your account to continue",
    },
  },
};

export const metadata: Metadata = {
  title: "Live Countdown: for Fortnite Fans",
  description:
    "Live countdowns for Fortnite milestones and shop resets, built for fans.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      localization={clerkLocalization}
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <QueryProvider>{children}</QueryProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
