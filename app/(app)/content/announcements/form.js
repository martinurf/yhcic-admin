"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAnnouncement, deleteAnnouncement } from "./actions";

export default function AnnouncementForm({ announcement }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
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
