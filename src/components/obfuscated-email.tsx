"use client";

import { useEffect, useState } from "react";

import { trackEvent } from "@/lib/analytics";

// Keeps "user@domain" out of the server-rendered HTML (and therefore out of
// reach of the simple regex/text scrapers that most spam-address harvesters
// still are) — assembled into a real mailto link only once this runs in an
// actual browser. Search-engine crawlers get their own copy of the address
// through organization-jsonld.tsx, so hiding it here doesn't cost any SEO.
export function ObfuscatedEmail({
  user,
  domain,
  location,
  className,
}: {
  user: string;
  domain: string;
  /** Where on the page this link sits (header, footer, ...) — same idea as
   * TrackedContactLink, kept separate here since assembling the address
   * itself already needs its own client-side effect. */
  location: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(`${user}@${domain}`);
  }, [user, domain]);

  if (!email) {
    return (
      <span className={className}>
        {user} (at) {domain}
      </span>
    );
  }

  return (
    <a
      href={`mailto:${email}`}
      className={className}
      onClick={() => trackEvent("contact_click_email", { location })}
    >
      {email}
    </a>
  );
}
