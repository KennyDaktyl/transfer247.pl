import { businessRef, siteUrl } from "@/lib/seo";

/** TouristTrip for a /wycieczki/<slug> page — a round trip from Kraków with
 * the driver waiting on site, which is what distinguishes it from the
 * one-way Service on the /transfery pages for the same destination. */
export function TouristTripJsonLd({
  name,
  description,
  url,
  image,
  priceFrom,
  inLanguage,
  touristType,
}: {
  name: string;
  description: string;
  url: string;
  image?: string;
  priceFrom?: number;
  inLanguage: string;
  touristType?: string;
}) {
  const absoluteUrl = `${siteUrl()}${url}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description,
    url: absoluteUrl,
    inLanguage,
    ...(image ? { image } : {}),
    ...(touristType ? { touristType } : {}),
    provider: businessRef(),
    ...(priceFrom
      ? {
          offers: {
            "@type": "Offer",
            url: absoluteUrl,
            price: priceFrom,
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
            offeredBy: businessRef(),
          },
        }
      : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
