import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-[28px] font-semibold text-text sm:text-[36px]">{t("heading")}</h2>
            <p className="mt-3 max-w-[560px] text-[15px] text-muted sm:text-[16px]">{t("lead")}</p>
            <p className="mt-1.5 text-[12px] text-muted">{t("vatNote")}</p>
          </div>
          <Link href="/wycieczki" className="text-primary text-[14px] font-medium whitespace-nowrap">
            {t("backToIndex")} →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {tours.map((tour) => (
            <Link
              key={tour.slug}
              href={`/wycieczki/${tour.slug}`}
              className="border-border bg-bg block rounded-[16px] border p-6 transition-shadow hover:shadow-md"
            >
              <div className="text-secondary text-[13px] font-medium">{tour.duration}</div>
              <h3 className="font-heading mt-1 text-[20px] font-semibold text-text">
                {localize(tour, "title", locale)}
              </h3>
              <p className="mt-2 text-[14px] text-muted">{localize(tour, "summary", locale)}</p>

              <div className="border-border mt-5 border-t pt-4">
                {tour.price_from ? (
                  <div className="text-[17px] font-semibold text-text">
                    {t("from")} {formatPrice(tour.price_from, tour.price_from_eur, locale)}
                  </div>
                ) : (
                  <div className="text-[14px] text-muted">{t("priceOnRequest")}</div>
                )}
                {tour.vehicle_prices.length > 1 ? (
                  <div className="mt-1 text-[12.5px] text-muted">
                    {tour.vehicle_prices.length} {t("vehicleOptions")}
                  </div>
                ) : null}
              </div>

              <div className="text-primary mt-4 text-[13.5px] font-medium">{t("seeDetails")} →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
