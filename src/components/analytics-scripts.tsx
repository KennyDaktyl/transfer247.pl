import Script from "next/script";

import { GA_MEASUREMENT_ID } from "@/lib/analytics";

/** Google Consent Mode v2 + GA4, in the exact order Google requires:
 *
 * 1. Consent default (denied) — must run before ANY tag, including gtag.js
 *    itself, so Google never receives data without first knowing consent
 *    hasn't been granted yet. `beforeInteractive` is the only next/script
 *    strategy that runs early enough (injected into the initial HTML,
 *    before hydration) — it must live in the root layout, not a page, so
 *    every locale and every route gets it on first load.
 * 2. gtag.js itself, and the config call — `afterInteractive`, after #1.
 *    This always loads; Consent Mode is what actually decides whether it's
 *    allowed to send identifiable data (see CookieConsentBanner). Google's
 *    own guidance is to let gtag.js load unconditionally and have Consent
 *    Mode gate the requests, rather than conditionally injecting the
 *    script tag — Google still receives consent-mode "ping" telemetry
 *    either way, but nothing tied to the visitor before they decide. */
export function AnalyticsScripts() {
  return (
    <>
      <Script id="consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
            'wait_for_update': 500
          });
        `}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            'anonymize_ip': true
          });
        `}
      </Script>
    </>
  );
}
