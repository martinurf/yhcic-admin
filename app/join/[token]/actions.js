"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/invite-token";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

async function findValidInvitation(admin, token) {
  const { data: invitation } = await admin
    .from("invitations")
    .select("id, email, expires_at, accepted_at, revoked_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (!invitation) return null;
  if (invitation.accepted_at || invitation.revoked_at) return null;
  if (new Date(invitation.expires_at) < new Date()) return null;
  return invitation;
}

export async function acceptInvite(token, formData) {
  const admin = createAdminClient();
  const invitation = await findValidInvitation(admin, token);
  if (!invitation) return { error: "This invitation is no longer valid." };

  const displayName = String(formData.get("displayName") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (displayName.length < 2) return { error: "Enter your full name." };
  if (!USERNAME_RE.test(username)) {
    return { error: "Username must be 3-24 characters: letters, numbers, underscore only." };
  }
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };

  const { data: existing } = await admin
    .from("admin_profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();
  if (existing) return { error: "That username is already taken." };

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
  });
  if (createError || !created?.user) return { error: "Could not create the account. Try again." };

  const { error: profileError } = await admin.from("admin_profiles").insert({
    id: created.user.id,
    username,
    display_name: displayName,
    active: true,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => {});
    return { error: "Could not finish setting up the account. Try again." };
  }

  await admin.from("invitations").update({ accepted_at: new Date().toISOString() }).eq("id", invitation.id);

  redirect("/login");
}
