import { createClient } from "@/lib/supabase/server";

/* Service-role code (invitations, admin_profiles writes) bypasses RLS
   entirely, so it must do its own authorization check instead of
   relying on the database to refuse an unprivileged caller. Call this
   before any such write. */
export async function requireActiveAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, username, display_name, active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active) return null;
  return profile;
}
