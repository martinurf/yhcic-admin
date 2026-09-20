import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import { mediaPublicUrl } from "@/lib/media-url";
import ContentTopbar from "../content-topbar";

const TEAM_ICONS = {
  "Equity Research": <path d="M8 52h12V35H8ZM26 52h12V24H26ZM44 52h12V10H44Z" />,
  Markets: <><circle cx="32" cy="32" r="24" /><path d="M8 32h48M32 8c8 8 8 40 0 48M32 8c-8 8-8 40 0 48" /></>,
  Operations: <><circle cx="32" cy="32" r="8" /><path d="M32 10v6M32 48v6M10 32h6M48 32h6M16 16l4 4M44 44l4 4M48 16l-4 4M20 44l-4 4" /></>,
  Communications: <path d="M8 12h48v30H24l-10 10V42H8Z" />,
};

function normalize(s) {
  return (s || "").trim().toLowerCase();
}

export default async function MembersListPage() {
  const me = await requireActiveAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: members }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("members")
      .select("id, name, role, major, focus, class_of, team, admin_id, published, requested_at, media(storage_key)")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
    admin.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const all = members || [];
  const meNorm = normalize(me?.display_name);
  const myMember =
    all.find((m) => m.admin_id === me?.id) ||
    (meNorm ? all.find((m) => normalize(m.name).includes(meNorm) || meNorm.includes(normalize(m.name))) : null) ||
    all[0];

  const teamCounts = {};
  for (const m of all) if (m.team) teamCounts[m.team] = (teamCounts[m.team] || 0) + 1;
  const TEAMS = ["Equity Research", "Markets", "Operations", "Communications"];

  return (
    <>
      <ContentTopbar title="Member Network" pendingCount={pendingCount || 0} />
      <div className="container flush-top" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <section className="content-hero">
          <img className="content-hero__art" src="/college-lineart.webp" alt="" aria-hidden="true" />
          <h1>
            <span>Built by</span>
            <span>students.</span>
          </h1>
          <div className="hero-rule" />
          <p className="sub">Investment club / 2026</p>
        </section>

        <div className="workspace">
          <div className="section-toolbar">
            <h2>Leadership</h2>
            <Link href="#all-members" className="text-btn">View all &rarr;</Link>
          </div>

          {myMember ? (
            <Link href={`/content/members/${myMember.id}`} className="leadership-card">
              <span className="leadership-card__arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </span>
              <span className="leadership-card__photo">
                {mediaPublicUrl(myMember.media?.storage_key) ? (
                  <img src={mediaPublicUrl(myMember.media?.storage_key)} alt="" />
                ) : (
                  <span className="leadership-card__photo-default" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
                  </span>
                )}
              </span>
              <span className="leadership-card__info">
                <span className="leadership-card__name">{myMember.name}</span>
                {myMember.role ? (
                  <span className="leadership-card__role">{myMember.role}</span>
                ) : (
                  <span className="leadership-card__add">Add role</span>
                )}
                <span className="leadership-card__field-label">Major</span>
                {myMember.major ? (
                  <span className="leadership-card__field">{myMember.major}</span>
                ) : (
                  <span className="leadership-card__add">Add major</span>
                )}
                {myMember.class_of ? (
                  <span className="leadership-card__class">Class of {myMember.class_of}</span>
                ) : (
                  <span className="leadership-card__add">Add class year</span>
                )}
              </span>
              <span className="leadership-card__tagline">
                <em>Students.</em>
                <em>Markets.</em>
                <em>A Stronger Tomorrow.</em>
              </span>
            </Link>
          ) : (
            <p className="empty"><strong>No members yet</strong>Add the first officer to get started.</p>
          )}

          <div className="section-toolbar" style={{ marginTop: 32 }}>
            <h2>Teams</h2>
            <Link href="/content/members/new" className="text-btn">Join a team &rarr;</Link>
          </div>
          <div className="teams-grid">
            {TEAMS.map((team) => {
              const count = teamCounts[team] || 0;
              return count ? (
                <span key={team} className="team-card">
                  <span className="team-card__icon" aria-hidden="true"><svg viewBox="0 0 64 64">{TEAM_ICONS[team]}</svg></span>
                  <span>
                    <span className="team-card__title">{team}</span>
                    <span className="team-card__count">{count} member{count === 1 ? "" : "s"}</span>
                  </span>
                  <span className="team-card__arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg></span>
                </span>
              ) : (
                <span key={team} className="team-card team-card--add" aria-hidden="true">
                  <span className="team-card__icon" aria-hidden="true"><svg viewBox="0 0 64 64">{TEAM_ICONS[team]}</svg></span>
                  <span>
                    <span className="team-card__title">{team}</span>
                    <span className="team-card__count">Add</span>
                  </span>
                </span>
              );
            })}
          </div>

          <div id="all-members" className="section-toolbar" style={{ marginTop: 32, scrollMarginTop: 90 }}>
            <h2>All members</h2>
            <Link href="/content/members/new" className="text-btn">New member &rarr;</Link>
          </div>
          <div className="editorial-list">
            {all.length ? (
              all.map((m) => {
                const sub = [m.major, m.class_of ? `Class of ${m.class_of}` : null].filter(Boolean).join(" / ");
                return (
                  <Link key={m.id} href={`/content/members/${m.id}`} className="member-row">
                    <span className="member-row__avatar">
                      {mediaPublicUrl(m.media?.storage_key) ? (
                        <img src={mediaPublicUrl(m.media?.storage_key)} alt="" />
                      ) : (
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
                      )}
                    </span>
                    <span>
                      <span className="member-row__name">{m.name}</span>
                      <span className="member-row__sub">{sub || "No details yet"}</span>
                    </span>
                    <span className="member-row__arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" /></svg></span>
                  </Link>
                );
              })
            ) : (
              <p className="empty"><strong>No members yet</strong>Add the first officer to get started.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
