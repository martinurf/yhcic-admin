import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import ContentTopbar from "../../content-topbar";
import SourceDetail from "./source-detail";

export default async function SourceDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { edit } = await searchParams;
  const me = await requireActiveAdmin();
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: resource }, { data: comments }, { count: pendingCount }] = await Promise.all([
    admin
      .from("resources")
      .select("*, uploader:admin_profiles!uploaded_by(display_name, username)")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("content_comments")
      .select("id, body, created_at, author:admin_profiles!author_id(display_name, username)")
      .eq("parent_table", "resources")
      .eq("parent_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  if (!resource) notFound();

  let originTitle = null;
  if (resource.forked_from_id) {
    const { data: original } = await admin.from("resources").select("title").eq("id", resource.forked_from_id).maybeSingle();
    originTitle = original?.title || null;
  }

  const canEdit = Boolean(me) && resource.uploaded_by === me.id;

  return (
    <>
      <ContentTopbar title="Source" pendingCount={pendingCount || 0} />
      <div className="container flush-top">
        <p className="page__eyebrow">
          <Link href="/content/sources" className="muted">&larr; Sources &amp; research</Link>
        </p>
        <SourceDetail resource={resource} comments={comments || []} originTitle={originTitle} canEdit={canEdit} editing={canEdit && Boolean(edit)} />
      </div>
    </>
  );
}
