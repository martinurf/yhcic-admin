import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import { mediaPublicUrl } from "@/lib/media-url";
import ContentTopbar from "../content-topbar";
import JoinTeamButton from "./join-team-button";

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
  const teamLabel = (n) => `${n} ${n === 1 ? "MEMBER" : "MEMBERS"}`;

  return (
    <>
      <ContentTopbar title="Member Network" pendingCount={pendingCount || 0} />
      <div className="container flush-top" style={{ paddingLeft: 0, paddingRight: 0 }}>
        {/* Exact copy of member-network-blueprint.jpeg — same technique as
            the Content hub: the reference's own index.html renders this
            flat image with invisible/opaque overlays, not CSS. Positions
            below are the reference's own overlay percentages, ported
            verbatim (leader-avatar, count labels, member-replacement). */}
        <div className="mn-hub" style={{ aspectRatio: "864/1300.4" }}>
          <div className="mn-hub__inner" style={{ top: "-8.46%" }}>
            <img src="/member-network-blueprint.jpeg" alt="Member Network — Leadership, Teams, All members" />

            {myMember ? (
              <>
                <Link href={`/content/members/${myMember.id}`} className="mn-hit mn-hit--leadership" aria-label={`Open ${myMember.name}'s profile`} />
                <span className="mn-avatar mn-avatar--leader">
                  {mediaPublicUrl(myMember.media?.storage_key) ? (
                    <img src={mediaPublicUrl(myMember.media?.storage_key)} alt="" />
                  ) : (
                    <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="29" r="14" /><path d="M15 73c1-19 11-29 25-29s24 10 25 29" /></svg>
                  )}
                </span>
                <span className="mn-patch mn-patch--name"><span className="mn-name">{myMember.name}</span></span>
                <span className="mn-patch mn-patch--role">
                  {myMember.role ? <span className="mn-role">{myMember.role}</span> : <span className="mn-add">Add role</span>}
                </span>
                <span className="mn-patch mn-patch--major">
                  {myMember.major ? <span className="mn-field">{myMember.major}</span> : <span className="mn-add">Add major</span>}
                </span>
                <span className="mn-patch mn-patch--class">
                  {myMember.class_of ? <span className="mn-class">CLASS OF {myMember.class_of}</span> : <span className="mn-add">Add class year</span>}
                </span>
              </>
            ) : null}

            {myMember ? (
              <JoinTeamButton className="mn-hit mn-hit--jointeam" memberId={myMember.id} currentTeam={myMember.team} />
            ) : null}
            {TEAMS.map((team, i) => (
              <Link key={team} href={`/content/members/team/${encodeURIComponent(team)}`} className={`mn-hit mn-hit--team mn-hit--team${i}`} aria-label={`Open ${team}`} />
            ))}
            <span className="mn-patch mn-count mn-count--equity">{teamLabel(teamCounts["Equity Research"] || 0)}</span>
            <span className="mn-patch mn-count mn-count--markets">{teamLabel(teamCounts.Markets || 0)}</span>
            <span className="mn-patch mn-count mn-count--operations">{teamLabel(teamCounts.Operations || 0)}</span>
            <span className="mn-patch mn-count mn-count--communications">{teamLabel(teamCounts.Communications || 0)}</span>

            {/* Opaque, like the reference's own .member-replacement — the
                image underneath here is never meant to show through. */}
            <div className="mn-all-members">
              <header>
                <h2>All members</h2>
                <Link href="/content/members/new" className="mn-all-members__action">New member <span>&rarr;</span></Link>
              </header>
              <div className="mn-member-list">
                {all.length ? (
                  all.slice(0, 3).map((m) => {
                    const sub = [m.major?.toUpperCase(), m.class_of ? `CLASS OF ${m.class_of}` : null].filter(Boolean).join("  /  ");
                    return (
                      <Link key={m.id} href={`/content/members/${m.id}`} className="mn-member-row">
                        <span className="mn-avatar mn-avatar--row">
                          {mediaPublicUrl(m.media?.storage_key) ? (
                            <img src={mediaPublicUrl(m.media?.storage_key)} alt="" />
                          ) : (
                            <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="29" r="14" /><path d="M15 73c1-19 11-29 25-29s24 10 25 29" /></svg>
                          )}
                        </span>
                        <span className="mn-member-row__copy">
                          <strong>{m.name}</strong>
                          <small>{sub || "No details yet"}</small>
                        </span>
                        <span className="mn-member-row__arrow" aria-hidden="true">&rarr;</span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="empty" style={{ padding: "24px 4%" }}><strong>No members yet</strong>Add the first officer.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {all.length > 3 ? (
          <div className="workspace" style={{ paddingTop: 0 }}>
            <div className="section-toolbar members-toolbar" style={{ marginTop: 24 }}>
              <h2>Full directory</h2>
            </div>
            <div className="editorial-list">
              {all.map((m) => {
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
              })}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
