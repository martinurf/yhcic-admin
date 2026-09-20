import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { MenuProvider } from "./menu-context";
import Nav, { PageMenuButton } from "./nav";
import MenuSheet from "./menu-sheet";

async function countRequests(supabase, table) {
  // Runs in the shared layout on every page — must not take the whole
  // panel down if migration 0010 (requested_at) hasn't run yet.
  try {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .not("requested_at", "is", null)
      .eq("published", false)
      .is("deleted_at", null);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let requestCount = 0;
  if (user) {
    const [{ data }, memberRequests, projectRequests] = await Promise.all([
      supabase.from("admin_profiles").select("username, display_name").eq("id", user.id).maybeSingle(),
      countRequests(supabase, "members"),
      countRequests(supabase, "projects"),
    ]);
    profile = data;
    requestCount = memberRequests + projectRequests;
  }

  return (
    <div className="shell">
      <MenuProvider>
        <div className="app">
          <main className="main">{children}</main>
          <PageMenuButton />
        </div>
        <Nav />
        <MenuSheet profile={profile} onSignOut={signOut} requestCount={requestCount} />
      </MenuProvider>
    </div>
  );
}
