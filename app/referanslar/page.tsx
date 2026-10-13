export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ReferencesIndex } from "@/components/references-index";
import { getProjects } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Referanslar | Mars Web Ajans",
  description: "Mars Web Ajans referans projeleri: sektörlere özel web siteleri, e-ticaret ve yönetim panelleri. Her projenin vaka analizini inceleyin.",
  alternates: { canonical: "/referanslar" },
  openGraph: {
    title: "Referanslar | Mars Web Ajans",
    description: "Sektörlere özel web siteleri, e-ticaret ve yönetim panelleri. Vaka analizlerini inceleyin.",
    url: "https://marswebajans.com/referanslar",
  },
};

export default async function ReferencesPage() {
  const projects = await getProjects();

  return (
    <>
      <Navbar />
      <main id="icerik">
        <ReferencesIndex projects={projects} />
      </main>
      <Footer />
    </>
  );
}
