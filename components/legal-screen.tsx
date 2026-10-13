import { Footer } from "@/components/footer";
import { LegalArticle } from "@/components/legal-article";
import { Navbar } from "@/components/navbar";

export function LegalScreen({
  titleKey,
  tr,
  en,
}: {
  titleKey: "kvkk" | "privacy" | "cookies";
  tr: string;
  en: string;
}) {
  return (
    <>
      <Navbar />
      <main id="icerik">
        <LegalArticle titleKey={titleKey} tr={tr} en={en} />
      </main>
      <Footer />
    </>
  );
}
