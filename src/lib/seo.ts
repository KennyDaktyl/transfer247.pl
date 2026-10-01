import type { Metadata } from "next";

import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

const OG_LOCALES: Record<AppLocale, string> = { pl: "pl_PL", en: "en_GB", de: "de_DE" };

/** Which locales actually have their own copy of a CMS object. PL is the
 * backend's always-complete source language; EN/DE count only when every
 * listed `${field}_${locale}` is non-blank — otherwise `localize()` falls
 * back to Polish and the /en or /de URL just repeats the Polish page under
 * a foreign `<html lang>`, which Google treats as thin/duplicate content. */
export function translatedLocales(obj: object, fields: string[]): AppLocale[] {
  const record = obj as Record<string, unknown>;
  return routing.locales.filter(
    (locale) =>
      locale === routing.defaultLocale ||
      fields.every((field) => {
        const value = record[`${field}_${locale}`];
        return typeof value === "string" && value.trim() !== "";
      }),
  );
}

/** hreflang alternates + canonical for a given path (no locale prefix, e.g.
 * "/transfery/balice-krakow"). Without an explicit canonical, Next.js emits
 * no <link rel="canonical"> at all. `locale` is the page actually being
 * rendered, so its own URL is canonical for itself (each language is
 * authoritative for its own version). Only `available` locales enter the
 * hreflang cluster — pointing at a noindex'd untranslated version would make
 * the cluster invalid. x-default is the English version (the catch-all for
 * every visitor who is neither Polish nor German), or Polish when no
 * English copy exists. */
export function buildAlternates(path: string, locale: AppLocale, available: readonly AppLocale[] = routing.locales) {
  const canonical = `${siteUrl()}/${locale}${path}`;
  if (!available.includes(locale) || available.length < 2) return { canonical };

  const languages: Record<string, string> = {};
  for (const loc of available) {
    languages[loc] = `${siteUrl()}/${loc}${path}`;
  }
  languages["x-default"] = languages.en ?? languages[routing.defaultLocale];
  return { canonical, languages };
}

/** One place that turns a page's title/description into the full <head>
 * set: canonical, hreflang, robots, Open Graph and Twitter card. Pages that
 * exist in a locale without translated content (see `translatedLocales`)
 * get `noindex, follow` and drop out of the hreflang cluster. */
export function pageMetadata({
  path,
  locale,
  title,
  description,
  available = routing.locales,
  noindex = false,
  ogType = "website",
}: {
  path: string;
  locale: AppLocale;
  title?: string;
  description?: string;
  available?: readonly AppLocale[];
  noindex?: boolean;
  ogType?: "website" | "article";
}): Metadata {
  const indexable = !noindex && available.includes(locale);
  // A noindex page must not take part in an hreflang cluster at all.
  const alternates = indexable ? buildAlternates(path, locale, available) : { canonical: `${siteUrl()}/${locale}${path}` };
  const alternateLocales = indexable
    ? available.filter((loc) => loc !== locale).map((loc) => OG_LOCALES[loc])
    : [];

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates,
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: ogType,
      siteName: "transfer247.pl",
      url: alternates.canonical,
      locale: OG_LOCALES[locale],
      ...(alternateLocales.length > 0 ? { alternateLocale: alternateLocales } : {}),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
  };
}

/** For private/utility pages (login, customer panel, tracking): kept out of
 * the index but still crawlable, so Google can see the noindex — blocking
 * them in robots.txt instead would hide the tag and leave the URLs indexed. */
export const NOINDEX_FOLLOW: Metadata["robots"] = { index: false, follow: true };

/** Stable `@id` of the LocalBusiness node (OrganizationJsonLd) — Service,
 * TouristTrip and BlogPosting reference it instead of repeating a partial
 * copy of the business, so Google merges them into one entity. */
export function businessId(): string {
  return `${siteUrl()}/#business`;
}

/** Reference to that node, with name/url repeated so validators that don't
 * resolve `@id` across separate <script> blocks still see a named entity. */
export function businessRef() {
  return { "@id": businessId(), name: "transfer247.pl", url: siteUrl() };
}
