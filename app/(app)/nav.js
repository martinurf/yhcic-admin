"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenu } from "./menu-context";

const TABS = [
  {
    href: "/",
    label: "Home",
    icon: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  },
  {
    href: "/applications",
    label: "Applications",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),
  },
  {
    href: "/content",
    label: "Content",
    icon: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />,
  },
  {
    href: "/content/members",
    label: "Members",
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
];

export default function Nav() {
  const pathname = usePathname();

  /* Longest-prefix match, not "does it start with" — /content/members
     starts with both "/content" and "/content/members", and without
     this both tabs would light up together. */
  const activeHref = TABS
    .filter((t) => (t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="bottom-nav" aria-label="Admin navigation">
      <Link href="/" className="side-nav__mark" aria-hidden="true">
        <span className="side__mark">YHCIC</span>
      </Link>
      {TABS.map((t) => {
        const active = t.href === activeHref;
        return (
          <Link key={t.href} href={t.href} className={`nav-item${active ? " active" : ""}`}>
            <svg viewBox="0 0 24 24">{t.icon}</svg>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* The hero on "/" carries its own menu button, and the Content Library
   screens (hub, Projects, Announcements, Sources — not /content/members,
   which has no topbar of its own) carry ContentTopbar with the same
   trigger built in. Either one paired with this floating button would
   just be a second hamburger on the same screen. */
const HAS_OWN_TOPBAR = [/^\/content$/, /^\/content\/projects/, /^\/content\/announcements/, /^\/content\/sources/];
export function PageMenuButton() {
  const pathname = usePathname();
  const { setOpen } = useMenu();
  if (pathname === "/" || HAS_OWN_TOPBAR.some((re) => re.test(pathname))) return null;

  return (
    <button type="button" className="page-menu-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
      <span className="menu-lines" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
      </span>
    </button>
  );
}
