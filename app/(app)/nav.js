"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ items, profile, onSignOut }) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onScroll() {
      setStuck(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`mast${stuck ? " is-stuck" : ""}`}>
        <div className="mast__in">
          <span className="side__mark">YHCIC</span>
          <div className="mast__right">
            <span className="mast__ticker">Officer access</span>
            <button
              type="button"
              className="burger"
              aria-expanded={open}
              aria-controls="amenu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`amenu${open ? " is-open" : ""}`} id="amenu" aria-hidden={!open}>
        <div className="amenu__in">
          <p className="amenu__meta">YHCIC / Admin panel</p>
          <nav className="amenu__nav" aria-label="Main">
            {items.map((item, i) => {
              const n = String(i + 1).padStart(2, "0");
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              if (item.disabled) {
                return (
                  <span key={item.href} className="soon" style={{ "--i": i + 1 }}>
                    <em>{n}</em> {item.label} <b>Soon</b>
                  </span>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ "--i": i + 1, color: active ? "var(--vault-accent-2)" : undefined }}
                >
                  <em>{n}</em> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="amenu__foot">
            <p className="amenu__who">
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
