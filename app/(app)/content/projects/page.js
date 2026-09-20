import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RequestPublishButton from "../request-publish-button";
import { requestProjectPublish } from "./actions";

export default async function ProjectsListPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("projects")
    .select("id, title, status, published, requested_at, updated_at")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  const publishedCount = items?.filter((p) => p.published).length || 0;

  return (
    <div className="container">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Current projects</h1>
        </div>
        <Link href="/content/projects/new" className="btn btn--primary">New project</Link>
      </div>

      <p className="fld__hint" style={{ marginBottom: 14 }}>
        {publishedCount} of {items?.length || 0} published to the public site.
      </p>

      <div className="list">
        {!items?.length ? (
          <p className="list__empty">No projects yet — these stay private to the club until published.</p>
        ) : (
          items.map((p) => {
            const status = p.published
              ? { label: "Published", tone: "published" }
              : p.requested_at
              ? { label: "Requested", tone: "pending" }
              : { label: "Draft", tone: "draft" };
            return (
              <div key={p.id} className="list__row">
                <Link href={`/content/projects/${p.id}`} className="list__row-link">
                  <span className="list__title">{p.title}</span>
                  <p className="list__sub">{p.status}</p>
                </Link>
                <div className="list__row-actions">
                  <span className={`badge badge--${status.tone}`}>{status.label}</span>
                  {status.tone === "draft" ? (
                    <RequestPublishButton id={p.id} requestAction={requestProjectPublish} />
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
