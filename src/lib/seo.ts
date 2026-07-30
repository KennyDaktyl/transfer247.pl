import { routing } from "@/i18n/routing";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** hreflang alternates for a given path (no locale prefix, e.g. "/transfery/balice-krakow"). */
export function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${siteUrl()}/${locale}${path}`;
  }
  languages["x-default"] = `${siteUrl()}/${routing.defaultLocale}${path}`;
  return { languages };
}
