"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const GENERIC_ERROR = "Incorrect username or password.";
const DECOY_USER_ID = "00000000-0000-0000-0000-000000000000";

/* Username -> email -> Supabase Auth, entirely server-side. The browser
   never sees which part failed — unknown username, wrong password, and
   a disabled account all return the exact same message. A real rate
   limiter (per-IP and per-username) belongs in front of this before
   this panel handles real students' data day to day; not built yet —
   noted here rather than left silently assumed. */
export async function signIn(_prevState, formData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Enter your username and password." };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("admin_profiles")
    .select("id, active")
    .ilike("username", username)
    .maybeSingle();

  if (!profile || !profile.active) {
    // do roughly the same work as a real lookup so an unknown username
    // doesn't resolve conspicuously faster than a real one
    await admin.auth.admin.getUserById(DECOY_USER_ID).catch(() => {});
    return { error: GENERIC_ERROR };
  }

  const { data: userRecord, error: lookupError } = await admin.auth.admin.getUserById(profile.id);
  if (lookupError || !userRecord?.user?.email) {
    return { error: GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userRecord.user.email,
    password,
  });

  if (signInError) {
    return { error: GENERIC_ERROR };
  }

  redirect("/");
}
