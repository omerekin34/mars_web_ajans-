-- Mars Web Ajans — dinamik içerik şeması
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
-- leads tablosu bilinçli olarak bu dosyada yoktur; mevcut tablo kullanılmaya devam eder.
-- Paket talep formu için tablo, eksik sütunlar ve anon ekleme izni: leads.sql
--
-- Aşağıdaki erişim politikaları, yönetim panelinin tarayıcıdaki anon anahtarla
-- yazabilmesi içindir. Paneli herkese açmadan önce kimlik doğrulama ekleyip
-- anon rolünün insert/update/delete izinlerini kapatın.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- faqs: Sıkça Sorulan Sorular
-- ---------------------------------------------------------------------------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  question_en text,
  answer_en text,
  category text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faqs_category_valid check (category is null or category in ('pricing', 'process', 'technical', 'support')),
  constraint faqs_question_not_blank check (char_length(btrim(question)) > 0),
  constraint faqs_answer_not_blank check (char_length(btrim(answer)) > 0),
  constraint faqs_sort_order_nonnegative check (sort_order >= 0)
);

comment on table public.faqs is 'Sitedeki sıkça sorulan sorular.';
comment on column public.faqs.question is 'Soru';
comment on column public.faqs.answer is 'Cevap';
comment on column public.faqs.question_en is 'Soru (İngilizce). Boşsa ön yüz Türkçe soruyu gösterir.';
comment on column public.faqs.answer_en is 'Cevap (İngilizce). Boşsa ön yüz Türkçe cevabı gösterir.';
comment on column public.faqs.is_active is 'Aktiflik durumu';
comment on column public.faqs.sort_order is 'Sıralama (küçük değer önce gelir)';

create index if not exists faqs_sort_idx on public.faqs (is_active, sort_order, created_at);

drop trigger if exists faqs_touch_updated_at on public.faqs;
create trigger faqs_touch_updated_at
before update on public.faqs
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- packages: Fiyat paketleri
-- ---------------------------------------------------------------------------
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  price numeric(12, 2) not null,
  features text[] not null default '{}',
  features_en jsonb,
  tagline text,
  tagline_en text,
  old_price numeric(12, 2),
  price_note text,
  price_note_en text,
  delivery_time text,
  delivery_time_en text,
  badge text,
  badge_en text,
  cta_label text,
  cta_label_en text,
  addons jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_title_not_blank check (char_length(btrim(title)) > 0),
  constraint packages_price_nonnegative check (price >= 0),
  constraint packages_old_price_nonnegative check (old_price is null or old_price >= 0),
  constraint packages_sort_order_nonnegative check (sort_order >= 0)
);

comment on table public.packages is 'Sitedeki fiyat paketleri.';
comment on column public.packages.title is 'Başlık';
comment on column public.packages.title_en is 'Başlık (İngilizce). Boşsa ön yüz Türkçe başlığı gösterir.';
comment on column public.packages.price is 'Fiyat (TRY)';
comment on column public.packages.features is 'Özellikler dizisi';
comment on column public.packages.features_en is 'Özellikler (İngilizce), JSON metin dizisi. Boşsa ön yüz Türkçe özellikleri gösterir.';
comment on column public.packages.is_popular is 'Popülerlik durumu';
comment on column public.packages.sort_order is 'Sıralama. Küçük sayı solda ve listede önce gelir.';
comment on column public.packages.old_price is 'Üstü çizili liste fiyatı (TRY). Fiyattan büyükse indirim rozeti çıkar.';
comment on column public.packages.addons is 'Talep formunda seçilebilen ek hizmetler (JSON dizisi). Ayrıntı: packages-upgrade.sql';
comment on column public.packages.is_active is 'Sitede gösterilsin mi?';

create index if not exists packages_sort_idx on public.packages (sort_order, created_at);

drop trigger if exists packages_touch_updated_at on public.packages;
create trigger packages_touch_updated_at
before update on public.packages
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- projects: Referanslar / portfolyo
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_name_en text,
  sector text not null,
  industry_en text,
  description text,
  description_en text,
  client_problem text,
  client_problem_en text,
  our_solution text,
  our_solution_en text,
  tech_frontend text,
  tech_backend text,
  tech_admin text,
  image_url text not null default '',
  website_url text not null default '',
  slug text unique,
  summary text,
  summary_en text,
  services text,
  services_en text,
  project_year text,
  duration text,
  duration_en text,
  cover_url text,
  gallery jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '[]'::jsonb,
  features text,
  features_en text,
  client_quote text,
  client_quote_en text,
  quote_author text,
  quote_author_en text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_client_name_not_blank check (char_length(btrim(client_name)) > 0),
  constraint projects_sector_not_blank check (char_length(btrim(sector)) > 0),
  constraint projects_slug_format check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

comment on table public.projects is 'Referanslar ve portfolyo kayıtları.';
comment on column public.projects.client_name is 'Müşteri adı';
comment on column public.projects.client_name_en is 'Müşteri adı (İngilizce, opsiyonel). Boşsa ön yüz Türkçe adı gösterir.';
comment on column public.projects.sector is 'Sektör';
comment on column public.projects.industry_en is 'Sektör (İngilizce). Boşsa ön yüz Türkçe sektörü gösterir.';
comment on column public.projects.description is 'Proje detayı / başarı hikayesi (Türkçe).';
comment on column public.projects.description_en is 'Eski proje detayı (İngilizce). Vaka analizi alanları bunun yerine kullanılır.';
comment on column public.projects.client_problem is 'Müşterinin sorunu / ihtiyacı (Türkçe).';
comment on column public.projects.client_problem_en is 'Müşterinin sorunu (İngilizce). Boşsa ön yüz Türkçe metni gösterir.';
comment on column public.projects.our_solution is 'Sunduğumuz çözüm (Türkçe).';
comment on column public.projects.our_solution_en is 'Sunduğumuz çözüm (İngilizce). Boşsa ön yüz Türkçe metni gösterir.';
comment on column public.projects.tech_frontend is 'Frontend teknolojileri. Virgülle ayrılır.';
comment on column public.projects.tech_backend is 'Backend teknolojileri. Virgülle ayrılır.';
comment on column public.projects.tech_admin is 'Yönetim paneli altyapısı. Virgülle ayrılır.';
comment on column public.projects.image_url is 'Görsel URL';
comment on column public.projects.website_url is 'Web sitesi linki';

create index if not exists projects_sector_idx on public.projects (sector);
create index if not exists projects_sort_order_idx on public.projects (sort_order, created_at desc);

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- testimonials: Müşteri yorumları
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  title_en text,
  review text not null,
  review_en text,
  rating integer not null default 5,
  is_verified boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint testimonials_name_not_blank check (char_length(btrim(name)) > 0),
  constraint testimonials_title_not_blank check (char_length(btrim(title)) > 0),
  constraint testimonials_review_not_blank check (char_length(btrim(review)) > 0),
  constraint testimonials_rating_range check (rating between 1 and 5),
  constraint testimonials_sort_order_nonnegative check (sort_order >= 0)
);

comment on table public.testimonials is 'Sitedeki müşteri yorumları.';
comment on column public.testimonials.name is 'Müşteri adı soyadı';
comment on column public.testimonials.title is 'Unvan ve şirket (Türkçe)';
comment on column public.testimonials.title_en is 'Unvan ve şirket (İngilizce). Boşsa ön yüz Türkçe unvanı gösterir.';
comment on column public.testimonials.review is 'Yorum metni (Türkçe)';
comment on column public.testimonials.review_en is 'Yorum metni (İngilizce). Boşsa ön yüz Türkçe yorumu gösterir.';
comment on column public.testimonials.rating is 'Yıldız sayısı (1-5)';
comment on column public.testimonials.is_verified is 'Onaylanmış müşteri rozeti';
comment on column public.testimonials.sort_order is 'Sıralama (küçük değer önce gelir)';

create index if not exists testimonials_sort_idx on public.testimonials (sort_order, created_at);

-- ---------------------------------------------------------------------------
-- site_settings: Genel ayarlar (iletişim ve serbest anahtar-değer kayıtları)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null,
  label text not null,
  value text not null default '',
  address_en text,
  footer_text_en text,
  footer_logo_url text,
  instagram_url text,
  linkedin_url text,
  x_url text,
  kvkk_text text,
  kvkk_text_en text,
  privacy_text text,
  privacy_text_en text,
  cookie_text text,
  cookie_text_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_key_unique unique (setting_key),
  constraint site_settings_key_format check (setting_key ~ '^[a-z][a-z0-9_]{1,40}$'),
  constraint site_settings_label_not_blank check (char_length(btrim(label)) > 0)
);

comment on table public.site_settings is 'İletişim numarası, e-posta, adres ve diğer genel site verileri.';
comment on column public.site_settings.setting_key is 'Makine adı (phone, email, address...)';
comment on column public.site_settings.label is 'Yönetim panelinde görünen ad';
comment on column public.site_settings.value is 'Ayar değeri';
comment on column public.site_settings.address_en is 'Adresin İngilizcesi. address anahtarlı satırda kullanılır.';
comment on column public.site_settings.footer_text_en is 'Alt bilgi metninin İngilizcesi. footer_text anahtarlı satırda kullanılır.';
comment on column public.site_settings.footer_logo_url is 'Footer logosu. footer anahtarlı satırda kullanılır. Boşsa ön yüz statik logoyu gösterir.';
comment on column public.site_settings.instagram_url is 'Instagram adresi. footer anahtarlı satırda kullanılır. Boşsa ikon gizlenir.';
comment on column public.site_settings.linkedin_url is 'LinkedIn adresi. footer anahtarlı satırda kullanılır. Boşsa ikon gizlenir.';
comment on column public.site_settings.x_url is 'X adresi. footer anahtarlı satırda kullanılır. Boşsa ikon gizlenir.';
comment on column public.site_settings.kvkk_text is 'KVKK aydınlatma metni (Türkçe). footer anahtarlı satırda kullanılır.';
comment on column public.site_settings.kvkk_text_en is 'KVKK aydınlatma metni (İngilizce). Boşsa ön yüz Türkçe metni gösterir.';
comment on column public.site_settings.privacy_text is 'Gizlilik politikası (Türkçe). footer anahtarlı satırda kullanılır.';
comment on column public.site_settings.privacy_text_en is 'Gizlilik politikası (İngilizce). Boşsa ön yüz Türkçe metni gösterir.';
comment on column public.site_settings.cookie_text is 'Çerez politikası (Türkçe). footer anahtarlı satırda kullanılır.';
comment on column public.site_settings.cookie_text_en is 'Çerez politikası (İngilizce). Boşsa ön yüz Türkçe metni gösterir.';

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
before update on public.site_settings
for each row execute function public.touch_updated_at();

insert into public.site_settings (setting_key, label, value)
values
  ('phone', 'İletişim Numarası', '+90 212 000 00 00'),
  ('email', 'E-posta', 'info@marswebajans.com'),
  ('address', 'Adres', 'Maslak, Sarıyer / İstanbul'),
  ('footer_text', 'Alt bilgi metni', ''),
  ('project_slots', 'Kalan Proje Kontenjanı', '2')
on conflict (setting_key) do nothing;

insert into public.site_settings (setting_key, label, value, instagram_url, linkedin_url, x_url)
values (
  'footer',
  'Footer',
  '',
  'https://www.instagram.com/marswebajans',
  'https://www.linkedin.com/company/marswebajans',
  'https://x.com/marswebajans'
)
on conflict (setting_key) do nothing;

-- ---------------------------------------------------------------------------
-- API erişimi
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.faqs to anon, authenticated;
grant select, insert, update, delete on public.packages to anon, authenticated;
grant select, insert, update, delete on public.projects to anon, authenticated;
grant select, insert, update, delete on public.testimonials to anon, authenticated;
grant select, insert, update, delete on public.site_settings to anon, authenticated;

alter table public.faqs enable row level security;
alter table public.packages enable row level security;
alter table public.projects enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists faqs_admin_all on public.faqs;
create policy faqs_admin_all on public.faqs
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists packages_admin_all on public.packages;
create policy packages_admin_all on public.packages
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists projects_admin_all on public.projects;
create policy projects_admin_all on public.projects
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists testimonials_admin_all on public.testimonials;
create policy testimonials_admin_all on public.testimonials
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings
for all
to anon, authenticated
using (true)
with check (true);
