"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NavLink from "./nav-link";

export default function MobileNav({ nav, profile, onSignOut }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="topbar">
        <span className="side__mark">YHCIC</span>
        <button
          type="button"
          className={`topbar__toggle${open ? " is-open" : ""}`}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className={`mobile-nav${open ? " is-open" : ""}`} aria-hidden={!open}>
        <nav className="side__nav">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href} disabled={item.disabled}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="side__foot">
          <hr className="hair" style={{ margin: "0 0 14px" }} />
          <p className="side__who">
            Signed in as <b>{profile?.display_name || profile?.username || "—"}</b>
          </p>
          <form action={onSignOut}>
            <button className="btn btn--sm" type="submit" style={{ width: "100%" }}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
