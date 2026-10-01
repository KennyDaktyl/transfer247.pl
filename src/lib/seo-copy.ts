import { getTranslations } from "next-intl/server";

import type { AppLocale } from "@/i18n/routing";
import { formatPrice } from "@/lib/format";

/** Fallback <title>/<meta description> generated from a route's or tour's
 * own data (name, "from" price, vehicle size) for when the CMS's
 * `seo_title_*` / `seo_description_*` are left blank — instead of the old
 * fallback to the bare H1 with no description at all. Curated CMS copy
 * always wins; this only fills the gaps, so a newly added route is never
 * published without a price-bearing title. */

type Priced = { price_from: string | null; price_from_eur: string | null };

function priceLabel(item: Priced, locale: AppLocale): string | null {
  return item.price_from ? formatPrice(item.price_from, item.price_from_eur, locale) : null;
}

const ROUTE_COPY: Record<
  AppLocale,
  { title: (name: string, price: string | null) => string; description: (name: string, price: string | null) => string }
> = {
  pl: {
    title: (name, price) => (price ? `${name} od ${price} | Transfer 24/7` : `${name} | Transfer 24/7`),
    description: (name, price) =>
      `Prywatny transfer ${name}${price ? ` – stała cena od ${price}` : ""}. Bus do 6 osób, odbiór z tablicą, śledzenie lotu, 24/7. Zarezerwuj online.`,
  },
  en: {
    title: (name, price) => (price ? `${name} from ${price} | Transfer 24/7` : `${name} | Transfer 24/7`),
    description: (name, price) =>
      `Private transfer ${name}${price ? ` – fixed price from ${price}` : ""}. Van for up to 6 people, meet & greet, flight tracking, 24/7. Book online.`,
  },
  de: {
    title: (name, price) => (price ? `${name} ab ${price} | Transfer 24/7` : `${name} | Transfer 24/7`),
    description: (name, price) =>
      `Privater Transfer ${name}${price ? ` – Festpreis ab ${price}` : ""}. Van für bis zu 6 Personen, Abholung mit Namensschild, 24/7. Jetzt online buchen.`,
  },
};

const TOUR_COPY: Record<
  AppLocale,
  { title: (name: string) => string; description: (name: string, price: string | null) => string }
> = {
  pl: {
    title: (name) => `${name} | Wycieczka z kierowcą`,
    description: (name, price) =>
      `${name}: całodniowa wycieczka z Krakowa z powrotem${price ? `, od ${price} za bus` : ""}. Do 6 osób, kierowca czeka na miejscu. Zarezerwuj online.`,
  },
  en: {
    title: (name) => `${name} | Private Day Trip`,
    description: (name, price) =>
      `${name}: private day trip from Kraków with return${price ? `, from ${price} per van` : ""}. Up to 6 people, driver waits on site. Book online.`,
  },
  de: {
    title: (name) => `${name} | Privatausflug`,
    description: (name, price) =>
      `${name}: privater Tagesausflug ab Krakau mit Rückfahrt${price ? `, ab ${price} pro Van` : ""}. Bis 6 Personen, Fahrer wartet vor Ort. Online buchen.`,
  },
};

export function routeSeoFallback(name: string, item: Priced, locale: AppLocale) {
  const price = priceLabel(item, locale);
  return { title: ROUTE_COPY[locale].title(name, price), description: ROUTE_COPY[locale].description(name, price) };
}

export function tourSeoFallback(name: string, item: Priced, locale: AppLocale) {
  const price = priceLabel(item, locale);
  return { title: TOUR_COPY[locale].title(name), description: TOUR_COPY[locale].description(name, price) };
}

/** Lowest "from" price among catalog items, formatted for the locale
 * (PLN for PL, EUR for EN/DE) — fills the `{price}` placeholder in the
 * Seo.* category descriptions, so they track the CMS instead of going
 * stale when prices change. */
export function lowestPrice(items: Priced[], locale: AppLocale): string | null {
  const priced = items.filter((item) => item.price_from && Number(item.price_from) > 0);
  if (priced.length === 0) return null;
  const cheapest = priced.reduce((min, item) => (Number(item.price_from) < Number(min.price_from) ? item : min));
  return priceLabel(cheapest, locale);
}

export type SeoPageKey =
  | "home" | "airport" | "transfers" | "tours" | "blog" | "fleet" | "contact" | "terms" | "bikes";

/** Title/description for a static or category page from the `Seo`
 * namespace of messages/*.json. `{price}` is filled with the lowest live
 * catalog price; when none is known the "od/from/ab {price}" phrase is
 * dropped rather than rendering an empty price. */
export async function staticPageSeo(key: SeoPageKey, locale: AppLocale, priced: Priced[] = []) {
  const t = await getTranslations({ locale, namespace: "Seo" });
  const price = lowestPrice(priced, locale);
  const raw = t.raw(`${key}.description`) as string;
  const description = price
    ? raw.replace("{price}", price)
    : raw.replace(/\s(?:od|from|ab) \{price\}/, "").replace("{price}", "");
  return { title: t(`${key}.title`), description };
}
