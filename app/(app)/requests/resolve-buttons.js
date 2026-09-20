"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveMemberRequest } from "../content/members/actions";
import { resolveProjectRequest } from "../content/projects/actions";

export default function ResolveButtons({ type, id }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const resolve = type === "member" ? resolveMemberRequest : resolveProjectRequest;

  function onPublish() {
    startTransition(async () => {
      await resolve(id, true);
      router.refresh();
    });
  }

  function onDismiss() {
    if (!confirm("Dismiss this request without publishing? It goes back to Draft.")) return;
    startTransition(async () => {
      await resolve(id, false);
      router.refresh();
    });
  }

  return (
    <span className="row" style={{ gap: 8 }}>
      <button type="button" className="btn btn--sm btn--primary" disabled={pending} onClick={onPublish}>
        Mark as published
      </button>
      <button type="button" className="btn btn--sm" disabled={pending} onClick={onDismiss}>
        Dismiss
      </button>
    </span>
  );
}
