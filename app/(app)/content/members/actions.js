"use server";

import { saveContent, softDeleteContent, requestPublish, resolvePublishRequest } from "@/lib/content";

const TABLE = "members";
const PATH = "/content/members";

export async function saveMember(id, formData) {
  const data = {
    name: String(formData.get("name") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    major: String(formData.get("major") || "").trim() || null,
    focus: String(formData.get("focus") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
  };
  if (!data.name) return { error: "Name is required." };
  return saveContent(TABLE, id, data, PATH);
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
