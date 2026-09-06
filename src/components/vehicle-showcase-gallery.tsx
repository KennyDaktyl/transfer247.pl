"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export type ShowcaseGalleryPhoto = {
  src: string;
  thumbnailSrc: string;
  caption: string;
  alt: string;
};

/** The homepage "moje auto" gallery: one large lead photo plus a stacked
 * column of supporting shots, every tile opening a full-size lightbox on
 * click. Layout adapts to however many VEHICLE photos the admin published —
 * with just the lead photo it fills the row on its own. */
export function VehicleShowcaseGallery({ photos }: { photos: ShowcaseGalleryPhoto[] }) {
  const [index, setIndex] = useState(-1);

  if (photos.length === 0) return null;

  const [lead, ...rest] = photos;
  const side = rest.slice(0, 3);

  return (
    <>
      <div className={`grid gap-3 ${side.length > 0 ? "lg:grid-cols-[1.35fr_1fr]" : ""}`}>
        <GalleryTile
          photo={lead}
          large
          onOpen={() => setIndex(0)}
          className="min-h-[240px] sm:min-h-[340px]"
        />

        {side.length > 0 ? (
          <div className={`grid gap-3 ${side.length > 1 ? "grid-cols-2 lg:grid-cols-1" : ""}`}>
            {side.map((photo, i) => (
              <GalleryTile
                key={photo.src}
                photo={photo}
                onOpen={() => setIndex(i + 1)}
                className="min-h-[130px] sm:min-h-[160px]"
              />
            ))}
          </div>
        ) : null}
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

function GalleryTile({
  photo,
  onOpen,
  large = false,
  className = "",
}: {
  photo: ShowcaseGalleryPhoto;
  onOpen: () => void;
  large?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative w-full overflow-hidden rounded-[16px] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={large ? photo.src : photo.thumbnailSrc}
        alt={photo.alt}
        loading={large ? undefined : "lazy"}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      {photo.caption ? (
        <span className="absolute bottom-2 left-2 rounded-[8px] bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {photo.caption}
        </span>
      ) : null}
    </button>
  );
}
