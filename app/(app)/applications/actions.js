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
    .select("status")
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

  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
  return { ok: true };
}
