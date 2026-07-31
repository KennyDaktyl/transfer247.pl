import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { localize } from "@/lib/localize";
import { buildAlternates } from "@/lib/seo";
import type { Tour } from "@/lib/types";

async function getTours(): Promise<Tour[]> {
  try {
    return await apiFetch<Tour[]>("/api/tours/", { next: { revalidate: 60 } });
  } catch {
    return [];
  }
}

async function getTour(slug: string): Promise<Tour | null> {
  try {
    return await apiFetch<Tour>(`/api/tours/${slug}/`, { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const tours = await getTours();
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tour = await getTour(slug);
  if (!tour) return {};

  const appLocale = locale as AppLocale;
  const title =
    localize(tour, "seo_title", appLocale) ||
    localize(tour, "h1", appLocale) ||
    localize(tour, "title", appLocale);
  const description = localize(tour, "seo_description", appLocale) || localize(tour, "summary", appLocale);

  return { title, description, alternates: buildAlternates(`/wycieczki/${slug}`) };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, appLocale, allTours, tour] = await Promise.all([
    getTranslations("Tours"),
    getLocale() as Promise<AppLocale>,
    getTours(),
    getTour(slug),
  ]);

  if (!tour) notFound();

  const h1 = localize(tour, "h1", appLocale) || localize(tour, "title", appLocale);
  const body = localize(tour, "body", appLocale);
  const otherTours = allTours.filter((other) => other.slug !== tour.slug);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[820px] px-4 py-14 sm:px-6 sm:py-20">
          <Link href="/wycieczki" className="text-primary text-[13px] font-medium">
            ← {t("backToIndex")}
          </Link>

          <h1 className="font-heading mt-4 text-[32px] leading-[1.1] font-semibold text-text sm:text-[42px]">
            {h1}
          </h1>

          <div className="border-border bg-surface mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[16px] border p-6">
            <div className="text-[14px] text-muted">{tour.duration}</div>
            <div className="flex flex-wrap gap-6 text-[14px]">
              <div>
                <div className="text-muted">Toyota Auris Hybrid</div>
                <div className="text-[17px] font-semibold text-text">
                  {t("from")} {formatPrice(tour.price_from, tour.price_from_eur, appLocale)}
                </div>
              </div>
              {tour.price_large_vehicle ? (
                <div>
                  <div className="text-muted">Ford Tourneo Custom</div>
                  <div className="text-[17px] font-semibold text-text">
                    {t("from")} {formatPrice(tour.price_large_vehicle, tour.price_large_vehicle_eur, appLocale)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <Link
            href="/kontakt"
            className="bg-primary hover:bg-primary-hover mt-8 inline-block rounded-[999px] px-7 py-3 text-[15px] font-medium text-white transition-colors"
          >
            {t("bookThisTour")}
          </Link>

          <div className="mt-10">
            <MarkdownContent markdown={body} />
          </div>

          {otherTours.length > 0 ? (
            <div className="border-border mt-14 border-t pt-10">
              <h2 className="font-heading mb-4 text-[18px] font-semibold text-text">{t("otherTours")}</h2>
              <div className="flex flex-wrap gap-2">
                {otherTours.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/wycieczki/${other.slug}`}
                    className="border-border rounded-[999px] border px-4 py-2 text-[13.5px] text-muted transition-colors hover:border-primary hover:text-text"
                  >
                    {localize(other, "title", appLocale)}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
