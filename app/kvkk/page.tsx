export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { LegalScreen } from "@/components/legal-screen";
import { getLegalDocument } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Mars Web Ajans",
  description: "Mars Web Ajans kişisel verilerin korunması aydınlatma metni.",
  openGraph: {
    title: "KVKK Aydınlatma Metni | Mars Web Ajans",
    description: "Mars Web Ajans kişisel verilerin korunması aydınlatma metni.",
    url: "https://marswebajans.com/kvkk",
  },
};

export default async function KvkkPage() {
  const document = await getLegalDocument("kvkk");

  return <LegalScreen titleKey="kvkk" tr={document.tr} en={document.en} />;
}
