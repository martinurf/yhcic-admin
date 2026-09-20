"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB, matches the bucket's own limit

export async function uploadResource(formData) {
  const admin = await requireActiveAdmin();
  if (!admin) return { error: "Not signed in." };

  const ALLOWED_TYPES = ["ARTICLE", "DATA", "FILINGS", "DOCUMENT", "NOTE"];
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const type = ALLOWED_TYPES.includes(formData.get("type")) ? formData.get("type") : "NOTE";
  const file = formData.get("file");
  const hasFile = file instanceof File && file.size > 0;
  const rawUrl = String(formData.get("url") || "").trim();

  if (!title) return { error: "Title is required." };
  if (!hasFile && !rawUrl) return { error: "Add a link or choose a file." };
  if (hasFile && file.size > MAX_SIZE) return { error: "File is larger than 25MB." };

  let url = null;
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      url = parsed.href;
    } catch {
      return { error: "That link doesn't look valid." };
    }
  }

  const supabase = createAdminClient();
  let storageKey = null;
  if (hasFile) {
    storageKey = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("resources").upload(storageKey, file, {
      contentType: file.type || "application/octet-stream",
    });
    if (uploadError) return { error: "Upload failed. Try again." };
  }

  const { error: dbError } = await supabase.from("resources").insert({
    title,
    description,
    type,
    url,
    file_name: hasFile ? file.name : null,
    storage_key: storageKey,
    content_type: hasFile ? file.type || null : null,
    file_size: hasFile ? file.size : null,
    uploaded_by: admin.id,
  });
  if (dbError) {
    if (storageKey) await supabase.storage.from("resources").remove([storageKey]);
    return { error: "Could not save the source." };
  }

  revalidatePath("/content/sources");
  return { ok: true };
}

export async function deleteResource(id, storageKey) {
  const admin = await requireActiveAdmin();
  if (!admin) return { error: "Not signed in." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("resources").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: "Could not remove the file." };

  if (storageKey) await supabase.storage.from("resources").remove([storageKey]).catch(() => {});

  revalidatePath("/content/sources");
  return { ok: true };
}

export async function getDownloadUrl(storageKey) {
  const admin = await requireActiveAdmin();
  if (!admin) return { error: "Not signed in." };

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from("resources").createSignedUrl(storageKey, 60);
  if (error || !data) return { error: "Could not create a download link." };

  return { ok: true, url: data.signedUrl };
}
