import { businessRef, siteUrl } from "@/lib/seo";

/** Article/BlogPosting structured data — every blog post rendered this
 * without it before. No per-post author byline exists in the CMS, so the
 * publishing Organization itself is used as `author` (accurate — nothing
 * here claims a named human wrote it) rather than inventing a person.
 * `dateModified` is the CMS's last-edit timestamp when the backend has one,
 * otherwise equal to `datePublished` rather than guessed. */
export function BlogPostingJsonLd({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  inLanguage,
}: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string | null;
  inLanguage: string;
}) {
  const absoluteUrl = `${siteUrl()}${url}`;
  const organization = businessRef();

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    url: absoluteUrl,
    mainEntityOfPage: absoluteUrl,
    ...(image ? { image } : {}),
    datePublished,
    dateModified: dateModified || datePublished,
    inLanguage,
    author: organization,
    publisher: organization,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
