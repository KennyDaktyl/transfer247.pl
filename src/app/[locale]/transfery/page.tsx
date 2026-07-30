import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
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
  return { title: t("heading"), description: t("lead"), alternates: buildAlternates("/transfery") };
}

export default async function RoutesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, appLocale, routes] = await Promise.all([
    getTranslations("Routes"),
    getLocale() as Promise<AppLocale>,
    apiFetch<FixedRoute[]>("/api/fixed-routes/", { next: { revalidate: 60 } }),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="font-heading text-[32px] font-semibold text-text sm:text-[42px]">{t("heading")}</h1>
          <p className="mt-3 max-w-[560px] text-[16px] text-muted">{t("lead")}</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <Link
                key={route.slug}
                href={`/transfery/${route.slug}`}
                className="border-border bg-surface block rounded-[16px] border p-6 transition-shadow hover:shadow-md"
              >
                <div className="text-[13px] font-medium text-muted">{route.duration}</div>
                <h2 className="font-heading mt-1 text-[19px] font-semibold text-text">
                  {localize(route, "name", appLocale)}
                </h2>
                <div className="mt-4 text-[15px] font-semibold text-text">
                  {t("from")} {formatPrice(route.price_from)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
