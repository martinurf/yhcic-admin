"use server";

import { requireActiveAdmin } from "@/lib/require-admin";
import { uploadContentImage } from "@/lib/media-upload";
import { saveContent, softDeleteContent, requestPublish, resolvePublishRequest } from "@/lib/content";

const TABLE = "projects";
const PATH = "/content/projects";

export async function saveProject(id, formData) {
  const me = await requireActiveAdmin();
  if (!me) return { error: "Not signed in." };

  const isPrivate = formData.get("isPrivate") === "on";
  const removeImage = formData.get("removeImage") === "on";
  const data = {
    title: String(formData.get("title") || "").trim(),
    status: String(formData.get("status") || "").trim(),
    code: String(formData.get("code") || "").trim() || null,
    body: String(formData.get("body") || "").trim(),
    notes: String(formData.get("notes") || "").trim() || null,
    is_private: isPrivate,
  };
  if (!data.title || !data.status || !data.body) return { error: "Title, status, and body are required." };

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

export async function deleteProject(id) {
  return softDeleteContent(TABLE, id, PATH);
}

export async function requestProjectPublish(id) {
  return requestPublish(TABLE, id, PATH);
}

export async function resolveProjectRequest(id, publish) {
  return resolvePublishRequest(TABLE, id, publish, PATH);
}
