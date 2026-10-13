-- Mars Web Ajans — paket talep formu (leads)
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
-- Tablo zaten varsa yalnızca eksik sütunlar eklenir. Yönetim paneli firma_adi, sektor,
-- adres, telefon ve ai_email alanlarını okumaya devam eder.
--
-- Aşağıdaki erişim, ön yüz formunun ve panelin tarayıcıdaki anon anahtarla
-- yazabilmesi içindir. Paneli herkese açmadan önce kimlik doğrulama ekleyip
-- anon rolünün izinlerini daraltın.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  firma_adi text,
  sektor text,
  adres text,
  telefon text,
  ai_email text,
  ad_soyad text,
  email text,
  paket text,
  proje_notu text,
  project_type text,
  domain_status text,
  budget_range text,
  addons text,
  estimated_total numeric(12, 2),
  status text default 'pending',
  created_at timestamptz not null default now()
);

alter table public.leads
  add column if not exists firma_adi text,
  add column if not exists sektor text,
  add column if not exists adres text,
  add column if not exists telefon text,
  add column if not exists ai_email text,
  add column if not exists ad_soyad text,
  add column if not exists email text,
  add column if not exists paket text,
  add column if not exists proje_notu text,
  add column if not exists project_type text,
  add column if not exists domain_status text,
  add column if not exists budget_range text,
  add column if not exists addons text,
  add column if not exists estimated_total numeric(12, 2),
  add column if not exists status text default 'pending',
  add column if not exists created_at timestamptz default now();

comment on table public.leads is 'Paket seçimi ve teklif formlarından gelen müşteri talepleri.';
comment on column public.leads.ad_soyad is 'Talep eden kişinin adı soyadı';
comment on column public.leads.firma_adi is 'Firma adı';
comment on column public.leads.telefon is 'Telefon numarası';
comment on column public.leads.email is 'E-posta adresi';
comment on column public.leads.paket is 'Seçilen paket (ad ve fiyat)';
comment on column public.leads.proje_notu is 'Proje hakkında kısa bilgi';
comment on column public.leads.sektor is 'Eski kayıtlar için sektör. Yeni paket taleplerinde seçilen paket de burada durur.';
comment on column public.leads.project_type is 'Teklif sihirbazı 1. adım: çözüm tipi (Kurumsal Web Sitesi, E-Ticaret vb.).';
comment on column public.leads.domain_status is 'Teklif sihirbazı 2. adım: alan adı / mevcut site durumu.';
comment on column public.leads.budget_range is 'Teklif sihirbazı 3. adım: bütçe aralığı.';
comment on column public.leads.status is 'Talep durumu: pending (beklemede), accepted (kabul), rejected (red).';

-- Ad soyad, işletme, e-posta ve telefon yeni sütun değildir.
-- Sihirbaz bunları sırasıyla ad_soyad, firma_adi, email ve telefon sütunlarına yazar.

update public.leads
set status = 'pending'
where status is null;

grant select, insert, update, delete on public.leads to anon, authenticated;

alter table public.leads enable row level security;

drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
for insert
to anon, authenticated
with check (true);

drop policy if exists leads_read_all on public.leads;
create policy leads_read_all on public.leads
for select
to anon, authenticated
using (true);

drop policy if exists leads_update_all on public.leads;
create policy leads_update_all on public.leads
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists leads_delete_all on public.leads;
create policy leads_delete_all on public.leads
for delete
to anon, authenticated
using (true);
