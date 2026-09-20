"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Shared save path for all four content tables. Snapshots the row as
   it was BEFORE overwriting it — the lightweight revision model: not
   a diff, just enough to undo "right record, wrong content" without
   restoring the whole database for one paragraph. A rollback (see
   restoreRevision) creates a new revision too; history is never
   deleted by using it. */
export async function saveContent(table, id, data, path) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  if (id) {
    const { data: prev } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
    if (prev) {
      await supabase.from("content_revisions").insert({
        content_type: table,
        content_id: id,
        previous_data: prev,
        changed_by: user.id,
      });
    }
    const { error } = await supabase
      .from(table)
      .update({ ...data, updated_by: user.id, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from(table).insert({ ...data, created_by: user.id, updated_by: user.id });
    if (error) return { error: error.message };
  }

  revalidatePath(path);
  return { ok: true };
}

/* Members and Projects don't self-publish. An officer can only ask —
   this timestamps the ask. Martín adds it to the (static, no-build-step)
   public site by hand, then resolves the request below. */
export async function requestPublish(table, id, path) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: row } = await supabase.from(table).select("published").eq("id", id).maybeSingle();
  if (!row) return { error: "Not found." };
  if (row.published) return { error: "Already published." };

  const { error } = await supabase
    .from(table)
    .update({ requested_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(path);
  revalidatePath("/requests");
  return { ok: true };
}

/* Martín-side resolution of a request: either mark it live (he just
   added it to the public site by hand) or dismiss it without
   publishing — both just clear it from the queue. */
export async function resolvePublishRequest(table, id, publish, path) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from(table)
    .update({ published: publish, requested_at: null, updated_by: user.id })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(path);
  revalidatePath("/requests");
  return { ok: true };
}

/* The only deletion path that exists anywhere in this app — RLS has no
   delete policy on any content table, so this (an update setting
   deleted_at) is structurally the sole way to remove something, and it
   is always recoverable. */
export async function softDeleteContent(table, id, path) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(path);
  return { ok: true };
}
