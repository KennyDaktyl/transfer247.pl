import { getTranslations, setRequestLocale } from "next-intl/server";

import { BookingsList } from "@/components/bookings-list";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { redirect } from "@/i18n/navigation";
import { apiBaseUrl, withSiteHeader } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { Booking } from "@/lib/types";

export default async function PanelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tCrumbs, { customer, accessToken }] = await Promise.all([
    getTranslations("Panel"),
    getTranslations("Breadcrumbs"),
    getSession(),
  ]);

  if (!customer || !accessToken) {
    redirect({ href: "/logowanie", locale });
  }

  const res = await fetch(`${apiBaseUrl()}/api/bookings/mine/`, {
    headers: withSiteHeader({ Authorization: `Bearer ${accessToken}` }),
    cache: "no-store",
  });
  const bookings: Booking[] = res.ok ? await res.json() : [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <Breadcrumbs items={[{ label: tCrumbs("home"), href: "/" }, { label: t("title") }]} />
        <h1 className="font-heading mt-3 mb-8 text-2xl font-semibold text-text">{t("title")}</h1>
        <BookingsList bookings={bookings} locale={locale} />
      </main>
      <SiteFooter />
    </>
  );
}
