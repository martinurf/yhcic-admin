import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Greeting from "./greeting";

async function countRows(supabase, table, filters = {}) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { count } = await query;
  return count ?? 0;
}

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("admin_profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }
  const displayName = profile?.display_name || profile?.username || "officer";
  const firstName = displayName.split(" ")[0];

  const [pending, memberCount, memberPublished, { data: attention }, { data: recentMembers }] = await Promise.all([
    countRows(supabase, "applications", { status: "pending" }),
    countRows(supabase, "members"),
    countRows(supabase, "members", { published: true }),
    supabase
      .from("applications")
      .select("id, name, submitted_at")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true })
      .limit(4),
    supabase
      .from("members")
      .select("id, name, published, updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  return (
    <>
      <div className="hero-admin">
        <img className="hero-admin__mark" src="/campus-mark.webp" alt="" aria-hidden="true" />
        <div className="hero-admin__in">
          <div className="hero-admin__top">
            <span className="side__mark side__mark--on-dark">YHCIC</span>
            <div className="hero-admin__actions">
              <Link href="/applications?status=pending" className="hero-admin__bell" aria-label={`${pending} pending applications`}>
                <svg viewBox="0 0 24 24"><path d="M6 10a6 6 0 1 1 12 0c0 4.2 1.4 6 2 6.5H4c.6-.5 2-2.3 2-6.5Z" /><path d="M9.5 19.5a2.6 2.6 0 0 0 5 0" /></svg>
                {pending > 0 ? <span className="hero-admin__dot" aria-hidden="true" /> : null}
              </Link>
              <span className="hero-admin__avatar" aria-hidden="true">{initials(displayName)}</span>
            </div>
          </div>

          <p className="hero-admin__eyebrow">Admin overview</p>
          <Greeting name={firstName} className="hero-admin__greet" />
          <p className="hero-admin__tagline">Discipline &middot; Perspective &middot; Progress</p>

          <Link href="/content/members/new" className="hero-admin__cta">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            Add member
          </Link>
        </div>
      </div>

      <div className="stats">
        <div className="stats__in">
          <div className="stat">
            <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.1" /><path d="M3.4 19c.4-3.2 2.8-5 5.6-5s5.2 1.8 5.6 5" /><circle cx="16.8" cy="8.8" r="2.4" /><path d="M15.4 13.4c2.6-.5 4.8 1.2 5.2 4.2" /></svg>
            <span className="stat__label">Members</span>
            <span className="stat__value">{memberCount}</span>
          </div>
          <div className="stat">
            <svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M9.5 12.5h5M9.5 16h5" /></svg>
            <span className="stat__label">Applications</span>
            <span className="stat__value">{pending}</span>
          </div>
          <div className="stat">
            <svg viewBox="0 0 24 24"><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.6 1 .6 1.6v.1h6v-.1c0-.6.1-1.2.6-1.6A6 6 0 0 0 12 3Z" /></svg>
            <span className="stat__label">Projects</span>
            <span className="stat__value stat__value--soon">Soon</span>
          </div>
          <div className="stat">
            <svg viewBox="0 0 24 24"><path d="M5 21V4" /><path d="M5 5h13l-3 4 3 4H5" /></svg>
            <span className="stat__label">Goals</span>
            <span className="stat__value stat__value--soon">Soon</span>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__head">
          <h2 className="section__title">Needs your attention</h2>
          <Link href="/applications?status=pending" className="section__all">
            View all <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        {attention?.length ? (
          <div>
            {attention.map((a) => (
              <Link key={a.id} href={`/applications/${a.id}`} className="entry">
                <span className="entry__icon">
                  <svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M9.5 12.5h5M9.5 16h5" /></svg>
                </span>
                <span className="entry__body">
                  <span className="entry__title">{a.name}</span>
                  <p className="entry__sub">
                    Membership application &middot; Submitted {new Date(a.submitted_at).toLocaleDateString()}
                  </p>
                </span>
                <span className="badge badge--pending">Pending</span>
                <svg className="entry__chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        ) : (
          <p className="entry__empty">Nothing waiting on a decision right now.</p>
        )}
      </div>

      <div className="section" style={{ paddingBottom: 20 }}>
        <div className="section__head">
          <h2 className="section__title">Recently updated</h2>
          <Link href="/content/members" className="section__all">
            View all <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        {recentMembers?.length ? (
          <div>
            {recentMembers.map((m) => (
              <Link key={m.id} href={`/content/members/${m.id}`} className="entry entry--status">
                <span style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
                  <span className="entry__icon">
                    <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.1" /><path d="M3.4 19c.4-3.2 2.8-5 5.6-5s5.2 1.8 5.6 5" /><circle cx="16.8" cy="8.8" r="2.4" /><path d="M15.4 13.4c2.6-.5 4.8 1.2 5.2 4.2" /></svg>
                  </span>
                  <span className="entry__body">
                    <span className="entry__title">{m.name}</span>
                    <p className="entry__sub">Member &middot; Updated {new Date(m.updated_at).toLocaleDateString()}</p>
                  </span>
                  <svg className="entry__chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                </span>
                <span className={`entry__statusbar entry__statusbar--${m.published ? "live" : "draft"}`}>
                  <b>{m.published ? "Published and live" : "Draft"}</b>
                  <span>{m.published ? "Visible to the public site" : "Not visible yet"}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="entry__empty">No members yet.</p>
        )}
      </div>
    </>
  );
}
