import { signOut } from "./actions";
import { MenuProvider } from "./menu-context";
import Nav, { PageMenuButton } from "./nav";
import MenuSheet from "./menu-sheet";
import { requireActiveAdmin } from "@/lib/require-admin";

// Admin data changes constantly (applications, requests, content) —
// never let Next.js's fetch cache serve a stale page here.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }) {
  const profile = await requireActiveAdmin();

  return (
    <div className="shell">
      <MenuProvider>
        <div className="app">
          <main className="main">{children}</main>
          <PageMenuButton />
        </div>
        <Nav />
        <MenuSheet profile={profile} onSignOut={signOut} isOwner={!!profile?.is_owner} />
      </MenuProvider>
    </div>
  );
}
