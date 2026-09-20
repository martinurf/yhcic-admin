import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import ContentTopbar from "./content-topbar";

export default async function ContentHubPage() {
  const me = await requireActiveAdmin();
  const supabase = await createClient();
  /* resources has zero RLS policies for the authenticated role (by
     design — every read/write goes through service-role actions that
     check is_active_admin() themselves), so a plain session count
     would always come back 0. */
  const admin = createAdminClient();

  const [
    { count: projectCount },
    { count: announcementPublished },
    { count: sourceCount },
    { count: pendingCount },
    { data: recentProject },
    { data: recentAnnouncement },
  ] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("announcements").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("published", true),
    admin.from("resources").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
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
    <>
      <ContentTopbar title="Content Library" pendingCount={pendingCount || 0} />
    <div className="container flush-top" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <section className="content-hero">
        <img className="content-hero__art" src="/college-lineart.webp" alt="" aria-hidden="true" />
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
            <svg viewBox="0 0 64 64"><path d="M20 38c-7-5-9-12-6-20C18 7 30 3 41 8s15 18 8 28c-2 3-5 5-7 7H24c-1-2-2-4-4-5Z" /><path d="M24 49h18M27 56h12M32 1v5M9 13l5 3M55 13l-5 3M5 32h7M52 32h7" /></svg>
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
            <svg viewBox="0 0 64 64"><path d="M10 27v15h10l26 11V15L20 27Z" /><path d="M46 28h8v12h-8M19 42l4 13h10l-5-10" /></svg>
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
            <svg viewBox="0 0 64 64"><path d="M5 13c11-5 19-3 27 4v39c-8-7-16-9-27-4ZM59 13c-11-5-19-3-27 4v39c8-7 16-9 27-4Z" /><path d="M10 20c7-2 13 0 18 4M54 20c-7-2-13 0-18 4" /></svg>
          </span>
          <h2>Sources &amp; Research</h2>
          <p>Save articles, documents, and notes.</p>
          <span className="hub-card__stat">{sourceCount || 0} sources</span>
        </Link>

        <span className="hub-card disabled" aria-hidden="true">
          <span className="hub-card__index">04</span>
          <span className="hub-card__icon">
            <svg viewBox="0 0 64 64"><path d="M8 52h12V35H8ZM26 52h12V24H26ZM44 52h12V10H44Z" /><rect x="43" y="37" width="17" height="16" rx="2" /><path d="M47 37v-5a5 5 0 0 1 10 0v5" /></svg>
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
    </>
  );
}
