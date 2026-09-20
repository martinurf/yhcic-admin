import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import NavLink from "./nav-link";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/content/announcements", label: "Announcements" },
  { href: "/content/projects", label: "Projects" },
  { href: "/content/goals", label: "Goals" },
  { href: "/content/members", label: "Members" },
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
      <aside className="side">
        <span className="side__mark">YHCIC</span>
        <p className="side__meta">Admin panel</p>

        <nav className="side__nav">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="side__foot">
          <hr className="hair" style={{ margin: "0 0 14px" }} />
          <p className="side__who">
            Signed in as <b>{profile?.display_name || profile?.username || "—"}</b>
          </p>
          <form action={signOut}>
            <button className="btn btn--sm" type="submit" style={{ width: "100%" }}>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
