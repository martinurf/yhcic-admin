import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { MenuProvider } from "./menu-context";
import Nav, { PageMenuButton } from "./nav";
import MenuSheet from "./menu-sheet";

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("admin_profiles").select("username, display_name").eq("id", user.id).maybeSingle();
    profile = data;
  }

  return (
    <div className="shell">
      <MenuProvider>
        <div className="app">
          <main className="main">{children}</main>
          <PageMenuButton />
        </div>
        <Nav />
        <MenuSheet profile={profile} onSignOut={signOut} />
      </MenuProvider>
    </div>
  );
}
