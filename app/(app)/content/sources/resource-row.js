"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteResource, getDownloadUrl } from "./actions";

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResourceRow({ resource }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDownload() {
    startTransition(async () => {
      const res = await getDownloadUrl(resource.storage_key);
      if (res?.url) window.open(res.url, "_blank", "noopener");
    });
  }

  function onDelete() {
    if (!confirm("Remove this file? It stays recoverable — this is a soft delete.")) return;
    startTransition(async () => {
      await deleteResource(resource.id, resource.storage_key);
      router.refresh();
    });
  }

  const openLink = resource.url ? () => window.open(resource.url, "_blank", "noopener") : onDownload;
  const sub = [
    resource.url ? new URL(resource.url).hostname.replace(/^www\./, "") : resource.file_name,
    resource.file_size ? formatSize(resource.file_size) : null,
    new Date(resource.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  ].filter(Boolean).join(" · ");

  return (
    <article className="source-card" data-source-card>
      <div className="source-type">{resource.type || "NOTE"}</div>
      <div>
        <h3>{resource.title}</h3>
        <p>{resource.description || sub}</p>
      </div>
      <button type="button" className="source-link" disabled={pending} onClick={openLink} aria-label={`Open ${resource.title}`}>
        <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>
      </button>
      <button type="button" className="text-btn" disabled={pending} onClick={onDelete} style={{ gridColumn: "2", justifySelf: "start" }}>
        Remove
      </button>
    </article>
  );
}
