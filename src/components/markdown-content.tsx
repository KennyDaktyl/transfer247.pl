"use client";

import { marked } from "marked";
import type { MouseEvent } from "react";

import { trackEvent } from "@/lib/analytics";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

marked.setOptions({ breaks: true });

const LOCALE_PREFIX_RE = new RegExp(`^/(?:${routing.locales.join("|")})(?:/|$)`);

/** CMS bodies (Markdown, authored once per locale in Django Admin) link to
 * other pages with site-relative paths, e.g. "/transfery/balice-krakow" —
 * without a locale prefix, since the author doesn't know which locale will
 * render the link. Left as-is, that renders as a literal unprefixed
 * <a href>, which next-intl's middleware then redirects to the current
 * locale — wasted crawl budget and exactly the kind of "page contains a
 * redirect" internal link GSC's coverage report flags. Prefix every
 * site-relative markdown link with the locale actually rendering it, so
 * links go straight to their target. Skips image markdown (`![alt](/path)`)
 * and anything already locale-prefixed, anchors, mailto:/tel:/http(s):. */
function localizeMarkdownLinks(markdown: string, locale: AppLocale): string {
  return markdown.replace(/(!?)(\]\()(\/[^)\s]*)/g, (match, bang: string, open: string, path: string) => {
    if (bang || LOCALE_PREFIX_RE.test(path)) return match;
    // A bare root-relative anchor ("/#fleet", linking to a homepage section)
    // would otherwise become "/pl/#fleet" — the leading "/" is the anchor's,
    // not a path segment, so drop it before appending to the locale prefix.
    if (path.startsWith("/#")) return `${bang}${open}/${locale}${path.slice(1)}`;
    return `${bang}${open}/${locale}${path}`;
  });
}

/** A tel:/mailto:/wa.me link typed into a CMS body (contact page, a route's
 * FAQ, anywhere) is otherwise invisible to GA4 — Enhanced Measurement only
 * tracks outbound clicks to other domains, never those protocol links.
 * One delegated listener on the rendered container covers every such link
 * an admin ever adds, on any page, without editing that page's code. */
function trackContactLinkClick(event: MouseEvent<HTMLDivElement>) {
  const link = (event.target as HTMLElement).closest("a");
  const href = link?.getAttribute("href") ?? "";
  if (href.startsWith("tel:")) trackEvent("contact_click_phone", { location: "content" });
  else if (href.startsWith("mailto:")) trackEvent("contact_click_email", { location: "content" });
  else if (href.includes("wa.me")) trackEvent("contact_click_whatsapp", { location: "content" });
}

/** Renders admin-authored CMS markdown (headings, bold, FAQ pairs) as HTML.
 * Content comes from Django Admin, not user input — same trust level as
 * everything else pulled from the CMS, so no sanitizer pass is needed.
 * Pass `locale` whenever the markdown may contain internal links, so they
 * get rewritten to the current locale (see `localizeMarkdownLinks`). */
export function MarkdownContent({
  markdown,
  locale,
  className = "",
}: {
  markdown: string;
  locale?: AppLocale;
  className?: string;
}) {
  if (!markdown.trim()) return null;
  const source = locale ? localizeMarkdownLinks(markdown, locale) : markdown;
  const html = marked.parse(source, { async: false });
  return (
    <div
      className={`prose-content ${className}`}
      onClick={trackContactLinkClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
