import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  allowSearchIndexing,
  getSiteUrl,
} from "@/lib/seo/site";

export type PageMetadataInput = {
  title: string;
  description?: string;
  pathname: string;
  noIndex?: boolean;
};

function resolveTitle(title: string): string {
  return title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
}

function ogImageUrl(): string {
  return new URL(DEFAULT_OG_IMAGE_PATH, getSiteUrl()).href;
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  pathname,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonicalPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pageUrl = new URL(canonicalPath, getSiteUrl()).href;
  const resolvedTitle = resolveTitle(title);
  const indexingBlocked = noIndex || !allowSearchIndexing();

  return {
    title: resolvedTitle,
    description,
    alternates: { canonical: canonicalPath },
    robots: indexingBlocked
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
          },
        },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: pageUrl,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
      images: [ogImageUrl()],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [ogImageUrl()],
    },
  };
}

export function rootLayoutMetadata(): Metadata {
  const indexingBlocked = !allowSearchIndexing();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: "/" },
    robots: indexingBlocked
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: getSiteUrl(),
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
