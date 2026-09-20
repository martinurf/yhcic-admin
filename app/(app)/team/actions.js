"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import { generateToken, hashToken } from "@/lib/invite-token";

const INVITE_TTL_DAYS = 7;

export async function createInvite(formData) {
  const admin = await requireActiveAdmin();
  if (!admin) return { error: "Not signed in." };

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = createAdminClient();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("invitations").insert({
    email,
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

export async function revokeInvite(id) {
  const admin = await requireActiveAdmin();
  if (!admin) return { error: "Not signed in." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("accepted_at", null)
    .is("revoked_at", null);
  if (error) return { error: "Could not revoke the invitation." };

  revalidatePath("/team");
  return { ok: true };
}
