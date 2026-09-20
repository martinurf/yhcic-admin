"use client";

import { useState, useTransition } from "react";
import { uploadResource } from "./actions";

export default function UploadForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await uploadResource(formData);
      if (res?.error) setError(res.error);
      else form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="fld">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" required />
      </div>
      <div className="fld">
        <label htmlFor="type">Type</label>
        <select id="type" name="type" defaultValue="NOTE">
          <option value="ARTICLE">Article</option>
          <option value="DATA">Data</option>
          <option value="FILINGS">Filings</option>
          <option value="DOCUMENT">Document</option>
          <option value="NOTE">Note</option>
        </select>
      </div>
      <div className="fld">
        <label htmlFor="description">Notes <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
        <textarea id="description" name="description" rows={2} />
      </div>
      <div className="fld">
        <label htmlFor="file">File <em style={{ fontStyle: "normal", opacity: 0.6 }}>up to 25MB</em></label>
        <input id="file" name="file" type="file" required />
      </div>

      {error ? <p className="status-text" data-tone="err">{error}</p> : null}

      <div className="form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Uploading…" : "Upload"}
        </button>
      </div>
    </form>
  );
}
