import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-border bg-surface border-t">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="font-heading text-[18px] font-semibold text-text">
              transfer<span className="text-primary">247</span>.pl
            </span>
            <p className="mt-3 max-w-[220px] text-[14px] text-muted">{t("tagline")}</p>
          </div>
          <div>
            <div className="mb-3 text-[13px] font-semibold tracking-wide text-text uppercase">{t("routes")}</div>
            <a href="/#trasy" className="block text-[14px] text-muted hover:text-text">
              {t("routes")}
            </a>
          </div>
          <div>
            <div className="mb-3 text-[13px] font-semibold tracking-wide text-text uppercase">{t("tours")}</div>
            <a href="/#wycieczki" className="block text-[14px] text-muted hover:text-text">
              {t("tours")}
            </a>
          </div>
          <div>
            <div className="mb-3 text-[13px] font-semibold tracking-wide text-text uppercase">{t("company")}</div>
            <Link href="/blog" className="block text-[14px] text-muted hover:text-text">
              {t("blog")}
            </Link>
            <Link href="/kontakt" className="mt-2 block text-[14px] text-muted hover:text-text">
              {t("contact")}
            </Link>
          </div>
        </div>
        <div className="border-border mt-10 border-t pt-6 text-[13px] text-muted">
          © {new Date().getFullYear()} transfer247.pl — {t("rights")}
        </div>
      </div>
    </footer>
  );
}
