"use client";

import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { publicApiBaseUrl, withSiteHeader } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { reverseGeocode, type AddressSuggestion } from "@/lib/geocode";
import { absoluteImageUrl } from "@/lib/images";
import type { RouteEstimate, VehiclePrice } from "@/lib/types";
import { useToasts } from "@/lib/use-toasts";

import { AddressSearchField } from "./address-search-field";
import { PhoneVerifyStep } from "./phone-verify-step";
import { ToastStack } from "./toast";

const BookingMap = dynamic(() => import("./booking-map").then((m) => m.BookingMap), {
  ssr: false,
  loading: () => <div className="bg-bg h-[240px] w-full animate-pulse rounded-lg md:h-[320px]" />,
});

type LatLng = { lat: number; lng: number };
const FORM_STORAGE_KEY = "transfer247:booking-form-draft";

// Geocoders (Nominatim) and the browser's Geolocation API can return more
// decimal places than the backend's DecimalField(decimal_places=6) accepts.
function roundCoord(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

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
  const { toasts, pushToast, dismissToast } = useToasts();

  const [vehicleId, setVehicleId] = useState<number | null>(vehiclePrices[0]?.vehicle_id ?? null);
  const selectedVehicle = vehiclePrices.find((vp) => vp.vehicle_id === vehicleId) ?? null;
  const maxPassengers = selectedVehicle?.vehicle_seats ?? 1;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [childSeatAges, setChildSeatAges] = useState<number[]>([]);
  const [bikeTransport, setBikeTransport] = useState(false);
  const [bikeCount, setBikeCount] = useState(1);
  const [pickup, setPickup] = useState<LatLng | null>(null);
  const [pickupText, setPickupText] = useState("");
  const [dropoff, setDropoff] = useState<LatLng | null>(null);
  const [dropoffText, setDropoffText] = useState("");
  const [activeField, setActiveField] = useState<"pickup" | "dropoff">("pickup");
  const [locating, setLocating] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [phone, setPhone] = useState("+48");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "unauthenticated">("idle");
  const [estimate, setEstimate] = useState<RouteEstimate | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formHydrated, setFormHydrated] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  // Restores whatever the customer had already typed if they navigate away
  // (e.g. to check /flota) and come back — sessionStorage rather than
  // localStorage since this is a working draft, not something that should
  // outlive the tab. Only ever read once, right after mount.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(FORM_STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.vehicleId != null) setVehicleId(saved.vehicleId);
          if (saved.date) setDate(saved.date);
          if (saved.time) setTime(saved.time);
          if (saved.passengers) setPassengers(saved.passengers);
          if (saved.childSeatAges) setChildSeatAges(saved.childSeatAges);
          if (saved.bikeTransport) setBikeTransport(saved.bikeTransport);
          if (saved.bikeCount) setBikeCount(saved.bikeCount);
          if (saved.pickup) setPickup(saved.pickup);
          if (saved.pickupText) setPickupText(saved.pickupText);
          if (saved.dropoff) setDropoff(saved.dropoff);
          if (saved.dropoffText) setDropoffText(saved.dropoffText);
          if (saved.customerName) setCustomerName(saved.customerName);
          if (saved.customerEmail) setCustomerEmail(saved.customerEmail);
          if (saved.flightNumber) setFlightNumber(saved.flightNumber);
          if (saved.phone) setPhone(saved.phone);
        }
      } catch {
        // Corrupt or blocked storage — just start from a blank form.
      }
      setFormHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Waits for the restore above to finish (formHydrated) so this doesn't
  // immediately overwrite a just-restored draft with the pre-restore blank
  // values from that same first render.
  useEffect(() => {
    if (!formHydrated) return;
    try {
      sessionStorage.setItem(
        FORM_STORAGE_KEY,
        JSON.stringify({
          vehicleId, date, time, passengers, childSeatAges, bikeTransport, bikeCount,
          pickup, pickupText, dropoff, dropoffText, customerName, customerEmail, flightNumber, phone,
        }),
      );
    } catch {
      // Storage full/blocked (private browsing) — losing the draft on
      // navigation is an acceptable degradation, not worth surfacing.
    }
  }, [
    formHydrated, vehicleId, date, time, passengers, childSeatAges, bikeTransport, bikeCount,
    pickup, pickupText, dropoff, dropoffText, customerName, customerEmail, flightNumber, phone,
  ]);

  function armMapField(field: "pickup" | "dropoff") {
    setActiveField(field);
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // A vehicle switch can shrink the seat cap below whatever the customer
  // already picked — never silently submit more passengers than fit.
  useEffect(() => {
    setPassengers((prev) => Math.min(prev, maxPassengers));
  }, [maxPassengers]);

  // Distance/duration/route-line preview — shown as soon as both points are
  // picked, not gated behind date/time, since this form never shows
  // estimate.price/is_reserved (the real price always comes from the
  // catalog's own FixedRouteVehiclePrice/TourVehiclePrice, server-side) —
  // scheduled_at here only affects that unused price field, not the road
  // geometry, so a placeholder value is fine until the customer picks a
  // real date/time.
  useEffect(() => {
    if (!pickup || !dropoff) {
      setEstimate(null);
      return;
    }
    const scheduledAt = date && time ? new Date(`${date}T${time}:00`).toISOString() : new Date().toISOString();
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          pickup_lat: String(pickup.lat),
          pickup_lng: String(pickup.lng),
          dropoff_lat: String(dropoff.lat),
          dropoff_lng: String(dropoff.lng),
          scheduled_at: scheduledAt,
        });
        const res = await fetch(`${publicApiBaseUrl()}/api/route-estimate/?${params}`, {
          signal: controller.signal,
          headers: withSiteHeader(),
        });
        if (res.ok) {
          setEstimate(await res.json());
        } else {
          pushToast("error", t("estimateFetchError"));
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") pushToast("error", t("estimateFetchError"));
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, dropoff, date, time]);

  async function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: roundCoord(pos.coords.latitude), lng: roundCoord(pos.coords.longitude) };
        setPickup(coords);
        markTouched("pickup");
        setActiveField("dropoff");
        const address = await reverseGeocode(coords.lat, coords.lng);
        if (address) setPickupText(address);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleSelectSuggestion(field: "pickup" | "dropoff", s: AddressSuggestion) {
    const coords = { lat: roundCoord(s.lat), lng: roundCoord(s.lng) };
    if (field === "pickup") {
      setPickup(coords);
      setPickupText(s.label);
      markTouched("pickup");
      setActiveField("dropoff");
      dropoffInputRef.current?.focus();
    } else {
      setDropoff(coords);
      setDropoffText(s.label);
      markTouched("dropoff");
      nameInputRef.current?.focus();
    }
  }

  async function handleMapChange(field: "pickup" | "dropoff", pos: LatLng) {
    if (field === "pickup") {
      setPickup(pos);
      markTouched("pickup");
      setActiveField("dropoff");
    } else {
      setDropoff(pos);
      markTouched("dropoff");
    }
    const address = await reverseGeocode(pos.lat, pos.lng);
    if (address) {
      if (field === "pickup") setPickupText(address);
      else setDropoffText(address);
    }
  }

  // The success box replaces the whole (much taller) form — without this,
  // the browser keeps whatever scroll position the customer was at while
  // filling out the form, which can land well below the now-short success
  // message with nothing visible on screen.
  useEffect(() => {
    if (status === "success") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [status]);

  const canSubmit = vehicleId != null && date && time && pickupText && dropoffText && customerName;
  const visibleChildSeatAges = childSeatAges.slice(0, passengers);

  function addChildSeat() {
    setChildSeatAges((prev) => {
      if (prev.length >= maxPassengers) return prev;
      const next = [...prev, 3];
      if (next.length > passengers) setPassengers(next.length);
      return next;
    });
  }

  function updateChildSeatAge(index: number, age: number) {
    setChildSeatAges((prev) => prev.map((item, i) => (i === index ? age : item)));
  }

  function removeChildSeat(index: number) {
    setChildSeatAges((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!canSubmit) {
      setAttemptedSubmit(true);
      return;
    }
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
          child_seat_ages: visibleChildSeatAges,
          bike_count: bikeTransport ? bikeCount : 0,
          pickup_details: pickupText,
          pickup_lat: pickup?.lat,
          pickup_lng: pickup?.lng,
          dropoff_details: dropoffText,
          dropoff_lat: dropoff?.lat,
          dropoff_lng: dropoff?.lng,
          flight_number: flightNumber || undefined,
          customer_name: customerName,
          customer_email: customerEmail || undefined,
        }),
      });
      if (res.status === 401) {
        setStatus("unauthenticated");
        return;
      }
      setStatus(res.ok ? "success" : "error");
      pushToast(res.ok ? "success" : "error", res.ok ? t("submitSuccessToast") : t("submitErrorToast"));
      if (res.ok) {
        try {
          sessionStorage.removeItem(FORM_STORAGE_KEY);
        } catch {
          // Nothing to clean up if storage was blocked in the first place.
        }
      }
    } catch {
      setStatus("error");
      pushToast("error", t("submitErrorToast"));
    }
  }

  if (status === "success") {
    return (
      <>
        <div className="border-border bg-surface mt-6 rounded-[16px] border p-6 text-center">
          <p className="text-[14px] font-semibold text-text">{t("success")}</p>
          <Link href="/panel" className="text-primary mt-2 inline-block text-[13.5px] underline">
            {t("successPanelLink")}
          </Link>
        </div>
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="border-border bg-surface mt-6 rounded-[16px] border p-6">
      <h2 className="font-heading text-[19px] font-semibold text-text">{t("title")}</h2>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
            {t("vehicleLabel")}
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {vehiclePrices.map((vp) => {
              const selected = vp.vehicle_id === vehicleId;
              return (
                <button
                  key={vp.vehicle_id}
                  type="button"
                  onClick={() => {
                    setVehicleId(vp.vehicle_id);
                    dateInputRef.current?.focus();
                  }}
                  className={`overflow-hidden rounded-[12px] border text-left transition-colors ${
                    selected ? "border-primary" : "border-border hover:border-text/30"
                  }`}
                >
                  {vp.vehicle_cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={absoluteImageUrl(vp.vehicle_cover_image)}
                      alt={vp.vehicle_name}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="bg-bg flex aspect-square w-full items-center justify-center text-[12px] text-muted">
                      {vp.vehicle_name}
                    </div>
                  )}
                  <div className="p-3">
                    <div className="text-[14px] font-semibold text-text">{vp.vehicle_name}</div>
                    <div className="mt-0.5 flex items-center justify-between text-[13px]">
                      <span className="text-muted">{vp.vehicle_seats} os.</span>
                      <span className="font-semibold text-text">{formatPrice(vp.price, vp.price_eur, locale)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              {t("dateLabel")} <span className="text-red-600">*</span>
            </label>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (e.target.value) timeInputRef.current?.focus();
              }}
              onBlur={() => markTouched("date")}
              className={`bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none ${
                (touched.date || attemptedSubmit) && !date ? "border-red-500" : date ? "border-green-500" : "border-border"
              }`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              {t("timeLabel")} <span className="text-red-600">*</span>
            </label>
            <input
              ref={timeInputRef}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              onBlur={() => markTouched("time")}
              className={`bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none ${
                (touched.time || attemptedSubmit) && !time ? "border-red-500" : time ? "border-green-500" : "border-border"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              {t("passengersLabel")}
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="border-border bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
            >
              {Array.from({ length: maxPassengers }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              {t("flightNumberLabel")}
            </label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              placeholder={t("flightNumberPlaceholder")}
              className="border-border bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
            />
          </div>
        </div>

        <div className="border-border bg-bg rounded-[12px] border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[14px] font-semibold text-text">{t("childrenTitle")}</h3>
              <p className="mt-1 text-[12.5px] text-muted">{t("childrenHelp")}</p>
            </div>
            <button
              type="button"
              onClick={addChildSeat}
              disabled={childSeatAges.length >= maxPassengers}
              className="border-border hover:border-primary rounded-[999px] border px-3 py-2 text-[13px] font-semibold text-text transition-colors disabled:opacity-50"
            >
              {t("addChild")}
            </button>
          </div>
          {visibleChildSeatAges.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {visibleChildSeatAges.map((age, index) => (
                <div key={index} className="flex items-end gap-2">
                  <label className="flex flex-1 flex-col gap-1.5">
                    <span className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
                      {t("childAgeLabel", { number: index + 1 })}
                    </span>
                    <select
                      value={age}
                      onChange={(e) => updateChildSeatAge(index, Number(e.target.value))}
                      className="border-border bg-surface text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
                    >
                      {Array.from({ length: 13 }, (_, i) => i).map((n) => (
                        <option key={n} value={n}>
                          {t("childAgeOption", { age: n })}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeChildSeat(index)}
                    className="border-border hover:border-red-500 rounded-lg border px-3 py-[11px] text-[13px] font-semibold text-muted transition-colors"
                  >
                    {t("removeChild")}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="border-border bg-bg rounded-[12px] border p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={bikeTransport}
              onChange={(e) => setBikeTransport(e.target.checked)}
              className="border-border mt-0.5 h-4 w-4 rounded accent-[var(--color-primary)]"
            />
            <span>
              <span className="block text-[14px] font-semibold text-text">{t("bikeTransportLabel")}</span>
              <span className="mt-1 block text-[12.5px] text-muted">{t("bikeTransportHelp")}</span>
            </span>
          </label>
          {bikeTransport ? (
            <label className="mt-3 flex max-w-[180px] flex-col gap-1.5">
              <span className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
                {t("bikeCountLabel")}
              </span>
              <select
                value={bikeCount}
                onChange={(e) => setBikeCount(Number(e.target.value))}
                className="border-border bg-surface text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[400px_1fr]">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <AddressSearchField
                label={t("pickupLabel")}
                placeholder={t("pickupPlaceholder")}
                value={pickupText}
                onTextChange={setPickupText}
                onFocus={() => setActiveField("pickup")}
                onBlur={() => markTouched("pickup")}
                onSelect={(s) => handleSelectSuggestion("pickup", s)}
                onClear={() => setPickup(null)}
                required
                error={(touched.pickup || attemptedSubmit) && !pickupText}
                valid={!!pickupText}
              />
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  className="text-primary text-left text-[12.5px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  📍 {locating ? t("locating") : t("useMyLocation")}
                </button>
                <button
                  type="button"
                  onClick={() => armMapField("pickup")}
                  className="text-primary text-left text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                >
                  🗺️ {t("pickOnMapFrom")}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <AddressSearchField
                ref={dropoffInputRef}
                label={t("dropoffLabel")}
                placeholder={t("dropoffPlaceholder")}
                value={dropoffText}
                onTextChange={setDropoffText}
                onFocus={() => setActiveField("dropoff")}
                onBlur={() => markTouched("dropoff")}
                onSelect={(s) => handleSelectSuggestion("dropoff", s)}
                onClear={() => setDropoff(null)}
                required
                error={(touched.dropoff || attemptedSubmit) && !dropoffText}
                valid={!!dropoffText}
              />
              <button
                type="button"
                onClick={() => armMapField("dropoff")}
                className="text-primary text-left text-[12.5px] font-semibold transition-opacity hover:opacity-80"
              >
                🗺️ {t("pickOnMapTo")}
              </button>
            </div>
          </div>
          <div ref={mapSectionRef} className="flex flex-col gap-1.5">
            <p className="text-primary text-[11.5px] font-semibold">
              {activeField === "pickup" ? t("mapCaptionPickup") : t("mapCaptionDropoff")}
            </p>
            <div className="min-h-[240px]">
              <BookingMap
                pickup={pickup}
                dropoff={dropoff}
                activeField={activeField}
                routeGeometry={estimate?.geometry}
                onPickupChange={(pos) => handleMapChange("pickup", pos)}
                onDropoffChange={(pos) => handleMapChange("dropoff", pos)}
              />
            </div>
          </div>
        </div>

        {pickup && dropoff && estimate && (
          <div className="my-0.5 flex items-center gap-2">
            <span className="h-[7px] w-[7px] rounded-full bg-muted" />
            <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--color-muted)_0_4px,transparent_4px_8px)] opacity-50" />
            <span className="font-label text-xs tracking-[0.05em] text-muted whitespace-nowrap">
              {estimate.distance_km} {t("km")} · {Math.round(estimate.duration_min)} {t("min")}
            </span>
            <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--color-muted)_0_4px,transparent_4px_8px)] opacity-50" />
            <span className="bg-primary h-[7px] w-[7px] rounded-full" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              {t("nameLabel")} <span className="text-red-600">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={() => markTouched("name")}
              placeholder={t("namePlaceholder")}
              className={`bg-bg text-text focus:border-primary rounded-lg border px-3 py-[11px] text-[14.5px] outline-none ${
                (touched.name || attemptedSubmit) && !customerName
                  ? "border-red-500"
                  : customerName
                    ? "border-green-500"
                    : "border-border"
              }`}
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
          disabled={status === "submitting"}
          className="bg-primary hover:bg-primary-hover w-full rounded-[9px] py-[13px] text-[15px] font-bold text-white transition-colors disabled:opacity-60"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>
        {attemptedSubmit && !canSubmit && (
          <p className="text-center text-[12.5px] font-semibold text-red-600">{t("missingFields")}</p>
        )}

        {status === "error" && <p className="text-center text-xs font-semibold text-red-600">{t("error")}</p>}

        {status === "unauthenticated" && (
          <div className="flex flex-col gap-2">
            <p className="text-center text-xs font-semibold text-text">{t("verifyPhone")}</p>
            <PhoneVerifyStep phone={phone} onPhoneChange={setPhone} onVerified={handleSubmit} />
          </div>
        )}
      </div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
