import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/offline",
  "/robots.txt",
  "/sitemap.xml",
  "/data-request(.*)",
  "/privacy-policy(.*)",
  "/api/cron(.*)",
  "/api/debug/sentry",
  "/api/events(.*)",
  "/api/news(.*)",
  "/api/shop(.*)",
  // Handler returns 401 when unauthenticated; avoid middleware HTML 404 on API clients.
  "/api/favorites(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
