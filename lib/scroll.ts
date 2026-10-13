import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target, { force: true });
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function scrollToTopSmooth() {
  if (lenis) {
    lenis.scrollTo(0, { force: true });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function scrollToTop() {
  lenis?.scrollTo(0, { immediate: true, force: true });
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.scrollTop = 0;
  document.body.scrollTop = 0;
  html.style.scrollBehavior = previous;
}
