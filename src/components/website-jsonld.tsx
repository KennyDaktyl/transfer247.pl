import { siteUrl } from "@/lib/seo";

/** Site-wide — lets Google show a sitelinks search box directly in results
 * for brand-name queries ("transfer247"). Placed once in the root layout
 * (not per-page) since it describes the site as a whole, not one URL. */
export function WebSiteJsonLd() {
  const url = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "transfer247.pl",
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${url}/pl/blog?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
