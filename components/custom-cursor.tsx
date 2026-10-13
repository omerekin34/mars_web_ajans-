"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Mode = "default" | "hover" | "drag" | "text";

const TEXT_SELECTOR =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"], [type="reset"], [type="color"], [type="file"]), textarea, [contenteditable=""], [contenteditable="true"]';
const DRAG_SELECTOR = '[data-cursor="drag"], .cursor-ew-resize';
const HOVER_SELECTOR =
  'a[href], button:not(:disabled), [role="button"], [role="radio"], [role="tab"], [role="switch"], [role="checkbox"], label, summary, select, input, [data-cursor="hover"], .cursor-pointer';

const RING_SPRING = { stiffness: 520, damping: 38, mass: 0.6 };

const RING_STYLES: Record<Mode, { size: number; borderColor: string; backgroundColor: string; boxShadow: string }> = {
  default: {
    size: 34,
    borderColor: "rgba(110, 231, 183, 0.55)",
    backgroundColor: "rgba(16, 185, 129, 0)",
    boxShadow: "0 0 0px rgba(16, 185, 129, 0)",
  },
  hover: {
    size: 56,
    borderColor: "rgba(110, 231, 183, 0.95)",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    boxShadow: "0 0 26px rgba(16, 185, 129, 0.45)",
  },
  drag: {
    size: 76,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    boxShadow: "0 0 30px rgba(16, 185, 129, 0.6)",
  },
  text: {
    size: 34,
    borderColor: "rgba(110, 231, 183, 0)",
    backgroundColor: "rgba(16, 185, 129, 0)",
    boxShadow: "0 0 0px rgba(16, 185, 129, 0)",
  },
};

function resolveMode(target: EventTarget | null): Mode {
  if (!(target instanceof Element)) return "default";
  if (target.closest(TEXT_SELECTOR)) return "text";
  if (target.closest(DRAG_SELECTOR)) return "drag";
  if (target.closest(HOVER_SELECTOR)) return "hover";
  return "default";
}

export function CustomCursor() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const admin = pathname.startsWith("/admin");
  const [finePointer, setFinePointer] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("default");
  const [pressed, setPressed] = useState(false);
  const visibleRef = useRef(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, RING_SPRING);
  const ringY = useSpring(y, RING_SPRING);

  const active = finePointer && !admin && !reduce;

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const show = (next: boolean) => {
      visibleRef.current = next;
      setVisible(next);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      if (!visibleRef.current) {
        ringX.jump(event.clientX);
        ringY.jump(event.clientY);
        show(true);
      }
    };
    const onOver = (event: PointerEvent) => setMode(resolveMode(event.target));
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") setPressed(true);
    };
    const onUp = () => setPressed(false);
    const onOut = (event: MouseEvent) => {
      if (!event.relatedTarget) show(false);
    };
    const onBlur = () => {
      show(false);
      setPressed(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseout", onOut);
    window.addEventListener("blur", onBlur);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("blur", onBlur);
    };
  }, [active, x, y, ringX, ringY]);

  if (!active) return null;

  const ring = RING_STYLES[mode];
  const shown = visible && mode !== "text";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      <motion.div className="absolute top-0 left-0" style={{ x: ringX, y: ringY }}>
        <motion.div
          className="relative flex items-center justify-center rounded-full border text-white"
          style={{ x: "-50%", y: "-50%" }}
          initial={false}
          animate={{
            width: ring.size,
            height: ring.size,
            borderColor: ring.borderColor,
            backgroundColor: ring.backgroundColor,
            boxShadow: ring.boxShadow,
            opacity: shown ? 1 : 0,
            scale: pressed ? 0.82 : 1,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30, opacity: { duration: 0.18 } }}
        >
          <motion.span
            className="flex items-center"
            initial={false}
            animate={{ opacity: mode === "drag" ? 1 : 0, scale: mode === "drag" ? 1 : 0.6 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronRight className="-ml-1.5 h-4 w-4" />
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.div className="absolute top-0 left-0" style={{ x, y }}>
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.95)]"
          style={{ x: "-50%", y: "-50%" }}
          initial={false}
          animate={{
            opacity: shown ? 1 : 0,
            scale: mode === "hover" || mode === "drag" ? 0 : pressed ? 0.6 : 1,
          }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>
    </div>
  );
}
