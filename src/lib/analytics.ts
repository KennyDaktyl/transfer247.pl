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
 * then, and this is a no-op instead of a crash.
 *
 * One decision covers analytics AND advertising storage together (the
 * banner is a single Accept/Reject choice, not a granular per-purpose one)
 * — granting only analytics_storage would leave ad_storage/ad_user_data/
 * ad_personalization permanently denied, which caps Google Ads conversions
 * from EU visitors to modeled (statistically estimated) numbers instead of
 * real ones. */
export function updateAnalyticsConsent(decision: ConsentDecision): void {
  window.gtag?.("consent", "update", {
    analytics_storage: decision,
    ad_storage: decision,
    ad_user_data: decision,
    ad_personalization: decision,
  });
}

/** Fires a GA4 custom event — the booking funnel and contact-click events
 * below. gtag.js itself (not this function) is what respects Consent Mode:
 * an event fired while consent is still "denied" is sent cookieless, for
 * modeling, never blocked outright — same behavior page_view already
 * relies on, so no consent check is needed here. Safe pre-consent and if
 * the script failed to load (ad blocker) — `gtag` is just undefined then. */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  window.gtag?.("event", name, params);
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
