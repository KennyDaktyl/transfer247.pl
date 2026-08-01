"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export type GalleryPhoto = {
  src: string;
  thumbnailSrc: string;
  alt: string;
};

export function PhotoGallery({ photos, className = "" }: { photos: GalleryPhoto[]; className?: string }) {
  const [index, setIndex] = useState(-1);

  if (photos.length === 0) return null;

  return (
    <>
      <div className={`grid grid-cols-3 gap-2 sm:grid-cols-4 ${className}`}>
        {photos.map((photo, i) => (
          <button
            key={photo.src + i}
            type="button"
            onClick={() => setIndex(i)}
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
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={photos.map((p) => ({ src: p.src, alt: p.alt }))}
      />
    </>
  );
}
