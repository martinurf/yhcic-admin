"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveAdmin } from "@/lib/require-admin";
import { uploadContentImage } from "@/lib/media-upload";
import { saveContent, softDeleteContent } from "@/lib/content";

const TABLE = "announcements";
const PATH = "/content/announcements";

export async function saveAnnouncement(id, formData) {
  const me = await requireActiveAdmin();
  if (!me) return { error: "Not signed in." };

  const published = formData.get("published") === "on";
  const isPrivate = formData.get("isPrivate") === "on";
  const removeImage = formData.get("removeImage") === "on";
  const data = {
    title: String(formData.get("title") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    published,
    /* A published announcement is, definitionally, shared — you can't
       publish something to the member feed and keep it private at the
       same time, so publishing always forces this false regardless of
       what the toggle said. */
    is_private: published ? false : isPrivate,
  };

  if (!data.title || !data.body) return { error: "Title and body are required." };
  if (data.title.length > 140) return { error: "Title is too long (140 characters max)." };
  if (data.body.length > 4000) return { error: "Body is too long (4000 characters max)." };

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
