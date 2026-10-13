"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

type PointerPosition = {
  x: number;
  y: number;
};

export function CursorSpotlight() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [position, setPosition] = useState<PointerPosition | null>(null);
  const admin = pathname.startsWith("/admin");

  useEffect(() => {
    if (reduce || admin) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [admin, reduce]);

  if (admin || reduce || !position) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute top-0 left-0"
        initial={{ x: position.x, y: position.y, opacity: 0 }}
        animate={{ x: position.x, y: position.y, opacity: 1 }}
        transition={{ type: "spring", stiffness: 70, damping: 22, mass: 0.45 }}
      >
        <div className="h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/30 blur-3xl" />
      </motion.div>
    </div>
  );
}
