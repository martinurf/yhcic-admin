"use client";

import { useState } from "react";
import Link from "next/link";

function Row({ a }) {
  return (
    <Link href={`/content/announcements/${a.id}`} className="list__row">
      <div>
        <span className="list__title">
          {a.title}
          {a.is_private ? <span className="list__title-meta"> — private</span> : null}
        </span>
        <p className="list__sub">Updated {new Date(a.updated_at).toLocaleString()}</p>
      </div>
      <span className={`badge badge--${a.published ? "published" : "draft"}`}>
        {a.published ? "Published" : "Draft"}
      </span>
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

      <div className="list" style={{ marginTop: 16 }}>
        {lists[tab].length ? lists[tab].map((a) => <Row key={a.id} a={a} />) : <p className="list__empty">{empties[tab]}</p>}
      </div>
    </>
  );
}
