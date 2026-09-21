"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteResource, getDownloadUrl, updateResource, forkResource } from "./actions";
import { postComment } from "@/lib/comments";

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function authorName(a) {
  return a?.display_name || a?.username || "Unknown";
}

export default function ResourceRow({ resource, comments, originTitle, canEdit }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState(null);

  function onDownload() {
    // Opening the tab has to happen synchronously in the click handler —
    // Safari on iOS no longer counts it as user-initiated once a await
    // (the server action round-trip) comes first, and silently leaves
    // the new tab blank instead of navigating it. Open it immediately,
    // point it at the real URL once the signed link comes back.
    const win = window.open("", "_blank");
    startTransition(async () => {
      const res = await getDownloadUrl(resource.storage_key);
      if (win) {
        if (res?.url) win.location.href = res.url;
        else win.close();
      }
    });
  }

  function onDelete() {
    if (!confirm("Remove this? It stays recoverable — this is a soft delete.")) return;
    startTransition(async () => {
      await deleteResource(resource.id, resource.storage_key);
      router.refresh();
    });
  }

  function onFork() {
    startTransition(async () => {
      const res = await forkResource(resource.id);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  function onSaveEdit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateResource(resource.id, formData);
      if (res?.error) setError(res.error);
      else { setEditing(false); router.refresh(); }
    });
  }

  function onComment(e) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await postComment("resources", resource.id, commentText, location.pathname);
      if (res?.error) setError(res.error);
      else { setCommentText(""); router.refresh(); }
    });
  }

  const openLink = resource.url ? () => window.open(resource.url, "_blank", "noopener") : onDownload;
  const sub = [
    resource.url ? new URL(resource.url).hostname.replace(/^www\./, "") : resource.file_name,
    resource.file_size ? formatSize(resource.file_size) : null,
    new Date(resource.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  ].filter(Boolean).join(" · ");

  if (editing) {
    return (
      <article className="source-card" data-source-card style={{ gridTemplateColumns: "1fr" }}>
        <form onSubmit={onSaveEdit} className="stack">
          <div className="fld">
            <label htmlFor={`title-${resource.id}`}>Title</label>
            <input id={`title-${resource.id}`} name="title" defaultValue={resource.title} required />
          </div>
          <div className="fld">
            <label htmlFor={`url-${resource.id}`}>Link</label>
            <input id={`url-${resource.id}`} name="url" type="url" defaultValue={resource.url || ""} placeholder="https://" />
          </div>
          <div className="fld">
            <label htmlFor={`type-${resource.id}`}>Type</label>
            <select id={`type-${resource.id}`} name="type" defaultValue={resource.type}>
              <option value="ARTICLE">ARTICLE</option>
              <option value="DATA">DATA</option>
              <option value="FILINGS">FILINGS</option>
              <option value="DOCUMENT">DOCUMENT</option>
              <option value="NOTE">NOTE</option>
            </select>
          </div>
          <div className="fld">
            <label htmlFor={`description-${resource.id}`}>Notes</label>
            <textarea id={`description-${resource.id}`} name="description" rows={2} defaultValue={resource.description || ""} />
          </div>
          {error ? <p className="status-text" data-tone="err">{error}</p> : null}
          <div className="form__actions">
            <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
            <button type="button" className="btn" disabled={pending} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="source-card" data-source-card>
      <div className="source-type">{resource.type || "NOTE"}</div>
      <div>
        <h3>{resource.title}</h3>
        <p>{resource.description || sub}</p>
        {originTitle ? <p className="fld__hint" style={{ marginTop: 4 }}>A copy of {originTitle}</p> : null}
        <div className="meta">
          <span>{authorName(resource.uploader)}</span>
          <button type="button" className="text-btn" onClick={() => setThreadOpen((v) => !v)}>
            {threadOpen ? "Hide thread" : `Thread (${comments.length})`}
          </button>
          {canEdit ? <button type="button" className="text-btn" disabled={pending} onClick={() => setEditing(true)}>Edit</button> : null}
          <button type="button" className="text-btn" disabled={pending} onClick={onFork}>Make a copy</button>
          {canEdit ? <button type="button" className="text-btn" disabled={pending} onClick={onDelete}>Remove</button> : null}
        </div>

        {threadOpen ? (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
            {comments.length ? comments.map((c) => (
              <div key={c.id} className="meta" style={{ marginTop: 0, marginBottom: 10, alignItems: "flex-start" }}>
                <div>
                  <strong style={{ display: "block", fontSize: 12.5 }}>{authorName(c.author)}</strong>
                  <span>{c.body}</span>
                </div>
              </div>
            )) : <p className="fld__hint">No comments yet.</p>}
            <form onSubmit={onComment} style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment…" style={{ flex: 1 }} />
              <button className="btn btn--sm" type="submit" disabled={pending || !commentText.trim()}>Post</button>
            </form>
            {error ? <p className="status-text" data-tone="err">{error}</p> : null}
          </div>
        ) : null}
      </div>
      <button type="button" className="source-link" disabled={pending} onClick={openLink} aria-label={`Open ${resource.title}`}>
        <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>
      </button>
    </article>
  );
}
