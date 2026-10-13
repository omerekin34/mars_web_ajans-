export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CustomCursor } from "@/components/custom-cursor";
import { LanguageProvider } from "@/components/language-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteSettingsProvider } from "@/components/site-settings-provider";
import { StickyCtaBar } from "@/components/sticky-cta-bar";
import { getSiteSettings } from "@/lib/public-content";
import "lenis/dist/lenis.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marswebajans.com"),
  title: "Mars Web Ajans | KOBİ'ler için Premium Web Tasarım",
  description:
    "Dükkan kapalıyken de satış yapan dijital şubenizi kuruyoruz. KOBİ ve yerel işletmeler için anahtar teslim web tasarım, SEO ve e-ticaret.",
  openGraph: {
    title: "Mars Web Ajans | Premium Web Tasarım",
    description: "Dükkan kapalıyken de satış yapan dijital şubenizi kuruyoruz.",
    url: "https://marswebajans.com",
    siteName: "Mars Web Ajans",
    locale: "tr_TR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <html lang="tr" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.className} isolate overflow-x-hidden bg-slate-950 text-slate-200 antialiased`}>
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M32 0H0V32' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E\")",
            backgroundSize: "32px 32px",
          }}
        />
        <SmoothScroll />
        <CustomCursor />
        <div className="relative z-10">
          <LanguageProvider>
            <SiteSettingsProvider value={settings}>
              {children}
              <StickyCtaBar />
            </SiteSettingsProvider>
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}
