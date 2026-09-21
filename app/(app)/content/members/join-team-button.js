"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMyTeam } from "./actions";

const TEAMS = ["Equity Research", "Markets", "Operations", "Communications"];

export default function JoinTeamButton({ className, memberId, currentTeam }) {
  const dialogRef = useRef(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function pick(team) {
    setError(null);
    startTransition(async () => {
      const res = await setMyTeam(memberId, team);
      if (res?.error) setError(res.error);
      else {
        dialogRef.current?.close();
        router.refresh();
      }
    });
  }

  return (
    <>
      <button type="button" className={className} aria-label="Join a team" onClick={() => dialogRef.current?.showModal()} />
      <dialog ref={dialogRef} className="editor-dialog">
        <div className="editor-shell">
          <header className="editor-head">
            <div><span className="eyebrow">Set your team</span><h2>Join a team.</h2></div>
            <button type="button" className="icon-btn" aria-label="Close" onClick={() => dialogRef.current?.close()}>×</button>
          </header>
          <div className="form-grid">
            {TEAMS.map((team) => (
              <button
                key={team}
                type="button"
                className={team === currentTeam ? "primary" : "secondary"}
                disabled={pending}
                onClick={() => pick(team)}
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                {team}{team === currentTeam ? " ✓" : ""}
              </button>
            ))}
          </div>
          {error ? <p className="status-text" data-tone="err">{error}</p> : null}
        </div>
      </dialog>
    </>
  );
}
