export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { QuoteWizard } from "@/components/quote-wizard";

export const metadata: Metadata = {
  title: "Teklif Al | Mars Web Ajans",
  description:
    "Dört kısa adımda ihtiyacınızı, mevcut durumunuzu ve bütçenizi paylaşın. Talebiniz ekibimize iletilsin.",
  openGraph: {
    title: "Teklif Al | Mars Web Ajans",
    description: "Dört kısa adımda dijital projeniz için teklif alın.",
    url: "https://marswebajans.com/teklif-al",
  },
};

export default function QuotePage() {
  return (
    <>
      <QuoteWizard />
      <Footer />
    </>
  );
}
