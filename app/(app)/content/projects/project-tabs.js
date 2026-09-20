"use client";

import { useState } from "react";
import Link from "next/link";
import { mediaPublicUrl } from "@/lib/media-url";
import RequestPublishButton from "../request-publish-button";
import { requestProjectPublish } from "./actions";

function statusOf(p) {
  if (p.published) return { label: "Published", tone: "published" };
  if (p.requested_at) return { label: "Requested", tone: "pending" };
  return { label: "Draft", tone: "draft" };
}

function Row({ p, index }) {
  const status = statusOf(p);
  const thumb = mediaPublicUrl(p.media?.storage_key);
  return (
    <article className="work-card">
      <span className="work-num">{String(index + 1).padStart(2, "0")}</span>
      <div>
        {thumb ? (
          <img src={thumb} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", marginBottom: 10, borderRadius: "var(--radius)" }} />
        ) : null}
        <Link href={`/content/projects/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <h3>
            {p.title}
            {p.is_private ? <span className="list__title-meta"> — private</span> : null}
          </h3>
        </Link>
        <p>{p.status}</p>
      </div>
      <div className="work-card__actions">
        <span className={`badge badge--${status.tone}`}>{status.label}</span>
        {status.tone === "draft" && !p.is_private ? (
          <RequestPublishButton id={p.id} requestAction={requestProjectPublish} />
        ) : (
          <Link href={`/content/projects/${p.id}`} className="text-btn">Edit</Link>
        )}
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

  return (
    <>
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

      <div style={{ marginTop: 16 }}>
        {lists[tab].length ? (
          lists[tab].map((p, i) => <Row key={p.id} p={p} index={i} />)
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
