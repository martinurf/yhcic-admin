"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMember, deleteMember } from "./actions";

export default function MemberForm({ member }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
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

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="form__row">
        <div className="fld">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" defaultValue={member?.name} required />
        </div>
        <div className="fld">
          <label htmlFor="role">Role</label>
          <input id="role" name="role" type="text" placeholder="President" defaultValue={member?.role} required />
        </div>
      </div>
      <div className="form__row">
        <div className="fld">
          <label htmlFor="major">Major <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
          <input id="major" name="major" type="text" defaultValue={member?.major || ""} />
        </div>
        <div className="fld">
          <label htmlFor="focus">Focus <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
          <input id="focus" name="focus" type="text" defaultValue={member?.focus || ""} />
        </div>
      </div>
      <div className="fld">
        <label htmlFor="linkedin">LinkedIn <em style={{ fontStyle: "normal", opacity: 0.6 }}>optional</em></label>
        <input id="linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/in/…" defaultValue={member?.linkedin || ""} />
      </div>

      <label className="row" style={{ fontSize: 13.5 }}>
        <input type="checkbox" name="published" defaultChecked={member?.published} style={{ width: "auto" }} />
        Published
      </label>

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
