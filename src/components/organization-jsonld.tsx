import { siteUrl } from "@/lib/seo";

const SERVED_PLACES = [
  "Kraków", "Balice", "Wieliczka", "Skawina", "Niepołomice", "Zakopane", "Katowice", "Energylandia",
];

export function OrganizationJsonLd() {
  const url = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TaxiService"],
    name: "transfer247.pl",
    legalName: "Michał Pielak MIKTEL",
    url,
    logo: `${url}/pl/icon`,
    image: `${url}/pl/opengraph-image`,
    telephone: "+48506029980",
    email: "kontakt@transfer247.pl",
    taxID: "6782805234",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ul. Wspólna 2",
      postalCode: "32-061",
      addressLocality: "Rybna",
      addressCountry: "PL",
    },
    areaServed: SERVED_PLACES.map((name) => ({ "@type": "Place", name })),
    priceRange: "PLN",
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
