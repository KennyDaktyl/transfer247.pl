import type { AppLocale } from "@/i18n/routing";

function formatNumber(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** PL always shows the PLN price. EN/DE show the admin-entered EUR price
 * when one exists — falls back to PLN if the admin hasn't filled it in yet,
 * so a page never shows a blank price while EUR values are still pending. */
export function formatPrice(plnValue: string, eurValue: string | null | undefined, locale: AppLocale): string {
  if (locale !== "pl" && eurValue) {
    return `${formatNumber(eurValue)} €`;
  }
  return `${formatNumber(plnValue)} zł`;
}

const VAT_RATE = 0.23;

/** All PLN prices in this app are gross (VAT-inclusive) — this derives the
 * net amount for display next to the final price a customer is about to
 * pay (booking summary, deposit payment), never for the marketing "od X zł"
 * teaser prices where the breakdown would just be noise. */
export function netFromGross(grossPln: string | number): number {
  const gross = typeof grossPln === "string" ? parseFloat(grossPln) : grossPln;
  return gross / (1 + VAT_RATE);
}
