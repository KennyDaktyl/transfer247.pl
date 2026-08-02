import { getTranslations, setRequestLocale } from "next-intl/server";

import { PayDepositButton } from "@/components/pay-deposit-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link, redirect } from "@/i18n/navigation";
import { apiBaseUrl, withSiteHeader } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { Booking } from "@/lib/types";

const TRACKABLE_STATUSES = ["KIEROWCA_W_DRODZE", "W_TRAKCIE"];

export default async function PanelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tStatus, tPayment, { customer, accessToken }] = await Promise.all([
    getTranslations("Panel"),
    getTranslations("BookingStatus"),
    getTranslations("BookingPayment"),
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
        <h1 className="font-heading mb-8 text-2xl font-semibold text-text">{t("title")}</h1>

        {bookings.length === 0 ? (
          <p className="text-muted">{t("empty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="border-border bg-surface rounded-[12px] border p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-heading text-[15px] font-semibold text-text">
                    {booking.pickup_address} → {booking.dropoff_address}
                  </span>
                  <span className="border-border text-primary rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase">
                    {tStatus(booking.status)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px] text-muted">
                  <span>
                    {t("date")}: {new Date(booking.scheduled_at).toLocaleString(locale)}
                  </span>
                  <span>
                    {t("price")}: {booking.price ? `${Number(booking.price).toFixed(0)} zł` : "—"}
                  </span>
                  {TRACKABLE_STATUSES.includes(booking.status) && (
                    <Link href={`/panel/kurs/${booking.id}`} className="text-primary font-semibold underline">
                      {t("trackDriver")}
                    </Link>
                  )}
                </div>

                {booking.status === "NOWA" && (
                  <p className="mt-3 text-[13px] text-muted">{tPayment("waitingForConfirmation")}</p>
                )}

                {booking.status === "POTWIERDZONA" && booking.deposit_amount && (
                  <div className="mt-3 flex flex-col gap-2">
                    <PayDepositButton bookingId={booking.id} depositAmount={booking.deposit_amount} />
                    {booking.payment_deadline && (
                      <span className="text-[12px] text-muted">
                        {tPayment("payBy", { time: new Date(booking.payment_deadline).toLocaleString(locale) })}
                      </span>
                    )}
                  </div>
                )}

                {booking.status === "OPLACONA" && (
                  <p className="text-secondary mt-3 text-[13px]">{tPayment("paidConfirmed")}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
