import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function countRows(supabase, table, filters = {}) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { count } = await query;
  return count ?? 0;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [pending, accepted, rejected, projects, goals, members, announcements] = await Promise.all([
    countRows(supabase, "applications", { status: "pending" }),
    countRows(supabase, "applications", { status: "accepted" }),
    countRows(supabase, "applications", { status: "rejected" }),
    countRows(supabase, "projects", { published: true }),
    countRows(supabase, "goals", { published: true }),
    countRows(supabase, "members", { published: true }),
    countRows(supabase, "announcements", { published: true }),
  ]);

  const { data: lastPub } = await supabase
    .from("publications")
    .select("state, requested_at, completed_at")
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Overview</p>
          <h1 className="page__title">Dashboard</h1>
        </div>
      </div>

      <div className="list" style={{ marginBottom: 14 }}>
        <Link href="/applications?status=pending" className="list__row">
          <div>
            <span className="list__title">Pending applications</span>
            <p className="list__sub">Waiting for a decision</p>
          </div>
          <span className="badge badge--pending">{pending}</span>
        </Link>
        <div className="list__row">
          <div>
            <span className="list__title">Accepted / Rejected</span>
            <p className="list__sub">All-time totals</p>
          </div>
          <span className="row">
            <span className="badge badge--accepted">{accepted} accepted</span>
            <span className="badge badge--rejected">{rejected} rejected</span>
          </span>
        </div>
        <div className="list__row">
          <div>
            <span className="list__title">Last publication</span>
            <p className="list__sub">
              {lastPub ? new Date(lastPub.requested_at).toLocaleString() : "Nothing published yet"}
            </p>
          </div>
          {lastPub ? <span className={`badge badge--${lastPub.state}`}>{lastPub.state}</span> : null}
        </div>
      </div>

      <p className="page__eyebrow" style={{ marginTop: 28 }}>Published content</p>
      <div className="list">
        <Link href="/content/projects" className="list__row">
          <span className="list__title">Projects</span>
          <span className="mono muted">{projects} published</span>
        </Link>
        <Link href="/content/goals" className="list__row">
          <span className="list__title">Goals</span>
          <span className="mono muted">{goals} published</span>
        </Link>
        <Link href="/content/members" className="list__row">
          <span className="list__title">Members</span>
          <span className="mono muted">{members} published</span>
        </Link>
        <Link href="/content/announcements" className="list__row">
          <span className="list__title">Announcements</span>
          <span className="mono muted">{announcements} published</span>
        </Link>
      </div>
    </div>
  );
}
