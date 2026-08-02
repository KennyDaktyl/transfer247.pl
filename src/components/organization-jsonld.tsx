import { siteUrl } from "@/lib/seo";

export function OrganizationJsonLd() {
  const url = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "transfer247.pl",
    url,
    logo: `${url}/pl/icon`,
    image: `${url}/pl/opengraph-image`,
    telephone: "+48506029980",
    email: "kontakt@transfer247.pl",
    areaServed: {
      "@type": "City",
      name: "Kraków",
    },
    priceRange: "PLN",
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
