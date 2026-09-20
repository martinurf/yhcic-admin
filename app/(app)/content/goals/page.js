import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function GoalsListPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("goals")
    .select("id, n, title, stage, published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Goals</h1>
        </div>
        <Link href="/content/goals/new" className="btn btn--primary">New goal</Link>
      </div>

      <div className="list">
        {!items?.length ? (
          <p className="list__empty">No goals yet.</p>
        ) : (
          items.map((g) => (
            <Link key={g.id} href={`/content/goals/${g.id}`} className="list__row">
              <div>
                <span className="list__title">{g.n} — {g.title}</span>
                <p className="list__sub">{g.stage}</p>
              </div>
              <span className={`badge badge--${g.published ? "published" : "draft"}`}>
                {g.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
