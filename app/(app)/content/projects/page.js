import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProjectTabs from "./project-tabs";

export default async function ProjectsListPage() {
  const supabase = await createClient();
  /* RLS already scopes this to every shared row plus this viewer's own
     private ones — no extra filtering needed to keep someone else's
     private draft out of the list. */
  const { data: items } = await supabase
    .from("projects")
    .select("id, title, status, published, is_private, requested_at, updated_at, media(storage_key)")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  const all = items || [];
  const publishedCount = all.filter((p) => p.published).length;
  const workspace = all.filter((p) => !p.is_private);
  const mine = all.filter((p) => p.is_private);
  const requests = all.filter((p) => p.requested_at && !p.published);

  return (
    <div className="container">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Current projects</h1>
          <p className="page__sub">Plan, write, and collaborate — privately, until it's ready for the club or the public site.</p>
        </div>
        <Link href="/content/projects/new" className="btn btn--primary">New project</Link>
      </div>

      <p className="fld__hint" style={{ marginBottom: 14 }}>
        {publishedCount} of {all.length} published to the public site.
      </p>

      <ProjectTabs workspace={workspace} mine={mine} requests={requests} />
    </div>
  );
}
