/* The "media" Storage bucket is public — these are images meant to be
   seen (flyers, photos), not gated files like the "resources" bucket.
   A public bucket's objects are reachable by a plain, stable URL with
   no signing/expiry to manage. */
export function mediaPublicUrl(storageKey) {
  if (!storageKey) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${storageKey}`;
}
