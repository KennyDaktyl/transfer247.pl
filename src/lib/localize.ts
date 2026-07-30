import type { AppLocale } from "@/i18n/routing";

/** Picks the `${field}_${locale}` key off a CMS object, falling back to `_pl`
 * when a language (mainly `_de`) hasn't been translated yet — matches the
 * backend's own "PL is always complete, EN/DE may be blank" content policy. */
export function localize<T extends Record<string, unknown>>(obj: T, field: string, locale: AppLocale): string {
  const value = obj[`${field}_${locale}`];
  if (typeof value === "string" && value.trim() !== "") return value;
  return String(obj[`${field}_pl`] ?? "");
}
