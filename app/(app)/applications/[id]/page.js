import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusButtons from "./status-buttons";

export default async function ApplicationDetail({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: app } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!app) notFound();

  const rows = [
    ["Name", app.name],
    ["Email", app.email],
    ["Graduation year", app.grad_year],
    ["Major", app.major],
    ["Heard about us via", app.referral || "—"],
    ["Phone", app.phone || "—"],
    ["Submitted", new Date(app.submitted_at).toLocaleString()],
    ["Notification", app.notification_status],
  ];

  return (
    <div>
      <p className="page__eyebrow">
        <Link href="/applications" className="muted">&larr; Applications</Link>
      </p>
      <div className="page__head">
        <h1 className="page__title">{app.name}</h1>
        <span className={`badge badge--${app.status}`}>{app.status}</span>
      </div>

      <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
        <StatusButtons applicationId={app.id} currentStatus={app.status} />
      </div>

      <dl className="list">
        {rows.map(([label, value]) => (
          <div className="list__row" key={label}>
            <span className="mono muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {label}
            </span>
            <span>{value}</span>
          </div>
        ))}
      </dl>

      {app.experience ? (
        <>
          <p className="page__eyebrow" style={{ marginTop: 24 }}>Previous experience</p>
          <div className="panel" style={{ padding: 16, fontSize: 14, lineHeight: 1.7 }}>{app.experience}</div>
        </>
      ) : null}
    </div>
  );
}
