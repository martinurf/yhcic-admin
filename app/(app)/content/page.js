import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireActiveAdmin } from "@/lib/require-admin";

export default async function ContentHubPage() {
  const me = await requireActiveAdmin();
  const supabase = await createClient();

  const [
    { count: projectCount },
    { count: announcementPublished },
    { count: sourceCount },
    { data: recentProject },
    { data: recentAnnouncement },
  ] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("announcements").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("published", true),
    supabase.from("resources").select("id", { count: "exact", head: true }).is("deleted_at", null),
    me
      ? supabase
          .from("projects")
          .select("id, title, updated_at")
          .is("deleted_at", null)
          .eq("published", false)
          .eq("updated_by", me.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null },
    me
      ? supabase
          .from("announcements")
          .select("id, title, updated_at")
          .is("deleted_at", null)
          .eq("published", false)
          .eq("updated_by", me.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null },
  ]);

  /* Whichever of the two most-recently-touched drafts is actually the
     more recent one — a plain "last edited" resume link, not tied to
     private vs. shared, since RLS already made sure this can only be
     something the viewer is allowed to see in the first place. */
  const continueItem = [
    recentProject ? { ...recentProject, kind: "Project", href: `/content/projects/${recentProject.id}` } : null,
    recentAnnouncement ? { ...recentAnnouncement, kind: "Announcement", href: `/content/announcements/${recentAnnouncement.id}` } : null,
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

  return (
    <div className="container" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div style={{ padding: "0 clamp(20px, 4vw, 43px)" }}>
        <p className="page__eyebrow">Content</p>
      </div>

      <section className="content-hero">
        <h1>
          <span>Create.</span>
          <span>Research.</span>
          <span>Publish.</span>
        </h1>
        <div className="hero-rule" />
        <p className="sub">Club content, organized in one place.</p>
      </section>

      <div className="hub-grid">
        <Link href="/content/projects" className="hub-card">
          <span className="hub-card__index">01</span>
          <span className="hub-card__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
          <span className="hub-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M8.5 14.5A6 6 0 1 1 15.5 14.5c-1 .7-1.5 1.4-1.5 2.5h-4c0-1.1-.5-1.8-1.5-2.5z" /></svg>
          </span>
          <h2>Projects</h2>
          <p>Plan, write, and collaborate on club initiatives.</p>
          <span className="hub-card__stat">{projectCount || 0} active</span>
        </Link>

        <Link href="/content/announcements" className="hub-card">
          <span className="hub-card__index">02</span>
          <span className="hub-card__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
          <span className="hub-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m3 11 14-5v12L3 13z" /><path d="M11 16v4H7l-1-6M20 9v6" /></svg>
          </span>
          <h2>Announcements</h2>
          <p>Share news, updates, and events with members.</p>
          <span className="hub-card__stat">{announcementPublished || 0} published</span>
        </Link>

        <Link href="/content/sources" className="hub-card">
          <span className="hub-card__index">03</span>
          <span className="hub-card__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
          <span className="hub-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 3v12m0 0-4-4m4 4 4-4" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
          </span>
          <h2>Sources &amp; Research</h2>
          <p>Save articles, documents, and notes.</p>
          <span className="hub-card__stat">{sourceCount || 0} sources</span>
        </Link>

        <span className="hub-card disabled" aria-hidden="true">
          <span className="hub-card__index">04</span>
          <span className="hub-card__icon">
            <svg viewBox="0 0 24 24"><path d="M4 20h16M8 20V9M14 20V5M20 20v-7" /><rect x="17" y="4" width="6" height="6" rx="1" /></svg>
          </span>
          <h2>Portfolio</h2>
          <p>Showcase our best work (coming soon).</p>
          <span className="hub-card__stat">Coming soon</span>
        </span>
      </div>

      {continueItem ? (
        <Link href={continueItem.href} className="continue-band">
          <span>
            <span className="continue-band__eyebrow">Continue editing</span>
            <span className="continue-band__title">{continueItem.title}</span>
            <span className="continue-band__meta">{continueItem.kind} &middot; Draft</span>
          </span>
          <span className="continue-band__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
          </span>
        </Link>
      ) : null}
    </div>
  );
}
