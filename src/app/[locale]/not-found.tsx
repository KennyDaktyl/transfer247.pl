import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function NotFound() {
  const [t, tNav] = await Promise.all([getTranslations("NotFound"), getTranslations("Nav")]);

  const links = [
    { href: "/transfery", label: tNav("airportRoutes") },
    { href: "/wycieczki", label: tNav("tours") },
    { href: "/flota", label: tNav("fleet") },
    { href: "/kontakt", label: tNav("contact") },
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[640px] px-4 py-24 text-center sm:px-6">
          <div className="text-primary font-heading text-[64px] font-bold">404</div>
          <h1 className="font-heading mt-2 text-[26px] font-semibold text-text">{t("title")}</h1>
          <p className="mt-3 text-[15px] text-muted">{t("lead")}</p>

          <Link
            href="/"
            className="bg-primary hover:bg-primary-hover mt-8 inline-block rounded-[999px] px-6 py-3 text-[14px] font-medium text-white transition-colors"
          >
            {t("backHome")}
          </Link>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[14px]">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-primary font-medium hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
