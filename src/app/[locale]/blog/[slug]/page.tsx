import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { localize } from "@/lib/localize";
import { buildAlternates } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

async function getPosts(): Promise<BlogPost[]> {
  try {
    return await apiFetch<BlogPost[]>("/api/blog/", { next: { revalidate: 60 } });
  } catch {
    return [];
  }
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await apiFetch<BlogPost>(`/api/blog/${slug}/`, { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const appLocale = locale as AppLocale;
  const title = localize(post, "seo_title", appLocale) || localize(post, "title", appLocale);
  const description = localize(post, "seo_description", appLocale) || localize(post, "excerpt", appLocale);

  return { title, description, alternates: buildAlternates(`/blog/${slug}`) };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, appLocale, post] = await Promise.all([
    getTranslations("Blog"),
    getLocale() as Promise<AppLocale>,
    getPost(slug),
  ]);

  if (!post) notFound();

  const tag = localize(post, "tag", appLocale);
  const title = localize(post, "title", appLocale);
  const body = localize(post, "body", appLocale) || localize(post, "excerpt", appLocale);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-20">
          <Link href="/blog" className="text-primary text-[13px] font-medium">
            ← {t("backToIndex")}
          </Link>

          <div className="mt-4 flex items-center gap-3 text-[13px] text-muted">
            {tag ? <span className="text-primary font-medium">{tag}</span> : null}
            <time dateTime={post.published_at}>{post.published_at}</time>
          </div>
          <h1 className="font-heading mt-2 text-[30px] leading-[1.15] font-semibold text-text sm:text-[38px]">
            {title}
          </h1>

          <div className="mt-8">
            <MarkdownContent markdown={body} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
