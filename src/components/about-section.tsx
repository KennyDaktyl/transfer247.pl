import { getLocale, getTranslations } from "next-intl/server";

import { apiFetch } from "@/lib/api";
import { localize } from "@/lib/localize";
import type { HomeContent } from "@/lib/types";
import type { AppLocale } from "@/i18n/routing";

export async function AboutSection() {
  const [t, locale, content] = await Promise.all([
    getTranslations("About"),
    getLocale() as Promise<AppLocale>,
    apiFetch<HomeContent>("/api/home-content/", { next: { revalidate: 60 } }),
  ]);

  const about = localize(content, "about", locale);
  if (!about) return null;

  return (
    <section className="bg-surface border-border border-t">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-heading text-[24px] font-semibold text-text">{t("heading")}</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{about}</p>
        <a
          href="https://www.krakowairport.pl/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary mt-4 inline-block text-[13.5px] font-medium hover:underline"
        >
          {t("airportLink")} →
        </a>
      </div>
    </section>
  );
}
