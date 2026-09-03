import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pl", "en", "de"],
  defaultLocale: "pl",
  // A bare, unprefixed URL (old links, external backlinks, content authored
  // before the /pl/en/de split) always means "the default site" here, not
  // "guess from the visitor's browser" — with detection on, the same URL
  // could 307 different visitors (and Googlebot) to different locales,
  // which is incompatible with treating that redirect as permanent.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
