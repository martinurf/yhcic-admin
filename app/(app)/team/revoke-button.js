"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { revokeInvite } from "./actions";

export default function RevokeButton({ id }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Remove this invitation? The link will stop working.")) return;
    startTransition(async () => {
      await revokeInvite(id);
      router.refresh();
    });
  }

  return (
    <button type="button" className="btn btn--sm btn--danger" disabled={pending} onClick={onClick}>
      Remove
    </button>
  );
}
