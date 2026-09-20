"use server";

import { saveContent, softDeleteContent } from "@/lib/content";

const TABLE = "projects";
const PATH = "/content/projects";

export async function saveProject(id, formData) {
  const data = {
    title: String(formData.get("title") || "").trim(),
    status: String(formData.get("status") || "").trim(),
    code: String(formData.get("code") || "").trim() || null,
    body: String(formData.get("body") || "").trim(),
    published: formData.get("published") === "on",
  };
  if (!data.title || !data.status || !data.body) return { error: "Title, status, and body are required." };
  return saveContent(TABLE, id, data, PATH);
}

export async function deleteProject(id) {
  return softDeleteContent(TABLE, id, PATH);
}
