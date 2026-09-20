"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveGoal, deleteGoal } from "./actions";

export default function GoalForm({ goal }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveGoal(goal?.id, formData);
      if (res?.error) setError(res.error);
      else router.push("/content/goals");
    });
  }

  function onDelete() {
    if (!goal?.id) return;
    if (!confirm("Remove this goal? It stays recoverable — this is a soft delete.")) return;
    startTransition(async () => {
      const res = await deleteGoal(goal.id);
      if (res?.error) setError(res.error);
      else router.push("/content/goals");
    });
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="form__row">
        <div className="fld">
          <label htmlFor="n">Number</label>
          <input id="n" name="n" type="text" placeholder="01" defaultValue={goal?.n} required />
        </div>
        <div className="fld">
          <label htmlFor="stage">Stage</label>
          <input id="stage" name="stage" type="text" placeholder="Foundation" defaultValue={goal?.stage} required />
        </div>
      </div>
      <div className="fld">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" defaultValue={goal?.title} required />
      </div>
      <div className="fld">
        <label htmlFor="body">Description</label>
        <textarea id="body" name="body" rows={4} defaultValue={goal?.body} required />
      </div>

      <label className="row" style={{ fontSize: 13.5 }}>
        <input type="checkbox" name="published" defaultChecked={goal?.published} style={{ width: "auto" }} />
        Published
      </label>

      {error ? <p className="status-text" data-tone="err">{error}</p> : null}

      <div className="form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        {goal?.id ? (
          <button type="button" className="btn btn--danger" disabled={pending} onClick={onDelete}>Remove</button>
        ) : null}
      </div>
    </form>
  );
}
