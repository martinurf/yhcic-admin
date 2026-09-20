"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Plain-text remarks on a project or source's thread — separate from
   forks (full working copies). Any active admin can post one; only the
   author can remove their own. */
export async function postComment(parentTable, parentId, body, path) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const text = String(body || "").trim();
  if (!text) return { error: "Write something first." };

  const { error } = await supabase.from("content_comments").insert({
    parent_table: parentTable,
    parent_id: parentId,
    author_id: user.id,
    body: text,
  });
  if (error) return { error: error.message };

  revalidatePath(path);
  return { ok: true };
}

export async function deleteComment(id, path) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("content_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) return { error: error.message };

  revalidatePath(path);
  return { ok: true };
}
