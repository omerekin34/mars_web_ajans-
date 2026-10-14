import Image from "next/image";

type MarsLogoProps = {
  className?: string;
  wordmarkClassName?: string;
};

export function MarsLogo({ className = "", wordmarkClassName = "" }: MarsLogoProps) {
  return (
    <span className={`inline-flex items-center transition-opacity duration-300 hover:opacity-80 ${className}`}>
      <Image
        src="/marsweblogo-optimized.png"
        alt="Mars Web"
        width={180}
        height={64}
        className="h-10 w-auto object-contain"
        priority
        unoptimized
      />
      <span className={`hidden whitespace-nowrap text-[15px] leading-none tracking-wide sr-only ${wordmarkClassName}`}>
        <span className="font-bold text-white">MARS</span>{" "}
        <span className="font-normal text-slate-300">WEB</span>
      </span>
    </span>
  );
}
