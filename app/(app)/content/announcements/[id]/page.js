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

  /* Only the officer who posted it gets the edit form — everyone else
     just reads it, like a forum post, with no way to change or remove
     someone else's announcement. */
  if (!isAuthor) {
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
