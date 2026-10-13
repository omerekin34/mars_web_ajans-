type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  titleId?: string;
  align?: "center" | "start";
};

export function SectionHeading({ eyebrow, title, lead, titleId, align = "center" }: SectionHeadingProps) {
  const alignClass = align === "start" ? "mx-auto text-center lg:mx-0 lg:text-left" : "mx-auto text-center";
  return (
    <div className={`max-w-2xl ${alignClass}`}>
      <p className="text-xs font-medium tracking-[0.22em] text-violet-300/80 uppercase">{eyebrow}</p>
      <h2
        id={titleId}
        className="mt-4 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl md:text-5xl"
      >
        {title}
      </h2>
      {lead ? <p className="mt-5 text-base leading-relaxed text-pretty text-slate-400 sm:text-lg">{lead}</p> : null}
    </div>
  );
}
