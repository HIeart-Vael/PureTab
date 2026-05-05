<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logosu" width="80">
</p>

<h1 align="center">PlainTab V3 · Minimal Baslangıc Sayfası</h1>

> **Yeni bir sekme sadece tek bir şey yapmalı:**
> Açılmalı → hosunuza giden bir duvar kagıdı gostermeli → ihtiyacınız olan sayfaya gondermeli.
> Gercekten saate, bir karsılama mesajına ya da kısayollarla dolu bir ekrana ihtiyacınız mı var?
> **PlainTab'ın yanıtı: koklu sadeleştirme. Cift katmanlı duvar kagıdı mimarisiyle sıfırdan yeniden yazım. Sıfır titreme — yeni sekmenizin saf «PLAIN» haline donmesine izin verin.**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.4-blue?style=flat-square" alt="Surum">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Lisans">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Canlı Demo">
  </a>
</p>

<p align="center">
  <strong>Temiz, hızlı ve mudehil olmayan bir baslangıc sayfası ve yeni sekme cozumu.</strong><br>
  Şu adreste canlı: <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · sıfır titreme · dosya boyutu sınırı yok<br>
  Bing Gunluk Duvar Kagıdı · Yerel Gorseller · 16 Dil · Esnek Arama Cubugu · <strong>Gizlilik Once</strong>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" /> 
  <img src="../imgs/chrome_03.jpg" width="45%" />
  <img src="../imgs/chrome_04.jpg" width="45%" /> 
  <img src="../imgs/chrome_05.jpg" width="45%" />
  <img src="../imgs/chrome_06.jpg" width="45%" /> 
  <img src="../imgs/chrome_07.jpg" width="45%" />
  <img src="../imgs/chrome_08.jpg" width="45%" /> 
</div>

---

## 🆕 v3'teki Yenilikler

v3, **sıfırdan tam bir yeniden yazım** ve bir atılım icerir: **sıfır titremeli cift katmanlı duvar kagıdı sistemi**.

<details>
<summary><b>💡 v2 neden titriyordu?</b></summary>

Eski surum, CSS `background-image` gecisiyle tek bir `<div>` kullanıyordu. Kucuk resimden (stil sayfası kuralı) tam gorsele (satır ici stil) gecmek, basamaklı bir değişiklik gerektiriyordu — bu sırada tarayıcı, en az bir kare boyunca işlenmiş arka planı dusurerek gri arka planı ortaya cıkarıyordu.

</details>

**v3'ün cozumu — Cift Katmanlı Bileşim:**
1. `#wallpaperBack` — her zaman gorunur bir goruntu tutar. `preload.js`, tarayıcının ilk boyamasından once eşzamanlı olarak 640px'lik bir kucuk resim yazar
2. `#wallpaperFront` — saydam başlar. Tam goruntu cozuldukten sonra, ustte yavaşca belirir
3. En az bir katmanda her zaman gorunur bir goruntu bulunur → **gri flash yok**

Tam teknik detaylar icin [V3_NOTE.md](./V3_NOTE.md) dosyasına bakın.

---

## ✨ Neden PlainTab?

- 🔒 **Tamamen Temiz Gizlilik** — Hicbir kişisel veri toplanmaz. Tum duvar kagıtları yerel olarak depolanır.
- 🚀 **Bir Dakikada Birleşik Tarama Başlangıcı** — Ana sayfa olarak ayarla + eklentiyi yukle. Eklenti asla ana sayfayı değiştirmeye zorlamaz.
- 🧩 **O kadar hafif ki neredeyse hissetmezsiniz** — Sıfır bağımlılık, saf Vanilla JavaScript, anında başlangıc.
- 🌍 **Kutusundan cıktığı gibi calışır** — Tarayıcı dilini otomatik algılar (16), Google / Bing / Baidu / DuckDuckGo'yu destekler.

---

## 🚀 Denemek Icin Iki Yol

| Yöntem | Acıklama | En Uygunu |
|--------|-------------|----------|
| 🌐 **Cevrimici Başlangıc Sayfası** | [plaintab.netlify.app](https://plaintab.netlify.app) adresini ziyaret edin, tarayıcı ana sayfası olarak ayarlayın | Hicbir şey yuklemeden temiz bir ana sayfa |
| 🧩 **Tarayıcı Eklentisi** | Chrome veya Edge mağazasından yükleyin | Her yeni sekmede minimalist deneyim |

### Tarayıcı Eklentisi · Mağaza Kurulumu
- **Chrome Web Store**: [Yakında]()
- **Edge Add-ons**: [Yakında]()

> 💡 Henüz yayında değil? Geliştirici modunda manuel olarak yükleyin: `chrome://extensions` adresine gidin → **Geliştirici modu**nu etkinleştirin → **Paketlenmemiş öğe yükle** → proje klasörünü seçin

---

## 💡 Geliştirici Tavsiyesi: Üç Duvar Kağıdı, Üç Giriş

Eklentiyi kurdunuz — yeni sekmeniz zaten harika görünüyor. Ama işte bilmeyebileceğiniz bir şey: PlainTab iki yerde daha yayında:

| Giriş | Ayar | URL |
|------|--------|----------|
| 🧩 **Yeni Sekme** | Tarayıcı eklentisi | Bu eklentiyi yükle |
| 🌐 **Başlangıç Sayfası** | Tarayıcı başlatma | `plaintab.netlify.app` |
| 🏠 **Ana Sayfa** | Ana sayfa düğmesi | `kaininx.github.io/PlainTab` |

`plaintab.netlify.app` adresini tarayıcınızın başlangıç sayfası olarak ayarlayın, Bing'in günlük güncellemesini takip etmesine izin verin. Tarayıcıyı her başlattığınızda, bu sizin **ikinci duvar kağıdınızdır**.

Evet, dahası var. Tarayıcınızın görünüm ayarlarında "Ana sayfa düğmesi"ni bulun, `kaininx.github.io/PlainTab` yazın, beğendiğiniz başka bir duvar kağıdı seçin. Artık **üçüncü bir duvar kağıdınız** var.

Üç giriş tamamen birbirinden izoledir. Her birine farklı bir yerel duvar kağıdı verin veya her birinin Bing'in günlük yenilemesini takip etmesine izin verin. Tarayıcıyı başlatın: bir duvar kağıdı. Ana sayfa düğmesine tıklayın: başka bir. Yeni sekme açın: üçüncü bir. Dönüşüm garantili.

**Kurulum:**
1. Eklentiyi kurun → Yeni Sekme ✓
2. Tarayıcı ayarları → Başlangıçta → Belirli bir sayfayı aç → `https://plaintab.netlify.app`
3. Tarayıcı ayarları → Görünüm → Ana sayfa düğmesini göster → `https://kaininx.github.io/PlainTab`

---

## 🛠️ Kullanım

| Eylem | Etki |
|--------|--------|
| Fareyi sağ ust koseye goturmek | Dil / ayarlar simgelerini goster |
| Fareyi ortaya yaklaştırmak | Arama cubugu belirir (uzerine gelme modu) |
| Dişli simgesine tıklamak | Duvar kagıdı ve gelişmiş secenekler panelini ac |
| Küre simgesine tıklamak | Arayuz dilini değiştir |
| Arama motoru simgesine tıklamak | Google → Bing → Baidu → DuckDuckGo arasında geciş yap |
| Arama cubugunda `Enter`a basmak | Mevcut motorla ara |
| `Esc`ye basmak | Tum panelleri kapat |

### Duvar Kagıdı
- **Bing Gunluk**: Gunde bir kez otomatik olarak alınır. Yalnızca bugünün görseli yerel olarak önbelleğe alınır.
- **Yerel Duvar Kagıdı**: Herhangi bir boyuttaki görselleri yukleyin (IndexedDB, **dosya boyutu sınırı yok**). Yalnızca en son yuklenen görsel saklanır. Tek tıklamayla Bing gunluğe sıfırlama.

### Gelişmiş Secenekler
| Secenek | Acıklama |
|---------|----------|
| Arama cubugu modu | Uzerine gelme / Her zaman / Gizli |
| Simge opaklığı | 0 – 1 (varsayılan 0.45) |
| Arama motoru | Google / Bing / Baidu / DuckDuckGo |

> **Chrome Eklentisi vs. Web Sürümü — Arama Farkı:** Chrome Web Store'un "Tek Amaç" politikasına uymak için, eklenti, kullanıcının tarayıcı ayarlarında belirlediği varsayılan arama motoruna saygı duyan Chrome Search API'sini kullanır. Eklenti modunda motor değiştirme özelliği mevcut değildir. Web sürümü (Netlify / GitHub Pages) bu kısıtlamaya tabi değildir ve tam arama motoru seçicisini korur. Arama uygulaması dışında, her iki sürüm de işlevsel olarak aynıdır.

> Tüm ayarlar `localStorage`'da kaydedilir. Hesap yok, bulut senkronizasyonu yok.

---

## 🔧 Yeni Sekme Alt Bilgi Çubuğu

Eklentiyi yükledikten sonra, Chrome / Edge yeni sekme sayfasının sağ alt köşesinde bir alt bilgi (eklenti adını gösteren) gösterir. Bu, tarayıcı davranışıdır, PlainTab'ın eklediği bir şey değildir.

**Nasıl gizlenir ([Chrome Yardım](https://support.google.com/chrome/answer/11032183?hl=tr)'dan):**

Yeni bir sekme açın → sağ alt köşedeki "Chrome'u Özelleştir" ✏️ simgesine tıklayın → Alt bilgi → "Yeni Sekme sayfasında alt bilgiyi göster" seçeneğini kapatın.

---

## 🌐 Cok Dilli Destek

16 yerleşik dil, tarayıcıdan otomatik olarak algılanır, istediğiniz zaman manuel olarak secilebilir:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Katkıda Bulunma

Sorunlar ve Cekme Talepleri (Pull Request) kabul edilir. PlainTab'i minimal tutun — saf JavaScript, derleme adımı yok, bağımlılık yok.

---

## 📄 Lisans

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Teşekkürler

- Bing duvar kagıdı API'leri: [bing.img.run](https://bing.img.run) ve [bing.biturl.top](https://bing.biturl.top)
- Ekran görüntülerindeki bazı duvar kagıtları web'ten alınmıştır — yetenekli her yaratıcıya teşekkürler.

---

<p align="center">
  <sub>Temiz · Hızlı · Reklamsız · Yalnızca sana ait</sub>
</p>
