import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { apiBaseUrl, withSiteHeader } from "./lib/api";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALE_RE = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);
const ROUTE_RE = new RegExp(`^/(${routing.locales.join("|")})/(transfery|transfery-lotniskowe)/([^/]+)$`);

/** slug -> URL section ("transfery-lotniskowe" for airport routes,
 * "transfery" for the rest), cached for a minute so the proxy doesn't hit
 * the backend on every request. On a backend error the stale map (or an
 * empty one) is kept — worst case the page's own permanentRedirect still
 * fixes the section, just with one extra hop. */
let routeSections: Map<string, string> = new Map();
let routeSectionsFetchedAt = 0;

async function getRouteSections(): Promise<Map<string, string>> {
  if (Date.now() - routeSectionsFetchedAt < 60_000) return routeSections;
  routeSectionsFetchedAt = Date.now();
  try {
    const res = await fetch(`${apiBaseUrl()}/api/fixed-routes/`, {
      headers: withSiteHeader(),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const routes = (await res.json()) as { slug: string; category: string }[];
      routeSections = new Map(
        routes.map((r) => [r.slug, r.category === "LOTNISKO" ? "transfery-lotniskowe" : "transfery"]),
      );
    }
  } catch {
    // keep the previous map
  }
  return routeSections;
}

/** The final canonical path for a request, resolving every legacy form in
 * one step: a missing locale prefix (-> /pl, the default site — never
 * guessed from Accept-Language, so Googlebot sees every version) and an
 * airport route requested under /transfery (moved to /transfery-lotniskowe
 * on 2026-09-12) or vice versa. Chaining these as separate redirects cost
 * two hops for e.g. /transfery/balice-krakow. */
async function canonicalPath(pathname: string): Promise<string> {
  let path = LOCALE_RE.test(pathname) ? pathname : `/${routing.defaultLocale}${pathname === "/" ? "" : pathname}`;

  const match = path.match(ROUTE_RE);
  if (match) {
    const [, locale, section, slug] = match;
    const target = (await getRouteSections()).get(slug);
    if (target && target !== section) path = `/${locale}/${target}/${slug}`;
  }
  return path;
}

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (exported function `proxy` instead of `middleware`) — next-intl's own
// APIs are unaffected, we just export its handler under the new name.
export async function proxy(request: Parameters<typeof intlMiddleware>[0]) {
  // 308 is the GET-safe permanent redirect (Google treats it exactly like
  // 301); a temporary 307 — next-intl's default — would tell Google not to
  // consolidate ranking signals onto the target.
  const target = await canonicalPath(request.nextUrl.pathname);
  if (target !== request.nextUrl.pathname) {
    // nextUrl (not request.url) carries the public host/protocol behind nginx.
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url, 308);
  }

  const response = intlMiddleware(request);

  // Safety net for any other redirect next-intl still issues itself.
  if (response.status === 307) {
    const location = response.headers.get("location");
    if (location) {
      const permanent = NextResponse.redirect(location, 308);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "location") permanent.headers.set(key, value);
      });
      return permanent;
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|pay/|_next|.*\\..*).*)"],
};
