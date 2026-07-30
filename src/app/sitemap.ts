import type { MetadataRoute } from "next";

import { apiFetch } from "@/lib/api";
import { routing } from "@/i18n/routing";
import type { BlogPost, FixedRoute, Tour } from "@/lib/types";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function urlsFor(path: string): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({ url: `${siteUrl()}/${locale}${path}` }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [routes, tours, posts] = await Promise.all([
    apiFetch<FixedRoute[]>("/api/fixed-routes/").catch(() => []),
    apiFetch<Tour[]>("/api/tours/").catch(() => []),
    apiFetch<BlogPost[]>("/api/blog/").catch(() => []),
  ]);

  return [
    ...urlsFor(""),
    ...urlsFor("/transfery"),
    ...urlsFor("/wycieczki"),
    ...urlsFor("/flota"),
    ...urlsFor("/blog"),
    ...urlsFor("/kontakt"),
    ...routes.flatMap((route) => urlsFor(`/transfery/${route.slug}`)),
    ...tours.flatMap((tour) => urlsFor(`/wycieczki/${tour.slug}`)),
    ...posts.flatMap((post) => urlsFor(`/blog/${post.slug}`)),
  ];
}
