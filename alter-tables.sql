-- Mars Web Ajans — çift dil (TR / EN) sütunları
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
-- İngilizce sütunlar boş bırakılabilir. Ön yüz, boş veya null İngilizce değeri görünce Türkçe kayda döner.
--
-- site_settings anahtar-değer tablosudur:
--   address satırının Türkçe metni `value`, İngilizcesi `address_en` sütunundadır.
--   footer_text satırının Türkçe metni `value`, İngilizcesi `footer_text_en` sütunundadır.
-- packages.features_en bir JSON metin dizisidir: ["Feature one", "Feature two"]

alter table public.faqs
  add column if not exists question_en text,
  add column if not exists answer_en text;

alter table public.packages
  add column if not exists title_en text,
  add column if not exists features_en jsonb,
  add column if not exists sort_order integer not null default 0;

alter table public.projects
  add column if not exists client_name_en text,
  add column if not exists industry_en text,
  add column if not exists description text,
  add column if not exists description_en text;

alter table public.site_settings
  add column if not exists address_en text,
  add column if not exists footer_text_en text;

comment on column public.faqs.question_en is 'Soru (İngilizce). Boşsa ön yüz Türkçe soruyu gösterir.';
comment on column public.faqs.answer_en is 'Cevap (İngilizce). Boşsa ön yüz Türkçe cevabı gösterir.';
comment on column public.packages.title_en is 'Başlık (İngilizce). Boşsa ön yüz Türkçe başlığı gösterir.';
comment on column public.packages.features_en is 'Özellikler (İngilizce), JSON metin dizisi. Boşsa ön yüz Türkçe özellikleri gösterir.';
comment on column public.packages.sort_order is 'Sıralama. Küçük sayı solda ve listede önce gelir.';
comment on column public.projects.client_name_en is 'Müşteri adı (İngilizce, opsiyonel). Boşsa ön yüz Türkçe adı gösterir.';
comment on column public.projects.industry_en is 'Sektör (İngilizce). Boşsa ön yüz Türkçe sektörü (sector) gösterir.';
comment on column public.projects.description is 'Proje detayı / başarı hikayesi (Türkçe).';
comment on column public.projects.description_en is 'Eski proje detayı (İngilizce). Vaka analizi alanları bunun yerine kullanılır.';

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
comment on column public.site_settings.address_en is 'Adresin İngilizcesi. address anahtarlı satırda kullanılır.';
comment on column public.site_settings.footer_text_en is 'Alt bilgi metninin İngilizcesi. footer_text anahtarlı satırda kullanılır.';

insert into public.site_settings (setting_key, label, value)
values ('footer_text', 'Alt bilgi metni', '')
on conflict (setting_key) do nothing;

alter table public.site_settings
  add column if not exists footer_logo_url text,
  add column if not exists instagram_url text,
  add column if not exists linkedin_url text,
  add column if not exists x_url text,
  add column if not exists kvkk_text text,
  add column if not exists kvkk_text_en text,
  add column if not exists privacy_text text,
  add column if not exists privacy_text_en text,
  add column if not exists cookie_text text,
  add column if not exists cookie_text_en text;

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
