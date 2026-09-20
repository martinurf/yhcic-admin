"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID = ["pending", "accepted", "rejected"];

/* RLS (admin_can_update_application_status) is what actually enforces
   that only an active admin can do this — this action doesn't grant
   the permission, it just exercises it under the caller's own session. */
export async function updateStatus(applicationId, newStatus) {
  if (!VALID.includes(newStatus)) return { error: "Invalid status." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: current, error: readError } = await supabase
    .from("applications")
    .select("status, name, major, phone")
    .eq("id", applicationId)
    .maybeSingle();
  if (readError || !current) return { error: "Application not found." };

  const { error: updateError } = await supabase
    .from("applications")
    .update({ status: newStatus, status_changed_by: user.id, status_changed_at: new Date().toISOString() })
    .eq("id", applicationId);
  if (updateError) return { error: "Could not update status." };

  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    previous_status: current.status,
    new_status: newStatus,
    changed_by: user.id,
  });

  /* Accepting an application seeds a draft member with what we already
     know (major, phone — role is left blank, an officer fills that in),
     instead of making the officer retype it. The unique index on
     source_application_id makes this idempotent — accept/reject/accept
     again can't spawn a second draft, so a duplicate-key error here is
     expected and silently ignored rather than surfaced as a failure. */
  if (newStatus === "accepted") {
    const { error: memberError } = await supabase.from("members").insert({
      name: current.name,
      role: "",
      major: current.major,
      phone: current.phone,
      published: false,
      source_application_id: applicationId,
      created_by: user.id,
      updated_by: user.id,
    });
    if (memberError && memberError.code !== "23505") {
      console.error("Draft member creation failed:", memberError.message);
    }
    revalidatePath("/content/members");
  }

  /* Leaving "accepted" (back to pending, or rejected) retracts the
     draft it created — the application is no longer accepted, so an
     un-published draft shouldn't keep sitting in the members list.
     A member that already made it live stays untouched: publishing
     detaches it from the application's fate. Clearing
     source_application_id alongside the soft delete frees the unique
     index slot so accepting the same application again can insert a
     fresh draft instead of colliding with this now-deleted one. */
  if (current.status === "accepted" && newStatus !== "accepted") {
    const { error: retractError } = await supabase
      .from("members")
      .update({ deleted_at: new Date().toISOString(), source_application_id: null, updated_by: user.id })
      .eq("source_application_id", applicationId)
      .eq("published", false)
      .is("deleted_at", null);
    if (retractError) {
      console.error("Draft member retraction failed:", retractError.message);
    }
    revalidatePath("/content/members");
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
  return { ok: true };
}
