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

function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

export default function ProjectForm({ project, imageUrl }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(imageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageDims, setImageDims] = useState(null);
  const status = statusOf(project);

  async function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setRemoveImage(false);

    const looksHeic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
    if (looksHeic) {
      setError('That looks like an iPhone HEIC photo — browsers can\'t read those. In Photos, tap Share, then "Options" and switch the format to JPEG before sharing it here (or take a screenshot instead).');
      e.target.value = "";
      return;
    }

    try {
      const dims = await readImageDimensions(file);
      setImageDims(dims);
      setPreview(URL.createObjectURL(file));
    } catch {
      setError("Could not read that image — it may be a format browsers can't decode. Try a JPEG or PNG.");
      e.target.value = "";
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (imageDims) {
      formData.set("imageWidth", String(imageDims.width));
      formData.set("imageHeight", String(imageDims.height));
    }
    if (removeImage) formData.set("removeImage", "on");
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
          {status.tone === "draft" && !project?.is_private ? (
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

      <div className="fld">
        <label htmlFor="image">Image <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional — cover photo, chart, mockup</em></label>
        {preview && !removeImage ? (
          <div style={{ marginBottom: 8 }}>
            <img
              src={preview}
              alt=""
              style={{ maxWidth: "100%", maxHeight: 220, borderRadius: "var(--radius)", border: "1px solid var(--line)", display: "block" }}
            />
            <button
              type="button"
              className="btn btn--sm"
              style={{ marginTop: 8 }}
              onClick={() => {
                setRemoveImage(true);
                setPreview(null);
                setImageDims(null);
              }}
            >
              Remove image
            </button>
          </div>
        ) : null}
        <input id="image" name="image" type="file" accept="image/*" onChange={onImageChange} />
        <p className="fld__hint">JPEG, PNG, or WebP — up to 8MB.</p>
      </div>

      <label className="row" style={{ fontSize: 13.5 }}>
        <input type="checkbox" name="isPrivate" defaultChecked={project?.is_private} style={{ width: "auto" }} />
        Private draft — only you can see this
      </label>
      <p className="fld__hint" style={{ marginTop: -10 }}>
        Leave unchecked to share it with every officer in the club workspace right away.
      </p>

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
