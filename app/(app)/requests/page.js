import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/require-admin";
import ResolveButtons from "./resolve-buttons";

export default async function RequestsPage() {
  const me = await requireOwner();
  if (!me) redirect("/");

  const supabase = await createClient();
  const [{ data: memberRequests }, { data: projectRequests }] = await Promise.all([
    supabase
      .from("members")
      .select("id, name, requested_at")
      .not("requested_at", "is", null)
      .eq("published", false)
      .is("deleted_at", null)
      .order("requested_at", { ascending: true }),
    supabase
      .from("projects")
      .select("id, title, requested_at")
      .not("requested_at", "is", null)
      .eq("published", false)
      .is("deleted_at", null)
      .order("requested_at", { ascending: true }),
  ]);

  const items = [
    ...(memberRequests || []).map((m) => ({ type: "member", id: m.id, label: m.name, requestedAt: m.requested_at, href: `/content/members/${m.id}` })),
    ...(projectRequests || []).map((p) => ({ type: "project", id: p.id, label: p.title, requestedAt: p.requested_at, href: `/content/projects/${p.id}` })),
  ].sort((a, b) => new Date(a.requestedAt) - new Date(b.requestedAt));

  return (
    <div className="container">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Access</p>
          <h1 className="page__title">Requests</h1>
        </div>
      </div>

      <p className="fld__hint" style={{ marginBottom: 14 }}>
        Officers ask, you add it to the public site by hand, then mark it here. Nothing here goes live on its own.
      </p>

      <div className="list">
        {!items.length ? (
          <p className="list__empty">No pending requests.</p>
        ) : (
          items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="list__row">
              <div>
                <Link href={item.href} className="list__title" style={{ textDecoration: "underline" }}>
                  {item.label}
                </Link>
                <p className="list__sub">
                  {item.type === "member" ? "Member" : "Project"} &middot; Requested{" "}
                  {new Date(item.requestedAt).toLocaleDateString()}
                </p>
              </div>
              <ResolveButtons type={item.type} id={item.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
