/* Data helpers for the fork+comment thread — plain reads, not server
   actions, so they're called straight from server components. */

export async function loadComments(supabase, parentTable, parentId) {
  const { data } = await supabase
    .from("content_comments")
    .select("id, body, created_at, author:admin_profiles!author_id(display_name, username)")
    .eq("parent_table", parentTable)
    .eq("parent_id", parentId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function loadForks(supabase, table, parentId, extraColumns = "") {
  const { data } = await supabase
    .from(table)
    .select(`id, title, updated_at${extraColumns}, author:admin_profiles!created_by(display_name, username)`)
    .eq("forked_from_id", parentId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: true });
  return data || [];
}
