import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { AppLocale } from "@/i18n/routing";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { localize } from "@/lib/localize";
import { buildAlternates } from "@/lib/seo";
import type { ContentPage } from "@/lib/types";

async function getPage(): Promise<ContentPage | null> {
  try {
    return await apiFetch<ContentPage>("/api/content-pages/przewoz-rowerow/", { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage();
  if (!page) return {};
  const appLocale = locale as AppLocale;
  return {
    title: localize(page, "seo_title", appLocale) || localize(page, "title", appLocale),
    description: localize(page, "seo_description", appLocale) || undefined,
    alternates: buildAlternates("/przewoz-rowerow"),
  };
}

export default async function BikeTransportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const [tCrumbs, page] = await Promise.all([getTranslations("Breadcrumbs"), getPage()]);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <Breadcrumbs items={[{ label: tCrumbs("home"), href: "/" }, { label: tCrumbs("bikeTransport") }]} />
          <h1 className="font-heading mt-3 text-[32px] font-semibold text-text sm:text-[42px]">
            {page ? localize(page, "title", appLocale) : "Przewóz rowerów"}
          </h1>
          {page ? (
            <div className="mt-8">
              <MarkdownContent markdown={localize(page, "body", appLocale)} />
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
