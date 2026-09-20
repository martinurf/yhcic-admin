"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProject, deleteProject, requestProjectPublish } from "./actions";

function statusOf(project) {
  if (!project) return null;
  if (project.published) return { label: "Published", tone: "published" };
  if (project.requested_at) return { label: "Requested", tone: "pending" };
  return { label: "Draft", tone: "draft" };
}

export default function ProjectForm({ project }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const status = statusOf(project);

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveProject(project?.id, formData);
      if (res?.error) setError(res.error);
      else router.push("/content/projects");
    });
  }

  function onDelete() {
    if (!project?.id) return;
    if (!confirm("Remove this project? It stays recoverable — this is a soft delete.")) return;
    startTransition(async () => {
      const res = await deleteProject(project.id);
      if (res?.error) setError(res.error);
      else router.push("/content/projects");
    });
  }

  function onRequest() {
    if (!project?.id) return;
    startTransition(async () => {
      const res = await requestProjectPublish(project.id);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      {status ? (
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className={`badge badge--${status.tone}`}>{status.label}</span>
          {status.tone === "draft" ? (
            <button type="button" className="btn btn--sm" disabled={pending} onClick={onRequest}>
              Send request to publish
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="fld">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" defaultValue={project?.title} required />
      </div>
      <div className="form__row">
        <div className="fld">
          <label htmlFor="status">Status</label>
          <input id="status" name="status" type="text" placeholder="Planned / In Development / Active" defaultValue={project?.status} required />
        </div>
        <div className="fld">
          <label htmlFor="code">Code</label>
          <input id="code" name="code" type="text" placeholder="01 / RES" defaultValue={project?.code || ""} />
        </div>
      </div>
      <div className="fld">
        <label htmlFor="body">Description</label>
        <textarea id="body" name="body" rows={5} defaultValue={project?.body} required />
      </div>

      {error ? <p className="status-text" data-tone="err">{error}</p> : null}

      <div className="form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        {project?.id ? (
          <button type="button" className="btn btn--danger" disabled={pending} onClick={onDelete}>Remove</button>
        ) : null}
      </div>
    </form>
  );
}
