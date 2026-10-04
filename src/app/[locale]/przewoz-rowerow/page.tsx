import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { AppLocale } from "@/i18n/routing";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { localize } from "@/lib/localize";
import type { ContentPage } from "@/lib/types";
import { pageMetadata, translatedLocales } from "@/lib/seo";
import { staticPageSeo } from "@/lib/seo-copy";

async function getPage(): Promise<ContentPage | null> {
  try {
    return await apiFetch<ContentPage>("/api/content-pages/przewoz-rowerow/");
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
  const appLocale = locale as AppLocale;
  const [page, seo] = await Promise.all([getPage(), staticPageSeo("bikes", appLocale)]);
  return pageMetadata({
    path: "/przewoz-rowerow",
    locale: appLocale,
    // Seo.* copy (sized for the SERP) over the CMS's seo_* fields, which for
    // these pages are only a bare "Kontakt | transfer247.pl"-style label.
    ...seo,
    // ContentPage has no German fields at all yet, so /de/przewoz-rowerow renders the
    // Polish fallback — kept out of the index until a translation exists.
    available: page ? translatedLocales(page, ["title", "body"]) : undefined,
  });
}

export default async function BikeTransportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const [tCrumbs, page] = await Promise.all([getTranslations("Breadcrumbs"), getPage()]);

  const breadcrumbItems = [{ label: tCrumbs("home"), href: "/" }, { label: tCrumbs("bikeTransport") }];
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} locale={locale} />
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="font-heading mt-3 text-[32px] font-semibold text-text sm:text-[42px]">
            {page ? localize(page, "title", appLocale) : "Przewóz rowerów"}
          </h1>
          {page ? (
            <div className="mt-8">
              <MarkdownContent markdown={localize(page, "body", appLocale)} locale={appLocale} />
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
