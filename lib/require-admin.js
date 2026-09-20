import { createClient } from "@/lib/supabase/server";

/* Service-role code (invitations, admin_profiles writes) bypasses RLS
   entirely, so it must do its own authorization check instead of
   relying on the database to refuse an unprivileged caller. Call this
   before any such write. */
export async function requireActiveAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id, username, display_name, active, is_owner")
    .eq("id", user.id)
    .maybeSingle();

  /* is_owner (migration 0011) may not exist in the database yet — fall
     back to the columns guaranteed to exist so a pending migration
     degrades to "nobody is owner" instead of locking every admin out. */
  let profile = data;
  if (error) {
    const fallback = await supabase
      .from("admin_profiles")
      .select("id, username, display_name, active")
      .eq("id", user.id)
      .maybeSingle();
    profile = fallback.data ? { ...fallback.data, is_owner: false } : null;
  }

  if (!profile?.active) return null;
  return profile;
}

/* Requests review is owner-only — panel-only officers can send a
   request, but only the sole technical owner resolves it. */
export async function requireOwner() {
  const profile = await requireActiveAdmin();
  if (!profile?.is_owner) return null;
  return profile;
}
