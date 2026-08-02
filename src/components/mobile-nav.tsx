"use client";

import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

type NavItem = { href: string; label: string };

function CollapsibleGroup({ label, indexHref, items, onNavigate }: {
  label: string;
  indexHref: string;
  items: NavItem[];
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-border border-b">
      <div className="flex items-center justify-between">
        <Link href={indexHref} onClick={onNavigate} className="flex-1 rounded-md px-2 py-3 text-text">
          {label}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={label}
          className="p-3 text-muted"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 10 10"
            fill="none"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {expanded ? (
        <div className="flex flex-col gap-1 pb-2 pl-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="rounded-md px-2 py-2 text-[14px] text-muted transition-colors hover:bg-bg hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function MobileNav({
  airportRouteItems,
  stationRouteItems,
  tourItems,
  airportRoutesLabel,
  stationRoutesLabel,
  toursLabel,
  flatLinks,
  callLabel,
  loginHref,
  loginLabel,
}: {
  airportRouteItems: NavItem[];
  stationRouteItems: NavItem[];
  tourItems: NavItem[];
  airportRoutesLabel: string;
  stationRoutesLabel: string;
  toursLabel: string;
  flatLinks: NavItem[];
  callLabel: string;
  loginHref: string;
  loginLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="border-border flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-[5px] rounded-md border"
      >
        <span
          className={`bg-text h-[1.5px] w-[18px] transition-transform ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
        />
        <span className={`bg-text h-[1.5px] w-[18px] transition-opacity ${open ? "opacity-0" : ""}`} />
        <span
          className={`bg-text h-[1.5px] w-[18px] transition-transform ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-border bg-surface absolute inset-x-0 top-full z-40 max-h-[80vh] overflow-y-auto border-t px-4 py-4 shadow-xl">
          <nav className="flex flex-col text-[16px]">
            <CollapsibleGroup
              label={airportRoutesLabel}
              indexHref="/transfery#lotniskowe"
              items={airportRouteItems}
              onNavigate={() => setOpen(false)}
            />
            <CollapsibleGroup
              label={stationRoutesLabel}
              indexHref="/transfery#dworzec-pkp"
              items={stationRouteItems}
              onNavigate={() => setOpen(false)}
            />
            <CollapsibleGroup
              label={toursLabel}
              indexHref="/wycieczki"
              items={tourItems}
              onNavigate={() => setOpen(false)}
            />
            {flatLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-border rounded-md border-b px-2 py-3 text-text transition-colors hover:bg-bg"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:+48506029980"
              className="border-border text-primary rounded-md border-b px-2 py-3 font-medium transition-colors hover:bg-bg"
            >
              {callLabel}
            </a>
            <Link
              href={loginHref}
              onClick={() => setOpen(false)}
              className="border-primary text-primary mt-2 rounded-md border px-2 py-3 text-center font-semibold transition-colors hover:bg-primary/10"
            >
              {loginLabel}
            </Link>
          </nav>

          <div className="mt-4 flex items-center gap-3">
            <LocaleSwitcher />
          </div>
        </div>
      ) : null}
    </div>
  );
}
