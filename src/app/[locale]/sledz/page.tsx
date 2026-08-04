import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrackByCode } from "@/components/track-by-code";
import type { AppLocale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TrackByCode" });
  return { title: t("title"), description: t("lead"), alternates: buildAlternates("/sledz", locale as AppLocale) };
}

export default async function TrackByCodePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("TrackByCode");

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 text-center sm:px-6 sm:py-20">
          <h1 className="font-heading text-[32px] font-semibold text-text sm:text-[42px]">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-[520px] text-[16px] text-muted">{t("lead")}</p>
          <div className="mt-10">
            <TrackByCode />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
