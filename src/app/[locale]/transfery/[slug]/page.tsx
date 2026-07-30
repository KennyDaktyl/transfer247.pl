import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { localize } from "@/lib/localize";
import { buildAlternates } from "@/lib/seo";
import type { FixedRoute } from "@/lib/types";

async function getRoutes(): Promise<FixedRoute[]> {
  try {
    return await apiFetch<FixedRoute[]>("/api/fixed-routes/", { next: { revalidate: 60 } });
  } catch {
    return [];
  }
}

async function getRoute(slug: string): Promise<FixedRoute | null> {
  try {
    return await apiFetch<FixedRoute>(`/api/fixed-routes/${slug}/`, { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const routes = await getRoutes();
  return routes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const route = await getRoute(slug);
  if (!route) return {};

  const appLocale = locale as AppLocale;
  const title =
    localize(route, "seo_title", appLocale) ||
    localize(route, "h1", appLocale) ||
    localize(route, "name", appLocale);
  const description = localize(route, "seo_description", appLocale);

  return { title, description, alternates: buildAlternates(`/transfery/${slug}`) };
}

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, appLocale, allRoutes, route] = await Promise.all([
    getTranslations("Routes"),
    getLocale() as Promise<AppLocale>,
    getRoutes(),
    getRoute(slug),
  ]);

  if (!route) notFound();

  const h1 = localize(route, "h1", appLocale) || localize(route, "name", appLocale);
  const body = localize(route, "body", appLocale);
  const otherRoutes = allRoutes.filter((r) => r.slug !== route.slug);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[820px] px-4 py-14 sm:px-6 sm:py-20">
          <Link href="/transfery" className="text-primary text-[13px] font-medium">
            ← {t("backToIndex")}
          </Link>

          <h1 className="font-heading mt-4 text-[32px] leading-[1.1] font-semibold text-text sm:text-[42px]">
            {h1}
          </h1>

          <div className="border-border bg-surface mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[16px] border p-6">
            <div className="text-[14px] text-muted">{route.duration}</div>
            <div className="flex flex-wrap gap-6 text-[14px]">
              <div>
                <div className="text-muted">{t("vehicleSmall")}</div>
                <div className="text-[17px] font-semibold text-text">
                  {t("from")} {formatPrice(route.price_from)}
                </div>
              </div>
              {route.price_large_vehicle ? (
                <div>
                  <div className="text-muted">{t("vehicleLarge")}</div>
                  <div className="text-[17px] font-semibold text-text">
                    {t("from")} {formatPrice(route.price_large_vehicle)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <Link
            href="/kontakt"
            className="bg-primary hover:bg-primary-hover mt-8 inline-block rounded-[999px] px-7 py-3 text-[15px] font-medium text-white transition-colors"
          >
            {t("bookThisRoute")}
          </Link>

          <div className="mt-10">
            <MarkdownContent markdown={body} />
          </div>

          {otherRoutes.length > 0 ? (
            <div className="border-border mt-14 border-t pt-10">
              <h2 className="font-heading mb-4 text-[18px] font-semibold text-text">{t("otherRoutes")}</h2>
              <div className="flex flex-wrap gap-2">
                {otherRoutes.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/transfery/${r.slug}`}
                    className="border-border rounded-[999px] border px-4 py-2 text-[13.5px] text-muted transition-colors hover:border-primary hover:text-text"
                  >
                    {localize(r, "name", appLocale)}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
