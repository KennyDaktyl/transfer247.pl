import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { absoluteImageUrl } from "@/lib/images";
import { localize } from "@/lib/localize";
import type { BlogPost } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";
import { fillPriceTokens, staticPageSeo } from "@/lib/seo-copy";
import { getPriceCatalog } from "@/lib/catalog";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const [{ locale }, { q }] = await Promise.all([params, searchParams]);
  const appLocale = locale as AppLocale;
  const seo = await staticPageSeo("blog", appLocale);
  // ?q= search results are an endless set of thin near-duplicates of the
  // index — keep them out of the index (canonical already points at /blog).
  return pageMetadata({ path: "/blog", locale: appLocale, ...seo, noindex: Boolean(q?.trim()) });
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const [t, tCrumbs, appLocale, allPosts, catalog] = await Promise.all([
    getTranslations("Blog"),
    getTranslations("Breadcrumbs"),
    getLocale() as Promise<AppLocale>,
    apiFetch<BlogPost[]>("/api/blog/", { next: { revalidate: 60 } }),
    getPriceCatalog(),
  ]);

  const query = q?.trim().toLowerCase() ?? "";
  const posts = query
    ? allPosts.filter((post) => {
        const haystack = `${localize(post, "title", appLocale)} ${localize(post, "excerpt", appLocale)} ${localize(post, "body", appLocale)}`.toLowerCase();
        return haystack.includes(query);
      })
    : allPosts;

  const breadcrumbItems = [{ label: tCrumbs("home"), href: "/" }, { label: tCrumbs("blog") }];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} locale={locale} />
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="font-heading mt-3 text-[32px] font-semibold text-text sm:text-[42px]">{t("heading")}</h1>
          <p className="mt-3 max-w-[560px] text-[16px] text-muted">{t("lead")}</p>

          <form action="/blog" method="get" className="mt-6 flex max-w-[420px] gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder={t("searchPlaceholder")}
              className="border-border bg-surface flex-1 rounded-[10px] border px-4 py-2.5 text-[14px] text-text outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover rounded-[10px] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors"
            >
              {t("searchSubmit")}
            </button>
          </form>
          {query ? (
            <p className="mt-3 text-[13px] text-muted">
              {t("searchResultsCount", { count: posts.length, query: q ?? "" })}{" "}
              <Link href="/blog" className="text-primary underline">
                {t("searchClear")}
              </Link>
            </p>
          ) : null}

          <div className="mt-10 flex flex-col gap-5">
            {posts.length === 0 ? <p className="text-muted">{t("searchNoResults")}</p> : null}
            {posts.map((post, index) => {
              const tag = localize(post, "tag", appLocale);
              const title = fillPriceTokens(localize(post, "title", appLocale), appLocale, catalog);
              const excerpt = fillPriceTokens(localize(post, "excerpt", appLocale), appLocale, catalog);

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="border-border bg-surface flex flex-col gap-5 overflow-hidden rounded-[16px] border transition-shadow hover:shadow-md sm:flex-row"
                >
                  {post.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={absoluteImageUrl(post.cover_image)}
                      alt={title}
                      width={560}
                      height={384}
                      loading={index < 2 ? undefined : "lazy"}
                      decoding="async"
                      className="h-48 w-full object-cover sm:h-auto sm:w-[280px] sm:shrink-0"
                    />
                  ) : null}
                  <div className={`flex flex-col gap-2 p-6 ${post.cover_image ? "sm:py-6 sm:pl-0" : ""}`}>
                    <div className="flex items-center gap-3 text-[13px] text-muted">
                      {tag ? <span className="text-primary font-medium">{tag}</span> : null}
                      <time dateTime={post.published_at}>{post.published_at}</time>
                    </div>
                    <h2 className="font-heading text-[20px] font-semibold text-text">{title}</h2>
                    {excerpt ? <p className="text-[14px] text-muted">{excerpt}</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
