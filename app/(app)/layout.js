import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import Nav from "./nav";

const SOON = ["Announcements", "Projects", "Goals"];

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let pendingCount = 0;
  if (user) {
    const [{ data }, { count }] = await Promise.all([
      supabase.from("admin_profiles").select("username, display_name").eq("id", user.id).maybeSingle(),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    profile = data;
    pendingCount = count ?? 0;
  }

  return (
    <div className="shell">
      <main className="main">{children}</main>
      <Nav soon={SOON} profile={profile} onSignOut={signOut} pendingCount={pendingCount} />
    </div>
  );
}
