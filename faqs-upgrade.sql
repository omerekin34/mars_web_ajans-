-- Mars Web Ajans — SSS yükseltmesi
-- Supabase SQL Editor'da bir kez çalıştırın. Komutlar tekrar çalıştırmaya uygundur.
--
-- 1) faqs tablosuna kategori sütunu ekler. Sitedeki sekmeler bu sütuna göre çalışır.
--    Değerler: pricing (Fiyat & Ödeme), process (Süreç & Teslim),
--              technical (Teknik & SEO), support (Teslim Sonrası). Boş bırakılırsa soru yalnızca "Tümü" sekmesinde görünür.
-- 2) DİKKAT: Mevcut tüm SSS kayıtlarını siler ve paketlerle tutarlı, yeniden yazılmış 16 soruyu (TR + EN) ekler.
--    Sonradan her şeyi yönetim panelinden değiştirebilirsiniz.

alter table public.faqs
  add column if not exists category text;

alter table public.faqs drop constraint if exists faqs_category_valid;
alter table public.faqs add constraint faqs_category_valid
  check (category is null or category in ('pricing', 'process', 'technical', 'support'));

comment on column public.faqs.category is 'Kategori: pricing, process, technical, support. Boşsa yalnızca "Tümü" sekmesinde görünür.';

delete from public.faqs;

insert into public.faqs (category, sort_order, question, answer, question_en, answer_en) values

-- ---------------------------------------------------------------------------
-- Fiyat & Ödeme
-- ---------------------------------------------------------------------------
(
  'pricing', 1,
  'Fiyatlara neler dahil? Sonradan sürpriz bir masraf çıkar mı?',
  'Paketlerimiz anahtar teslimdir: tasarım, kodlama, kurulum, ilk yıl alan adı (domain), hosting ve SSL sertifikası fiyata dahildir. Çalışmaya başlamadan önce kapsamı ve fiyatı yazılı olarak netleştiririz; onayınız olmadan tek kuruşluk ek kalem çıkmaz. İkinci yıldan itibaren yalnızca standart alan adı ve sunucu yenileme ücretini ödersiniz.',
  'What is included in the price? Will there be surprise costs later?',
  'Our packages are turnkey: design, development, setup, and the first year of domain, hosting, and SSL certificate are all included. Before any work begins, we put the scope and price in writing; nothing extra is ever added without your approval. From the second year on, you only pay standard domain and hosting renewal fees.'
),
(
  'pricing', 2,
  'Ödemeyi nasıl yapıyoruz? Taksit imkânı var mı?',
  'Süreç %50 ön ödemeyle başlar, kalan %50 siteniz onayınızla yayına alınırken ödenir. Banka havalesi/EFT ya da 3D Secure korumalı altyapımız üzerinden kredi kartıyla ödeme yapabilir, kartınıza uygun taksit seçeneklerinden yararlanabilirsiniz. Fiyatlarımıza KDV dahil değildir; tüm ödemeler için fatura düzenlenir.',
  'How does payment work? Do you offer installments?',
  'We start with a 50% upfront payment, and the remaining 50% is due when your site goes live with your approval. You can pay by bank transfer or by credit card through our 3D Secure infrastructure, with installment options available depending on your card. Prices exclude VAT, and an invoice is issued for every payment.'
),
(
  'pricing', 3,
  'Teklif almak veya ön görüşme yapmak ücretli mi?',
  'Hayır, tamamen ücretsiz ve bağlayıcı değildir. İşletmenizi ve rakiplerinizi inceler, size en geç bir iş günü içinde yazılı kapsam, sabit fiyat ve net teslim tarihi içeren bir teklif göndeririz. Teklifi inceleyip karar vermek tamamen size kalır.',
  'Is getting a quote or a first consultation paid?',
  'No, it is completely free and non-binding. We review your business and competitors, then send you a written proposal with the scope, a fixed price, and a clear delivery date within one business day. Whether you move forward is entirely up to you.'
),

-- ---------------------------------------------------------------------------
-- Süreç & Teslim
-- ---------------------------------------------------------------------------
(
  'process', 4,
  'Web sitem ne kadar sürede yayına girer?',
  'Süre seçtiğiniz pakete göre bellidir: Dijital Kartvizit 5 iş günü, Kurumsal Vitrin 10–14 iş günü, E-Ticaret Makinesi 21–30 iş günü. Teslim tarihi teklifte yazılı olarak belirtilir. Süre, içeriklerinizin (logo, metin, görsel) bize ulaştığı gün başlar; süreç boyunca her aşamada sizi bilgilendiririz.',
  'How long until my website goes live?',
  'Timelines are fixed per package: Digital Business Card takes 5 business days, Corporate Showcase 10–14 business days, and E-Commerce Engine 21–30 business days. The delivery date is stated in writing in your proposal. The clock starts once we receive your content (logo, text, images), and we keep you updated at every stage.'
),
(
  'process', 5,
  'Süreç boyunca benden neler istenecek? İçerikleri kim hazırlıyor?',
  'Sizden yalnızca kısa bir tanışma görüşmesi, varsa logonuz, firmanızı anlatan temel bilgiler ve ürün/hizmet görselleriniz istenir. Metin yazmakla uğraşmak istemezseniz profesyonel metin yazımını, logonuz yoksa logo tasarımını ek hizmet olarak üstlenebiliriz. Eksik görselleri telifsiz, kaliteli stok görsellerle tamamlarız.',
  'What will you need from me? Who prepares the content?',
  'All we need is a short kickoff call, your logo if you have one, the basics about your business, and photos of your products or services. If you would rather not write the copy, we can take on professional copywriting, and if you have no logo, logo design, both as add-on services. Any missing images are filled with high-quality, royalty-free stock photos.'
),
(
  'process', 6,
  'Tasarımı beğenmezsem ne olur? Revizyon hakkım var mı?',
  'Kodlamaya geçmeden önce tasarım yönünü sizinle birlikte netleştirir ve onayınızı alırız; bu sayede sürprizle karşılaşmazsınız. Onaydan sonra Dijital Kartvizit''te 1, Kurumsal Vitrin''de 3 revizyon turu hakkınız vardır. Yazı, renk, görsel ve yerleşim değişikliklerini bu turlarda tek seferde toplu olarak iletebilirsiniz.',
  'What if I don''t like the design? Do I get revisions?',
  'Before any coding starts, we define the design direction together and get your approval, so there are no surprises. After approval, you get 1 revision round with Digital Business Card and 3 with Corporate Showcase. You can send all text, color, image, and layout changes together in each round.'
),
(
  'process', 7,
  'Hazır şablon mu kullanıyorsunuz, yoksa tasarım bana özel mi?',
  'Tasarımı işletmenize, sektörünüze ve hedef müşterinize göre sıfırdan kurguluyoruz; binlerce sitede kullanılan hazır temalar kullanmıyoruz. Siteniz Next.js gibi modern bir altyapıyla, gereksiz eklenti yükü olmadan kodlanır. Sonuç: rakiplerinizden ayrışan, hızlı ve güvenli bir site.',
  'Do you use ready-made templates, or is the design custom?',
  'We design from scratch around your business, industry, and target customers; we do not use themes shared by thousands of other sites. Your site is built on a modern stack like Next.js, without bloated plugins. The result is a fast, secure website that stands apart from your competitors.'
),

-- ---------------------------------------------------------------------------
-- Teknik & SEO
-- ---------------------------------------------------------------------------
(
  'technical', 8,
  'Sitem Google''da üst sıralara çıkacak mı?',
  'Hiçbir dürüst ajans "1. sıra" garantisi veremez; sıralama rekabete, içeriğe ve zamana bağlıdır. Bizim garantimiz, Google''ın sevdiği altyapıyı eksiksiz kurmaktır: yüksek hız, mobil uyum, doğru başlık ve açıklamalar, site haritası, Search Console kaydı ve Google İşletme Profili. Bu temel, özellikle "şehir + hizmet" aramalarında öne çıkmanız için en güçlü başlangıçtır.',
  'Will my site rank at the top of Google?',
  'No honest agency can guarantee the number one spot; rankings depend on competition, content, and time. What we guarantee is a complete, Google-friendly foundation: high speed, mobile optimization, proper titles and descriptions, a sitemap, Search Console setup, and a Google Business Profile. That foundation is the strongest start for showing up in local "city + service" searches.'
),
(
  'technical', 9,
  'Sitem telefonda düzgün görünecek mi, hızlı açılacak mı?',
  'Evet. Ziyaretçilerin büyük çoğunluğu telefondan geldiği için tasarıma mobilden başlıyoruz; tüm ekran boyutlarında yazılar, butonlar ve görseller net görünür. Görseller otomatik olarak sıkıştırılır ve siteniz Google PageSpeed testinde 90+ skor hedefiyle optimize edilir.',
  'Will my site look right on phones and load fast?',
  'Yes. Since most visitors arrive on mobile, we design mobile-first; text, buttons, and images stay sharp on every screen size. Images are compressed automatically, and your site is optimized to target a 90+ score on Google PageSpeed.'
),
(
  'technical', 10,
  'Mevcut bir sitem ve alan adım var. Yenilerken Google sıralamamı kaybeder miyim?',
  'Hayır. Mevcut alan adınızı koruyarak yeni sitenizi onun üzerine kurarız. Eski sayfalarınızı yeni adreslerine 301 yönlendirmesiyle bağlar, Google''daki mevcut değerinizin yeni siteye aktarılmasını sağlarız. Geçiş, sitenizin kapalı kalmayacağı şekilde planlanır.',
  'I already have a website and domain. Will I lose my Google rankings when redesigning?',
  'No. We keep your existing domain and build the new site on it. Old pages are mapped to their new URLs with 301 redirects so the value you have built on Google carries over. The switch is planned so your site never goes offline.'
),
(
  'technical', 11,
  'Kurumsal e-posta adresi (info@firmaniz.com) kuruyor musunuz?',
  'Evet. Tüm paketlerde alan adınıza bağlı kurumsal e-posta yönlendirmesi kurulur; info@firmaniz.com adresine gelen postalar mevcut e-posta kutunuza düşer. Tam teşekküllü bir kurumsal posta kutusu isterseniz Google Workspace veya Microsoft 365 kurulumunda da yardımcı oluruz; lisans ücretini doğrudan sağlayıcıya ödersiniz.',
  'Do you set up a business email address (info@yourcompany.com)?',
  'Yes. Every package includes business email forwarding on your domain, so mail sent to info@yourcompany.com lands in your existing inbox. If you want a full business mailbox, we can help set up Google Workspace or Microsoft 365; you pay the license fee directly to the provider.'
),
(
  'technical', 12,
  'KVKK ve çerez metinleri hazırlanıyor mu? Sitem yasal olarak uyumlu olacak mı?',
  'Kurumsal Vitrin ve E-Ticaret Makinesi paketlerinde KVKK aydınlatma metni, gizlilik ve çerez politikası şablonları hazır gelir; e-ticarette buna mesafeli satış sözleşmesi de eklenir. Metinleri şirket bilgilerinize göre doldururuz. Hukuki son kontrolün avukatınız veya mali müşavirinizce yapılmasını öneririz.',
  'Do you prepare privacy and cookie policies? Will my site be legally compliant?',
  'Corporate Showcase and E-Commerce Engine come with ready-made templates for the KVKK notice, privacy policy, and cookie policy, plus a distance sales agreement for online stores. We fill them in with your company details. We recommend a final legal review by your lawyer or accountant.'
),

-- ---------------------------------------------------------------------------
-- Teslim Sonrası
-- ---------------------------------------------------------------------------
(
  'support', 13,
  'Site yayına girdikten sonra teknik destek veriyor musunuz?',
  'Evet. Kurumsal Vitrin''de 30 gün, E-Ticaret Makinesi''nde 60 gün ücretsiz teknik destek sağlıyoruz. Bu süreden sonra güvenlik güncellemeleri, yedekleme ve küçük içerik değişikliklerini kapsayan yıllık bakım paketimizle sitenizi sizin yerinize takip edebiliriz. Bize her zaman WhatsApp üzerinden doğrudan ulaşabilirsiniz.',
  'Do you provide technical support after launch?',
  'Yes. We provide 30 days of free technical support with Corporate Showcase and 60 days with E-Commerce Engine. After that, our yearly care plan covers security updates, backups, and small content changes so we keep an eye on your site for you. You can always reach us directly on WhatsApp.'
),
(
  'support', 14,
  'Sitedeki bilgileri sonradan kendim güncelleyebilir miyim?',
  'Evet. Kurumsal Vitrin ve E-Ticaret Makinesi paketleri, kod bilgisi gerektirmeyen Türkçe bir yönetim paneliyle gelir. Telefon, fiyat, metin, görsel, ürün ve blog yazılarını birkaç tıkla kendiniz güncellersiniz. Teslimde paneli nasıl kullanacağınızı birebir gösteririz; küçük bir değişiklik için ajans beklemezsiniz.',
  'Can I update the site content myself later?',
  'Yes. Corporate Showcase and E-Commerce Engine come with an easy admin panel that requires no coding. You can update phone numbers, prices, text, images, products, and blog posts in a few clicks. We walk you through the panel at handover, so you never wait on an agency for a small change.'
),
(
  'support', 15,
  'Web sitesinin tüm hakları bana mı ait olacak? Size bağımlı kalır mıyım?',
  'Ödemesi tamamlanan projede alan adı, tasarım, içerik ve kaynak kodun tüm hakları %100 sizindir. Alan adınız sizin adınıza kaydedilir ve yönetim bilgileri size teslim edilir. Dilediğiniz zaman sitenizi başka bir sunucuya taşıyabilir veya farklı bir ekiple çalışabilirsiniz; sizi sözleşmeyle bağlamayız.',
  'Will I own all rights to the website? Will I be locked in?',
  'Once the project is paid in full, you own 100% of the rights to the domain, design, content, and source code. Your domain is registered in your name and all access details are handed over to you. You can move your site to another host or work with a different team at any time; we never lock you in with contracts.'
),
(
  'support', 16,
  'İleride siteme yeni özellikler ekletebilir miyim?',
  'Elbette. Siteniz büyümeye hazır bir altyapıyla kurulur; online randevu, ikinci dil, blog, e-ticaret, pazaryeri (Trendyol, Hepsiburada) veya e-Fatura entegrasyonu gibi özellikleri sonradan ekleyebiliriz. Her eklenti için önceden yazılı fiyat ve süre veririz; sitenizi baştan yaptırmanız gerekmez.',
  'Can I add new features to my site later?',
  'Absolutely. Your site is built on a foundation ready to grow; we can later add online booking, a second language, a blog, e-commerce, marketplace (Trendyol, Hepsiburada), or e-invoice integrations. Each addition comes with a written price and timeline upfront, and you never need to rebuild your site from scratch.'
);
