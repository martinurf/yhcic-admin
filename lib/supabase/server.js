import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/* Server-side client for Server Components / Server Actions / Route
   Handlers. Sessions live in real httpOnly cookies via @supabase/ssr —
   this is specifically what gets the session-security property a
   client-side-only Supabase integration does not give you for free. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component during render — middleware
            // is what actually refreshes the session in that case
          }
        },
      },
    }
  );
}
