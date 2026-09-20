"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/require-admin";
import { saveContent, softDeleteContent } from "@/lib/content";

const TABLE = "announcements";
const PATH = "/content/announcements";
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB, matches the bucket's own limit

/* Uploads straight to Storage and rows the result in `media`, same
   service-role pattern as Sources & Research uploads. Announcements
   are direct-publish content (no owner review step), so the media row
   goes straight to "published" — there's no separate approval stage
   for it to wait in. */
async function uploadAnnouncementImage(uploaderId, file, width, height) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { error: "Image must be JPEG, PNG, or WebP." };
  if (file.size > MAX_IMAGE_SIZE) return { error: "Image is larger than 8MB." };
  if (!width || !height) return { error: "Could not read the image dimensions. Try a different file." };

  const ext = file.type.split("/")[1];
  const storageKey = `${crypto.randomUUID()}.${ext}`;
  const service = createAdminClient();

  const { error: uploadError } = await service.storage.from("media").upload(storageKey, file, {
    contentType: file.type,
  });
  if (uploadError) return { error: "Image upload failed. Try again." };

  const { data: mediaRow, error: mediaError } = await service
    .from("media")
    .insert({
      storage_key: storageKey,
      content_type: file.type,
      byte_size: file.size,
      width,
      height,
      status: "published",
      uploaded_by: uploaderId,
    })
    .select("id")
    .single();
  if (mediaError || !mediaRow) {
    await service.storage.from("media").remove([storageKey]);
    return { error: "Could not save the image. Try again." };
  }

  return { ok: true, mediaId: mediaRow.id };
}

export async function saveAnnouncement(id, formData) {
  const me = await requireActiveAdmin();
  if (!me) return { error: "Not signed in." };

  const published = formData.get("published") === "on";
  const removeImage = formData.get("removeImage") === "on";
  const data = {
    title: String(formData.get("title") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    published,
  };

  if (!data.title || !data.body) return { error: "Title and body are required." };
  if (data.title.length > 140) return { error: "Title is too long (140 characters max)." };
  if (data.body.length > 4000) return { error: "Body is too long (4000 characters max)." };

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const width = Number(formData.get("imageWidth"));
    const height = Number(formData.get("imageHeight"));
    const result = await uploadAnnouncementImage(me.id, imageFile, width, height);
    if (result.error) return { error: result.error };
    data.media_id = result.mediaId;
  } else if (removeImage) {
    data.media_id = null;
  }

  /* published_at marks the moment it first went live — only stamp it on
     the transition into "published", not on every later edit. Without
     this, correcting a typo on an already-live announcement would bump
     it back to the top of the list as if it were brand new. */
  if (published) {
    let alreadyPublished = false;
    if (id) {
      const supabase = await createClient();
      const { data: current } = await supabase.from(TABLE).select("published").eq("id", id).maybeSingle();
      alreadyPublished = !!current?.published;
    }
    if (!alreadyPublished) data.published_at = new Date().toISOString();
  }

  return saveContent(TABLE, id, data, PATH);
}

export async function deleteAnnouncement(id) {
  return softDeleteContent(TABLE, id, PATH);
}
