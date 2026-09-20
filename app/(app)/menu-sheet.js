"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMenu } from "./menu-context";

export default function MenuSheet({ profile, onSignOut }) {
  const { open, setOpen } = useMenu();

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={`sheet${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="sheet__scrim" onClick={() => setOpen(false)} />
      <div className="sheet__panel">
        <div className="sheet__head">
          <h2>Menu</h2>
          <button type="button" className="sheet__close" aria-label="Close menu" onClick={() => setOpen(false)}>
            &times;
          </button>
        </div>

        <Link href="/team" className="sheet__link" onClick={() => setOpen(false)}>
          Team &amp; invitations
        </Link>
        <Link href="/content/announcements" className="sheet__link" onClick={() => setOpen(false)}>
          Announcements
        </Link>
        <Link href="/content/projects" className="sheet__link" onClick={() => setOpen(false)}>
          Projects
        </Link>
        <Link href="/content/sources" className="sheet__link" onClick={() => setOpen(false)}>
          Sources &amp; research
        </Link>

        <div className="sheet__foot">
          <p className="sheet__who">
            Signed in as <b>{profile?.display_name || profile?.username || "—"}</b>
          </p>
          <form action={onSignOut}>
            <button className="btn btn--sm" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
