import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { LoginForm } from "@/components/login-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NOINDEX_FOLLOW } from "@/lib/seo";

// noindex, follow (not nofollow): Google must still be able to crawl the
// page to see the noindex — and robots.txt deliberately doesn't block it.
export const metadata: Metadata = { robots: NOINDEX_FOLLOW };

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main className="px-6 py-16">
        <LoginForm />
      </main>
      <SiteFooter />
    </>
  );
}
