import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RequestPublishButton from "../request-publish-button";
import { requestMemberPublish } from "./actions";

export default async function MembersListPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("members")
    .select("id, name, role, major, focus, published, requested_at")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return (
    <div className="container">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Content</p>
          <h1 className="page__title">Members</h1>
          <p className="page__sub">Members of YHCIC.</p>
        </div>
        <Link href="/content/members/new" className="btn btn--primary">New member</Link>
      </div>

      <div className="list">
        {!items?.length ? (
          <p className="list__empty">No members yet.</p>
        ) : (
          items.map((m) => {
            const details = [m.role, m.major, m.focus].filter(Boolean).join(" · ");
            const status = m.published
              ? { label: "Published", tone: "published" }
              : m.requested_at
              ? { label: "Requested", tone: "pending" }
              : { label: "Draft", tone: "draft" };
            return (
              <div key={m.id} className="list__row">
                <Link href={`/content/members/${m.id}`} className="list__row-link">
                  <span className="list__title">
                    {m.name}
                    {details ? <span className="list__title-meta"> — {details}</span> : null}
                  </span>
                  {!details ? <p className="list__sub muted">No details yet</p> : null}
                </Link>
                <div className="list__row-actions">
                  <span className={`badge badge--${status.tone}`}>{status.label}</span>
                  {status.tone === "draft" ? (
                    <RequestPublishButton id={m.id} requestAction={requestMemberPublish} />
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
