"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProject, deleteProject } from "./actions";

export default function ProjectForm({ project }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

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

  return (
    <form onSubmit={onSubmit} className="stack">
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

      <label className="row" style={{ fontSize: 13.5 }}>
        <input type="checkbox" name="published" defaultChecked={project?.published} style={{ width: "auto" }} />
        Published
      </label>

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
