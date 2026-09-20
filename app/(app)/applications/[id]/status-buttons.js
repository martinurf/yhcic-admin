"use client";

import { useState, useTransition } from "react";
import { updateStatus } from "../actions";

export default function StatusButtons({ applicationId, currentStatus }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(currentStatus);

  function change(next) {
    setError(null);
    startTransition(async () => {
      const res = await updateStatus(applicationId, next);
      if (res?.error) setError(res.error);
      else setStatus(next);
    });
  }

  return (
    <div>
      <div className="row">
        <button
          className="btn"
          disabled={pending || status === "accepted"}
          onClick={() => change("accepted")}
        >
          Accept
        </button>
        <button
          className="btn btn--danger"
          disabled={pending || status === "rejected"}
          onClick={() => change("rejected")}
        >
          Reject
        </button>
        <button
          className="btn"
          disabled={pending || status === "pending"}
          onClick={() => change("pending")}
        >
          Back to pending
        </button>
      </div>
      {error ? <p className="status-text" data-tone="err">{error}</p> : null}
    </div>
  );
}
