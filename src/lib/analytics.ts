export const GA_MEASUREMENT_ID = "G-5DKZMMRGK1";

export const CONSENT_STORAGE_KEY = "transfer247:cookie-consent";
export const CONSENT_REOPEN_EVENT = "transfer247:cookie-consent-reopen";

export type ConsentDecision = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Pushes an update onto Consent Mode v2 — the `gtag` function itself is
 * defined by the inline "default denied" script in the root layout
 * (loaded beforeInteractive on every page), so it's always present by the
 * time any client component runs. Safe to call even if something went
 * wrong loading that script (ad blocker, etc.) — `gtag` is just undefined
 * then, and this is a no-op instead of a crash. */
export function updateAnalyticsConsent(decision: ConsentDecision): void {
  window.gtag?.("consent", "update", { analytics_storage: decision });
}

export function getStoredConsent(): ConsentDecision | null {
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Private browsing / storage disabled — treat as "no decision yet",
    // the banner will just ask again next time.
    return null;
  }
}

export function storeConsent(decision: ConsentDecision): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, decision);
  } catch {
    // Nothing we can do if storage is unavailable — consent still gets
    // applied for the current page load via updateAnalyticsConsent.
  }
}

/** Footer's "Cookie settings" link fires this so the already-mounted
 * banner can reappear without a full page reload. */
export function reopenConsentBanner(): void {
  window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT));
}
