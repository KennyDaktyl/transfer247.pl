import { getLocale, getTranslations } from "next-intl/server";

import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { localize } from "@/lib/localize";
import type { FixedRoute, Tour } from "@/lib/types";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";
import { LogoutButton } from "./logout-button";
import { MobileNav } from "./mobile-nav";
import { NavDropdown } from "./nav-dropdown";

export async function SiteHeader() {
  const [t, locale, routes, tours, { customer }] = await Promise.all([
    getTranslations("Nav"),
    getLocale() as Promise<AppLocale>,
    apiFetch<FixedRoute[]>("/api/fixed-routes/", { next: { revalidate: 60 } }),
    apiFetch<Tour[]>("/api/tours/", { next: { revalidate: 60 } }),
    getSession(),
  ]);

  const toNavItem = (r: FixedRoute) => ({ href: `/transfery/${r.slug}`, label: localize(r, "name", locale) });
  const airportRouteItems = routes.filter((r) => r.category === "LOTNISKO").map(toNavItem);
  const stationRouteItems = routes.filter((r) => r.category === "DWORZEC_PKP").map(toNavItem);
  const tourItems = [
    ...tours.map((tour) => ({ href: `/wycieczki/${tour.slug}`, label: localize(tour, "title", locale) })),
    { href: "/przewoz-rowerow", label: t("bikeTransport") },
  ];
  const flatLinks = [
    { href: "/flota", label: t("fleet") },
    { href: "/blog", label: t("blog") },
    { href: "/kontakt", label: t("contact") },
  ];
  const loginHref = customer ? "/panel" : "/logowanie";
  const loginLabel = customer ? t("myTrips") : t("login");

  return (
    <header className="border-border bg-surface/90 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="relative mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <span className="font-heading text-[19px] font-semibold tracking-tight text-text">
            transfer<span className="text-primary">247</span>.pl
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-4 text-[13.5px] text-muted lg:flex xl:gap-5">
          <NavDropdown label={t("airportRoutes")} indexHref="/transfery#lotniskowe" items={airportRouteItems} />
          <NavDropdown label={t("stationRoutes")} indexHref="/transfery#dworzec-pkp" items={stationRouteItems} />
          <NavDropdown label={t("tours")} indexHref="/wycieczki" items={tourItems} />
          {flatLinks.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap transition-colors hover:text-text">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden lg:block">
            <LocaleSwitcher />
          </div>
          <Link
            href={loginHref}
            className="border-primary text-primary hover:bg-primary/10 hidden shrink-0 rounded-[999px] border px-3 py-2 text-[14px] font-medium whitespace-nowrap transition-colors lg:inline-block"
          >
            {loginLabel}
          </Link>
          {customer && (
            <LogoutButton
              label={t("logout")}
              className="hidden shrink-0 text-[13.5px] font-medium whitespace-nowrap text-muted transition-colors hover:text-text lg:inline-block"
            />
          )}
          <a
            href="tel:+48506029980"
            aria-label={t("call")}
            className="border-border hover:border-primary hover:text-primary hidden shrink-0 items-center gap-1.5 rounded-[999px] border px-3 py-2 text-[14px] font-medium text-text transition-colors lg:flex"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path
                d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.4 3 2.8 3.4 2.4 4 2.4h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden xl:inline">{t("call")}</span>
          </a>
          <Link
            href="/transfery"
            className="bg-primary hover:bg-primary-hover rounded-[999px] px-4 py-2 text-[14px] font-medium text-white transition-colors"
          >
            {t("bookNow")}
          </Link>
          <MobileNav
            airportRouteItems={airportRouteItems}
            stationRouteItems={stationRouteItems}
            tourItems={tourItems}
            airportRoutesLabel={t("airportRoutes")}
            stationRoutesLabel={t("stationRoutes")}
            toursLabel={t("tours")}
            flatLinks={flatLinks}
            callLabel={t("call")}
            loginHref={loginHref}
            loginLabel={loginLabel}
            isLoggedIn={Boolean(customer)}
            logoutLabel={t("logout")}
          />
        </div>
      </div>
    </header>
  );
}
