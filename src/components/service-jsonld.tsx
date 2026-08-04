import { siteUrl } from "@/lib/seo";

/** One Service entry per fixed route/tour page — ties the page to the
 * TaxiService provider (see OrganizationJsonLd) with its own name, area,
 * and starting price so route pages can surface as rich results
 * independently of the homepage listing. */
export function ServiceJsonLd({
  name,
  description,
  areaServed,
  priceFrom,
  url,
  serviceType = "Airport transfer",
}: {
  name: string;
  description: string;
  areaServed: string[];
  priceFrom?: number;
  url: string;
  serviceType?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType,
    name,
    description,
    url: `${siteUrl()}${url}`,
    provider: { "@type": "TaxiService", name: "transfer247.pl", url: siteUrl() },
    areaServed: areaServed.map((place) => ({ "@type": "Place", name: place })),
    ...(priceFrom
      ? { offers: { "@type": "Offer", price: priceFrom, priceCurrency: "PLN", availability: "https://schema.org/InStock" } }
      : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
