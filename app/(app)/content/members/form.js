"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMember, deleteMember, requestMemberPublish } from "./actions";

function statusOf(member) {
  if (!member) return null;
  if (member.published) return { label: "Published", tone: "published" };
  if (member.requested_at) return { label: "Requested", tone: "pending" };
  return { label: "Draft", tone: "draft" };
}

function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that image.")); };
    img.src = url;
  });
}

export default function MemberForm({ member, imageUrl }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(imageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageDims, setImageDims] = useState(null);
  const status = statusOf(member);

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
      const res = await saveMember(member?.id, formData);
      if (res?.error) setError(res.error);
      else router.push("/content/members");
    });
  }

  function onDelete() {
    if (!member?.id) return;
    if (!confirm("Remove this member? It stays recoverable — this is a soft delete.")) return;
    startTransition(async () => {
      const res = await deleteMember(member.id);
      if (res?.error) setError(res.error);
      else router.push("/content/members");
    });
  }

  function onRequest() {
    if (!member?.id) return;
    startTransition(async () => {
      const res = await requestMemberPublish(member.id);
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
        <label htmlFor="image">Photo <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional — shows in the member card and directory</em></label>
        {preview && !removeImage ? (
          <div style={{ marginBottom: 8 }}>
            <img src={preview} alt="" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "50%", border: "1px solid var(--line)", display: "block" }} />
            <button type="button" className="btn btn--sm" style={{ marginTop: 8 }} onClick={() => { setRemoveImage(true); setPreview(null); setImageDims(null); }}>
              Remove photo
            </button>
          </div>
        ) : null}
        <input id="image" name="image" type="file" accept="image/*" onChange={onImageChange} />
        <p className="fld__hint">JPEG, PNG, or WebP — up to 8MB.</p>
      </div>

      <div className="form__row">
        <div className="fld">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" defaultValue={member?.name} required />
        </div>
        <div className="fld">
          <label htmlFor="role">Role <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
          <input id="role" name="role" type="text" placeholder="President" defaultValue={member?.role} />
        </div>
      </div>
      <div className="form__row">
        <div className="fld">
          <label htmlFor="major">Major <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
          <input id="major" name="major" type="text" defaultValue={member?.major || ""} />
        </div>
        <div className="fld">
          <label htmlFor="classOf">Class of <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
          <input id="classOf" name="classOf" type="text" placeholder="2029" defaultValue={member?.class_of || ""} />
        </div>
      </div>
      <div className="form__row">
        <div className="fld">
          <label htmlFor="team">Team <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
          <input id="team" name="team" type="text" placeholder="Equity Research" defaultValue={member?.team || ""} />
        </div>
        <div className="fld">
          <label htmlFor="focus">Focus <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
          <input id="focus" name="focus" type="text" defaultValue={member?.focus || ""} />
        </div>
      </div>
      <div className="fld">
        <label htmlFor="phone">Phone <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
        <input id="phone" name="phone" type="tel" placeholder="(706) 555-0123" defaultValue={member?.phone || ""} />
      </div>

      {error ? <p className="status-text" data-tone="err">{error}</p> : null}

      <div className="form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        {member?.id ? (
          <button type="button" className="btn btn--danger" disabled={pending} onClick={onDelete}>Remove</button>
        ) : null}
      </div>
    </form>
  );
}
