"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatPrice } from "@/lib/format";
import type { VehiclePrice } from "@/lib/types";

import { PhoneVerifyStep } from "./phone-verify-step";

const MAX_PASSENGERS = 7;

export function CatalogBookingForm({
  kind,
  catalogSlug,
  vehiclePrices,
}: {
  kind: "route" | "tour";
  catalogSlug: string;
  vehiclePrices: VehiclePrice[];
}) {
  const t = useTranslations("CatalogBooking");
  const locale = useLocale() as AppLocale;

  const [vehicleId, setVehicleId] = useState<number | null>(vehiclePrices[0]?.vehicle_id ?? null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [pickupDetails, setPickupDetails] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("+48");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "unauthenticated">("idle");

  const canSubmit = vehicleId != null && date && time && pickupDetails && customerName;

  async function handleSubmit() {
    if (!canSubmit) return;
    setStatus("submitting");
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      const res = await fetch("/api/bookings/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [kind === "route" ? "fixed_route_slug" : "tour_slug"]: catalogSlug,
          vehicle_id: vehicleId,
          scheduled_at: scheduledAt,
          passenger_count: passengers,
          pickup_details: pickupDetails,
          customer_name: customerName,
          customer_email: customerEmail || undefined,
        }),
      });
      if (res.status === 401) {
        setStatus("unauthenticated");
        return;
      }
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border-border bg-surface mt-6 rounded-[16px] border p-6 text-center">
        <p className="text-[14px] font-semibold text-text">{t("success")}</p>
        <Link href="/panel" className="text-primary mt-2 inline-block text-[13.5px] underline">
          {t("successPanelLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface mt-6 rounded-[16px] border p-6">
      <h2 className="font-heading text-[19px] font-semibold text-text">{t("title")}</h2>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
            {t("vehicleLabel")}
          </label>
          <select
            value={vehicleId ?? ""}
            onChange={(e) => setVehicleId(Number(e.target.value))}
            className="border-border bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
          >
            {vehiclePrices.map((vp) => (
              <option key={vp.vehicle_id} value={vp.vehicle_id}>
                {vp.vehicle_name} · {vp.vehicle_seats} os. · {formatPrice(vp.price, vp.price_eur, locale)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              {t("dateLabel")}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              {t("timeLabel")}
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border-border bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
            {t("passengersLabel")}
          </label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="border-border bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
          >
            {Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
            {t("pickupDetailsLabel")}
          </label>
          <input
            type="text"
            value={pickupDetails}
            onChange={(e) => setPickupDetails(e.target.value)}
            placeholder={t("pickupDetailsPlaceholder")}
            className="border-border bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              {t("nameLabel")}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="border-border bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="border-border bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || status === "submitting"}
          className="bg-primary hover:bg-primary-hover w-full rounded-[9px] py-[13px] text-[15px] font-bold text-white transition-colors disabled:opacity-60"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>

        {status === "error" && (
          <p className="text-center text-xs font-semibold text-red-600">{t("error")}</p>
        )}

        {status === "unauthenticated" && (
          <div className="flex flex-col gap-2">
            <p className="text-center text-xs font-semibold text-text">{t("verifyPhone")}</p>
            <PhoneVerifyStep phone={phone} onPhoneChange={setPhone} onVerified={handleSubmit} />
          </div>
        )}
      </div>
    </div>
  );
}
