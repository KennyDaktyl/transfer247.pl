import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { absoluteImageUrl } from "@/lib/images";
import { localize } from "@/lib/localize";
import { buildAlternates } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return { title: t("heading"), description: t("lead"), alternates: buildAlternates("/blog") };
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tCrumbs, appLocale, posts] = await Promise.all([
    getTranslations("Blog"),
    getTranslations("Breadcrumbs"),
    getLocale() as Promise<AppLocale>,
    apiFetch<BlogPost[]>("/api/blog/", { next: { revalidate: 60 } }),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <Breadcrumbs items={[{ label: tCrumbs("home"), href: "/" }, { label: tCrumbs("blog") }]} />
          <h1 className="font-heading mt-3 text-[32px] font-semibold text-text sm:text-[42px]">{t("heading")}</h1>
          <p className="mt-3 max-w-[560px] text-[16px] text-muted">{t("lead")}</p>

          <div className="mt-10 flex flex-col gap-5">
            {posts.map((post) => {
              const tag = localize(post, "tag", appLocale);
              const title = localize(post, "title", appLocale);
              const excerpt = localize(post, "excerpt", appLocale);

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
                      className="h-48 w-full object-cover sm:h-auto sm:w-[280px] sm:shrink-0"
                    />
                  ) : null}
                  <div className="flex flex-col gap-2 p-6 sm:py-6 sm:pl-0">
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
