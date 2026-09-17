"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

/** A single clickable image (e.g. a driver portrait) that opens the same
 * lightbox library used everywhere else on the site, just with one slide —
 * there's no separate driver/team gallery model to page through.
 * `thumbnailSrc` is what's displayed inline (small, fast); the lightbox
 * itself always opens the full-resolution `src`. */
export function SinglePhotoLightbox({
  src,
  thumbnailSrc,
  alt,
  className = "",
}: {
  src: string;
  thumbnailSrc?: string;
  alt: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailSrc || src}
          alt={alt}
          className={`transition-opacity hover:opacity-80 ${className}`}
        />
      </button>
      <Lightbox open={open} close={() => setOpen(false)} slides={[{ src, alt }]} />
    </>
  );
}
