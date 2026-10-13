export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { LegalScreen } from "@/components/legal-screen";
import { getLegalDocument } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Mars Web Ajans",
  description: "Mars Web Ajans gizlilik politikası.",
  openGraph: {
    title: "Gizlilik Politikası | Mars Web Ajans",
    description: "Mars Web Ajans gizlilik politikası.",
    url: "https://marswebajans.com/gizlilik-politikasi",
  },
};

export default async function PrivacyPage() {
  const document = await getLegalDocument("privacy");

  return <LegalScreen titleKey="privacy" tr={document.tr} en={document.en} />;
}
