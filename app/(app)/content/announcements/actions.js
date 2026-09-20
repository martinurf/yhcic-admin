"use server";

import { saveContent, softDeleteContent } from "@/lib/content";

const TABLE = "announcements";
const PATH = "/content/announcements";

export async function saveAnnouncement(id, formData) {
  const published = formData.get("published") === "on";
  const data = {
    title: String(formData.get("title") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    published,
  };

  if (!data.title || !data.body) return { error: "Title and body are required." };
  if (data.title.length > 140) return { error: "Title is too long (140 characters max)." };
  if (data.body.length > 4000) return { error: "Body is too long (4000 characters max)." };

  if (published) data.published_at = new Date().toISOString();

  return saveContent(TABLE, id, data, PATH);
}

export async function deleteAnnouncement(id) {
  return softDeleteContent(TABLE, id, PATH);
}
