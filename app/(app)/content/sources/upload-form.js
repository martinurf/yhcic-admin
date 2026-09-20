"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadResource } from "./actions";

export default function UploadForm() {
  const dialogRef = useRef(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }
  function close() {
    dialogRef.current?.close();
  }

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await uploadResource(formData);
      if (res?.error) setError(res.error);
      else {
        form.reset();
        close();
        router.refresh();
      }
    });
  }

  return (
    <>
      <button type="button" className="primary" onClick={open}>
        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        <span>Add source</span>
      </button>

      <dialog ref={dialogRef} className="editor-dialog">
        <form onSubmit={onSubmit} className="editor-shell">
          <header className="editor-head">
            <div><span className="eyebrow">New entry</span><h2>Source</h2></div>
            <button type="button" className="icon-btn" aria-label="Close" onClick={close}>×</button>
          </header>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" required />
            </div>
            <div className="form-row">
              <label htmlFor="url">Link <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional if you attach a file</em></label>
              <input id="url" name="url" type="url" placeholder="https://" />
            </div>
            <div className="form-row">
              <label htmlFor="type">Type</label>
              <select id="type" name="type" defaultValue="NOTE">
                <option value="ARTICLE">Article</option>
                <option value="DATA">Data</option>
                <option value="FILINGS">Filings</option>
                <option value="DOCUMENT">Document</option>
                <option value="NOTE">Note</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="description">Notes <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
              <textarea id="description" name="description" rows={2} />
            </div>
            <div className="form-row">
              <label htmlFor="file">File <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional, up to 25MB</em></label>
              <input id="file" name="file" type="file" />
            </div>
          </div>

          {error ? <p className="status-text" data-tone="err">{error}</p> : null}

          <div className="editor-actions">
            <button type="button" className="secondary" disabled={pending} onClick={close}>Cancel</button>
            <button type="submit" className="primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
