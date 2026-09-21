"use server";

import { requireActiveAdmin } from "@/lib/require-admin";
import { uploadContentImage } from "@/lib/media-upload";
import { saveContent, softDeleteContent, requestPublish, resolvePublishRequest } from "@/lib/content";

const TABLE = "members";
const PATH = "/content/members";

export async function saveMember(id, formData) {
  const me = await requireActiveAdmin();
  if (!me) return { error: "Not signed in." };

  const removeImage = formData.get("removeImage") === "on";
  const data = {
    name: String(formData.get("name") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    major: String(formData.get("major") || "").trim() || null,
    focus: String(formData.get("focus") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    class_of: String(formData.get("classOf") || "").trim() || null,
    team: String(formData.get("team") || "").trim() || null,
  };
  if (!data.name) return { error: "Name is required." };

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const width = Number(formData.get("imageWidth"));
    const height = Number(formData.get("imageHeight"));
    const result = await uploadContentImage(me.id, imageFile, width, height);
    if (result.error) return { error: result.error };
    data.media_id = result.mediaId;
  } else if (removeImage) {
    data.media_id = null;
  }

  return saveContent(TABLE, id, data, PATH);
}

const TEAMS = ["Equity Research", "Markets", "Operations", "Communications"];

/* "Join a team" is just this one field — no reason to send someone
   through the full edit form (photo, role, major, everything) to set
   it. */
export async function setMyTeam(memberId, team) {
  const me = await requireActiveAdmin();
  if (!me) return { error: "Not signed in." };
  if (!TEAMS.includes(team)) return { error: "Not a real team." };

  return saveContent(TABLE, memberId, { team }, PATH);
}

export async function deleteMember(id) {
  return softDeleteContent(TABLE, id, PATH);
}

export async function requestMemberPublish(id) {
  return requestPublish(TABLE, id, PATH);
}

export async function resolveMemberRequest(id, publish) {
  return resolvePublishRequest(TABLE, id, publish, PATH);
}
