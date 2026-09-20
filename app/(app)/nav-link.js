"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children, disabled }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (disabled) {
    return (
      <span className="side__nav-disabled" aria-disabled="true">
        {children}
        <em>Soon</em>
      </span>
    );
  }

  return (
    <Link href={href} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
