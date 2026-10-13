-- Mars Web Ajans — paket özelleştirme yükseltmesi
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
--
-- 1) packages tablosuna yeni alanlar ekler: kısa açıklama, eski (üstü çizili) fiyat,
--    fiyat notu, teslim süresi, özel rozet, özel buton yazısı, ek hizmetler ve görünürlük.
-- 2) leads tablosuna müşterinin seçtiği ek hizmetleri ve tahmini toplam tutarı ekler.
-- 3) Mevcut üç paketi (başlığa göre) güncel fiyat, metin ve ek hizmetlerle doldurur.
--    Paket yoksa oluşturur. Sonradan her şeyi yönetim panelinden değiştirebilirsiniz.
--
-- addons bir JSON dizisidir: [{"title": "Logo tasarımı", "title_en": "Logo design", "price": 3500}]

alter table public.packages
  add column if not exists title_en text,
  add column if not exists features_en jsonb,
  add column if not exists sort_order integer not null default 0,
  add column if not exists tagline text,
  add column if not exists tagline_en text,
  add column if not exists old_price numeric(12, 2),
  add column if not exists price_note text,
  add column if not exists price_note_en text,
  add column if not exists delivery_time text,
  add column if not exists delivery_time_en text,
  add column if not exists badge text,
  add column if not exists badge_en text,
  add column if not exists cta_label text,
  add column if not exists cta_label_en text,
  add column if not exists addons jsonb not null default '[]'::jsonb,
  add column if not exists is_active boolean not null default true;

alter table public.packages drop constraint if exists packages_old_price_nonnegative;
alter table public.packages add constraint packages_old_price_nonnegative check (old_price is null or old_price >= 0);

comment on column public.packages.tagline is 'Başlığın altındaki kısa açıklama (Türkçe).';
comment on column public.packages.tagline_en is 'Kısa açıklama (İngilizce). Boşsa Türkçe metin gösterilir.';
comment on column public.packages.old_price is 'Üstü çizili liste fiyatı (TRY). Fiyattan büyükse indirim rozeti çıkar.';
comment on column public.packages.price_note is 'Fiyatın altındaki not. Örn: + KDV · Tek seferlik ödeme';
comment on column public.packages.price_note_en is 'Fiyat notu (İngilizce).';
comment on column public.packages.delivery_time is 'Teslim süresi. Örn: 10–14 iş günü';
comment on column public.packages.delivery_time_en is 'Teslim süresi (İngilizce).';
comment on column public.packages.badge is 'Özel rozet. Boşsa popüler pakette varsayılan rozet gösterilir.';
comment on column public.packages.badge_en is 'Özel rozet (İngilizce).';
comment on column public.packages.cta_label is 'Özel buton yazısı. Boşsa varsayılan yazı gösterilir.';
comment on column public.packages.cta_label_en is 'Özel buton yazısı (İngilizce).';
comment on column public.packages.addons is 'Talep formunda seçilebilen ek hizmetler (JSON dizisi).';
comment on column public.packages.is_active is 'Sitede gösterilsin mi?';

alter table public.leads
  add column if not exists addons text,
  add column if not exists estimated_total numeric(12, 2);

comment on column public.leads.addons is 'Paket formunda seçilen ek hizmetler.';
comment on column public.leads.estimated_total is 'Paket + ek hizmetler tahmini toplamı (TRY).';

-- ---------------------------------------------------------------------------
-- Dijital Kartvizit
-- ---------------------------------------------------------------------------
insert into public.packages (title, price, sort_order)
select 'Dijital Kartvizit', 12900, 1
where not exists (select 1 from public.packages where title = 'Dijital Kartvizit');

update public.packages set
  title_en = 'Digital Business Card',
  tagline = 'Esnaf, serbest meslek ve yeni kurulan işletmeler için hızlı ve şık bir başlangıç.',
  tagline_en = 'A fast, polished start for local businesses, freelancers and new ventures.',
  price = 12900,
  old_price = 16900,
  price_note = '+ KDV · Tek seferlik ödeme',
  price_note_en = '+ VAT · One-time payment',
  delivery_time = '5 iş günü',
  delivery_time_en = '5 business days',
  badge = null,
  badge_en = null,
  cta_label = null,
  cta_label_en = null,
  features = array[
    'Tek sayfalık, kaydırmalı kurumsal site',
    'İlk yıl ücretsiz alan adı (.com / .com.tr)',
    'İlk yıl hosting ve SSL güvenlik sertifikası',
    '%100 mobil uyumlu, hızlı açılan tasarım',
    'WhatsApp, tek tıkla arama ve harita butonları',
    'Kurumsal e-posta yönlendirme (info@firmaniz.com)',
    'Google İşletme Profili kaydı ve temel SEO',
    '1 revizyon turu'
  ],
  features_en = '[
    "Single-page scrolling business website",
    "Free domain for the first year (.com / .com.tr)",
    "First-year hosting and SSL certificate",
    "100% mobile-friendly, fast-loading design",
    "WhatsApp, click-to-call and map buttons",
    "Business email forwarding (info@yourcompany.com)",
    "Google Business Profile setup and basic SEO",
    "1 revision round"
  ]'::jsonb,
  addons = '[
    {"title": "Logo tasarımı", "title_en": "Logo design", "price": 3500},
    {"title": "İngilizce dil seçeneği", "title_en": "English language version", "price": 2900},
    {"title": "Profesyonel metin yazımı", "title_en": "Professional copywriting", "price": 1900},
    {"title": "1 yıl bakım ve güncelleme", "title_en": "1-year care and updates", "price": 4900}
  ]'::jsonb,
  is_popular = false,
  is_active = true,
  sort_order = 1
where title = 'Dijital Kartvizit';

-- ---------------------------------------------------------------------------
-- Kurumsal Vitrin
-- ---------------------------------------------------------------------------
insert into public.packages (title, price, sort_order)
select 'Kurumsal Vitrin', 24900, 2
where not exists (select 1 from public.packages where title = 'Kurumsal Vitrin');

update public.packages set
  title_en = 'Corporate Showcase',
  tagline = 'Güven veren, Google''da bulunan ve müşteri getiren tam kapsamlı kurumsal site.',
  tagline_en = 'A complete corporate website that builds trust, ranks on Google and brings in customers.',
  price = 24900,
  old_price = 32900,
  price_note = '+ KDV · Tek seferlik ödeme',
  price_note_en = '+ VAT · One-time payment',
  delivery_time = '10–14 iş günü',
  delivery_time_en = '10–14 business days',
  badge = null,
  badge_en = null,
  cta_label = 'Bu paketle başla',
  cta_label_en = 'Start with this package',
  features = array[
    '8 sayfaya kadar özel tasarım kurumsal site',
    'İlk yıl ücretsiz alan adı, hosting ve SSL',
    'Kolay Türkçe yönetim paneli (içerik, görsel, blog)',
    'Gelişmiş Google SEO altyapısı ve site haritası',
    'Google Analytics ve Search Console kurulumu',
    'Teklif formu ve WhatsApp entegrasyonu',
    'KVKK ve çerez metinleri hazır şablon',
    'Yüksek hız optimizasyonu (Core Web Vitals)',
    '3 revizyon turu + 30 gün ücretsiz destek'
  ],
  features_en = '[
    "Custom-designed corporate site, up to 8 pages",
    "Free domain, hosting and SSL for the first year",
    "Easy admin panel (content, images, blog)",
    "Advanced Google SEO setup and sitemap",
    "Google Analytics and Search Console setup",
    "Quote form and WhatsApp integration",
    "Ready-made privacy and cookie policy templates",
    "High-speed optimization (Core Web Vitals)",
    "3 revision rounds + 30 days of free support"
  ]'::jsonb,
  addons = '[
    {"title": "Logo ve kurumsal kimlik seti", "title_en": "Logo and brand identity kit", "price": 6900},
    {"title": "İngilizce dil seçeneği", "title_en": "English language version", "price": 4900},
    {"title": "Profesyonel metin yazımı (8 sayfa)", "title_en": "Professional copywriting (8 pages)", "price": 3900},
    {"title": "Online randevu / rezervasyon modülü", "title_en": "Online booking module", "price": 5900},
    {"title": "1 yıl bakım ve güncelleme", "title_en": "1-year care and updates", "price": 7900}
  ]'::jsonb,
  is_popular = true,
  is_active = true,
  sort_order = 2
where title = 'Kurumsal Vitrin';

-- ---------------------------------------------------------------------------
-- E-Ticaret Makinesi
-- ---------------------------------------------------------------------------
insert into public.packages (title, price, sort_order)
select 'E-Ticaret Makinesi', 49900, 3
where not exists (select 1 from public.packages where title = 'E-Ticaret Makinesi');

update public.packages set
  title_en = 'E-Commerce Engine',
  tagline = 'Ödeme alan, stok ve siparişi yöneten, 7/24 satış yapan online mağaza.',
  tagline_en = 'An online store that takes payments, manages stock and orders, and sells 24/7.',
  price = 49900,
  old_price = 64900,
  price_note = '+ KDV · Tek seferlik ödeme',
  price_note_en = '+ VAT · One-time payment',
  delivery_time = '21–30 iş günü',
  delivery_time_en = '21–30 business days',
  badge = 'Satışa hazır',
  badge_en = 'Ready to sell',
  cta_label = null,
  cta_label_en = null,
  features = array[
    'Sınırsız ürün, kategori ve varyant (beden, renk)',
    'Sanal POS entegrasyonu (iyzico, PayTR, banka POS)',
    'Sepet, üyelik ve hızlı ödeme akışı',
    'Stok, sipariş ve müşteri yönetim paneli',
    'Kargo takibi ve otomatik e-posta bildirimleri',
    'Kupon, kampanya ve indirim yönetimi',
    'Ürün sayfaları için özel SEO şeması',
    'İlk yıl alan adı, hosting ve SSL dahil',
    'Mesafeli satış ve KVKK sözleşme şablonları',
    '60 gün ücretsiz teknik destek'
  ],
  features_en = '[
    "Unlimited products, categories and variants (size, color)",
    "Virtual POS integration (iyzico, PayTR, bank POS)",
    "Cart, accounts and fast checkout flow",
    "Stock, order and customer management panel",
    "Shipment tracking and automatic email notifications",
    "Coupon, campaign and discount management",
    "Custom SEO schema for product pages",
    "Domain, hosting and SSL included for the first year",
    "Distance sales and privacy agreement templates",
    "60 days of free technical support"
  ]'::jsonb,
  addons = '[
    {"title": "Pazaryeri entegrasyonu (Trendyol, Hepsiburada)", "title_en": "Marketplace integration (Trendyol, Hepsiburada)", "price": 9900},
    {"title": "e-Fatura / e-Arşiv entegrasyonu", "title_en": "e-Invoice integration", "price": 5900},
    {"title": "Kargo entegrasyonu (otomatik barkod)", "title_en": "Shipping integration (automatic labels)", "price": 4900},
    {"title": "İlk 100 ürünün yüklenmesi", "title_en": "Upload of the first 100 products", "price": 3900},
    {"title": "1 yıl bakım ve güncelleme", "title_en": "1-year care and updates", "price": 12900}
  ]'::jsonb,
  is_popular = false,
  is_active = true,
  sort_order = 3
where title = 'E-Ticaret Makinesi';
