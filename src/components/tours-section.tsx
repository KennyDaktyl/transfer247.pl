import { getLocale, getTranslations } from "next-intl/server";

import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { localize } from "@/lib/localize";
import type { Tour } from "@/lib/types";
import type { AppLocale } from "@/i18n/routing";

export async function ToursSection() {
  const [t, locale, tours] = await Promise.all([
    getTranslations("Tours"),
    getLocale() as Promise<AppLocale>,
    apiFetch<Tour[]>("/api/tours/", { next: { revalidate: 60 } }),
  ]);

  if (tours.length === 0) return null;

  return (
    <section id="wycieczki" className="bg-surface scroll-mt-20">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="font-heading text-[28px] font-semibold text-text sm:text-[36px]">{t("heading")}</h2>
        <p className="mt-3 max-w-[560px] text-[15px] text-muted sm:text-[16px]">{t("lead")}</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {tours.map((tour) => (
            <article key={tour.slug} className="border-border bg-bg rounded-[16px] border p-6">
              <div className="text-secondary text-[13px] font-medium">{tour.duration}</div>
              <h3 className="font-heading mt-1 text-[20px] font-semibold text-text">
                {localize(tour, "title", locale)}
              </h3>
              <p className="mt-2 text-[14px] text-muted">{localize(tour, "summary", locale)}</p>

              <div className="border-border mt-5 space-y-2 border-t pt-4 text-[14px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Toyota Auris Hybrid</span>
                  <span className="font-semibold text-text">
                    {t("from")} {formatPrice(tour.price_from)}
                  </span>
                </div>
                {tour.price_large_vehicle ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Ford Tourneo Custom</span>
                    <span className="font-semibold text-text">
                      {t("from")} {formatPrice(tour.price_large_vehicle)}
                    </span>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
