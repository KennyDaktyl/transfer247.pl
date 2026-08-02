"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { wsBaseUrl } from "@/lib/api";
import type { DriverLiveStatus } from "@/lib/types";

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

  const mapDrivers =
    driver?.current_lat && driver?.current_lng
      ? [
          {
            id: driver.id,
            position: [Number(driver.current_lat), Number(driver.current_lng)] as [number, number],
            color: "#c1552c",
            label: driver.name,
          },
        ]
      : [];

  return (
    <div className="isolate relative overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="absolute top-3.5 left-3.5 z-[400] flex items-center gap-1.5 rounded-full border border-border bg-white/90 px-3 py-1.5 text-[12.5px] font-semibold backdrop-blur-sm">
        <span className={`h-2 w-2 rounded-full ${connectionState === "open" ? "bg-secondary" : "bg-muted"}`} />
        {driver ? t(STATUS_KEY[driver.status] as never) : t("noActiveDriver")}
      </div>

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
