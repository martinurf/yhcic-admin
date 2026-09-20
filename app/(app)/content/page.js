import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ContentHubPage() {
  const supabase = await createClient();

  const [{ count: projectTotal }, { count: projectPublished }, { count: announcementCount }] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("projects").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("published", true),
    supabase.from("announcements").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("published", true),
  ]);

  return (
    <div className="container">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Content</h1>
          <p className="page__sub">Publish your projects, sources, and announcements — or save them as drafts first.</p>
        </div>
      </div>

      <div className="content-grid">
        <Link href="/content/projects" className="ccard">
          <span className="ccard__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18h6M10 22h4M8.5 14.5A6 6 0 1 1 15.5 14.5c-1 .7-1.5 1.4-1.5 2.5h-4c0-1.1-.5-1.8-1.5-2.5z" />
            </svg>
          </span>
          <h2 className="ccard__title">Projects</h2>
          <p className="ccard__desc">The club&rsquo;s private project roster &mdash; add, edit, and track work in progress.</p>
          <span className="ccard__sub">{projectPublished || 0} of {projectTotal || 0} published to the public site &rarr;</span>
        </Link>

        <Link href="/content/sources" className="ccard">
          <span className="ccard__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 3v12m0 0-4-4m4 4 4-4" />
              <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
            </svg>
          </span>
          <h2 className="ccard__title">Sources &amp; Research</h2>
          <p className="ccard__desc">Upload files, articles, and research the club is working from.</p>
          <span className="ccard__sub">Open &rarr;</span>
        </Link>
      </div>

      <Link href="/content/announcements" className="ccard ccard--wide">
        <span className="ccard__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="m3 11 14-5v12L3 13z" />
            <path d="M11 16v4H7l-1-6M20 9v6" />
          </svg>
        </span>
        <h2 className="ccard__title">Announcements</h2>
        <p className="ccard__desc">{announcementCount || 0} published to the public site.</p>
      </Link>
    </div>
  );
}
