"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteResource, updateResource, forkResource } from "../actions";
import { postComment } from "@/lib/comments";

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function authorName(a) {
  return a?.display_name || a?.username || "Unknown";
}

export default function SourceDetail({ resource, comments, originTitle, canEdit, editing }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState(null);

  const isImage = resource.content_type?.startsWith("image/");
  const downloadHref = `/api/sources/${resource.id}/download`;

  function onSaveEdit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateResource(resource.id, formData);
      if (res?.error) setError(res.error);
      else router.push(`/content/sources/${resource.id}`);
    });
  }

  function onDelete() {
    if (!confirm("Remove this? It stays recoverable — this is a soft delete.")) return;
    startTransition(async () => {
      await deleteResource(resource.id, resource.storage_key);
      router.push("/content/sources");
    });
  }

  function onFork() {
    startTransition(async () => {
      const res = await forkResource(resource.id);
      if (res?.error) setError(res.error);
      else router.push("/content/sources");
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

  if (editing) {
    return (
      <>
        <h1 className="page__title" style={{ marginBottom: 24 }}>Edit source</h1>
        <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
          <form onSubmit={onSaveEdit} className="stack">
            <div className="fld">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" defaultValue={resource.title} required />
            </div>
            <div className="fld">
              <label htmlFor="url">Link</label>
              <input id="url" name="url" type="url" defaultValue={resource.url || ""} placeholder="https://" />
            </div>
            <div className="fld">
              <label htmlFor="type">Type</label>
              <select id="type" name="type" defaultValue={resource.type}>
                <option value="ARTICLE">ARTICLE</option>
                <option value="DATA">DATA</option>
                <option value="FILINGS">FILINGS</option>
                <option value="DOCUMENT">DOCUMENT</option>
                <option value="NOTE">NOTE</option>
              </select>
            </div>
            <div className="fld">
              <label htmlFor="description">Why it matters / notes</label>
              <textarea id="description" name="description" rows={3} defaultValue={resource.description || ""} />
            </div>
            {error ? <p className="status-text" data-tone="err">{error}</p> : null}
            <div className="form__actions">
              <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
              <Link href={`/content/sources/${resource.id}`} className="btn">Cancel</Link>
            </div>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="panel" style={{ padding: 24, maxWidth: 560 }}>
        <div className="source-type" style={{ marginBottom: 14 }}>{resource.type || "NOTE"}</div>
        <h1 className="page__title" style={{ marginBottom: 10 }}>{resource.title}</h1>
        {originTitle ? <p className="fld__hint" style={{ marginTop: -4, marginBottom: 10 }}>A copy of {originTitle}</p> : null}
        {resource.description ? <p className="source-card__why" style={{ fontSize: "1rem", marginBottom: 14 }}>{resource.description}</p> : null}
        {resource.url ? (
          <a href={resource.url} target="_blank" rel="noopener" className="source-card__url" style={{ fontSize: ".9rem", marginBottom: 14 }}>
            {resource.url}
          </a>
        ) : null}
        {resource.storage_key ? (
          <div className="source-file" style={{ margin: "14px 0" }}>
            {isImage ? (
              <a href={downloadHref} target="_blank" rel="noopener">
                <img src={downloadHref.replace("/download", "/preview")} alt={resource.file_name || ""} style={{ maxWidth: "100%", display: "block", border: "1px solid var(--line)" }} />
              </a>
            ) : null}
            <a href={downloadHref} target="_blank" rel="noopener" className="btn btn--sm" style={{ marginTop: isImage ? 10 : 0, display: "inline-flex" }}>
              Download {resource.file_name}{resource.file_size ? ` (${formatSize(resource.file_size)})` : ""}
            </a>
          </div>
        ) : null}
        <p className="fld__hint" style={{ marginTop: 14 }}>
          Added by {authorName(resource.uploader)} &middot; {new Date(resource.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>

        <div className="form__actions" style={{ marginTop: 18 }}>
          {canEdit ? <Link href={`/content/sources/${resource.id}?edit=1`} className="primary">Edit</Link> : null}
          <button type="button" className="secondary" disabled={pending} onClick={onFork}>Make a copy</button>
          {canEdit ? <button type="button" className="secondary" disabled={pending} onClick={onDelete}>Remove</button> : null}
        </div>
        {error ? <p className="status-text" data-tone="err" style={{ marginTop: 10 }}>{error}</p> : null}
      </div>

      <div className="panel" style={{ padding: 22, maxWidth: 560, marginTop: 14 }}>
        <h2 className="fld__hint" style={{ textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
          Thread {comments.length ? `(${comments.length})` : ""}
        </h2>
        {comments.length ? comments.map((c) => (
          <div key={c.id} className="meta" style={{ marginTop: 0, marginBottom: 14, alignItems: "flex-start" }}>
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
      </div>
    </>
  );
}
