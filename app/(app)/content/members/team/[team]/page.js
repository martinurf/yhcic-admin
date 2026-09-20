import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mediaPublicUrl } from "@/lib/media-url";
import ContentTopbar from "../../../content-topbar";

const TEAMS = ["Equity Research", "Markets", "Operations", "Communications"];

export default async function TeamRosterPage({ params }) {
  const { team: teamParam } = await params;
  const team = TEAMS.find((t) => t === decodeURIComponent(teamParam));
  if (!team) notFound();

  const supabase = await createClient();
  const [{ data: members }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("members")
      .select("id, name, major, class_of, role, media(storage_key)")
      .eq("team", team)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <>
      <ContentTopbar title={team} pendingCount={pendingCount || 0} />
      <div className="container flush-top">
        <Link href="/content/members" className="backlink">
          <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
          Member Network
        </Link>
        <div className="section-hero">
          <div className="section-hero-row">
            <div>
              <p className="page__eyebrow">YHCIC team</p>
              <h1>{team}.</h1>
              <p className="desc">
                {members?.length || 0} member{members?.length === 1 ? "" : "s"} on this team.
              </p>
            </div>
          </div>
        </div>

        <div className="workspace">
          <div className="editorial-list">
            {members?.length ? (
              members.map((m) => {
                const sub = [m.role, m.major, m.class_of ? `Class of ${m.class_of}` : null].filter(Boolean).join(" · ");
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
              <p className="empty">
                <strong>No one here yet</strong>
                Set a member&apos;s team to &ldquo;{team}&rdquo; to see them show up here.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
