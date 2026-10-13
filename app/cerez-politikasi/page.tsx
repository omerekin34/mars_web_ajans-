export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { LegalScreen } from "@/components/legal-screen";
import { getLegalDocument } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Çerez Politikası | Mars Web Ajans",
  description: "Mars Web Ajans çerez politikası.",
  openGraph: {
    title: "Çerez Politikası | Mars Web Ajans",
    description: "Mars Web Ajans çerez politikası.",
    url: "https://marswebajans.com/cerez-politikasi",
  },
};

export default async function CookiePage() {
  const document = await getLegalDocument("cookie");

  return <LegalScreen titleKey="cookies" tr={document.tr} en={document.en} />;
}
