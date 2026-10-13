"use client";

import { useEffect, useState } from "react";
import { Agitation } from "@/components/agitation";
import { Calculator } from "@/components/calculator";
import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { Packages } from "@/components/packages";
import { PaymentTrust } from "@/components/payment-trust";
import { PortfolioSection } from "@/components/portfolio-section";
import { Testimonials } from "@/components/testimonials";
import { Process } from "@/components/process";
import { TechGrid } from "@/components/tech-grid";
import { LiveSupport } from "@/components/live-support";
import type { PublicFaq, PublicPackage, PublicProject, PublicTestimonial } from "@/lib/public-content";

type LandingProps = {
  faqs: PublicFaq[];
  packages: PublicPackage[];
  projects: PublicProject[];
  testimonials: PublicTestimonial[];
};

function initialPackageId(packages: PublicPackage[]) {
  return packages.find((item) => item.isPopular)?.id ?? packages[0]?.id ?? "";
}

export function Landing({ faqs, packages, projects, testimonials }: LandingProps) {
  const [packageId, setPackageId] = useState(() => initialPackageId(packages));

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const scroll = () => document.getElementById(id)?.scrollIntoView({ block: "start" });
    scroll();
    const timer = window.setTimeout(scroll, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <main id="icerik">
        <Hero projects={projects} testimonials={testimonials} />
        <TechGrid />
        <Agitation />
        <Process />
        <PortfolioSection projects={projects} />
        <Testimonials items={testimonials} />
        <Packages packages={packages} selected={packageId} onSelect={setPackageId} />
        <Calculator packages={packages} packageId={packageId} onPackageChange={setPackageId} />
        <Faq items={faqs} />
        <PaymentTrust />
      </main>
      <LiveSupport />
    </>
  );
}
