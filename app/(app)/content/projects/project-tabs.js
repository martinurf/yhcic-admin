"use client";

import { useState } from "react";
import Link from "next/link";
import { mediaPublicUrl } from "@/lib/media-url";
import RequestPublishButton from "../request-publish-button";
import { requestProjectPublish } from "./actions";

function statusOf(p) {
  if (p.published) return { label: "Live", tone: "live" };
  if (p.requested_at) return { label: "Requested", tone: "pending" };
  return { label: p.is_private ? "Private draft" : "Draft", tone: "" };
}

function Row({ p, index }) {
  const status = statusOf(p);
  const thumb = mediaPublicUrl(p.media?.storage_key);
  const author = p.author?.display_name || p.author?.username || "Unknown";
  const updated = new Date(p.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <article className="work-card">
      <span className="work-num">{String(index + 1).padStart(2, "0")}</span>
      <div>
        {thumb ? (
          <img src={thumb} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", marginBottom: 10 }} />
        ) : null}
        <Link href={`/content/projects/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <h3>{p.title}</h3>
        </Link>
        <p>{p.status}</p>
        <div className="meta">
          <span>{author}</span>
          <span>Updated {updated}</span>
          <span className={`status${status.tone ? ` ${status.tone}` : ""}`}>{status.label}</span>
        </div>
      </div>
      <div className="work-card__actions">
        <Link href={`/content/projects/${p.id}`} className="text-btn">Edit</Link>
        {!p.published && !p.requested_at && !p.is_private ? (
          <RequestPublishButton id={p.id} requestAction={requestProjectPublish} />
        ) : null}
      </div>
    </article>
  );
}

export default function ProjectTabs({ workspace, mine, requests }) {
  const [tab, setTab] = useState("workspace");
  const lists = { workspace, mine, requests };
  const empties = {
    workspace: "No shared projects yet — start one, or mark a private draft as shared.",
    mine: "No private drafts. Check \"Private draft\" when saving to keep something to yourself for now.",
    requests: "No pending public-site requests.",
  };
  const toolbars = {
    workspace: { h2: "In progress", eyebrow: "Internal only" },
    mine: { h2: "My drafts", eyebrow: "Only you" },
    requests: { h2: "Publication review", eyebrow: "Official website" },
  };

  return (
    <div className="workspace">
      <div className="tabs">
        <button type="button" className={`tab${tab === "workspace" ? " active" : ""}`} onClick={() => setTab("workspace")}>
          Club workspace ({workspace.length})
        </button>
        <button type="button" className={`tab${tab === "mine" ? " active" : ""}`} onClick={() => setTab("mine")}>
          My private drafts ({mine.length})
        </button>
        <button type="button" className={`tab${tab === "requests" ? " active" : ""}`} onClick={() => setTab("requests")}>
          Public requests ({requests.length})
        </button>
      </div>

      <div className="section-toolbar" style={{ marginTop: 27 }}>
        <h2>{toolbars[tab].h2}</h2>
        <span className="eyebrow">{toolbars[tab].eyebrow}</span>
      </div>
      <div className="editorial-list">
        {lists[tab].length ? (
          lists[tab].map((p, i) => <Row key={p.id} p={p} index={i} />)
        ) : (
          <p className="empty">
            <strong>Nothing here yet</strong>
            {empties[tab]}
          </p>
        )}
      </div>
    </div>
  );
}
