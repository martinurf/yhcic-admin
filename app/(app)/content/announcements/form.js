"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAnnouncement, deleteAnnouncement } from "./actions";

function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

export default function AnnouncementForm({ announcement, imageUrl }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(imageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageDims, setImageDims] = useState(null);

  async function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setRemoveImage(false);

    /* iPhones save photos as HEIC by default, which no browser can
       decode — catch it up front with a message that says what to do,
       instead of the generic "could not read that image" a failed
       Image() decode would otherwise produce. */
    const looksHeic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
    if (looksHeic) {
      setError('That looks like an iPhone HEIC photo — browsers can\'t read those. In Photos, tap Share, then "Options" and switch the format to JPEG before sharing it here (or take a screenshot instead).');
      e.target.value = "";
      return;
    }

    try {
      const dims = await readImageDimensions(file);
      setImageDims(dims);
      setPreview(URL.createObjectURL(file));
    } catch {
      setError("Could not read that image — it may be a format browsers can't decode. Try a JPEG or PNG.");
      e.target.value = "";
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (imageDims) {
      formData.set("imageWidth", String(imageDims.width));
      formData.set("imageHeight", String(imageDims.height));
    }
    if (removeImage) formData.set("removeImage", "on");
    startTransition(async () => {
      const res = await saveAnnouncement(announcement?.id, formData);
      if (res?.error) setError(res.error);
      else router.push("/content/announcements");
    });
  }

  function onDelete() {
    if (!announcement?.id) return;
    if (!confirm("Remove this announcement? It stays recoverable — this is a soft delete.")) return;
    startTransition(async () => {
      const res = await deleteAnnouncement(announcement.id);
      if (res?.error) setError(res.error);
      else router.push("/content/announcements");
    });
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="fld">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" defaultValue={announcement?.title} maxLength={140} required />
      </div>

      <div className="fld">
        <label htmlFor="body">Body</label>
        <textarea id="body" name="body" rows={8} defaultValue={announcement?.body} maxLength={4000} required />
        <p className="fld__hint">Plain text for now — no HTML is rendered from this field.</p>
      </div>

      <div className="fld">
        <label htmlFor="image">Image <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional — flyer, photo</em></label>
        {preview && !removeImage ? (
          <div style={{ marginBottom: 8 }}>
            <img
              src={preview}
              alt=""
              style={{ maxWidth: "100%", maxHeight: 220, borderRadius: "var(--radius)", border: "1px solid var(--line)", display: "block" }}
            />
            <button
              type="button"
              className="btn btn--sm"
              style={{ marginTop: 8 }}
              onClick={() => {
                setRemoveImage(true);
                setPreview(null);
                setImageDims(null);
              }}
            >
              Remove image
            </button>
          </div>
        ) : null}
        <input id="image" name="image" type="file" accept="image/*" onChange={onImageChange} />
        <p className="fld__hint">JPEG, PNG, or WebP — up to 8MB. Shows in place of the YHCIC mark wherever this announcement appears.</p>
      </div>

      <label className="row" style={{ fontSize: 13.5 }}>
        <input type="checkbox" name="published" defaultChecked={announcement?.published} style={{ width: "auto" }} />
        Published
      </label>

      {error ? <p className="status-text" data-tone="err">{error}</p> : null}

      <div className="form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        {announcement?.id ? (
          <button type="button" className="btn btn--danger" disabled={pending} onClick={onDelete}>
            Remove
          </button>
        ) : null}
      </div>
    </form>
  );
}
