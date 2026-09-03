import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqJsonLd } from "@/components/faq-jsonld";
import { MarkdownContent } from "@/components/markdown-content";
import { PhotoGallery } from "@/components/photo-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { apiFetch } from "@/lib/api";
import { extractFaqPairs } from "@/lib/faq";
import { absoluteImageUrl } from "@/lib/images";
import { localize } from "@/lib/localize";
import { buildAlternates } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

/** Accepts watch/short/embed URL shapes and returns a plain 11-char video
 * ID, or null if the link doesn't look like YouTube at all — used both to
 * build the embed src and to validate what an admin pasted into the CMS. */
function youtubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

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

  return { title, description, alternates: buildAlternates(`/blog/${slug}`, locale as AppLocale) };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, tCrumbs, appLocale, post] = await Promise.all([
    getTranslations("Blog"),
    getTranslations("Breadcrumbs"),
    getLocale() as Promise<AppLocale>,
    getPost(slug),
  ]);

  if (!post) notFound();

  const tag = localize(post, "tag", appLocale);
  const title = localize(post, "title", appLocale);
  const body = localize(post, "body", appLocale) || localize(post, "excerpt", appLocale);
  const videoId = post.youtube_url ? youtubeVideoId(post.youtube_url) : null;
  const galleryPhotos = post.photos.map((photo) => ({
    src: absoluteImageUrl(photo.image),
    thumbnailSrc: absoluteImageUrl(photo.thumbnail || photo.image),
    alt: photo.caption || title,
  }));
  const sortedLinks = [...post.links].sort((a, b) => a.order - b.order);
  const faqs = extractFaqPairs(body);
  const breadcrumbItems = [
    { label: tCrumbs("home"), href: "/" },
    { label: tCrumbs("blog"), href: "/blog" },
    { label: title },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} locale={locale} />
      <FaqJsonLd faqs={faqs} />
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-20">
          <Breadcrumbs items={breadcrumbItems} />

          <Link href="/blog" className="text-primary mt-3 inline-block text-[13px] font-medium">
            ← {t("backToIndex")}
          </Link>

          <div className="mt-4 flex items-center gap-3 text-[13px] text-muted">
            {tag ? <span className="text-primary font-medium">{tag}</span> : null}
            <time dateTime={post.published_at}>{post.published_at}</time>
          </div>
          <h1 className="font-heading mt-2 text-[30px] leading-[1.15] font-semibold text-text sm:text-[38px]">
            {title}
          </h1>

          {post.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={absoluteImageUrl(post.cover_image)}
              alt={title}
              className="mt-8 h-[240px] w-full rounded-[16px] object-cover sm:h-[380px]"
            />
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
            <div>
              <MarkdownContent markdown={body} locale={appLocale} />

              {videoId ? (
                <div className="mt-10 aspect-video w-full overflow-hidden rounded-[16px] border border-border">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              ) : null}

              {galleryPhotos.length > 0 ? (
                <div className="mt-10">
                  <h2 className="font-heading text-[20px] font-semibold text-text">{t("galleryHeading")}</h2>
                  <PhotoGallery photos={galleryPhotos} className="mt-4" />
                </div>
              ) : null}
            </div>

            {sortedLinks.length > 0 ? (
              <aside className="border-border bg-surface h-fit rounded-[16px] border p-5">
                <h2 className="font-label text-xs font-semibold tracking-[0.1em] text-muted uppercase">
                  {t("usefulLinksHeading")}
                </h2>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {sortedLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-[13.5px] font-medium underline underline-offset-2"
                      >
                        {localize(link, "label", appLocale)}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
