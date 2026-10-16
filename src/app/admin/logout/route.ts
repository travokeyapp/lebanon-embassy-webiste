import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-token";

// Clears the session cookie and sends the browser to the login page. Used
// when a session is found to be stale (deactivated user, changed password).
export async function GET(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  const reason = request.nextUrl.searchParams.get("reason");
  if (reason) {
    loginUrl.searchParams.set("reason", reason);
  }
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
