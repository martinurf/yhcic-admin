import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MembersListPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("members")
    .select("id, name, role, published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Members</h1>
        </div>
        <Link href="/content/members/new" className="btn btn--primary">New member</Link>
      </div>

      <div className="list">
        {!items?.length ? (
          <p className="list__empty">No members yet.</p>
        ) : (
          items.map((m) => (
            <Link key={m.id} href={`/content/members/${m.id}`} className="list__row">
              <div>
                <span className="list__title">{m.name}</span>
                <p className="list__sub">{m.role}</p>
              </div>
              <span className={`badge badge--${m.published ? "published" : "draft"}`}>
                {m.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
