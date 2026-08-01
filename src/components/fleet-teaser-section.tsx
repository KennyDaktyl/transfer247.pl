import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { apiFetch } from "@/lib/api";
import { absoluteImageUrl } from "@/lib/images";
import { localize } from "@/lib/localize";
import type { Vehicle } from "@/lib/types";

function VehiclePlaceholder() {
  return (
    <div className="bg-surface flex aspect-[4/3] w-full items-center justify-center rounded-[12px]">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-border">
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

export async function FleetTeaserSection() {
  const [t, locale, vehicles] = await Promise.all([
    getTranslations("Fleet"),
    getLocale() as Promise<AppLocale>,
    apiFetch<Vehicle[]>("/api/fleet/vehicles/", { next: { revalidate: 60 } }),
  ]);

  if (vehicles.length === 0) return null;

  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-[28px] font-semibold text-text sm:text-[36px]">{t("heading")}</h2>
            <p className="mt-3 max-w-[560px] text-[15px] text-muted sm:text-[16px]">{t("lead")}</p>
          </div>
          <Link href="/flota" className="text-primary text-[14px] font-medium whitespace-nowrap">
            {t("heading")} →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {vehicles.map((vehicle) => {
            const description = localize(vehicle, "description", locale);
            return (
              <Link
                key={vehicle.id}
                href={`/flota#vehicle-${vehicle.id}`}
                className="border-border bg-surface flex gap-5 rounded-[16px] border p-5 transition-shadow hover:shadow-md"
              >
                <div className="w-[40%] shrink-0">
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
                </div>
                <div>
                  <h3 className="font-heading text-[18px] font-semibold text-text">{vehicle.name}</h3>
                  <div className="mt-1 text-[13px] font-medium text-muted">
                    {vehicle.seats} {t("seats")}
                  </div>
                  <p className="mt-2 line-clamp-3 text-[13.5px] text-muted">{description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
