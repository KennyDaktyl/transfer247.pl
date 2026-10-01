import type { MetadataRoute } from "next";

import { apiFetch } from "@/lib/api";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { buildAlternates, translatedLocales } from "@/lib/seo";
import type { BlogPost, ContentPage, FixedRoute, Tour } from "@/lib/types";

// Regenerate on every request so a newly published blog post / route /
// tour appears in the sitemap immediately, without waiting for a rebuild.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** One <url> per indexable locale, each carrying the full hreflang cluster
 * as xhtml:link alternates. Locales whose copy isn't translated yet are
 * noindex'd on the page itself (see pageMetadata) and so left out here —
 * a sitemap must list only canonical, indexable 200 URLs. `lastModified`
 * is only set when the CMS actually records one; a made-up "now" on every
 * request teaches Google to ignore the field. */
function urlsFor(
  path: string,
  available: readonly AppLocale[] = routing.locales,
  lastModified?: string | null,
): MetadataRoute.Sitemap {
  return available.map((locale) => {
    const { canonical, languages } = buildAlternates(path, locale, available);
    return {
      url: canonical,
      ...(lastModified ? { lastModified } : {}),
      ...(languages ? { alternates: { languages } } : {}),
    };
  });
}

async function contentPageLocales(slug: string): Promise<readonly AppLocale[] | null> {
  try {
    const page = await apiFetch<ContentPage>(`/api/content-pages/${slug}/`, { cache: "no-store" });
    return translatedLocales(page, ["title", "body"]);
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [routes, tours, posts, contactLocales, termsLocales, bikesLocales] = await Promise.all([
    apiFetch<FixedRoute[]>("/api/fixed-routes/", { cache: "no-store" }).catch(() => []),
    apiFetch<Tour[]>("/api/tours/", { cache: "no-store" }).catch(() => []),
    apiFetch<BlogPost[]>("/api/blog/", { cache: "no-store" }).catch(() => []),
    contentPageLocales("kontakt-transfer247"),
    contentPageLocales("regulamin-transfer247"),
    contentPageLocales("przewoz-rowerow"),
  ]);

  const airportRoutes = routes.filter((route) => route.category === "LOTNISKO");
  const transferRoutes = routes.filter((route) => route.category === "TRANSFER");
  const latestPost = posts.map((post) => post.updated_at || post.published_at).sort().at(-1);

  return [
    ...urlsFor(""),
    ...urlsFor("/transfery-lotniskowe"),
    ...urlsFor("/transfery"),
    ...urlsFor("/wycieczki"),
    ...urlsFor("/flota"),
    ...urlsFor("/blog", routing.locales, latestPost),
    ...(contactLocales ? urlsFor("/kontakt", contactLocales) : []),
    ...(termsLocales ? urlsFor("/regulamin", termsLocales) : []),
    ...(bikesLocales ? urlsFor("/przewoz-rowerow", bikesLocales) : []),
    ...airportRoutes.flatMap((route) =>
      urlsFor(`/transfery-lotniskowe/${route.slug}`, translatedLocales(route, ["h1", "body"]), route.updated_at),
    ),
    ...transferRoutes.flatMap((route) =>
      urlsFor(`/transfery/${route.slug}`, translatedLocales(route, ["h1", "body"]), route.updated_at),
    ),
    ...tours.flatMap((tour) =>
      urlsFor(`/wycieczki/${tour.slug}`, translatedLocales(tour, ["title", "body"]), tour.updated_at),
    ),
    ...posts.flatMap((post) =>
      urlsFor(
        `/blog/${post.slug}`,
        translatedLocales(post, ["title", "body"]),
        post.updated_at || post.published_at,
      ),
    ),
  ];
}
