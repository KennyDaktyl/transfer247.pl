import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { CatalogBookingForm } from "@/components/catalog-booking-form";
import { MarkdownContent } from "@/components/markdown-content";
import { PhotoGallery } from "@/components/photo-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { absoluteImageUrl } from "@/lib/images";
import { localize } from "@/lib/localize";
import { buildAlternates } from "@/lib/seo";
import type { FixedRoute } from "@/lib/types";

async function getRoutes(): Promise<FixedRoute[]> {
  try {
    return await apiFetch<FixedRoute[]>("/api/fixed-routes/", { next: { revalidate: 60 } });
  } catch {
    return [];
  }
}

async function getRoute(slug: string): Promise<FixedRoute | null> {
  try {
    return await apiFetch<FixedRoute>(`/api/fixed-routes/${slug}/`, { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const routes = await getRoutes();
  return routes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const route = await getRoute(slug);
  if (!route) return {};

  const appLocale = locale as AppLocale;
  const title =
    localize(route, "seo_title", appLocale) ||
    localize(route, "h1", appLocale) ||
    localize(route, "name", appLocale);
  const description = localize(route, "seo_description", appLocale);

  return { title, description, alternates: buildAlternates(`/transfery/${slug}`) };
}

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, appLocale, allRoutes, route] = await Promise.all([
    getTranslations("Routes"),
    getLocale() as Promise<AppLocale>,
    getRoutes(),
    getRoute(slug),
  ]);

  if (!route) notFound();

  const h1 = localize(route, "h1", appLocale) || localize(route, "name", appLocale);
  const body = localize(route, "body", appLocale);
  const otherRoutes = allRoutes.filter((r) => r.slug !== route.slug);
  const galleryPhotos = route.photos.map((photo) => ({
    src: absoluteImageUrl(photo.image),
    thumbnailSrc: absoluteImageUrl(photo.thumbnail || photo.image),
    alt: photo.caption || h1,
  }));

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-20">
          <Link href="/transfery" className="text-primary text-[13px] font-medium">
            ← {t("backToIndex")}
          </Link>

          <h1 className="font-heading mt-4 text-[32px] leading-[1.1] font-semibold text-text sm:text-[42px]">
            {h1}
          </h1>

          <div className="border-border bg-surface mt-6 rounded-[16px] border p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[14px] text-muted">{route.duration}</div>
              {route.vehicle_prices.length > 0 ? (
                <div className="font-label text-[11px] font-semibold tracking-wide text-muted uppercase">
                  {t("priceTableHeading")}
                </div>
              ) : null}
            </div>
            {route.vehicle_prices.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2">
                {route.vehicle_prices.map((vp) => (
                  <Link
                    key={vp.vehicle_id}
                    href={`/flota#vehicle-${vp.vehicle_id}`}
                    className="flex items-center justify-between gap-4 border-t border-dashed border-border pt-2 first:border-t-0 first:pt-0"
                  >
                    <span className="text-[14px] text-text underline decoration-border underline-offset-2 hover:decoration-text">
                      {vp.vehicle_name} <span className="text-muted">· {vp.vehicle_seats} os.</span>
                    </span>
                    <span className="text-[15px] font-semibold whitespace-nowrap text-text">
                      {t("from")} {formatPrice(vp.price, vp.price_eur, appLocale)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[14px] text-muted">{t("priceOnRequest")}</p>
            )}
            <p className="mt-3 text-[12px] text-muted">{t("vatNote")}</p>
          </div>

          {route.vehicle_prices.length > 0 ? (
            <CatalogBookingForm kind="route" catalogSlug={route.slug} vehiclePrices={route.vehicle_prices} />
          ) : (
            <Link
              href="/kontakt"
              className="bg-primary hover:bg-primary-hover mt-8 inline-block rounded-[999px] px-7 py-3 text-[15px] font-medium text-white transition-colors"
            >
              {t("bookThisRoute")}
            </Link>
          )}

          <div className="mt-10">
            <MarkdownContent markdown={body} />
          </div>

          {galleryPhotos.length > 0 ? (
            <div className="border-border mt-10 border-t pt-10">
              <h2 className="font-heading mb-4 text-[18px] font-semibold text-text">{t("gallery")}</h2>
              <PhotoGallery photos={galleryPhotos} />
            </div>
          ) : null}

          {otherRoutes.length > 0 ? (
            <div className="border-border mt-14 border-t pt-10">
              <h2 className="font-heading mb-4 text-[18px] font-semibold text-text">{t("otherRoutes")}</h2>
              <div className="flex flex-wrap gap-2">
                {otherRoutes.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/transfery/${r.slug}`}
                    className="border-border rounded-[999px] border px-4 py-2 text-[13.5px] text-muted transition-colors hover:border-primary hover:text-text"
                  >
                    {localize(r, "name", appLocale)}
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
