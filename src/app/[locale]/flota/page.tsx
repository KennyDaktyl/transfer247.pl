import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import type { AppLocale } from "@/i18n/routing";
import { PhotoGallery } from "@/components/photo-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { absoluteImageUrl } from "@/lib/images";
import { localize } from "@/lib/localize";
import { buildAlternates } from "@/lib/seo";
import type { Vehicle } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Fleet" });
  return { title: t("heading"), description: t("lead"), alternates: buildAlternates("/flota") };
}

function VehiclePlaceholder() {
  return (
    <div className="bg-bg flex aspect-[4/3] w-full items-center justify-center rounded-[12px]">
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" className="text-border">
        <path
          d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13M5 13h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="17.5" r="1.2" fill="currentColor" />
        <circle cx="17" cy="17.5" r="1.2" fill="currentColor" />
      </svg>
    </div>
  );
}

export default async function FleetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // The real operational fleet (apps.fleet.Vehicle, shared with driver
  // assignment) is the only source of truth here — no separate showcase model.
  const [t, appLocale, vehicles] = await Promise.all([
    getTranslations("Fleet"),
    getLocale() as Promise<AppLocale>,
    apiFetch<Vehicle[]>("/api/fleet/vehicles/", { next: { revalidate: 60 } }),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="font-heading text-[32px] font-semibold text-text sm:text-[42px]">{t("heading")}</h1>
          <p className="mt-3 max-w-[560px] text-[16px] text-muted">{t("lead")}</p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {vehicles.map((vehicle) => {
              const description = localize(vehicle, "description", appLocale);
              const galleryPhotos = vehicle.photos.map((photo) => ({
                src: absoluteImageUrl(photo.image),
                thumbnailSrc: absoluteImageUrl(photo.thumbnail || photo.image),
                alt: photo.caption || vehicle.name,
              }));

              return (
                <article
                  key={vehicle.id}
                  id={`vehicle-${vehicle.id}`}
                  className="border-border bg-surface scroll-mt-24 rounded-[16px] border p-5"
                >
                  {vehicle.cover_photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={absoluteImageUrl(vehicle.cover_photo)}
                      alt={vehicle.name}
                      className="aspect-[4/3] w-full rounded-[12px] object-cover"
                    />
                  ) : (
                    <VehiclePlaceholder />
                  )}

                  <h2 className="font-heading mt-5 text-[21px] font-semibold text-text">{vehicle.name}</h2>
                  <div className="mt-1 text-[13px] font-medium text-muted">
                    {vehicle.seats} {t("seats")}
                  </div>
                  {description ? <p className="mt-3 text-[14px] leading-relaxed text-muted">{description}</p> : null}

                  {galleryPhotos.length > 0 ? <PhotoGallery photos={galleryPhotos} className="mt-4" /> : null}
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
