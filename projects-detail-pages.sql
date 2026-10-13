-- Mars Web Ajans — referans detay sayfaları (/referanslar/[slug])
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
-- Referanslar için gereken tüm sütunları kapsar; alter-tables.sql veya projects-case-study.sql çalıştırmanıza gerek yoktur.
-- İngilizce (_en) alanlar boş kalabilir. Ön yüz boş İngilizce değeri görünce Türkçe metne döner.

alter table public.projects
  add column if not exists client_name_en text,
  add column if not exists industry_en text,
  add column if not exists description text,
  add column if not exists description_en text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists client_problem text,
  add column if not exists client_problem_en text,
  add column if not exists our_solution text,
  add column if not exists our_solution_en text,
  add column if not exists tech_frontend text,
  add column if not exists tech_backend text,
  add column if not exists tech_admin text,
  add column if not exists slug text,
  add column if not exists summary text,
  add column if not exists summary_en text,
  add column if not exists services text,
  add column if not exists services_en text,
  add column if not exists project_year text,
  add column if not exists duration text,
  add column if not exists duration_en text,
  add column if not exists cover_url text,
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists metrics jsonb not null default '[]'::jsonb,
  add column if not exists features text,
  add column if not exists features_en text,
  add column if not exists client_quote text,
  add column if not exists client_quote_en text,
  add column if not exists quote_author text,
  add column if not exists quote_author_en text,
  add column if not exists is_published boolean not null default true,
  add column if not exists is_featured boolean not null default false,
  add column if not exists sort_order integer not null default 0;

comment on column public.projects.slug is 'Detay sayfası adresi: /referanslar/<slug>. Küçük harf, rakam ve tire.';
comment on column public.projects.summary is 'Kısa özet (Türkçe). Kartta ve detay sayfasının girişinde görünür.';
comment on column public.projects.summary_en is 'Kısa özet (İngilizce). Boşsa Türkçe özet gösterilir.';
comment on column public.projects.services is 'Verilen hizmetler (Türkçe). Virgülle ayrılır: Web Tasarım, SEO.';
comment on column public.projects.services_en is 'Verilen hizmetler (İngilizce). Boşsa Türkçe liste gösterilir.';
comment on column public.projects.project_year is 'Proje yılı. Örn. 2026.';
comment on column public.projects.duration is 'Teslim süresi (Türkçe). Örn. 3 hafta.';
comment on column public.projects.duration_en is 'Teslim süresi (İngilizce). Örn. 3 weeks.';
comment on column public.projects.cover_url is 'Kapak görseli: sitenin masaüstü ekran görüntüsü. Detay sayfasında tarayıcı çerçevesinde gösterilir.';
comment on column public.projects.gallery is 'Ek ekran görüntüleri. JSON metin dizisi: ["https://...", "https://..."].';
comment on column public.projects.metrics is 'Sonuç kartları. JSON dizi: [{"value":"+%180","label":"Organik trafik","label_en":"Organic traffic"}].';
comment on column public.projects.features is 'Öne çıkan özellikler (Türkçe). Her satır bir madde.';
comment on column public.projects.features_en is 'Öne çıkan özellikler (İngilizce). Boşsa Türkçe liste gösterilir.';
comment on column public.projects.client_quote is 'Müşteri yorumu (Türkçe).';
comment on column public.projects.client_quote_en is 'Müşteri yorumu (İngilizce). Boşsa Türkçe yorum gösterilir.';
comment on column public.projects.quote_author is 'Yorum sahibi ve unvanı (Türkçe). Örn. Ayşe Demir, Genel Müdür.';
comment on column public.projects.quote_author_en is 'Yorum sahibi ve unvanı (İngilizce).';
comment on column public.projects.is_published is 'Kapalıysa referans sitede ve detay sayfasında görünmez.';
comment on column public.projects.is_featured is 'Öne çıkan referans. Ana sayfada önce gösterilir ve rozet alır.';
comment on column public.projects.sort_order is 'Sıralama. Küçük sayı önce gelir.';

-- Mevcut kayıtlar için müşteri adından adres üretir (ör. "CNR Grup Danışmanlık" -> cnr-grup-danismanlik).
-- Aynı adres ikinci kez çıkarsa sonuna kayıt kimliğinin ilk 6 karakteri eklenir.
with base as (
  select
    id,
    coalesce(
      nullif(
        btrim(
          lower(
            regexp_replace(
              translate(client_name, 'çğıöşüÇĞİÖŞÜâîûÂÎÛ', 'cgiosuCGIOSUaiuAIU'),
              '[^a-zA-Z0-9]+', '-', 'g'
            )
          ),
          '-'
        ),
        ''
      ),
      'referans'
    ) as candidate
  from public.projects
  where slug is null or btrim(slug) = ''
),
numbered as (
  select id, candidate, row_number() over (partition by candidate order by id) as position
  from base
)
update public.projects as p
set slug = case
  when numbered.position = 1
    and not exists (select 1 from public.projects as other where other.slug = numbered.candidate)
  then numbered.candidate
  else numbered.candidate || '-' || left(p.id::text, 6)
end
from numbered
where p.id = numbered.id;

create unique index if not exists projects_slug_key on public.projects (slug);

alter table public.projects drop constraint if exists projects_slug_format;
alter table public.projects
  add constraint projects_slug_format check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- Hiç sıralama verilmemişse mevcut sırayı (en yeni önce) korur.
update public.projects as p
set sort_order = ordered.position
from (
  select id, row_number() over (order by created_at desc) as position
  from public.projects
) as ordered
where p.id = ordered.id
  and not exists (select 1 from public.projects where sort_order <> 0);

create index if not exists projects_sort_order_idx on public.projects (sort_order, created_at desc);

-- Eski tek parça açıklamayı, sorun alanı boşsa oraya taşır.
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
