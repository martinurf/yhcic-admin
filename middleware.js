import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/* Refreshes the Supabase session cookie on every request and redirects
   anyone without a valid, active-admin session away from anything but
   /login. This is the server-side authorization check — the page
   components below don't get to skip it just because a link is
   hidden in the UI. */
export async function middleware(request) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
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
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const disabledSection = DISABLED_SECTIONS.find(
    (base) => request.nextUrl.pathname !== base && request.nextUrl.pathname.startsWith(base + "/")
  );
  if (disabledSection) {
    const url = request.nextUrl.clone();
    url.pathname = disabledSection;
    return NextResponse.redirect(url);
  }

  return response;
}

/* Content types not ready for real use yet — their list pages show a
   "coming soon" placeholder; this collapses any /new or /[id] sub-route
   back to the list page so the disabled state can't be bypassed by URL. */
const DISABLED_SECTIONS = ["/content/announcements", "/content/projects", "/content/goals"];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
