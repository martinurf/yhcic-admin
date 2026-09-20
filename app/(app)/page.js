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

  const [pending, accepted, rejected] = await Promise.all([
    countRows(supabase, "applications", { status: "pending" }),
    countRows(supabase, "applications", { status: "accepted" }),
    countRows(supabase, "applications", { status: "rejected" }),
  ]);

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
      </div>
    </div>
  );
}
