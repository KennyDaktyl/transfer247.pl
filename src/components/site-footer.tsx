import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";
import type { FixedRoute, Tour } from "@/lib/types";

export async function SiteFooter() {
  const [t, tNav, locale, routes, tours] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Nav"),
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
          </div>
        </div>
        <div className="border-border mt-10 border-t pt-6 text-[13px] text-muted">
          © {new Date().getFullYear()} transfer247.pl — {t("rights")}
        </div>
      </div>
    </footer>
  );
}
