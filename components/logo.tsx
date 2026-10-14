import Image from "next/image";

export function Logo({
  hideWordmarkOnMobile = false,
  wordmarkClassName = "",
}: {
  hideWordmarkOnMobile?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <span className="inline-flex items-center">
      <Image
        src="/marsweblogo-optimized.png"
        alt="Mars Web Ajans"
        width={180}
        height={64}
        className="h-10 w-auto object-contain"
        priority
        unoptimized
      />
      <span
        className={`hidden text-[15px] font-semibold tracking-tight whitespace-nowrap text-white sr-only ${
          hideWordmarkOnMobile ? "max-sm:sr-only" : ""
        } ${wordmarkClassName}`}
      >
        Mars Web Ajans
      </span>
    </span>
  );
}
