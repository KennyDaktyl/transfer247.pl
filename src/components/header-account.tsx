"use client";

import { Link } from "@/i18n/navigation";
import { useLoggedIn } from "@/lib/use-logged-in";

import { CustomerMenu } from "./customer-menu";

/** Desktop header's account slot: "Log in" by default, the customer menu
 * once the browser confirms a session (see useLoggedIn). */
export function HeaderAccount({
  loginLabel,
  myTripsLabel,
  logoutLabel,
}: {
  loginLabel: string;
  myTripsLabel: string;
  logoutLabel: string;
}) {
  const loggedIn = useLoggedIn();

  if (loggedIn) return <CustomerMenu myTripsLabel={myTripsLabel} logoutLabel={logoutLabel} />;

  return (
    <Link
      href="/logowanie"
      className="border-primary text-primary hover:bg-primary/10 shrink-0 rounded-[999px] border px-3 py-2 text-[14px] font-medium whitespace-nowrap transition-colors"
    >
      {loginLabel}
    </Link>
  );
}
