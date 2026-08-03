"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Link } from "@/i18n/navigation";

/** Single dropdown replacing what used to be two separate top-level header
 * items ("Moje kursy" + "Wyloguj się") — with the language switcher, call,
 * and book buttons already competing for space, every logged-in customer
 * was getting a 5-6-element header row. */
export function CustomerMenu({ myTripsLabel, logoutLabel }: { myTripsLabel: string; logoutLabel: string }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
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

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setOpen(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="border-primary text-primary hover:bg-primary/10 flex shrink-0 items-center gap-1.5 rounded-[999px] border px-3 py-2 text-[14px] font-medium whitespace-nowrap transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4.5 20c1.4-4 4.4-6 7.5-6s6.1 2 7.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {myTripsLabel}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="border-border bg-surface absolute top-full right-0 z-50 mt-2 w-52 rounded-[12px] border p-2 shadow-lg">
          <Link
            href="/panel"
            onClick={() => setOpen(false)}
            className="block rounded-[8px] px-3 py-2 text-[14px] text-text transition-colors hover:bg-bg"
          >
            {myTripsLabel}
          </Link>
          <div className="border-border my-1 border-t" />
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="block w-full rounded-[8px] px-3 py-2 text-left text-[14px] text-muted transition-colors hover:bg-bg hover:text-text disabled:opacity-60"
          >
            {logoutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
