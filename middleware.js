import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/* Refreshes the Supabase session cookie on every request and redirects
   anyone without a valid, active-admin session away from anything but
   /login. This is the server-side authorization check — the page
   components below don't get to skip it just because a link is
   hidden in the UI. */
export async function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Public, unauthenticated routes — never gated behind admin login.
  // /join is how someone without an account yet gets one; /api/public/*
  // is the read-only feed the public site will eventually consume.
  if (
    request.nextUrl.pathname.startsWith("/api/apply") ||
    request.nextUrl.pathname.startsWith("/api/public/") ||
    request.nextUrl.pathname.startsWith("/join")
  ) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const res = NextResponse.redirect(url);
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  const disabledSection = DISABLED_SECTIONS.find(
    (base) => request.nextUrl.pathname !== base && request.nextUrl.pathname.startsWith(base + "/")
  );
  if (disabledSection) {
    const url = request.nextUrl.clone();
    url.pathname = disabledSection;
    const res = NextResponse.redirect(url);
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

/* Content types not ready for real use yet — their list pages show a
   "coming soon" placeholder; this collapses any /new or /[id] sub-route
   back to the list page so the disabled state can't be bypassed by URL. */
const DISABLED_SECTIONS = ["/content/goals"];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)"],
};
