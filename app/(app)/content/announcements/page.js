import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AnnouncementTabs from "./announcement-tabs";

export default async function AnnouncementsListPage() {
  const supabase = await createClient();
  /* RLS already scopes this to every shared row plus this viewer's own
     private ones. */
  const { data: items } = await supabase
    .from("announcements")
    .select("id, title, body, published, is_private, published_at, updated_at, media(storage_key)")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const all = items || [];
  const feed = all.filter((a) => a.published);
  const workspace = all.filter((a) => !a.published && !a.is_private);
  const mine = all.filter((a) => a.is_private);

  return (
    <div className="container">
      <Link href="/content" className="backlink">
        <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
        Content library
      </Link>
      <div className="section-hero">
        <div className="section-hero-row">
          <div>
            <p className="page__eyebrow">YHCIC workspace</p>
            <h1>Announcements.</h1>
            <p className="desc">
              Share updates, events, and photos with members. Draft privately, work on it with the team, or publish
              straight to the member feed.
            </p>
          </div>
          <Link href="/content/announcements/new" className="btn btn--primary">New announcement</Link>
        </div>
      </div>

      <AnnouncementTabs feed={feed} workspace={workspace} mine={mine} />
    </div>
  );
}
