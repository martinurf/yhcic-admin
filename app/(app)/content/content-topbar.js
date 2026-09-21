"use client";

import Link from "next/link";
import { useMenu } from "../menu-context";

export default function ContentTopbar({ title, pendingCount = 0 }) {
  const { setOpen } = useMenu();

  return (
    <header className="section-topbar">
      <Link href="/" className="side__mark side__mark--lg" aria-label="Home">YHCIC</Link>
      <span className="section-topbar__title">{title}</span>
      <div className="section-topbar__actions">
        <Link href="/applications?status=pending" className="icon-btn" aria-label="Pending applications">
          <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
          {pendingCount > 0 ? <span className="dot" aria-hidden="true" /> : null}
        </Link>
        <button type="button" className="icon-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24"><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></svg>
        </button>
      </div>
    </header>
  );
}
