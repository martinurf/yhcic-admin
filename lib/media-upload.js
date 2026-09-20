import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB, matches the bucket's own limit

/* Uploads straight to Storage and rows the result in `media`, same
   service-role pattern as Sources & Research uploads. Shared by
   Announcements and Projects — both attach a photo the same way,
   through the same public "media" bucket. Content goes straight to
   "published" media status: neither content type holds the image
   itself in a review queue, only the row it's attached to. */
export async function uploadContentImage(uploaderId, file, width, height) {
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
