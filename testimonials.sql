-- Mars Web Ajans — müşteri yorumları
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
-- İngilizce sütunlar boş bırakılabilir. Ön yüz, boş veya null İngilizce değeri görünce Türkçe kayda döner.
--
-- Aşağıdaki erişim politikası, yönetim panelinin tarayıcıdaki anon anahtarla
-- yazabilmesi içindir. Paneli herkese açmadan önce kimlik doğrulama ekleyip
-- anon rolünün insert/update/delete izinlerini kapatın.

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

grant select, insert, update, delete on public.testimonials to anon, authenticated;

alter table public.testimonials enable row level security;

drop policy if exists testimonials_admin_all on public.testimonials;
create policy testimonials_admin_all on public.testimonials
for all
to anon, authenticated
using (true)
with check (true);

-- Eski statik kartlar. Tablo boşsa bir kez eklenir; sonraki çalıştırmalar kopya üretmez.
insert into public.testimonials (name, title, title_en, review, review_en, rating, is_verified, sort_order)
select
  v.name,
  v.title,
  v.title_en,
  v.review,
  v.review_en,
  v.rating,
  v.is_verified,
  v.sort_order
from (
  values
    (
      'Elif Karaca'::text,
      'Operasyon Müdürü, Lumen Store'::text,
      'Operations Manager, Lumen Store'::text,
      'Web sitemiz kurulduktan sonraki ilk ayda online taleplerimiz %40 arttı. Mars ekibi gerçekten ne yaptığını biliyor.'::text,
      'In the first month after the site went live, online inquiries rose 40%. The Mars team actually knows what they are doing.'::text,
      5,
      true,
      1
    ),
    (
      'Mehmet Yılmaz',
      'İşletme Sahibi, Fırın 42',
      'Owner, Fırın 42',
      'Google''da ilk sayfaya çıktığımız hafta WhatsApp siparişleri ikiye katlandı. Akşam dükkanı kapattığımızda bile ciro yazmaya devam ediyor.',
      'The week we reached the first page on Google, WhatsApp orders doubled. We keep booking revenue after the shop closes.',
      5,
      true,
      2
    ),
    (
      'Selin Aydın',
      'Satış Direktörü, Onda10 Turizm',
      'Sales Director, Onda10 Turizm',
      'Rezervasyon sayfası yayına girince sezonda doğrudan gelen talepler %35 yükseldi. Aracıya düşen her soru artık bizim formumuza geliyor.',
      'Once the booking page launched, direct inquiries in season rose 35%. Questions that used to go to an intermediary now land on our form.',
      5,
      true,
      3
    ),
    (
      'Kerem Aslan',
      'Kurucu Hekim, Nova Klinik',
      'Founder, Nova Klinik',
      'Randevu sistemi açıldıktan sonraki 30 günde yeni hasta kayıtları belirgin şekilde arttı. Gece bırakılan formlar sabah dolu bir ajandaya dönüyor.',
      'In the 30 days after the appointment system opened, new patient registrations rose sharply. Forms left at night become a full morning schedule.',
      5,
      true,
      4
    ),
    (
      'Ayşe Demir',
      'İletişim Koordinatörü, Atlas Vakfı',
      'Communications Lead, Atlas Vakfı',
      'Bağış sayfası yayına alındıktan sonra online katkılar ilk çeyrekte %28 büyüdü. Kurumsal duruşumuz arama sonucunda da güven veriyor.',
      'After the donation page launched, online contributions grew 28% in the first quarter. Our institutional presence now earns trust in search too.',
      5,
      true,
      5
    ),
    (
      'Deniz Korkmaz',
      'Marka Yöneticisi, Mira Atelier',
      'Brand Manager, Mira Atelier',
      'Katalog sitemiz açılınca toptan talepler mağaza trafiğinin önüne geçti. Gece gelen teklifler sabah siparişe dönüşüyor.',
      'When the catalog site opened, wholesale inquiries overtook store traffic. Quotes that arrive at night turn into orders by morning.',
      5,
      true,
      6
    )
) as v(name, title, title_en, review, review_en, rating, is_verified, sort_order)
where not exists (select 1 from public.testimonials);
