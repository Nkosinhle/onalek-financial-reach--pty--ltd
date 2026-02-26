import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/not-authorized",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) return;

  const { isAuthenticated, redirectToSignIn, sessionClaims } = await auth();

  // Not signed in -> go sign in
  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  // Admin routes -> must have role=admin in public metadata
  if (isAdminRoute(req)) {
    const role = (sessionClaims?.metadata as any)?.role;

    if (role !== "admin") {
      return Response.redirect(new URL("/not-authorized", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};