"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cleanLogo } from "@/lib/clean-logo";

export function CleanLogoImage({
  src,
  className = "",
  onFail,
}: {
  src: string;
  className?: string;
  onFail?: () => void;
}) {
  const [cleaned, setCleaned] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  const [originalFailed, setOriginalFailed] = useState(false);
  const [cleanFailed, setCleanFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setCleaned(null);
    setSettled(false);
    setOriginalFailed(false);
    setCleanFailed(false);
    cleanLogo(src).then((logo) => {
      if (!active) return;
      if (logo?.src) setCleaned(logo.src);
      setSettled(true);
    });
    return () => {
      active = false;
    };
  }, [src]);

  useEffect(() => {
    if (originalFailed && settled && (!cleaned || cleanFailed)) onFail?.();
  }, [cleanFailed, cleaned, onFail, originalFailed, settled]);

  if (originalFailed && !cleaned) return null;
  if (originalFailed && cleanFailed) return null;

  const displaySrc = cleaned && !cleanFailed ? cleaned : src;

  return (
    <Image
      key={displaySrc}
      src={displaySrc}
      alt=""
      width={320}
      height={160}
      unoptimized
      loading="eager"
      referrerPolicy="no-referrer"
      onError={() => {
        if (displaySrc === src) setOriginalFailed(true);
        else setCleanFailed(true);
      }}
      className={`h-auto w-auto max-w-full object-contain ${className}`}
    />
  );
}
