"use client";

import { useState } from "react";
import Link from "next/link";
import { mediaPublicUrl } from "@/lib/media-url";

function PostCard({ a }) {
  const thumb = mediaPublicUrl(a.media?.storage_key);
  return (
    <Link href={`/content/announcements/${a.id}`} className="post-card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div className="post-card__head">
        <span className={`badge badge--${a.published ? "published" : "draft"}`}>
          {a.published ? "Published" : a.is_private ? "Private" : "Draft"}
        </span>
        <span className="list__sub">Updated {new Date(a.updated_at).toLocaleDateString()}</span>
      </div>
      <h3 className="post-card__title">{a.title}</h3>
      <p className="post-card__body">{a.body}</p>
      {thumb ? <img className="post-card__image" src={thumb} alt="" /> : null}
    </Link>
  );
}

export default function AnnouncementTabs({ feed, workspace, mine }) {
  const [tab, setTab] = useState("feed");
  const lists = { feed, workspace, mine };
  const empties = {
    feed: "Nothing published to the member feed yet.",
    workspace: "No shared drafts yet — start one, or mark a private draft as shared.",
    mine: "No private drafts. Check \"Private draft\" when saving to keep something to yourself for now.",
  };

  return (
    <>
      <div className="tabs">
        <button type="button" className={`tab${tab === "feed" ? " active" : ""}`} onClick={() => setTab("feed")}>
          Member feed ({feed.length})
        </button>
        <button type="button" className={`tab${tab === "workspace" ? " active" : ""}`} onClick={() => setTab("workspace")}>
          Club workspace ({workspace.length})
        </button>
        <button type="button" className={`tab${tab === "mine" ? " active" : ""}`} onClick={() => setTab("mine")}>
          My private drafts ({mine.length})
        </button>
      </div>

      <div className="feed" style={{ marginTop: 16 }}>
        {lists[tab].length ? (
          lists[tab].map((a) => <PostCard key={a.id} a={a} />)
        ) : (
          <p className="empty">
            <strong>Nothing here yet</strong>
            {empties[tab]}
          </p>
        )}
      </div>
    </>
  );
}
