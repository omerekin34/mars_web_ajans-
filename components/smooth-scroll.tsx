"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { setLenis } from "@/lib/scroll";

export function SmoothScroll() {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");

  useEffect(() => {
    if (admin) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 0.95,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      // Modals lock the page with `body { overflow: hidden }`; leave wheel events native while locked.
      virtualScroll: () => document.body.style.overflow !== "hidden",
    });
    setLenis(lenis);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, [admin]);

  return null;
}
