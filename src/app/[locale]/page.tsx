import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { AboutSection } from "@/components/about-section";
import { FixedRoutesSection } from "@/components/fixed-routes-section";
import { FleetTeaserSection } from "@/components/fleet-teaser-section";
import { HeroSection } from "@/components/hero-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToursSection } from "@/components/tours-section";
import { VehicleShowcaseSection } from "@/components/vehicle-showcase-section";
import type { AppLocale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: buildAlternates("", locale as AppLocale) };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <VehicleShowcaseSection />
        <FixedRoutesSection />
        <ToursSection />
        <FleetTeaserSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </>
  );
}
