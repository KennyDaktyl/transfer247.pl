"use client";

import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 transition-colors hover:text-text"
      >
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`mt-px transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {open ? (
        <div className="border-border bg-surface absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 rounded-[12px] border p-2 shadow-lg">
          <Link
            href={indexHref}
            onClick={() => setOpen(false)}
            className="text-primary block rounded-[8px] px-3 py-2 text-[13.5px] font-medium transition-colors hover:bg-bg"
          >
            {label} →
          </Link>
          <div className="border-border my-1 border-t" />
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
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
