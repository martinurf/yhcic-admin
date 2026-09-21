"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMenu } from "./menu-context";
import GetAppSheet from "./get-app-sheet";

export default function MenuSheet({ profile, onSignOut, isOwner = false }) {
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

        <nav className="sheet__list">
          <Link href="/team" className="sheet__link" onClick={() => setOpen(false)}>
            <span className="sheet__link__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </span>
            Team &amp; invitations
          </Link>
          <Link href="/content/announcements" className="sheet__link" onClick={() => setOpen(false)}>
            <span className="sheet__link__icon" aria-hidden="true">
              <svg viewBox="0 0 64 64"><path d="M10 27v15h10l26 11V15L20 27Z" /><path d="M46 28h8v12h-8M19 42l4 13h10l-5-10" /></svg>
            </span>
            Announcements
          </Link>
          <Link href="/content/projects" className="sheet__link" onClick={() => setOpen(false)}>
            <span className="sheet__link__icon" aria-hidden="true">
              <svg viewBox="0 0 64 64"><path d="M20 38c-7-5-9-12-6-20C18 7 30 3 41 8s15 18 8 28c-2 3-5 5-7 7H24c-1-2-2-4-4-5Z" /><path d="M24 49h18M27 56h12M32 1v5M9 13l5 3M55 13l-5 3M5 32h7M52 32h7" /></svg>
            </span>
            Projects
          </Link>
          <Link href="/content/sources" className="sheet__link" onClick={() => setOpen(false)}>
            <span className="sheet__link__icon" aria-hidden="true">
              <svg viewBox="0 0 64 64"><path d="M5 13c11-5 19-3 27 4v39c-8-7-16-9-27-4ZM59 13c-11-5-19-3-27 4v39c8-7 16-9 27-4Z" /><path d="M10 20c7-2 13 0 18 4M54 20c-7-2-13 0-18 4" /></svg>
            </span>
            Sources &amp; research
          </Link>
          {isOwner ? (
            <Link href="/requests" className="sheet__link" onClick={() => setOpen(false)}>
              <span className="sheet__link__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
              </span>
              Requests
            </Link>
          ) : null}
          <GetAppSheet className="sheet__link">
            <span className="sheet__link__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>
            </span>
            Get the app
            <span className="sheet__badge">New</span>
          </GetAppSheet>
        </nav>

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
