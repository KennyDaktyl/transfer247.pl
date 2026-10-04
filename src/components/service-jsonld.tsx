import { businessRef, siteUrl } from "@/lib/seo";

/** One Service entry per fixed route page — ties the page to the
 * LocalBusiness provider (see OrganizationJsonLd, referenced by `@id`) with
 * its own name, area, and starting price so route pages can surface as
 * rich results independently of the homepage listing. */
export function ServiceJsonLd({
  name,
  description,
  areaServed,
  priceFrom,
  url,
  image,
  inLanguage,
  serviceType = "Airport transfer",
  schemaType = "Service",
}: {
  name: string;
  description: string;
  areaServed: string[];
  priceFrom?: number;
  url: string;
  image?: string;
  inLanguage: string;
  serviceType?: string;
  /** "TaxiService" (a Service subtype) for private airport/point-to-point
   * rides — it matches "airport taxi" intent more closely than plain Service. */
  schemaType?: "Service" | "TaxiService";
}) {
  const absoluteUrl = `${siteUrl()}${url}`;
  const data = {
    "@context": "https://schema.org",
    "@type": schemaType,
    serviceType,
    name,
    description,
    url: absoluteUrl,
    inLanguage,
    ...(image ? { image } : {}),
    provider: businessRef(),
    areaServed: areaServed.map((place) => ({ "@type": "Place", name: place })),
    ...(priceFrom
      ? {
          offers: {
            "@type": "Offer",
            url: absoluteUrl,
            price: priceFrom,
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: priceFrom,
              priceCurrency: "PLN",
              valueAddedTaxIncluded: true,
            },
          },
        }
      : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
