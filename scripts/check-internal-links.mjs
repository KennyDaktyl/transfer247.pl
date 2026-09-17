#!/usr/bin/env node
/**
 * Crawls the whole site starting from sitemap.xml, follows every internal
 * <a href> found in the rendered HTML, and reports:
 *
 *   1. MISSING LOCALE PREFIX — an internal href to this domain whose path
 *      doesn't start with /pl, /en or /de. next-intl's proxy 308-redirects
 *      these to the default locale, which is exactly the "page contains a
 *      redirect" class of problem GSC's Coverage report flags. This is the
 *      general-purpose version of the bug fixed once already in
 *      MarkdownContent (2026-09-03) — this script catches it regardless of
 *      which component/model field produced the link.
 *   2. REDIRECTS — any internal link (locale-prefixed or not) that doesn't
 *      resolve with a 200 in one hop. Catches stale links left behind by a
 *      URL restructuring (e.g. the /transfery -> /transfery-lotniskowe
 *      split) even when they already carry a correct locale prefix.
 *   3. BROKEN — internal links that 404 or otherwise error.
 *   4. SITEMAP URLS THAT REDIRECT/404 — sitemap.xml should only ever list
 *      canonical, directly-resolving URLs.
 *   5. POSSIBLE DUPLICATES — distinct paths (ignoring locale) sharing an
 *      identical <title>+<h1> pair, or pages missing <link rel="canonical">.
 *
 * Usage:
 *   node scripts/check-internal-links.mjs [baseUrl]
 *   BASE_URL=http://localhost:1701 node scripts/check-internal-links.mjs
 *
 * Defaults to https://transfer247.pl. Exit code is non-zero if any
 * MISSING LOCALE PREFIX, BROKEN, or sitemap-redirect issue is found, so
 * this can gate a deploy once CI exists. Run it locally before publishing
 * a batch of new content (new blog posts, routes, tours) — see README.
 */

const BASE_URL = (process.argv[2] || process.env.BASE_URL || "https://transfer247.pl").replace(/\/+$/, "");
const LOCALES = ["pl", "en", "de"];
const CONCURRENCY = 6;
const REQUEST_DELAY_MS = 30;

/** @type {string} */
const HOST = new URL(BASE_URL).host;

async function fetchText(url) {
  const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": "internal-link-checker/1.0" } });
  const body = res.status >= 200 && res.status < 300 ? await res.text() : "";
  return { status: res.status, location: res.headers.get("location"), body };
}

function extractLocs(sitemapXml) {
  return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function extractHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((m) => m[1]);
}

function extractTag(html, tag) {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return m ? m[1].trim() : null;
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function classifyHref(rawHref, sourceUrl) {
  const trimmed = rawHref.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  if (/^(mailto|tel|javascript):/i.test(trimmed)) return null;

  let resolved;
  try {
    resolved = new URL(trimmed, sourceUrl);
  } catch {
    return null;
  }
  if (resolved.host !== HOST) return null; // external link, out of scope here

  const path = resolved.pathname;
  if (path.startsWith("/api/") || path.startsWith("/_next/")) return null;
  if (/\.[a-z0-9]+$/i.test(path) && !path.endsWith(".xml")) return null; // static asset

  const hasLocalePrefix = LOCALES.some((l) => path === `/${l}` || path.startsWith(`/${l}/`));
  return { url: `${resolved.origin}${path}`, path, hasLocalePrefix };
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
      await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  console.log(`Crawling ${BASE_URL} ...\n`);

  const sitemapRes = await fetchText(`${BASE_URL}/sitemap.xml`);
  if (sitemapRes.status !== 200) {
    console.error(`Could not fetch /sitemap.xml (status ${sitemapRes.status}). Aborting.`);
    process.exit(2);
  }
  const sitemapUrls = extractLocs(sitemapRes.body);
  console.log(`sitemap.xml lists ${sitemapUrls.length} URLs.`);

  const sitemapIssues = [];
  const hrefsBySource = new Map(); // href -> Set(sourceUrl)
  const pageMeta = []; // { url, title, h1, canonical }

  await mapWithConcurrency(sitemapUrls, CONCURRENCY, async (url) => {
    const { status, location, body } = await fetchText(url);
    if (status !== 200) {
      sitemapIssues.push({ url, status, location });
      return;
    }
    const title = extractTag(body, "title");
    const h1 = extractTag(body, "h1");
    const canonical = extractCanonical(body);
    pageMeta.push({ url, title, h1, canonical });

    for (const rawHref of extractHrefs(body)) {
      const classified = classifyHref(rawHref, url);
      if (!classified) continue;
      if (!hrefsBySource.has(classified.url)) hrefsBySource.set(classified.url, { sources: new Set(), hasLocalePrefix: classified.hasLocalePrefix });
      hrefsBySource.get(classified.url).sources.add(url);
    }
  });

  const missingPrefix = [];
  const redirectingLinks = [];
  const brokenLinks = [];

  const uniqueHrefs = [...hrefsBySource.keys()];
  await mapWithConcurrency(uniqueHrefs, CONCURRENCY, async (href) => {
    const info = hrefsBySource.get(href);
    if (!info.hasLocalePrefix) {
      missingPrefix.push({ href, sources: [...info.sources] });
      return; // don't bother probing it too, we already know it 30x-redirects
    }
    const { status, location } = await fetchText(href);
    if (status >= 300 && status < 400) {
      redirectingLinks.push({ href, to: location, sources: [...info.sources] });
    } else if (status >= 400) {
      brokenLinks.push({ href, status, sources: [...info.sources] });
    }
  });

  // Duplicate-content heuristic: same (title, h1) across different paths
  // (ignoring the locale segment, since that's expected to repeat 3x).
  const byPathNoLocale = new Map();
  for (const p of pageMeta) {
    const path = new URL(p.url).pathname.replace(new RegExp(`^/(${LOCALES.join("|")})`), "");
    byPathNoLocale.set(path, p.url);
  }
  const byTitleH1 = new Map();
  for (const p of pageMeta) {
    const key = `${p.title}|||${p.h1}`;
    if (!byTitleH1.has(key)) byTitleH1.set(key, new Set());
    const path = new URL(p.url).pathname.replace(new RegExp(`^/(${LOCALES.join("|")})`), "");
    byTitleH1.get(key).add(path);
  }
  const duplicateTitleH1 = [...byTitleH1.entries()]
    .filter(([, paths]) => paths.size > 1)
    .map(([key, paths]) => ({ title: key.split("|||")[0], h1: key.split("|||")[1], paths: [...paths] }));

  const missingCanonical = pageMeta.filter((p) => !p.canonical).map((p) => p.url);

  // --- report ---
  const section = (title) => console.log(`\n${"=".repeat(4)} ${title} ${"=".repeat(4)}`);

  section(`SITEMAP URLS THAT DON'T RESOLVE 200 (${sitemapIssues.length})`);
  for (const i of sitemapIssues) console.log(`  ${i.url} -> ${i.status}${i.location ? ` (Location: ${i.location})` : ""}`);

  section(`INTERNAL LINKS MISSING LOCALE PREFIX (${missingPrefix.length})`);
  for (const m of missingPrefix) {
    console.log(`  ${m.href}`);
    console.log(`    linked from: ${m.sources.slice(0, 3).join(", ")}${m.sources.length > 3 ? ` (+${m.sources.length - 3} more)` : ""}`);
  }

  section(`INTERNAL LINKS THAT REDIRECT (${redirectingLinks.length})`);
  for (const r of redirectingLinks) {
    console.log(`  ${r.href} -> ${r.to}`);
    console.log(`    linked from: ${r.sources.slice(0, 3).join(", ")}${r.sources.length > 3 ? ` (+${r.sources.length - 3} more)` : ""}`);
  }

  section(`BROKEN INTERNAL LINKS (${brokenLinks.length})`);
  for (const b of brokenLinks) {
    console.log(`  ${b.href} -> ${b.status}`);
    console.log(`    linked from: ${b.sources.slice(0, 3).join(", ")}${b.sources.length > 3 ? ` (+${b.sources.length - 3} more)` : ""}`);
  }

  section(`PAGES MISSING <link rel="canonical"> (${missingCanonical.length})`);
  for (const u of missingCanonical) console.log(`  ${u}`);

  section(`POSSIBLE DUPLICATE CONTENT — same title+H1, different path (${duplicateTitleH1.length})`);
  for (const d of duplicateTitleH1) {
    console.log(`  title="${d.title}" h1="${d.h1}"`);
    console.log(`    paths: ${d.paths.join(", ")}`);
  }

  console.log(`\nCrawled ${pageMeta.length}/${sitemapUrls.length} sitemap pages, checked ${uniqueHrefs.length} unique internal link targets.\n`);

  const hasBlockingIssues = sitemapIssues.length > 0 || missingPrefix.length > 0 || brokenLinks.length > 0;
  process.exit(hasBlockingIssues ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
