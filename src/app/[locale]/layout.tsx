import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Lora, Work_Sans } from "next/font/google";

import { AnalyticsScripts } from "@/components/analytics-scripts";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { OrganizationJsonLd } from "@/components/organization-jsonld";
import { WebSiteJsonLd } from "@/components/website-jsonld";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

// Lora is headings only (font-heading), always semibold — including the
// homepage H1, the LCP element, hence the preload.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
  weight: ["600"],
  display: "swap",
  preload: true,
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin", "latin-ext"],
  // 700: font-bold on the booking/login submit buttons.
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("title"), description: t("description"), metadataBase: new URL(siteUrl()) };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  // Seo.* (<title>/description copy) is only ever read server-side in
  // generateMetadata — no need to ship it to the browser.
  const clientMessages = { ...(await getMessages()) };
  delete clientMessages.Seo;

  return (
    <html lang={locale} className={`${lora.variable} ${workSans.variable} antialiased`}>
      <body className="bg-bg text-text min-h-screen" suppressHydrationWarning>
        <AnalyticsScripts />
        <WebSiteJsonLd locale={locale as AppLocale} />
        <OrganizationJsonLd />
        <NextIntlClientProvider messages={clientMessages}>
          {children}
          <WhatsAppButton />
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
