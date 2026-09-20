import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectsListPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("projects")
    .select("id, title, status, published, updated_at")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Projects</h1>
        </div>
        <Link href="/content/projects/new" className="btn btn--primary">New project</Link>
      </div>

      <div className="list">
        {!items?.length ? (
          <p className="list__empty">No projects yet.</p>
        ) : (
          items.map((p) => (
            <Link key={p.id} href={`/content/projects/${p.id}`} className="list__row">
              <div>
                <span className="list__title">{p.title}</span>
                <p className="list__sub">{p.status}</p>
              </div>
              <span className={`badge badge--${p.published ? "published" : "draft"}`}>
                {p.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
