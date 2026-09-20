"use server";

import { saveContent, softDeleteContent } from "@/lib/content";

const TABLE = "goals";
const PATH = "/content/goals";

export async function saveGoal(id, formData) {
  const data = {
    n: String(formData.get("n") || "").trim(),
    stage: String(formData.get("stage") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    published: formData.get("published") === "on",
  };
  if (!data.n || !data.stage || !data.title || !data.body) return { error: "All fields are required." };
  return saveContent(TABLE, id, data, PATH);
}

export async function deleteGoal(id) {
  return softDeleteContent(TABLE, id, PATH);
}
