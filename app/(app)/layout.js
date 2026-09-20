import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import Nav from "./nav";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/content/members", label: "Members" },
  { href: "/team", label: "Team" },
  { href: "/content/announcements", label: "Announcements", disabled: true },
  { href: "/content/projects", label: "Projects", disabled: true },
  { href: "/content/goals", label: "Goals", disabled: true },
];

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("admin_profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <div className="shell">
      <Nav items={NAV} profile={profile} onSignOut={signOut} />
      <main className="main">{children}</main>
    </div>
  );
}
