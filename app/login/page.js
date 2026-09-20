"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

const initialState = { error: null, ok: false };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="login">
      <div className="login__panel">
        <span className="side__mark" style={{ marginBottom: 22 }}>YHCIC</span>
        <h1 className="login__title">Sign in</h1>
        <p className="login__sub">Club officers and advisor only — invitation-only accounts.</p>

        <form action={formAction} className="stack">
          <div className="fld">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" type="text" autoComplete="username" required autoFocus />
          </div>
          <div className="fld">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>

          {state?.error ? <p className="status-text" data-tone="err">{state.error}</p> : null}

          <div className="form__actions">
            <button className="btn btn--primary" type="submit" disabled={pending} style={{ width: "100%" }}>
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
