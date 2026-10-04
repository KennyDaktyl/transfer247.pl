import { absoluteImageUrl } from "@/lib/images";
import type { Tour } from "@/lib/types";

/** The image at the top of a tour card (homepage section, /wycieczki):
 * the tour's cover, else the first gallery photo's thumbnail. A tour with no
 * photo at all gets a neutral placeholder of the same size, so cards in one
 * grid row stay level. */
export function TourCardImage({ tour, alt, eager = false }: { tour: Tour; alt: string; eager?: boolean }) {
  const photo = tour.photos[0];
  const src = tour.cover_image ?? (photo ? photo.thumbnail || photo.image : null);

  if (!src) {
    return (
      <div aria-hidden className="bg-border/40 flex aspect-[16/9] w-full items-center justify-center text-muted">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m3 16 5-5 4 4 3-3 6 6" />
          <circle cx="15.5" cy="8.5" r="1.5" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={absoluteImageUrl(src)}
      alt={alt}
      width={640}
      height={360}
      loading={eager ? undefined : "lazy"}
      decoding="async"
      className="aspect-[16/9] w-full object-cover"
    />
  );
}
