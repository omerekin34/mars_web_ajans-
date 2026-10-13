export const revalidate = 0;
export const dynamic = "force-dynamic";

import { Footer } from "@/components/footer";
import { Landing } from "@/components/landing";
import { getHomeContent } from "@/lib/public-content";

export default async function HomePage() {
  const content = await getHomeContent();
  return (
    <>
      <Landing faqs={content.faqs} packages={content.packages} projects={content.projects} testimonials={content.testimonials} />
      <Footer />
    </>
  );
}
