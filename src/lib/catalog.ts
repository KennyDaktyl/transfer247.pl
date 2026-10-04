import { apiFetch } from "@/lib/api";
import type { FixedRoute, Tour } from "@/lib/types";

/** Shared, cached catalog fetches for metadata/sitemap code that only
 * needs the list (not one item) — a failed backend call yields an empty
 * list rather than breaking <head> generation. */
export async function getAllRoutes(): Promise<FixedRoute[]> {
  return apiFetch<FixedRoute[]>("/api/fixed-routes/").catch(() => []);
}

export async function getAllTours(): Promise<Tour[]> {
  return apiFetch<Tour[]>("/api/tours/").catch(() => []);
}

/** Both lists at once — what `fillPriceTokens` needs to resolve
 * `{price:route:…}` / `{price:tour:…}` in CMS copy. */
export async function getPriceCatalog(): Promise<{ routes: FixedRoute[]; tours: Tour[] }> {
  const [routes, tours] = await Promise.all([getAllRoutes(), getAllTours()]);
  return { routes, tours };
}
