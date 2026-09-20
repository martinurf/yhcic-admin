import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/invite-token";
import JoinForm from "./join-form";

async function loadInvitation(token) {
  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("invited_name, expires_at, accepted_at, revoked_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  const valid =
    invitation && !invitation.accepted_at && !invitation.revoked_at && new Date(invitation.expires_at) > new Date();
  return { invitation, valid };
}

/* Personalizes what shows up when this link is pasted into iMessage,
   WhatsApp, Slack, etc. — a plain URL doesn't say anything; this does. */
export async function generateMetadata({ params }) {
  const { token } = await params;
  const { invitation, valid } = await loadInvitation(token);
  const firstName = invitation?.invited_name?.trim().split(" ")[0];

  if (!valid) return { title: "Invitation not valid — YHCIC" };

  return {
    title: firstName ? `${firstName}, you're invited to YHCIC` : "You're invited to YHCIC",
    description: "Set up your officer account for the Young Harris College Investment Club admin panel.",
  };
}

export default async function JoinPage({ params }) {
  const { token } = await params;
  const { invitation, valid } = await loadInvitation(token);
  const firstName = invitation?.invited_name?.trim().split(" ")[0] || null;

  return (
    <div className="login">
      <div className="login__panel">
        <span className="side__mark" style={{ marginBottom: 22 }}>YHCIC</span>
        {valid ? (
          <>
            <h1 className="login__title">{firstName ? `Congratulations, ${firstName}!` : "Welcome"}</h1>
            <p className="login__sub">
              {firstName
                ? "You've received the link to create your YHCIC account. Set a username and password to get in."
                : "You've been invited as a YHCIC officer. Set a username and password to get in."}
            </p>
            <JoinForm token={token} />
            <p className="fld__hint" style={{ marginTop: 18 }}>
              Invitation-only — this link was sent to you specifically, works once, and expires in 7 days.
            </p>
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
