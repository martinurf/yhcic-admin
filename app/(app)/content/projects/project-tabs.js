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

function Row({ p }) {
  const status = statusOf(p);
  const thumb = mediaPublicUrl(p.media?.storage_key);
  return (
    <div className="list__row">
      <Link href={`/content/projects/${p.id}`} className="list__row-link">
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          {thumb ? (
            <img src={thumb} alt="" style={{ width: 44, height: 44, borderRadius: "var(--radius)", objectFit: "cover", flexShrink: 0 }} />
          ) : null}
          <div>
            <span className="list__title">
              {p.title}
              {p.is_private ? <span className="list__title-meta"> — private</span> : null}
            </span>
            <p className="list__sub">{p.status}</p>
          </div>
        </div>
      </Link>
      <div className="list__row-actions">
        <span className={`badge badge--${status.tone}`}>{status.label}</span>
        {status.tone === "draft" && !p.is_private ? (
          <RequestPublishButton id={p.id} requestAction={requestProjectPublish} />
        ) : null}
      </div>
    </div>
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

      <div className="list" style={{ marginTop: 16 }}>
        {lists[tab].length ? lists[tab].map((p) => <Row key={p.id} p={p} />) : <p className="list__empty">{empties[tab]}</p>}
      </div>
    </>
  );
}
