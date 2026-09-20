"use client";

import { useState, useTransition } from "react";
import { acceptInvite } from "./actions";

export default function JoinForm({ token }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await acceptInvite(token, formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="fld">
        <label htmlFor="displayName">Full name</label>
        <input id="displayName" name="displayName" type="text" required autoFocus />
      </div>
      <div className="fld">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" required minLength={3} maxLength={24} />
        <p className="fld__hint">3-24 characters: letters, numbers, underscore.</p>
      </div>
      <div className="fld">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="fld">
        <label htmlFor="confirm">Confirm password</label>
        <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
      </div>

      {error ? <p className="status-text" data-tone="err">{error}</p> : null}

      <div className="form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending} style={{ width: "100%" }}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </div>
    </form>
  );
}
