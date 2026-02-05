# Amazon Image Downloader Chrome Extension

Bu Chrome Eklentisi, Amazon ürün sayfalarındaki görselleri tarar ve yüksek çözünürlüklü olarak indirmenize olanak tanır.
Google Chrome Mağazası standartlarına uygun olarak Manifest V3 ile geliştirilmiştir.

## Özellikler

- **Otomatik Tarama:** Ürün sayfasını açtığınızda görselleri otomatik algılar.
- **Yüksek Çözünürlük:** Küçük resimleri ve zoom halindeki dosyaları analiz edip en yüksek kaliteyi bulur (`_AC_` filtrelerini temizler).
- **Toplu İndirme:** Tek tıkla tüm görselleri indirme imkanı.
- **Seçerek İndirme:** İstenilen görselleri seçip indirme.
- **Modern Arayüz:** Kullanıcı dostu ve şık tasarım.

## Kurulum

1. Bu projeyi bilgisayarınıza indirin/klonlayın.
2. `npm install` komutunu çalıştırarak bağımlılıkları yükleyin (Geliştirme için).
3. Google Chrome'u açın ve `chrome://extensions` adresine gidin.
4. Sağ üst köşedeki **Geliştirici Modu**'nu (Developer Mode) aktif hale getirin.
5. **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
6. Proje klasörünü (`d:/PROJELER/Chrome Extentions/Amazon Image Downloader`) seçin.

## Kullanım

1. Herhangi bir Amazon ürün sayfasına gidin (örn: `www.amazon.co.uk/dp/B08...`).
2. Tarayıcı toolbar'ındaki eklenti simgesine tıklayın.
3. Görseller listelenecektir.
4. İndirmek istediğiniz görselleri seçin veya "Hepsini İndir" butonunu kullanın.

## Geliştirme

- **Testleri Çalıştırma:** `npm test`
- **Lint:** `npm run lint`

## Lisans

ISC
