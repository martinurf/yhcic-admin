"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin, requireOwner } from "@/lib/require-admin";
import { generateToken, hashToken } from "@/lib/invite-token";

const INVITE_TTL_DAYS = 7;

export async function createInvite(formData) {
  const admin = await requireActiveAdmin();
  if (!admin) return { error: "Not signed in." };

  const name = String(formData.get("name") || "").trim() || null;

  const supabase = createAdminClient();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // No real email is collected — the invitee never needs one, they just
  // set a username and password. Supabase Auth still requires *an*
  // email internally, so this generates one nobody will ever see or use.
  const placeholderEmail = `invite-${generateToken().slice(0, 16)}@invite.yhcic.internal`;

  const { error } = await supabase.from("invitations").insert({
    email: placeholderEmail,
    invited_name: name,
    token_hash: hashToken(token),
    invited_by: admin.id,
    expires_at: expiresAt,
  });
  if (error) return { error: "Could not create the invitation." };

  const host = (await headers()).get("host");
  const proto = host?.startsWith("localhost") ? "http" : "https";
  const link = `${proto}://${host}/join/${token}`;

  revalidatePath("/team");
  return { ok: true, link, expiresAt };
}

export async function removeInvite(id) {
  const admin = await requireActiveAdmin();
  if (!admin) return { error: "Not signed in." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id)
    .is("accepted_at", null);
  if (error) return { error: "Could not remove the invitation." };

  revalidatePath("/team");
  return { ok: true };
}

/* Until now there was no way to actually cut off an officer who already
   has an account — only a not-yet-accepted invitation could be revoked.
   Owner-only, and can't be used on your own account (that would be a
   self-lockout with no one left to undo it). Flipping `active` is the
   real boundary here: every RLS policy re-checks it on every query via
   is_active_admin(), so this takes effect immediately even if their
   browser still holds a live session — it just stops being able to
   read or write anything. */
export async function setAdminActive(id, active) {
  const owner = await requireOwner();
  if (!owner) return { error: "Not authorized." };
  if (id === owner.id) return { error: "You can't change your own access." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("admin_profiles").update({ active }).eq("id", id);
  if (error) return { error: "Could not update that officer's access." };

  revalidatePath("/team");
  return { ok: true };
}
