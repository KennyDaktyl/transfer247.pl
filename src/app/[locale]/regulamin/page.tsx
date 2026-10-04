import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import type { AppLocale } from "@/i18n/routing";
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
    return await apiFetch<ContentPage>("/api/content-pages/regulamin-transfer247/");
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
  const [page, seo] = await Promise.all([getPage(), staticPageSeo("terms", appLocale)]);
  return pageMetadata({
    path: "/regulamin",
    locale: appLocale,
    // Seo.* copy (sized for the SERP) over the CMS's seo_* fields, which for
    // these pages are only a bare "Kontakt | transfer247.pl"-style label.
    ...seo,
    // ContentPage has no German fields at all yet, so /de/regulamin renders the
    // Polish fallback — kept out of the index until a translation exists.
    available: page ? translatedLocales(page, ["title", "body"]) : undefined,
  });
}

export default async function RegulaminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const page = await getPage();

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="font-heading text-[32px] font-semibold text-text sm:text-[42px]">
            {page ? localize(page, "title", appLocale) : "Regulamin"}
          </h1>
          {page ? (
            <div className="mt-8 max-w-[760px]">
              <MarkdownContent markdown={localize(page, "body", appLocale)} locale={appLocale} />
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
