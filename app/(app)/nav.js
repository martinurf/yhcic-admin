"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24"><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></svg>
  ),
  applications: (
    <svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M9.5 12.5h5M9.5 16h5" /></svg>
  ),
  members: (
    <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.1" /><path d="M3.4 19c.4-3.2 2.8-5 5.6-5s5.2 1.8 5.6 5" /><circle cx="16.8" cy="8.8" r="2.4" /><path d="M15.4 13.4c2.6-.5 4.8 1.2 5.2 4.2" /></svg>
  ),
  team: (
    <svg viewBox="0 0 24 24"><path d="M12 3 4 6.5v5c0 5 3.4 8.4 8 9.5 4.6-1.1 8-4.5 8-9.5v-5z" /><path d="m9 12 2 2 4-4" /></svg>
  ),
  more: (
    <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>
  ),
};

const TABS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/applications", label: "Applications", icon: "applications" },
  { href: "/content/members", label: "Members", icon: "members" },
  { href: "/team", label: "Team", icon: "team" },
];

export default function Nav({ soon, profile, onSignOut, pendingCount }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const moreActive = pathname.startsWith("/content/announcements") || pathname.startsWith("/content/projects") || pathname.startsWith("/content/goals");

  return (
    <>
      <nav className="tabs" aria-label="Main">
        <div className="tabs__in">
          {TABS.map((t) => {
            const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
            const showBadge = t.href === "/applications" && pendingCount > 0;
            return (
              <Link key={t.href} href={t.href} className={`tabs__item${active ? " is-active" : ""}`} style={{ position: "relative" }}>
                {ICONS[t.icon]}
                {showBadge ? <span className="tabs__badge">{pendingCount > 9 ? "9+" : pendingCount}</span> : null}
                {t.label}
              </Link>
            );
          })}
          <button type="button" className={`tabs__item${moreActive ? " is-active" : ""}`} onClick={() => setOpen(true)}>
            {ICONS.more}
            More
          </button>
        </div>
      </nav>

      <div className={`sheet${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="sheet__scrim" onClick={() => setOpen(false)} />
        <div className="sheet__panel">
          <div className="sheet__grip" />
          <p className="sheet__title">More</p>
          {soon.map((label) => (
            <div key={label} className="sheet__soon">
              {label} <b>Soon</b>
            </div>
          ))}
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
    </>
  );
}
