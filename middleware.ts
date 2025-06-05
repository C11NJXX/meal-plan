import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/subscribe/(.*)",
  "/api/webhook(.*)",
]);

const isSignUpRoute = createRouteMatcher(["/sign-up(/*)"]);

export default clerkMiddleware(async (auth, req) => {
  const userAuth = await auth();
  const { userId } = userAuth;
  const { pathname, origin } = req.nextUrl;

  // 判断是否在访问公共页面，或者是在登录状态访问非公共页面，如果是非登录状态访问非公共页面，则重定向
  if (!isPublicRoute(req) && !userId) {
    console.log("Access Denied");
    return NextResponse.redirect(new URL("/sign-up", origin));
  }
  //判断是否在登录状态访问登录界面，若是则跳转到meal-plan页面
  if (isSignUpRoute(req) && userId) {
    return NextResponse.redirect(new URL("/meal-plan", origin));
  }

  //完成检查操作
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
