-- Mars Web Ajans — footer, sosyal medya ve yasal metin sütunları
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
--
-- Tüm sütunlar site_settings tablosunda, setting_key = 'footer' satırında tutulur.
-- footer_logo_url boşsa ön yüz statik logoyu gösterir.
-- instagram_url, linkedin_url veya x_url boşsa ilgili ikon gizlenir.
-- İngilizce yasal metin boş veya null ise ön yüz Türkçe metni gösterir.

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
