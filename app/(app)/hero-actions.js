"use client";

import Link from "next/link";
import { useMenu } from "./menu-context";

export default function HeroActions({ pendingCount }) {
  const { setOpen } = useMenu();

  return (
    <div className="top-actions">
      <Link href="/applications?status=pending" className={`icon-button${pendingCount > 0 ? " has-dot" : ""}`} aria-label={`${pendingCount} pending applications`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      </Link>
      <button type="button" className="menu-button" aria-label="Open menu" onClick={() => setOpen(true)}>
        <span className="menu-lines" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
        </span>
      </button>
    </div>
  );
}
