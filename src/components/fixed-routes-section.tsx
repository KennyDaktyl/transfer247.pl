import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { localize } from "@/lib/localize";
import type { FixedRoute } from "@/lib/types";
import type { AppLocale } from "@/i18n/routing";

export async function FixedRoutesSection() {
  const [t, locale, routes] = await Promise.all([
    getTranslations("Routes"),
    getLocale() as Promise<AppLocale>,
    apiFetch<FixedRoute[]>("/api/fixed-routes/", { next: { revalidate: 60 } }),
  ]);

  if (routes.length === 0) return null;

  return (
    <section id="trasy" className="bg-bg scroll-mt-20">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-[28px] font-semibold text-text sm:text-[36px]">{t("heading")}</h2>
            <p className="mt-3 max-w-[560px] text-[15px] text-muted sm:text-[16px]">{t("lead")}</p>
          </div>
          <Link href="/transfery" className="text-primary text-[14px] font-medium whitespace-nowrap">
            {t("backToIndex")} →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Link
              key={route.slug}
              href={`/transfery/${route.slug}`}
              className="border-border bg-surface block rounded-[16px] border p-6 transition-shadow hover:shadow-md"
            >
              <div className="text-[13px] font-medium text-muted">{route.duration}</div>
              <h3 className="font-heading mt-1 text-[19px] font-semibold text-text">
                {localize(route, "name", locale)}
              </h3>

              <div className="border-border mt-5 space-y-2 border-t pt-4 text-[14px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t("vehicleSmall")}</span>
                  <span className="font-semibold text-text">
                    {t("from")} {formatPrice(route.price_from, route.price_from_eur, locale)}
                  </span>
                </div>
                {route.price_large_vehicle ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted">{t("vehicleLarge")}</span>
                    <span className="font-semibold text-text">
                      {t("from")} {formatPrice(route.price_large_vehicle, route.price_large_vehicle_eur, locale)}
                    </span>
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
