import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Greeting from "./greeting";
import HeroActions from "./hero-actions";

async function countRows(supabase, table, filters = {}, excludeDeleted = false) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  if (excludeDeleted) query = query.is("deleted_at", null);
  const { count } = await query;
  return count ?? 0;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("admin_profiles").select("username, display_name").eq("id", user.id).maybeSingle();
    profile = data;
  }
  const displayName = profile?.display_name || profile?.username || "officer";
  const firstName = displayName.split(" ")[0];

  const [pending, memberCount, projectCount, announcementCount, { data: recentApplications }, { data: recentAnnouncement }] = await Promise.all([
    countRows(supabase, "applications", { status: "pending" }),
    countRows(supabase, "members", {}, true),
    countRows(supabase, "projects", {}, true),
    countRows(supabase, "announcements", { published: true }, true),
    supabase
      .from("applications")
      .select("id, name, submitted_at")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true })
      .limit(3),
    supabase
      .from("announcements")
      .select("id, title, body, published_at")
      .eq("published", true)
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <>
      <header className="hero">
        <img className="college-art" src="/college-lineart.webp" alt="" aria-hidden="true" />
        <div className="topbar">
          <div className="monogram" aria-label="YHCIC">
            YHC
            <br />
            IC
          </div>
          <HeroActions pendingCount={pending} />
        </div>
        <p className="hero-aside" aria-hidden="true">
          Higher
          <br />
          Ideas
          <br />
          Brighter
          <br />
          Tomorrows
        </p>
        <div className="hero-copy">
          <p className="eyebrow">Member overview</p>
          <Greeting name={firstName} />
          <p className="motto">Students. Ideas. Impact.</p>
          <div className="small-rule" />
          <Link href="/content/announcements/new" className="primary-action">
            <span>&#65291;</span>New announcement
          </Link>
        </div>
      </header>

      <section className="summary" aria-label="Club overview">
        <Link href="/applications?status=pending" className="metric">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M8 13h8M8 17h6" />
          </svg>
          <span className="metric-label">Applications</span>
          <strong className="metric-value">{pending}</strong>
        </Link>
        <Link href="/content/projects" className="metric">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18h6M10 22h4M8.5 14.5A6 6 0 1 1 15.5 14.5c-1 .7-1.5 1.4-1.5 2.5h-4c0-1.1-.5-1.8-1.5-2.5z" />
          </svg>
          <span className="metric-label">Current projects</span>
          <strong className="metric-value">{projectCount}</strong>
        </Link>
        <Link href="/content/announcements" className="metric">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="m3 11 14-5v12L3 13z" />
            <path d="M11 16v4H7l-1-6M20 9v6" />
          </svg>
          <span className="metric-label">Announcements</span>
          <strong className="metric-value">{announcementCount}</strong>
        </Link>
        <Link href="/content/members" className="metric">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="metric-label">Members</span>
          <strong className="metric-value">{memberCount}</strong>
        </Link>
      </section>

      <main className="home-main">
        <section className="home-section" id="applications">
          <div className="section-head">
            <h2>Recent applications</h2>
            <Link href="/applications?status=pending" className="view-all">
              View all&nbsp; &rsaquo;
            </Link>
          </div>

          {recentApplications?.length ? (
            recentApplications.map((a) => (
              <Link key={a.id} href={`/applications/${a.id}`} className="approw">
                <div className="round-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M8 13h8M8 17h6" />
                  </svg>
                </div>
                <div className="approw-copy">
                  <h3>{a.name}</h3>
                  <p>Applied {new Date(a.submitted_at).toLocaleDateString()}</p>
                </div>
                <span className="pill-status">&#9711; Pending</span>
                <span className="chevron">&rsaquo;</span>
              </Link>
            ))
          ) : (
            <p className="empty-row">Nothing waiting on a decision right now.</p>
          )}
        </section>

        <section className="home-section announcements-card" id="announcements">
          <div className="announcements-head">
            <h2>Announcements</h2>
            <Link href="/content/announcements" className="view-all">
              View all &rarr;
            </Link>
          </div>
          {recentAnnouncement ? (
            <Link href={`/content/announcements/${recentAnnouncement.id}`} className="announcement-item">
              {/* Always the official mark here — it's what says "this is
                  an official YHCIC announcement." An uploaded photo is
                  content, not identity; it shows inside the full post,
                  never in place of this. */}
              <div className="announcement-item__mark" aria-hidden="true">
                <span className="side__mark">YHCIC</span>
              </div>
              <div>
                <div className="announcement-titleline">
                  <h3>{recentAnnouncement.title}</h3>
                  <span className="published-badge">Published</span>
                </div>
                <p className="announcement-meta">
                  YHCIC &middot; {new Date(recentAnnouncement.published_at).toLocaleDateString()}
                </p>
                <p className="announcement-copy">{recentAnnouncement.body}</p>
              </div>
              <span className="chevron">&rsaquo;</span>
            </Link>
          ) : (
            <div className="announcement-empty">No announcements yet.</div>
          )}
        </section>
      </main>
    </>
  );
}
