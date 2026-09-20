"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

/* Lets an officer send a publish request straight from the list row,
   instead of having to open the full edit form first. */
export default function RequestPublishButton({ id, requestAction }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await requestAction(id);
      router.refresh();
    });
  }

  return (
    <button type="button" className="text-btn" disabled={pending} onClick={onClick}>
      {pending ? "Sending…" : "Request public"}
    </button>
  );
}
