"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { publicApiBaseUrl, withSiteHeader, wsBaseUrl } from "@/lib/api";
import type { DriverLiveStatus, RouteEstimate } from "@/lib/types";

const LiveMapInner = dynamic(() => import("./live-map-inner").then((m) => m.LiveMapInner), {
  ssr: false,
  loading: () => <div className="h-[340px] w-full animate-pulse bg-border" />,
});

const STATUS_KEY: Record<string, string> = {
  DOSTEPNY: "statusAvailable",
  JADACY_PO_KLIENTA: "statusEnRoute",
  W_KURSIE: "statusBusy",
  WRACA_DO_BAZY: "statusEnRoute",
};

const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 15000;
// The route estimate is a real OSRM request server-side — refetching on
// every single GPS tick (every ~10s from the driver's app) would be
// wasteful for how little the ETA actually moves between ticks.
const ETA_REFRESH_MIN_MS = 20000;

type LatLng = { lat: number; lng: number };

/** The customer's own live position, watched continuously (not just once)
 * so the "you are here" marker and ETA stay accurate if they're walking to
 * a different meeting spot while waiting. Silently does nothing if the
 * browser denies permission — this is a nice-to-have, not required to see
 * the driver's own dot. */
function useMyPosition(): LatLng | null {
  const [position, setPosition] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        // Denied or unavailable — the tracker still works without it.
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return position;
}

/** Live distance/ETA from the driver's current position to wherever the
 * customer actually is right now — reuses the same public route-estimate
 * endpoint the booking forms use, just with the driver and customer as the
 * two points instead of pickup/dropoff. */
function useLiveEta(driverPos: LatLng | null, myPos: LatLng | null): RouteEstimate | null {
  const [estimate, setEstimate] = useState<RouteEstimate | null>(null);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    if (!driverPos || !myPos) return;
    const now = Date.now();
    if (now - lastFetchRef.current < ETA_REFRESH_MIN_MS) return;
    lastFetchRef.current = now;

    const controller = new AbortController();
    (async () => {
      try {
        const params = new URLSearchParams({
          pickup_lat: String(driverPos.lat),
          pickup_lng: String(driverPos.lng),
          dropoff_lat: String(myPos.lat),
          dropoff_lng: String(myPos.lng),
          scheduled_at: new Date().toISOString(),
        });
        const res = await fetch(`${publicApiBaseUrl()}/api/route-estimate/?${params}`, {
          signal: controller.signal,
          headers: withSiteHeader(),
        });
        if (res.ok) setEstimate(await res.json());
      } catch {
        // ignore — stale/aborted request or transient network hiccup
      }
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverPos?.lat, driverPos?.lng, myPos?.lat, myPos?.lng]);

  return estimate;
}

export function BookingTracker({
  bookingId,
  code,
  accessToken,
  driverName,
  driverVehicle,
}: {
  bookingId: number;
  code?: string;
  accessToken?: string;
  driverName: string | null;
  driverVehicle: string | null;
}) {
  const t = useTranslations("TrackByCode");
  const [driver, setDriver] = useState<DriverLiveStatus | null>(null);
  const [connectionState, setConnectionState] = useState<"connecting" | "open" | "closed">("connecting");
  const myPos = useMyPosition();

  useEffect(() => {
    let cancelled = false;
    let retryDelay = RECONNECT_BASE_MS;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let socket: WebSocket | null = null;

    function connect() {
      if (cancelled) return;
      setConnectionState("connecting");
      const authParam = code ? `code=${code}` : `token=${accessToken}`;
      socket = new WebSocket(`${wsBaseUrl()}/ws/booking/track/${bookingId}/?${authParam}`);

      socket.onopen = () => {
        retryDelay = RECONNECT_BASE_MS;
        setConnectionState("open");
      };
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "update" && msg.driver) setDriver(msg.driver);
        } catch {
          // ignore malformed frame
        }
      };
      socket.onclose = () => {
        setConnectionState("closed");
        if (cancelled) return;
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, RECONNECT_MAX_MS);
      };
      socket.onerror = () => socket?.close();
    }

    connect();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    };
  }, [bookingId, code, accessToken]);

  const driverPos =
    driver?.current_lat && driver?.current_lng
      ? { lat: Number(driver.current_lat), lng: Number(driver.current_lng) }
      : null;
  const eta = useLiveEta(driverPos, myPos);

  const mapDrivers = [
    ...(driverPos ? [{ id: driver!.id, position: [driverPos.lat, driverPos.lng] as [number, number], color: "#c1552c", label: driver!.name }] : []),
    ...(myPos ? [{ id: -1, position: [myPos.lat, myPos.lng] as [number, number], color: "#2563eb", label: t("you") }] : []),
  ];

  return (
    <div className="isolate relative overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="absolute top-3.5 left-3.5 z-[400] flex items-center gap-1.5 rounded-full border border-border bg-white/90 px-3 py-1.5 text-[12.5px] font-semibold backdrop-blur-sm">
        <span className={`h-2 w-2 rounded-full ${connectionState === "open" ? "bg-secondary" : "bg-muted"}`} />
        {driver ? t(STATUS_KEY[driver.status] as never) : t("noActiveDriver")}
      </div>
      {eta && (
        <div className="absolute top-3.5 right-3.5 z-[400] rounded-full border border-border bg-white/90 px-3 py-1.5 text-[12.5px] font-semibold backdrop-blur-sm">
          {t("etaLabel", { minutes: Math.round(eta.duration_min), km: eta.distance_km })}
        </div>
      )}

      <LiveMapInner drivers={mapDrivers} />

      <div className="absolute right-3.5 bottom-3.5 left-3.5 z-[400] rounded-xl border border-border bg-white/92 px-3.5 py-3 backdrop-blur-md">
        <div className="text-[13.5px] font-semibold text-text">
          {driverName ?? t("vehicleUnknown")}
          {driverVehicle ? ` · ${driverVehicle}` : ""}
        </div>
      </div>
    </div>
  );
}
