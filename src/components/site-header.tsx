import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

export async function SiteHeader() {
  const t = await getTranslations("Nav");

  const navLinks = [
    { href: "/#trasy", label: t("routes") },
    { href: "/#wycieczki", label: t("tours") },
    { href: "/blog", label: t("blog") },
    { href: "/kontakt", label: t("contact") },
  ];

  return (
    <header className="border-border bg-surface/90 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="min-w-0">
          <span className="font-heading text-[19px] font-semibold tracking-tight text-text">
            transfer<span className="text-primary">247</span>.pl
          </span>
        </Link>

        <nav className="hidden shrink-0 gap-7 text-[14.5px] text-muted md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-text">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <LocaleSwitcher />
          <a
            href="/#trasy"
            className="bg-primary hover:bg-primary-hover rounded-[999px] px-4 py-2 text-[14px] font-medium text-white transition-colors"
          >
            {t("bookNow")}
          </a>
        </div>
      </div>
    </header>
  );
}
