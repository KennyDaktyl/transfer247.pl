import { apiFetch } from "@/lib/api";
import { absoluteImageUrl } from "@/lib/images";
import { businessId, siteUrl } from "@/lib/seo";
import type { ContactInfo, FixedRoute, ShowcasePhoto, Tour } from "@/lib/types";

const SERVED_PLACES = [
  "Kraków", "Balice", "Wieliczka", "Skawina", "Niepołomice", "Zakopane", "Katowice", "Energylandia",
];
const SERVED_REGIONS = ["Małopolska", "Śląsk"];

/** "149-799 PLN" from the live catalog's "from" prices, instead of a
 * hand-typed range that silently goes stale when prices change. */
function priceRange(items: { price_from: string | null }[]): string | undefined {
  const prices = items.map((item) => Number(item.price_from)).filter((n) => n > 0);
  if (prices.length === 0) return undefined;
  return `${Math.min(...prices)}-${Math.max(...prices)} PLN`;
}

export async function OrganizationJsonLd() {
  const url = siteUrl();
  const [contact, showcasePhotos, routes, tours] = await Promise.all([
    apiFetch<ContactInfo>("/api/contact-info/", { next: { revalidate: 60 } }),
    apiFetch<ShowcasePhoto[]>("/api/showcase-photos/", { next: { revalidate: 3600 } }).catch(
      () => [] as ShowcasePhoto[],
    ),
    apiFetch<FixedRoute[]>("/api/fixed-routes/", { next: { revalidate: 60 } }).catch(() => [] as FixedRoute[]),
    apiFetch<Tour[]>("/api/tours/", { next: { revalidate: 60 } }).catch(() => [] as Tour[]),
  ]);
  const range = priceRange([...routes, ...tours]);
  // A real photo of the car or driver represents the business far better
  // than the code-generated geometric og:image — falls back to that only
  // when no admin-curated showcase photo exists yet.
  const heroPhoto =
    showcasePhotos.find((p) => p.category === "VEHICLE") ?? showcasePhotos.find((p) => p.category === "DRIVER");
  const data = {
    "@context": "https://schema.org",
    // LocalBusiness is itself an Organization subtype; both are listed so
    // tools that only look for "Organization" (logo, brand panel) match too.
    "@type": ["LocalBusiness", "Organization"],
    "@id": businessId(),
    name: "transfer247.pl",
    legalName: contact.legal_name,
    url,
    logo: `${url}/pl/apple-icon`,
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
    areaServed: [
      ...SERVED_PLACES.map((name) => ({ "@type": "City", name })),
      ...SERVED_REGIONS.map((name) => ({ "@type": "AdministrativeArea", name })),
    ],
    ...(range ? { priceRange: range } : {}),
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
