-- Mars Web Ajans — "Sınırlı Kontenjan" sayısı
-- Supabase SQL Editor'da çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
--
-- Kalan proje kontenjanı site_settings tablosunda project_slots anahtarlı satırda tutulur.
-- Bu sayı hero alanındaki rozette ve hesaplayıcıdaki uyarı metninde gösterilir.
-- 0 yazılırsa "Kontenjan Doldu" metni çıkar.
-- Kayıt yoksa veya değer geçersizse site 2 gösterir.
-- Aynı değer yönetim panelinde Genel Ayarlar > "Sınırlı Kontenjan" kartından da düzenlenebilir.
-- Kart, kayıt yoksa ilk kayıtta satırı kendisi oluşturur.

-- 1) Kaydı oluştur (bir kez çalıştırmanız yeterli)
insert into public.site_settings (setting_key, label, value)
values ('project_slots', 'Kalan Proje Kontenjanı', '2')
on conflict (setting_key) do nothing;

-- 2) Kontenjanı güncelle: aşağıdaki sayıyı değiştirip sadece bu satırı çalıştırın
update public.site_settings set value = '2' where setting_key = 'project_slots';

-- 3) Mevcut değeri görüntüle
select value as kalan_kontenjan, updated_at from public.site_settings where setting_key = 'project_slots';
