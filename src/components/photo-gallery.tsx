"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export type GalleryPhoto = {
  src: string;
  thumbnailSrc: string;
  alt: string;
};

/** `coverPhoto`, when given, renders as a large clickable image above the
 * thumbnail grid (e.g. a vehicle's cover_photo, a separate field from its
 * photo gallery) and becomes slide 0 of the same lightbox the thumbnails
 * open — previously it was rendered by the caller as a plain <img> outside
 * this component, so clicking it did nothing while the thumbnails below it
 * worked, which read as a bug rather than deliberate. */
export function PhotoGallery({
  photos,
  coverPhoto,
  children,
  className = "",
}: {
  photos: GalleryPhoto[];
  coverPhoto?: GalleryPhoto;
  /** Rendered between the cover image and the thumbnail grid — lets a
   * caller (e.g. a vehicle card with cover → heading/description →
   * thumbnails) keep its own visual order while still sharing this
   * component's lightbox state across both the cover and the thumbnails. */
  children?: ReactNode;
  className?: string;
}) {
  const [index, setIndex] = useState(-1);
  const thumbnailOffset = coverPhoto ? 1 : 0;
  const slides = coverPhoto ? [coverPhoto, ...photos] : photos;

  if (slides.length === 0) return null;

  return (
    <>
      {coverPhoto ? (
        <button type="button" onClick={() => setIndex(0)} className="block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverPhoto.src}
            alt={coverPhoto.alt}
            className="aspect-square w-full rounded-[12px] object-cover transition-opacity hover:opacity-90"
          />
        </button>
      ) : null}
      {children}
      {photos.length > 0 ? (
        <div className={`grid grid-cols-3 gap-2 sm:grid-cols-4 ${className}`}>
          {photos.map((photo, i) => (
            <button
              key={photo.src + i}
              type="button"
              onClick={() => setIndex(i + thumbnailOffset)}
              className="aspect-square overflow-hidden rounded-[8px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnailSrc}
                alt={photo.alt}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </button>
          ))}
        </div>
      ) : null}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides.map((p) => ({ src: p.src, alt: p.alt }))}
      />
    </>
  );
}
