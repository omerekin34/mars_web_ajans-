type MarsLogoProps = {
  className?: string;
  wordmarkClassName?: string;
};

export function MarsLogo({ className = "", wordmarkClassName = "" }: MarsLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-80 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7 shrink-0"
      >
        <defs>
          <linearGradient id="mars-logo-emerald" x1="4" y1="28" x2="28" y2="3" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <path
          d="M4 15A15 12 0 0 1 29 4.5"
          fill="none"
          stroke="url(#mars-logo-emerald)"
          strokeWidth="1.15"
          strokeLinejoin="miter"
          strokeLinecap="butt"
        />
        <path
          d="M5.25 25.75 L11.15 13.2 L16 19.15 L21.7 6.9 L27.4 25.75"
          fill="none"
          stroke="url(#mars-logo-emerald)"
          strokeWidth="2.2"
          strokeLinejoin="miter"
          strokeMiterlimit="8"
          strokeLinecap="butt"
        />
      </svg>
      <span className={`whitespace-nowrap text-[15px] leading-none tracking-wide ${wordmarkClassName}`}>
        <span className="font-bold text-white">MARS</span>{" "}
        <span className="font-normal text-slate-300">WEB</span>
      </span>
    </span>
  );
}
