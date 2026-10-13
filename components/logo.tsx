export function Logo({
  hideWordmarkOnMobile = false,
  wordmarkClassName = "",
}: {
  hideWordmarkOnMobile?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5">
        <span className="h-3 w-3 rounded-full bg-gradient-to-br from-violet-300 to-sky-400 shadow-[0_0_12px_rgba(139,92,246,0.85)]" />
      </span>
      <span
        className={`text-[15px] font-semibold tracking-tight whitespace-nowrap text-white ${
          hideWordmarkOnMobile ? "max-sm:sr-only" : ""
        } ${wordmarkClassName}`}
      >
        Mars Web Ajans
      </span>
    </span>
  );
}
