import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** hreflang alternates + canonical for a given path (no locale prefix, e.g.
 * "/transfery/balice-krakow"). Without an explicit canonical, Next.js emits
 * no <link rel="canonical"> at all — search engines are left to guess which
 * of PL/EN/DE is authoritative for a given URL, which is exactly the kind
 * of ambiguity duplicate-content audits flag. `locale` is the page actually
 * being rendered, so its own URL becomes canonical for itself (each
 * language is authoritative for its own version, not all pointing at PL). */
export function buildAlternates(path: string, locale: AppLocale) {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${siteUrl()}/${loc}${path}`;
  }
  // x-default must match routing.defaultLocale ("pl") — this is the Polish
  // transport market's primary site, not an English-first one.
  languages["x-default"] = `${siteUrl()}/pl${path}`;
  return { canonical: `${siteUrl()}/${locale}${path}`, languages };
}
