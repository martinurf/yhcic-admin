import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AnnouncementTabs from "./announcement-tabs";

export default async function AnnouncementsListPage() {
  const supabase = await createClient();
  /* RLS already scopes this to every shared row plus this viewer's own
     private ones. */
  const { data: items } = await supabase
    .from("announcements")
    .select("id, title, published, is_private, published_at, updated_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const all = items || [];
  const feed = all.filter((a) => a.published);
  const workspace = all.filter((a) => !a.published && !a.is_private);
  const mine = all.filter((a) => a.is_private);

  return (
    <div className="container">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Announcements</h1>
          <p className="page__sub">Draft privately, work on it with the team, or publish straight to the member feed.</p>
        </div>
        <Link href="/content/announcements/new" className="btn btn--primary">New announcement</Link>
      </div>

      <AnnouncementTabs feed={feed} workspace={workspace} mine={mine} />
    </div>
  );
}
