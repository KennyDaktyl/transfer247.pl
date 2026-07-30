"use client";

import { useState } from "react";

import { Link } from "@/i18n/navigation";

type NavDropdownItem = { href: string; label: string };

export function NavDropdown({
  label,
  indexHref,
  items,
}: {
  label: string;
  indexHref: string;
  items: NavDropdownItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link href={indexHref} className="flex items-center gap-1 transition-colors hover:text-text">
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="mt-px">
          <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </Link>
      {open ? (
        <div className="border-border bg-surface absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 rounded-[12px] border p-2 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-[8px] px-3 py-2 text-[14px] text-text transition-colors hover:bg-bg"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
