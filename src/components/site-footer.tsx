import { getLocale, getTranslations } from "next-intl/server";

import { ObfuscatedEmail } from "@/components/obfuscated-email";
import { PaymentBadge } from "@/components/payment-badge";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";
import type { FixedRoute, Tour } from "@/lib/types";

const SERVED_PLACES = [
  "Kraków", "Balice", "Wieliczka", "Skawina", "Niepołomice", "Zakopane", "Katowice", "Energylandia",
];
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=ul.+Wspólna+2,+32-061+Rybna";

export async function SiteFooter() {
  const [t, tNav, tPayment, locale, routes, tours] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Nav"),
    getTranslations("BookingPayment"),
    getLocale() as Promise<AppLocale>,
    apiFetch<FixedRoute[]>("/api/fixed-routes/", { next: { revalidate: 60 } }),
    apiFetch<Tour[]>("/api/tours/", { next: { revalidate: 60 } }),
  ]);

  return (
    <footer className="border-border bg-surface border-t">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="font-heading text-[18px] font-semibold text-text">
              transfer<span className="text-primary">247</span>.pl
            </span>
            <p className="mt-3 max-w-[220px] text-[14px] text-muted">{t("tagline")}</p>
            <div className="mt-4 flex flex-col gap-1.5 text-[13.5px] text-muted">
              <a href="tel:+48506029980" className="hover:text-text">
                +48 506 029 980
              </a>
              <ObfuscatedEmail user="kontakt" domain="transfer247.pl" className="hover:text-text" />
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text"
              >
                ul. Wspólna 2, 32-061 Rybna →
              </a>
            </div>
            <div className="mt-4">
              <div className="text-[12px] font-semibold tracking-wide text-text uppercase">
                {t("serviceAreaHeading")}
              </div>
              <p className="mt-1.5 max-w-[220px] text-[13px] text-muted">{SERVED_PLACES.join(" · ")}</p>
            </div>
          </div>
          <div>
            <div className="mb-3 text-[13px] font-semibold tracking-wide text-text uppercase">{t("routes")}</div>
            <div className="flex flex-col gap-2">
              {routes.map((route) => (
                <Link
                  key={route.slug}
                  href={`/transfery/${route.slug}`}
                  className="text-[14px] text-muted hover:text-text"
                >
                  {localize(route, "name", locale)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 text-[13px] font-semibold tracking-wide text-text uppercase">{t("tours")}</div>
            <div className="flex flex-col gap-2">
              {tours.map((tour) => (
                <Link
                  key={tour.slug}
                  href={`/wycieczki/${tour.slug}`}
                  className="text-[14px] text-muted hover:text-text"
                >
                  {localize(tour, "title", locale)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 text-[13px] font-semibold tracking-wide text-text uppercase">{t("company")}</div>
            <Link href="/flota" className="block text-[14px] text-muted hover:text-text">
              {tNav("fleet")}
            </Link>
            <Link href="/przewoz-rowerow" className="mt-2 block text-[14px] text-muted hover:text-text">
              {t("bikeTransport")}
            </Link>
            <Link href="/blog" className="mt-2 block text-[14px] text-muted hover:text-text">
              {t("blog")}
            </Link>
            <Link href="/kontakt" className="mt-2 block text-[14px] text-muted hover:text-text">
              {t("contact")}
            </Link>
            <Link href="/regulamin" className="mt-2 block text-[14px] text-muted hover:text-text">
              {t("terms")}
            </Link>
          </div>
        </div>
        <div className="border-border mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <div className="flex flex-col gap-1 text-[12.5px] text-muted">
            <span>Michał Pielak MIKTEL · NIP 6782805234 · ul. Wspólna 2, 32-061 Rybna</span>
            <span>
              © {new Date().getFullYear()} transfer247.pl — {t("rights")}
            </span>
          </div>
          <PaymentBadge label={tPayment("securePayments")} sublabel={tPayment("paymentMethods")} />
        </div>
      </div>
    </footer>
  );
}
