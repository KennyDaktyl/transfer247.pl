"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import {
  CONSENT_REOPEN_EVENT,
  getStoredConsent,
  storeConsent,
  updateAnalyticsConsent,
} from "@/lib/analytics";

export function CookieConsentBanner() {
  const t = useTranslations("CookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored === "granted") {
      // Consent Mode defaults to denied on every fresh page load — a
      // returning visitor who already said yes shouldn't be asked again,
      // but the "granted" state has to be re-applied for this load too.
      updateAnalyticsConsent("granted");
    } else if (stored === null) {
      setVisible(true);
    }

    const reopen = () => setVisible(true);
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, reopen);
  }, []);

  function decide(decision: "granted" | "denied") {
    storeConsent(decision);
    updateAnalyticsConsent(decision);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6" role="dialog" aria-live="polite" aria-label={t("title")}>
      <div className="border-border bg-surface mx-auto flex max-w-[860px] flex-col gap-4 rounded-[16px] border p-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] sm:flex-row sm:items-center sm:p-6">
        <p className="text-[13.5px] leading-relaxed text-muted">
          {t("text")}{" "}
          <Link href="/regulamin" className="text-primary underline underline-offset-2">
            {t("privacyLinkText")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="border-border text-text hover:border-primary flex-1 rounded-[999px] border px-5 py-2.5 text-[14px] font-medium whitespace-nowrap transition-colors sm:flex-none"
          >
            {t("reject")}
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="bg-primary hover:bg-primary-hover flex-1 rounded-[999px] px-5 py-2.5 text-[14px] font-medium whitespace-nowrap text-white transition-colors sm:flex-none"
          >
            {t("acceptAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
