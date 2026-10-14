-- Supabase Storage Setup for Image Uploads
-- Bu SQL dosyasını Supabase SQL Editor'da çalıştırın

-- 1. 'images' bucket'ını oluştur (varsa hata vermez)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Bucket'ı public yap
UPDATE storage.buckets
SET public = true
WHERE id = 'images';

-- 3. Mevcut policy'leri sil (varsa)
DROP POLICY IF EXISTS "Public Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Images" ON storage.objects;

-- 4. Public okuma izni (herkes görebilir)
CREATE POLICY "Public Images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'images');

-- 5. Anon kullanıcılar için yükleme izni (admin panel custom session kullandığı için)
CREATE POLICY "Anon Upload Images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'images');

-- 6. Anon kullanıcılar için silme izni
CREATE POLICY "Anon Delete Images"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'images');
