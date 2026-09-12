import { siteUrl } from "@/lib/seo";

/** Article/BlogPosting structured data — every blog post rendered this
 * without it before. No per-post author byline exists in the CMS, so the
 * publishing Organization itself is used as `author` (accurate — nothing
 * here claims a named human wrote it) rather than inventing a person.
 * `dateModified` isn't tracked separately from `published_at`, so it's
 * left equal to `datePublished` rather than guessed. */
export function BlogPostingJsonLd({
  headline,
  description,
  url,
  image,
  datePublished,
}: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
}) {
  const absoluteUrl = `${siteUrl()}${url}`;
  const organization = { "@type": "Organization", name: "transfer247.pl", url: siteUrl() };

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    url: absoluteUrl,
    mainEntityOfPage: absoluteUrl,
    ...(image ? { image } : {}),
    datePublished,
    dateModified: datePublished,
    author: organization,
    publisher: organization,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
