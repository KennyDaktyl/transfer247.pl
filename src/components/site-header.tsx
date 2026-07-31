import { getLocale, getTranslations } from "next-intl/server";

import { apiFetch } from "@/lib/api";
import { localize } from "@/lib/localize";
import type { FixedRoute, Tour } from "@/lib/types";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { NavDropdown } from "./nav-dropdown";

export async function SiteHeader() {
  const [t, locale, routes, tours] = await Promise.all([
    getTranslations("Nav"),
    getLocale() as Promise<AppLocale>,
    apiFetch<FixedRoute[]>("/api/fixed-routes/", { next: { revalidate: 60 } }),
    apiFetch<Tour[]>("/api/tours/", { next: { revalidate: 60 } }),
  ]);

  const routeItems = routes.map((r) => ({ href: `/transfery/${r.slug}`, label: localize(r, "name", locale) }));
  const tourItems = tours.map((tour) => ({ href: `/wycieczki/${tour.slug}`, label: localize(tour, "title", locale) }));
  const flatLinks = [
    { href: "/flota", label: t("fleet") },
    { href: "/blog", label: t("blog") },
    { href: "/kontakt", label: t("contact") },
  ];

  return (
    <header className="border-border bg-surface/90 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="min-w-0">
          <span className="font-heading text-[19px] font-semibold tracking-tight text-text">
            transfer<span className="text-primary">247</span>.pl
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-7 text-[14.5px] text-muted md:flex">
          <NavDropdown label={t("routes")} indexHref="/transfery" items={routeItems} />
          <NavDropdown label={t("tours")} indexHref="/wycieczki" items={tourItems} />
          {flatLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-text">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          <Link
            href="/transfery"
            className="bg-primary hover:bg-primary-hover rounded-[999px] px-4 py-2 text-[14px] font-medium text-white transition-colors"
          >
            {t("bookNow")}
          </Link>
          <MobileNav
            routeItems={routeItems}
            tourItems={tourItems}
            routesLabel={t("routes")}
            toursLabel={t("tours")}
            flatLinks={flatLinks}
          />
        </div>
      </div>
    </header>
  );
}
