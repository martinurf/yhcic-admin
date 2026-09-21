"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postComment, deleteComment } from "@/lib/comments";

function authorName(a) {
  return a?.display_name || a?.username || "Unknown";
}

function when(ts) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Thread({ parentTable, parentId, forks, comments, forkHrefBase, canFork, forkAction }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  const entries = [
    ...forks.map((f) => ({ kind: "fork", id: f.id, at: f.updated_at, author: f.author, title: f.title })),
    ...comments.map((c) => ({ kind: "comment", id: c.id, at: c.created_at, author: c.author, body: c.body })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

  function onFork() {
    startTransition(async () => {
      const res = await forkAction();
      if (res?.error) setError(res.error);
    });
  }

  function onComment(e) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await postComment(parentTable, parentId, text, location.pathname);
      if (res?.error) setError(res.error);
      else { setText(""); router.refresh(); }
    });
  }

  function onDeleteComment(id) {
    startTransition(async () => {
      await deleteComment(id, location.pathname);
      router.refresh();
    });
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div className="section-toolbar">
        <h2>Thread</h2>
        {canFork ? (
          <button type="button" className="text-btn" disabled={pending} onClick={onFork}>
            Make a copy
          </button>
        ) : null}
      </div>

      {entries.length ? (
        <div className="editorial-list">
          {entries.map((e) => (
            <article key={`${e.kind}-${e.id}`} className="work-card" style={{ gridTemplateColumns: "1fr" }}>
              <div className="meta" style={{ marginTop: 0 }}>
                <span>{authorName(e.author)}</span>
                <span>{when(e.at)}</span>
                <span className="status">{e.kind === "fork" ? "Copy" : "Comment"}</span>
              </div>
              {e.kind === "fork" ? (
                <p style={{ marginTop: 8 }}>
                  Made a copy: <Link href={`${forkHrefBase}/${e.id}`}>{e.title}</Link>
                </p>
              ) : (
                <p style={{ marginTop: 8 }}>{e.body}</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="empty"><strong>Nothing yet</strong>No copies or comments so far.</p>
      )}

      <form onSubmit={onComment} style={{ marginTop: 18 }}>
        <div className="fld">
          <label htmlFor="comment">Add a comment</label>
          <textarea id="comment" rows={2} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        {error ? <p className="status-text" data-tone="err">{error}</p> : null}
        <div className="form__actions" style={{ marginTop: 8 }}>
          <button className="btn btn--primary" type="submit" disabled={pending || !text.trim()}>
            {pending ? "Posting…" : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
