"use client";

import { reopenConsentBanner } from "@/lib/analytics";

/** Reopens the cookie consent banner so a visitor can change an earlier
 * decision — required by GDPR guidance alongside the first-visit prompt,
 * not just a one-time question. A plain button (not a real link, since it
 * dispatches an event rather than navigating). */
export function CookieSettingsLink({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={reopenConsentBanner} className={className}>
      {label}
    </button>
  );
}
