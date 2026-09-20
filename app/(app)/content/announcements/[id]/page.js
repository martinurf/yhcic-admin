import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import { mediaPublicUrl } from "@/lib/media-url";
import AnnouncementForm from "../form";
import AnnouncementPost from "../post";

export default async function EditAnnouncementPage({ params }) {
  const { id } = await params;
  const me = await requireActiveAdmin();
  if (!me) redirect("/login");

  const supabase = await createClient();
  const { data: announcement } = await supabase
    .from("announcements")
    .select("*, media(storage_key)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!announcement) notFound();

  const isAuthor = announcement.created_by === me.id;
  const imageUrl = mediaPublicUrl(announcement.media?.storage_key);

  /* Published = official and out to members — only the author can
     touch it after that, everyone else gets a read-only forum-post
     view. A shared (not private, not yet published) draft is exactly
     the opposite: it's the collaborative club workspace, so any
     officer who can see it can also help write it. A private draft
     never reaches this branch at all — RLS already hid the row from
     anyone but its creator before the query above even ran. */
  const canEdit = isAuthor || !announcement.published;
  if (!canEdit) {
    /* RLS on admin_profiles only lets an officer read their own row
       (admin_can_read_own_profile) — legitimate for privacy, but it
       means the session-scoped client can't resolve anyone else's
       name here. Service role, same as the Team page already does. */
    const admin = createAdminClient();
    const { data: author } = await admin
      .from("admin_profiles")
      .select("display_name, username")
      .eq("id", announcement.created_by)
      .maybeSingle();

    return (
      <div className="container">
        <p className="page__eyebrow"><Link href="/content/announcements" className="muted">&larr; Announcements</Link></p>
        <AnnouncementPost
          announcement={announcement}
          imageUrl={imageUrl}
          authorName={author?.display_name || author?.username || "YHCIC"}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <p className="page__eyebrow"><Link href="/content/announcements" className="muted">&larr; Announcements</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>Edit announcement</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <AnnouncementForm announcement={announcement} imageUrl={imageUrl} />
      </div>
    </div>
  );
}
