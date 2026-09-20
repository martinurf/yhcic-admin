"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAdminActive } from "./actions";

export default function AdminToggle({ id, active }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    const confirmMsg = active
      ? "Disable this officer's access? They immediately lose the ability to read or write anything in the panel."
      : "Re-enable this officer's access?";
    if (!confirm(confirmMsg)) return;
    startTransition(async () => {
      await setAdminActive(id, !active);
      router.refresh();
    });
  }

  return (
    <button type="button" className={`btn btn--sm${active ? " btn--danger" : ""}`} disabled={pending} onClick={onClick}>
      {active ? "Disable" : "Enable"}
    </button>
  );
}
