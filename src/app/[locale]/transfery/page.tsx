import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { localize } from "@/lib/localize";
import { buildAlternates } from "@/lib/seo";
import type { FixedRoute } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Routes" });
  return { title: t("heading"), description: t("lead"), alternates: buildAlternates("/transfery", locale as AppLocale) };
}

function RouteGrid({
  routes,
  appLocale,
  fromLabel,
  priceOnRequestLabel,
}: {
  routes: FixedRoute[];
  appLocale: AppLocale;
  fromLabel: string;
  priceOnRequestLabel: string;
}) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {routes.map((route) => (
        <Link
          key={route.slug}
          href={`/transfery/${route.slug}`}
          className="border-border bg-surface block rounded-[16px] border p-6 transition-shadow hover:shadow-md"
        >
          <div className="text-[13px] font-medium text-muted">{route.duration}</div>
          <h3 className="font-heading mt-1 text-[19px] font-semibold text-text">
            {localize(route, "name", appLocale)}
          </h3>
          <div className="mt-4 text-[15px] font-semibold text-text">
            {route.price_from ? (
              <>
                {fromLabel} {formatPrice(route.price_from, route.price_from_eur, appLocale)}
              </>
            ) : (
              <span className="font-normal text-muted">{priceOnRequestLabel}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function RoutesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tCrumbs, appLocale, routes] = await Promise.all([
    getTranslations("Routes"),
    getTranslations("Breadcrumbs"),
    getLocale() as Promise<AppLocale>,
    apiFetch<FixedRoute[]>("/api/fixed-routes/", { next: { revalidate: 60 } }),
  ]);

  const airportRoutes = routes.filter((r) => r.category === "LOTNISKO");
  const stationRoutes = routes.filter((r) => r.category === "DWORZEC_PKP");

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <Breadcrumbs items={[{ label: tCrumbs("home"), href: "/" }, { label: tCrumbs("transfers") }]} />
          <h1 className="font-heading mt-3 text-[32px] font-semibold text-text sm:text-[42px]">{t("heading")}</h1>
          <p className="mt-3 max-w-[560px] text-[16px] text-muted">{t("lead")}</p>
          <p className="mt-1.5 text-[12px] text-muted">{t("vatNote")}</p>

          {airportRoutes.length > 0 ? (
            <section id="lotniskowe" className="mt-14 scroll-mt-24">
              <h2 className="font-heading text-[24px] font-semibold text-text">{t("airportHeading")}</h2>
              <p className="mt-2 max-w-[560px] text-[14px] text-muted">{t("airportLead")}</p>
              <RouteGrid
                routes={airportRoutes}
                appLocale={appLocale}
                fromLabel={t("from")}
                priceOnRequestLabel={t("priceOnRequest")}
              />
            </section>
          ) : null}

          {stationRoutes.length > 0 ? (
            <section id="dworzec-pkp" className="mt-14 scroll-mt-24">
              <h2 className="font-heading text-[24px] font-semibold text-text">{t("stationHeading")}</h2>
              <p className="mt-2 max-w-[560px] text-[14px] text-muted">{t("stationLead")}</p>
              <RouteGrid
                routes={stationRoutes}
                appLocale={appLocale}
                fromLabel={t("from")}
                priceOnRequestLabel={t("priceOnRequest")}
              />
            </section>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
