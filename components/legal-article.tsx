"use client";

import { useI18n } from "@/components/language-provider";
import { localizedText } from "@/lib/localized";

const proseClass =
  "prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-white prose-p:text-slate-300 prose-p:leading-8 prose-a:text-emerald-300 prose-strong:text-white prose-li:marker:text-emerald-300 prose-li:text-slate-300 prose-blockquote:border-emerald-400/40 prose-blockquote:text-slate-200";

function ArticleBody({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={proseClass}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function LegalArticle({
  titleKey,
  tr,
  en,
}: {
  titleKey: "kvkk" | "privacy" | "cookies";
  tr: string;
  en: string;
}) {
  const { locale, t } = useI18n();
  const body = localizedText(locale, tr, en).trim();

  return (
    <article className="mx-auto w-full max-w-3xl px-6 pt-36 pb-24 md:pt-44 md:pb-32">
      <p className="text-xs font-semibold tracking-[0.22em] text-emerald-300/80 uppercase">{t.footer.legalNav}</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">{t.footer.legal[titleKey]}</h1>
      <div className="mt-10 border-t border-white/10 pt-10">
        {body ? (
          <ArticleBody text={body} />
        ) : (
          <div className={proseClass}>
            <p>{t.footer.updating}</p>
          </div>
        )}
      </div>
    </article>
  );
}
