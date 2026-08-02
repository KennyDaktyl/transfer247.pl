import { setRequestLocale } from "next-intl/server";

import { AboutSection } from "@/components/about-section";
import { FixedRoutesSection } from "@/components/fixed-routes-section";
import { FleetTeaserSection } from "@/components/fleet-teaser-section";
import { HeroSection } from "@/components/hero-section";
import { OrganizationJsonLd } from "@/components/organization-jsonld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToursSection } from "@/components/tours-section";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <OrganizationJsonLd />
      <SiteHeader />
      <main>
        <HeroSection />
        <FixedRoutesSection />
        <ToursSection />
        <FleetTeaserSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </>
  );
}
