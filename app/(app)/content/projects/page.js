import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ContentTopbar from "../content-topbar";
import ProjectTabs from "./project-tabs";

export default async function ProjectsListPage() {
  const supabase = await createClient();
  const [{ data: items }, { count: pendingCount }] = await Promise.all([
    /* RLS already scopes this to every shared row plus this viewer's
       own private ones — no extra filtering needed to keep someone
       else's private draft out of the list. */
    supabase
      .from("projects")
      .select("id, title, status, published, is_private, requested_at, updated_at, media(storage_key)")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const all = items || [];
  const publishedCount = all.filter((p) => p.published).length;
  const workspace = all.filter((p) => !p.is_private);
  const mine = all.filter((p) => p.is_private);
  const requests = all.filter((p) => p.requested_at && !p.published);

  return (
    <>
      <ContentTopbar title="Projects" pendingCount={pendingCount || 0} />
      <div className="container flush-top">
        <Link href="/content" className="backlink">
          <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
          Content library
        </Link>
        <div className="section-hero">
          <div className="section-hero-row">
            <div>
              <p className="page__eyebrow">YHCIC workspace</p>
              <h1>Projects.</h1>
              <p className="desc">
                Plan, write, and collaborate privately. When the work is ready, send a separate request for review
                before it reaches the official public site. {publishedCount} of {all.length} published so far.
              </p>
            </div>
            <Link href="/content/projects/new" className="btn btn--primary">New project</Link>
          </div>
        </div>

        <ProjectTabs workspace={workspace} mine={mine} requests={requests} />
      </div>
    </>
  );
}
