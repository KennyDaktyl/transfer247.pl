"use client";

import type { AnchorHTMLAttributes } from "react";

import { trackEvent } from "@/lib/analytics";

type ContactKind = "phone" | "email" | "whatsapp";

/** A plain <a> (tel:/mailto:/wa.me) that also fires a GA4
 * `contact_click_{kind}` event — GA4's own "Enhanced measurement" only
 * tracks outbound clicks to other domains, never the tel:/mailto: protocol
 * links this business's phone/e-mail actually use, so without this, every
 * attempt to call or e-mail was invisible in Analytics. `location`
 * distinguishes where on the page the click came from (header, footer,
 * floating button, ...) since GA4 already attaches the page itself to
 * every event automatically. */
export function TrackedContactLink({
  kind,
  location,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { kind: ContactKind; location: string }) {
  return (
    <a
      {...rest}
      onClick={(event) => {
        trackEvent(`contact_click_${kind}`, { location });
        onClick?.(event);
      }}
    />
  );
}
