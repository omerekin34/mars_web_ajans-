export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ReferenceDetail } from "@/components/reference-detail";
import { referenceHref } from "@/lib/projects";
import { getProjectDetail } from "@/lib/public-content";

type Params = Promise<{ slug: string }>;

function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProjectDetail(decodeSlug(slug));
  if (!detail) return { title: "Referans bulunamadı | Mars Web Ajans" };

  const { project } = detail;
  const title = `${project.clientName} | Referanslar | Mars Web Ajans`;
  const description =
    project.summary ||
    project.clientProblem.slice(0, 160) ||
    `${project.clientName} için Mars Web Ajans tarafından hazırlanan ${project.sector} projesi.`;
  const image = project.coverUrl || project.imageUrl;

  return {
    title,
    description,
    alternates: { canonical: referenceHref(project.slug) },
    openGraph: {
      title,
      description,
      url: `https://marswebajans.com${referenceHref(project.slug)}`,
      type: "article",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ReferenceDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const detail = await getProjectDetail(decodeSlug(slug));
  if (!detail) notFound();

  return (
    <>
      <Navbar />
      <main id="icerik">
        <ReferenceDetail project={detail.project} previous={detail.previous} next={detail.next} related={detail.related} />
      </main>
      <Footer />
    </>
  );
}
