"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PayDepositButton({ bookingId, depositAmount }: { bookingId: number; depositAmount: string }) {
  const t = useTranslations("BookingPayment");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "paying" | "error">("idle");

  async function handlePay() {
    setStatus("paying");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pay`, { method: "POST" });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handlePay}
        disabled={status === "paying"}
        className="bg-primary hover:bg-primary-hover rounded-[9px] px-5 py-2.5 text-[14px] font-bold text-white transition-colors disabled:opacity-60"
      >
        {status === "paying" ? t("paying") : t("payDeposit", { amount: Number(depositAmount).toFixed(0) })}
      </button>
      {status === "error" ? <span className="text-[12px] text-red-600">{t("error")}</span> : null}
    </div>
  );
}
