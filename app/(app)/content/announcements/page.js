import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AnnouncementsListPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("announcements")
    .select("id, title, published, published_at, updated_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Announcements</h1>
        </div>
        <Link href="/content/announcements/new" className="btn btn--primary">New announcement</Link>
      </div>

      <div className="list">
        {!items?.length ? (
          <p className="list__empty">No announcements yet.</p>
        ) : (
          items.map((a) => (
            <Link key={a.id} href={`/content/announcements/${a.id}`} className="list__row">
              <div>
                <span className="list__title">{a.title}</span>
                <p className="list__sub">Updated {new Date(a.updated_at).toLocaleString()}</p>
              </div>
              <span className={`badge badge--${a.published ? "published" : "draft"}`}>
                {a.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
