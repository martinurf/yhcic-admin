import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const TABS = ["pending", "accepted", "rejected", "all"];

export default async function ApplicationsPage({ searchParams }) {
  const params = await searchParams;
  const status = TABS.includes(params?.status) ? params.status : "pending";

  const supabase = await createClient();
  let query = supabase
    .from("applications")
    .select("id, name, email, grad_year, major, status, submitted_at")
    .order("submitted_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);

  const { data: applications } = await query;

  return (
    <div className="container">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Membership</p>
          <h1 className="page__title">Applications</h1>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/applications?status=${t}`}
            className="btn btn--sm"
            style={t === status ? { borderColor: "var(--vault-accent)", background: "rgba(180,143,224,.1)" } : undefined}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </Link>
        ))}
      </div>

      <div className="list">
        {!applications?.length ? (
          <p className="list__empty">No applications here.</p>
        ) : (
          applications.map((a) => (
            <Link key={a.id} href={`/applications/${a.id}`} className="list__row">
              <div>
                <span className="list__title">{a.name}</span>
                <p className="list__sub">{a.email} &middot; Class of {a.grad_year} &middot; {a.major}</p>
              </div>
              <span className="list__meta">
                <span className={`badge badge--${a.status}`}>{a.status}</span>
                <span>{new Date(a.submitted_at).toLocaleDateString()}</span>
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
