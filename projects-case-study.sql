-- Mars Web Ajans — referans vaka analizi sütunları
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
-- İngilizce metinler boş bırakılabilir. Ön yüz, boş İngilizce değeri görünce Türkçe kayda döner.
-- Teknoloji alanları dile göre ayrılmaz; virgülle yazılır (ör. Next.js, Tailwind CSS).

alter table public.projects
  add column if not exists client_problem text,
  add column if not exists client_problem_en text,
  add column if not exists our_solution text,
  add column if not exists our_solution_en text,
  add column if not exists tech_frontend text,
  add column if not exists tech_backend text,
  add column if not exists tech_admin text;

comment on column public.projects.client_problem is 'Müşterinin sorunu / ihtiyacı (Türkçe).';
comment on column public.projects.client_problem_en is 'Müşterinin sorunu (İngilizce). Boşsa ön yüz Türkçe metni gösterir.';
comment on column public.projects.our_solution is 'Sunduğumuz çözüm (Türkçe).';
comment on column public.projects.our_solution_en is 'Sunduğumuz çözüm (İngilizce). Boşsa ön yüz Türkçe metni gösterir.';
comment on column public.projects.tech_frontend is 'Frontend teknolojileri. Virgülle ayrılır.';
comment on column public.projects.tech_backend is 'Backend teknolojileri. Virgülle ayrılır.';
comment on column public.projects.tech_admin is 'Yönetim paneli altyapısı. Virgülle ayrılır.';

-- Eski tek parça proje detayını, yeni sorun alanı boşsa oraya taşır.
-- Çözüm ve teknoloji alanlarına dokunmaz. İstemiyorsanız bu iki update'i çalıştırmayın.
update public.projects
set client_problem = description
where client_problem is null
  and description is not null
  and btrim(description) <> '';

update public.projects
set client_problem_en = description_en
where client_problem_en is null
  and description_en is not null
  and btrim(description_en) <> '';
