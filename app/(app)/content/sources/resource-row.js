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

  return (
    <div className="list__row">
      <div>
        <span className="list__title">{resource.title}</span>
        <p className="list__sub">
          {resource.file_name} {resource.file_size ? `· ${formatSize(resource.file_size)}` : ""} &middot;{" "}
          {new Date(resource.created_at).toLocaleDateString()}
        </p>
      </div>
      <span className="row" style={{ gap: 10 }}>
        <button type="button" className="btn btn--sm" disabled={pending} onClick={onDownload}>
          Download
        </button>
        <button type="button" className="btn btn--sm btn--danger" disabled={pending} onClick={onDelete}>
          Remove
        </button>
      </span>
    </div>
  );
}
