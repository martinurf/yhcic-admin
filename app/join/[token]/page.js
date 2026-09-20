import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/invite-token";
import JoinForm from "./join-form";

export default async function JoinPage({ params }) {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("invited_name, expires_at, accepted_at, revoked_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  const valid =
    invitation && !invitation.accepted_at && !invitation.revoked_at && new Date(invitation.expires_at) > new Date();

  return (
    <div className="login">
      <div className="login__panel">
        <span className="side__mark" style={{ marginBottom: 22 }}>YHCIC</span>
        {valid ? (
          <>
            <h1 className="login__title">
              {invitation.invited_name ? `Welcome, ${invitation.invited_name}` : "Welcome"}
            </h1>
            <p className="login__sub">You've been invited as a YHCIC officer. Set a username and password to get in.</p>
            <JoinForm token={token} />
          </>
        ) : (
          <>
            <h1 className="login__title">Invitation not valid</h1>
            <p className="login__sub">
              This link has expired, was already used, or was revoked. Ask whoever invited you to send a new one.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
