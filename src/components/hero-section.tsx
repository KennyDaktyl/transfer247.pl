import { getLocale, getTranslations } from "next-intl/server";

import { apiFetch } from "@/lib/api";
import { localize } from "@/lib/localize";
import type { HomeContent } from "@/lib/types";
import type { AppLocale } from "@/i18n/routing";

export async function HeroSection() {
  const [t, locale, content] = await Promise.all([
    getTranslations("Hero"),
    getLocale() as Promise<AppLocale>,
    apiFetch<HomeContent>("/api/home-content/", { next: { revalidate: 60 } }),
  ]);

  const eyebrow = localize(content, "eyebrow", locale);
  const headline = localize(content, "headline", locale);
  const highlight = localize(content, "headline_highlight", locale);
  const lead = localize(content, "lead", locale);
  const footnote = localize(content, "footnote", locale);

  const [before, after] = headline.includes("{highlight}") ? headline.split("{highlight}") : [headline, ""];

  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-4 py-20 text-center sm:px-6 sm:py-28">
        {eyebrow ? (
          <div className="border-border bg-surface mx-auto mb-6 inline-flex items-center gap-2 rounded-[999px] border px-4 py-1.5 text-[13px] font-medium text-muted">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-heading mx-auto max-w-[820px] text-[36px] leading-[1.12] font-semibold text-text sm:text-[52px]">
          {before}
          {highlight ? <span className="text-primary">{highlight}</span> : null}
          {after}
        </h1>
        {lead ? <p className="mx-auto mt-6 max-w-[620px] text-[16px] leading-relaxed text-muted sm:text-[18px]">{lead}</p> : null}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#trasy"
            className="bg-primary hover:bg-primary-hover rounded-[999px] px-7 py-3 text-[15px] font-medium text-white transition-colors"
          >
            {t("ctaBook")}
          </a>
          <a
            href="#trasy"
            className="border-border bg-surface hover:border-primary rounded-[999px] border px-7 py-3 text-[15px] font-medium text-text transition-colors"
          >
            {t("ctaRoutes")}
          </a>
        </div>

        {footnote ? <p className="mt-6 text-[13px] text-muted">{footnote}</p> : null}
      </div>
    </section>
  );
}
