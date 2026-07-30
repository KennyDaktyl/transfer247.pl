import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
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

  const [t, appLocale, posts] = await Promise.all([
    getTranslations("Blog"),
    getLocale() as Promise<AppLocale>,
    apiFetch<BlogPost[]>("/api/blog/", { next: { revalidate: 60 } }),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="font-heading text-[32px] font-semibold text-text sm:text-[42px]">{t("heading")}</h1>
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
                  className="border-border bg-surface block rounded-[16px] border p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3 text-[13px] text-muted">
                    {tag ? <span className="text-primary font-medium">{tag}</span> : null}
                    <time dateTime={post.published_at}>{post.published_at}</time>
                  </div>
                  <h2 className="font-heading mt-2 text-[20px] font-semibold text-text">{title}</h2>
                  {excerpt ? <p className="mt-2 text-[14px] text-muted">{excerpt}</p> : null}
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
