"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cleanLogo, type CleanLogo } from "@/lib/clean-logo";

export function CleanLogoImage({ src, className = "" }: { src: string; className?: string }) {
  const [result, setResult] = useState<{ src: string; logo: CleanLogo | null } | null>(null);

  useEffect(() => {
    let active = true;
    cleanLogo(src).then((logo) => {
      if (active) setResult({ src, logo });
    });
    return () => {
      active = false;
    };
  }, [src]);

  if (result?.src !== src) return null;

  const logo = result.logo;
  return (
    <Image
      src={logo?.src ?? src}
      alt=""
      width={logo?.width ?? 320}
      height={logo?.height ?? 160}
      unoptimized
      className={`h-auto w-auto object-contain ${className}`}
    />
  );
}
