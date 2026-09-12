import type { MetadataRoute } from "next";

import { apiFetch } from "@/lib/api";
import { routing } from "@/i18n/routing";
import type { BlogPost, FixedRoute, Tour } from "@/lib/types";

// Regenerate on every request so a newly published blog post / route /
// tour appears in the sitemap immediately, without waiting for a rebuild.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function urlsFor(path: string): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({ url: `${siteUrl()}/${locale}${path}` }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [routes, tours, posts] = await Promise.all([
    apiFetch<FixedRoute[]>("/api/fixed-routes/", { cache: "no-store" }).catch(() => []),
    apiFetch<Tour[]>("/api/tours/", { cache: "no-store" }).catch(() => []),
    apiFetch<BlogPost[]>("/api/blog/", { cache: "no-store" }).catch(() => []),
  ]);

  const airportRoutes = routes.filter((route) => route.category === "LOTNISKO");
  const transferRoutes = routes.filter((route) => route.category === "TRANSFER");

  return [
    ...urlsFor(""),
    ...urlsFor("/transfery-lotniskowe"),
    ...urlsFor("/transfery"),
    ...urlsFor("/wycieczki"),
    ...urlsFor("/flota"),
    ...urlsFor("/blog"),
    ...urlsFor("/kontakt"),
    ...urlsFor("/przewoz-rowerow"),
    ...airportRoutes.flatMap((route) => urlsFor(`/transfery-lotniskowe/${route.slug}`)),
    ...transferRoutes.flatMap((route) => urlsFor(`/transfery/${route.slug}`)),
    ...tours.flatMap((tour) => urlsFor(`/wycieczki/${tour.slug}`)),
    ...posts.flatMap((post) => urlsFor(`/blog/${post.slug}`)),
  ];
}
