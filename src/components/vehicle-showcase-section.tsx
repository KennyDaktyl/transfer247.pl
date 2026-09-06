import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { apiFetch } from "@/lib/api";
import { absoluteImageUrl } from "@/lib/images";
import { localize } from "@/lib/localize";
import type { ShowcasePhoto, Vehicle } from "@/lib/types";

import { VehicleShowcaseGallery } from "./vehicle-showcase-gallery";

const PAYMENT_BRANDS = ["VISA", "Mastercard", "BLIK"];

/** Homepage "moje auto" block — real photos of the car and the driver,
 * pulled from SiteShowcasePhoto (admin-curated, per site), plus the
 * card-payment reassurance. Lets a visitor size up the vehicle and the
 * person picking them up without opening /flota first. */
export async function VehicleShowcaseSection() {
  const [t, locale, photos, vehicles] = await Promise.all([
    getTranslations("VehicleShowcase"),
    getLocale() as Promise<AppLocale>,
    apiFetch<ShowcasePhoto[]>("/api/showcase-photos/", { next: { revalidate: 60 } }).catch(
      () => [] as ShowcasePhoto[],
    ),
    apiFetch<Vehicle[]>("/api/fleet/vehicles/", { next: { revalidate: 60 } }).catch(() => [] as Vehicle[]),
  ]);

  const vehiclePhotos = photos
    .filter((p) => p.category === "VEHICLE")
    .sort((a, b) => a.order - b.order);

  if (vehiclePhotos.length === 0) return null;

  const driverPhoto = photos.find((p) => p.category === "DRIVER");
  // The flagship transfer vehicle is the largest one in the shared fleet.
  const vehicle = [...vehicles].sort((a, b) => b.seats - a.seats)[0];

  const galleryPhotos = vehiclePhotos.map((p) => ({
    src: absoluteImageUrl(p.image),
    thumbnailSrc: absoluteImageUrl(p.thumbnail || p.image),
    caption: localize(p, "caption", locale),
    alt: localize(p, "caption", locale) || t("vehicleAlt"),
  }));

  return (
    <section className="bg-bg border-border border-t">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="max-w-[640px]">
            <p className="text-primary text-[12px] font-semibold tracking-[0.14em] uppercase">
              {t("eyebrow")}
            </p>
            {vehicle ? (
              <h2 className="font-heading mt-2 text-[30px] leading-[1.15] font-semibold text-text sm:text-[40px]">
                {vehicle.name}
                <span className="text-muted"> — {t("seats", { count: vehicle.seats })}</span>
              </h2>
            ) : null}
            <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-[16px]">{t("lead")}</p>
          </div>
          <Link href="/flota" className="text-primary mt-1 text-[14px] font-medium whitespace-nowrap">
            {t("seeFullFleet")} →
          </Link>
        </div>

        <div className="mt-10">
          <VehicleShowcaseGallery photos={galleryPhotos} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {driverPhoto ? (
            <div className="border-border bg-surface flex items-center gap-4 rounded-[16px] border p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={absoluteImageUrl(driverPhoto.thumbnail || driverPhoto.image)}
                alt={localize(driverPhoto, "caption", locale) || t("driverAlt")}
                className="border-primary h-16 w-16 shrink-0 rounded-full border-2 object-cover"
              />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                  {t("driverEyebrow")}
                </p>
                <h3 className="font-heading mt-0.5 text-[19px] font-semibold text-text">
                  {t("driverHeading")}
                </h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{t("driverBody")}</p>
              </div>
            </div>
          ) : null}

          <div className="border-border bg-surface flex items-start gap-4 rounded-[16px] border p-5">
            <span className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.7" />
                <path d="M6 14.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <circle cx="16.5" cy="14.5" r="1.4" fill="currentColor" />
              </svg>
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                {t("paymentEyebrow")}
              </p>
              <h3 className="font-heading mt-0.5 text-[19px] font-semibold text-text">
                {t("paymentHeading")}
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[...PAYMENT_BRANDS, t("paymentMethodContactless"), t("paymentMethodCash")].map((method) => (
                  <span
                    key={method}
                    className="border-border bg-bg rounded-[7px] border px-2 py-1 text-[11.5px] font-medium text-text"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/transfery"
            className="bg-primary hover:bg-primary-hover rounded-[999px] px-7 py-3 text-[15px] font-medium text-white transition-colors"
          >
            {t("ctaBook")}
          </Link>
          <p className="text-[13px] text-muted">{t("ctaNote")}</p>
        </div>
      </div>
    </section>
  );
}
