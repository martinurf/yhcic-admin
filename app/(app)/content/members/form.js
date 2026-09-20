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

export default function MemberForm({ member }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const status = statusOf(member);

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
