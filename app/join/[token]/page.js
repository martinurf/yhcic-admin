import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/invite-token";
import JoinForm from "./join-form";

export default async function JoinPage({ params }) {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("email, expires_at, accepted_at, revoked_at")
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
            <h1 className="login__title">Join as an officer</h1>
            <p className="login__sub">Set your username and password to finish setting up your account.</p>
            <JoinForm token={token} email={invitation.email} />
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
