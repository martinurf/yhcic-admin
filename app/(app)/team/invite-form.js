"use client";

import { useState, useTransition } from "react";
import { createInvite } from "./actions";

export default function InviteForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [link, setLink] = useState(null);
  const [copied, setCopied] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLink(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await createInvite(formData);
      if (res?.error) setError(res.error);
      else {
        setLink(res.link);
        form.reset();
      }
    });
  }

  function copy() {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="row" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
        <div className="fld" style={{ flex: "1 1 220px" }}>
          <label htmlFor="invite-name">Name <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional, just for you</em></label>
          <input id="invite-name" name="name" type="text" placeholder="Full name" />
        </div>
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Generating…" : "Get invite link"}
        </button>
      </form>

      {error ? <p className="status-text" data-tone="err">{error}</p> : null}

      {link ? (
        <div className="invite-result">
          <p className="fld__hint" style={{ marginBottom: 8 }}>
            One-time link — send it yourself (text, email, whatever). It expires in 7 days and works once.
          </p>
          <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
            <input className="text-input" readOnly value={link} onFocus={(e) => e.target.select()} />
            <button type="button" className="btn btn--sm" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
