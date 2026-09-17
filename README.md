# transfer247.pl — frontend

Next.js 16 / next-intl (locales: `pl`, `en`, `de`, default `pl`) frontend for
transfer247.pl, sharing the Django/DRF backend in the sibling
`dowieziemycie.pl` repo (`X-Site: transfer247` header scopes every request).

## Before publishing a batch of new content

New blog posts, routes, or tours are usually added via Django Admin, not a
code change — but their Markdown bodies can still introduce dead or
unprefixed internal links (a renamed/deleted route slug, a category that
moved URL section, a stray `/pl/...` hardcoded into a CMS field). This has
repeatedly shown up in Google Search Console's Coverage report as "contains
a redirect" / "crawled, not indexed" / 404 counts creeping up after a
content push.

Run the crawl-based checker against the **live site** after publishing (or
periodically) to catch these before/soon after they reach GSC:

```sh
node scripts/check-internal-links.mjs                       # crawls https://transfer247.pl
node scripts/check-internal-links.mjs http://localhost:1701 # or a local build
```

It walks `sitemap.xml`, fetches every listed page, and reports:

- internal `<a href>`s missing the `/pl` `/en` `/de` locale prefix (these
  308-redirect via next-intl's proxy — exactly what GSC flags),
- internal links that redirect or 404 even with a locale prefix (stale
  links left behind by a URL restructuring, e.g. the `/transfery` →
  `/transfery-lotniskowe` split),
- sitemap URLs that don't resolve with a direct 200,
- pages missing `<link rel="canonical">`,
- pages sharing an identical `<title>`+`<h1>` under a different path
  (possible duplicate content).

Exit code is non-zero if it finds a missing-prefix, broken, or
sitemap-redirect issue — there's no CI configured for this repo yet, but
this makes the script pipeline-friendly (`npm run check-links && ...`)
whenever one is added.

The backend (`dowieziemycie.pl/backend`) has a complementary, narrower
check that runs offline in the Django test suite —
`apps.content.tests.InternalCmsLinkIntegrityTests` — which validates every
CMS markdown link against the actual FixedRoute/Tour/BlogPost slugs and
categories in the database. It catches a migration or Admin edit that
breaks a link the moment it happens, without needing a deployed site; it
can't catch drift from a live Admin edit that was never reflected in a
CMS link elsewhere. Run it with `python manage.py test apps.content`.
