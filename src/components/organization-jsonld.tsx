import { apiFetch } from "@/lib/api";
import { absoluteImageUrl } from "@/lib/images";
import { siteUrl } from "@/lib/seo";
import type { ContactInfo, ShowcasePhoto } from "@/lib/types";

const SERVED_PLACES = [
  "Kraków", "Balice", "Wieliczka", "Skawina", "Niepołomice", "Zakopane", "Katowice", "Energylandia",
];

export async function OrganizationJsonLd() {
  const url = siteUrl();
  const [contact, showcasePhotos] = await Promise.all([
    apiFetch<ContactInfo>("/api/contact-info/", { next: { revalidate: 60 } }),
    apiFetch<ShowcasePhoto[]>("/api/showcase-photos/", { next: { revalidate: 3600 } }).catch(
      () => [] as ShowcasePhoto[],
    ),
  ]);
  // A real photo of the car or driver represents the business far better
  // than the code-generated geometric og:image — falls back to that only
  // when no admin-curated showcase photo exists yet.
  const heroPhoto =
    showcasePhotos.find((p) => p.category === "VEHICLE") ?? showcasePhotos.find((p) => p.category === "DRIVER");
  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TaxiService"],
    name: "transfer247.pl",
    legalName: contact.legal_name,
    url,
    logo: `${url}/pl/icon`,
    image: heroPhoto ? absoluteImageUrl(heroPhoto.image) : `${url}/pl/opengraph-image`,
    telephone: contact.phone,
    email: contact.email,
    taxID: contact.nip,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address_street,
      postalCode: contact.address_postal_code,
      addressLocality: contact.address_city,
      addressCountry: contact.address_country,
    },
    areaServed: SERVED_PLACES.map((name) => ({ "@type": "Place", name })),
    priceRange: "89-449 PLN",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
