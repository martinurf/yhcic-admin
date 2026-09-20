import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import InviteForm from "./invite-form";
import RevokeButton from "./revoke-button";

function inviteStatus(inv) {
  if (inv.accepted_at) return { label: "Accepted", tone: "published" };
  if (inv.revoked_at) return { label: "Revoked", tone: "rejected" };
  if (new Date(inv.expires_at) < new Date()) return { label: "Expired", tone: "draft" };
  return { label: "Pending", tone: "pending" };
}

export default async function TeamPage() {
  const me = await requireActiveAdmin();
  if (!me) redirect("/login");

  const admin = createAdminClient();
  const [{ data: admins }, { data: invitations }] = await Promise.all([
    admin.from("admin_profiles").select("id, username, display_name, active, created_at").order("created_at", { ascending: true }),
    admin.from("invitations").select("id, invited_name, expires_at, accepted_at, revoked_at, created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Access</p>
          <h1 className="page__title">Team</h1>
        </div>
      </div>

      <p className="page__eyebrow" style={{ marginBottom: 10 }}>Officers</p>
      <div className="list" style={{ marginBottom: 28 }}>
        {(admins || []).map((a) => (
          <div key={a.id} className="list__row">
            <div>
              <span className="list__title">{a.display_name}</span>
              <p className="list__sub">@{a.username}</p>
            </div>
            <span className={`badge badge--${a.active ? "published" : "draft"}`}>
              {a.active ? "Active" : "Disabled"}
            </span>
          </div>
        ))}
      </div>

      <p className="page__eyebrow" style={{ marginBottom: 10 }}>Invite an officer</p>
      <div className="panel" style={{ padding: 20, marginBottom: 28 }}>
        <InviteForm />
      </div>

      {invitations?.length ? (
        <>
          <p className="page__eyebrow" style={{ marginBottom: 10 }}>Invitations</p>
          <div className="list">
            {invitations.map((inv) => {
              const status = inviteStatus(inv);
              const revocable = status.label === "Pending";
              return (
                <div key={inv.id} className="list__row">
                  <div>
                    <span className="list__title">{inv.invited_name || "Invitation"}</span>
                    <p className="list__sub">
                      {status.label === "Pending"
                        ? `Expires ${new Date(inv.expires_at).toLocaleDateString()}`
                        : `Sent ${new Date(inv.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className="row" style={{ gap: 10 }}>
                    <span className={`badge badge--${status.tone}`}>{status.label}</span>
                    {revocable ? <RevokeButton id={inv.id} /> : null}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
