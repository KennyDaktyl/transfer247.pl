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
import type { Tour } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tours" });
  return { title: t("heading"), description: t("lead"), alternates: buildAlternates("/wycieczki") };
}

export default async function ToursIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, appLocale, tours] = await Promise.all([
    getTranslations("Tours"),
    getLocale() as Promise<AppLocale>,
    apiFetch<Tour[]>("/api/tours/", { next: { revalidate: 60 } }),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="font-heading text-[32px] font-semibold text-text sm:text-[42px]">{t("heading")}</h1>
          <p className="mt-3 max-w-[560px] text-[16px] text-muted">{t("lead")}</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {tours.map((tour) => (
              <Link
                key={tour.slug}
                href={`/wycieczki/${tour.slug}`}
                className="border-border bg-surface block rounded-[16px] border p-6 transition-shadow hover:shadow-md"
              >
                <div className="text-secondary text-[13px] font-medium">{tour.duration}</div>
                <h2 className="font-heading mt-1 text-[20px] font-semibold text-text">
                  {localize(tour, "title", appLocale)}
                </h2>
                <p className="mt-2 text-[14px] text-muted">{localize(tour, "summary", appLocale)}</p>
                <div className="mt-4 text-[15px] font-semibold text-text">
                  {t("from")} {formatPrice(tour.price_from)}
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
