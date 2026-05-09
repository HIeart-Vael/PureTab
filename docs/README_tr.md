<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Minimal yeni sekme sayfası</h1>

 > Yeni bir sekme tek bir şeyi iyi yapmalıdır: açılmak, güzel bir duvar kağıdı göstermek ve seni bir sonraki web sayfasına göndermek. Gerçekten bir saate, karşılama mesajına ya da ekranı dolduran kısayol bağlantılarına ihtiyacın var mı? PlainTab'ın cevabı: maksimum sadelik, maksimum hız — yeni sekmeni olması gerektiği gibi, güzel ve temiz haline geri döndür.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt_BR.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.4-blue?style=flat-square" alt="Sürüm">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Lisans">
  </a>
  <a href="https://plaintab.kaininx.workers.dev">
    <img src="https://img.shields.io/badge/Cevrimici_Dene-Cloudflare-00c7b7?style=flat-square&logo=cloudflare" alt="Cloudflare">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 Daha fazla ekran görüntüsü gör</b></summary>
<div align="center">
  <img src="../imgs/chrome_03.jpg" width="45%" />
  <img src="../imgs/chrome_04.jpg" width="45%" />
  <img src="../imgs/chrome_05.jpg" width="45%" />
  <img src="../imgs/chrome_06.jpg" width="45%" />
  <img src="../imgs/chrome_07.jpg" width="45%" />
  <img src="../imgs/chrome_08.jpg" width="45%" />
</div>
</details>

---
Yeni bir sekme açmak anlık bir harekettir — `Ctrl+T`'ye basar ve duvar kağıdının çoktan orada olmasını beklersin. Bunu doğru yapmak için PlainTab'ın tüm tasarımı tek bir hedef etrafında şekillenir: **duvar kağıdını ekranda olabildiğince hızlı göstermek**, hiçbir görünür yükleme süreci olmadan. Çift katmanlı duvar kağıdı mimarisi, senkron ön yükleme, Canvas küçük resim hattı, hibrit depolama stratejisi — tüm teknik kararlar aynı noktada birleşir: daha hızlı, daha akıcı, daha fark edilmez.

PlainTab projesi aynı anda hem bir Manifest V3 tarayıcı uzantısı hem de bağımsız bir Web sayfasıdır. Sıfır harici bağımlılık, derleme adımı yok, saf vanilla JS + CSS. Uzantı modu ve Web modu aynı kod tabanını kullanır, çalışma zamanında ortamı otomatik algılar. [Çevrimiçi dene](https://plaintab.kaininx.workers.dev).

---

## Hızlı başlangıç

**Tarayıcı uzantısı**: [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) adresinden yükleyin.

**Çevrimiçi başlangıç sayfası**: [plaintab.kaininx.workers.dev](https://plaintab.kaininx.workers.dev) adresini ziyaret edin ve tarayıcı ayarlarınızda başlangıç sayfası olarak ayarlayın.

**Yerel çalıştırma**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

Dizini `chrome://extensions` sayfasında "Paketlenmemiş uzantı yükle" ile yükleyin. Derleme adımı yok, `npm install` gerekmez.

<details>
<summary><b>🔧 Yeni sekmenin altındaki gri çubuk nasıl kaldırılır?</b></summary>

Uzantı yüklendikten sonra, Chrome / Edge yeni sekme sayfasının sağ alt köşesinde bir altbilgi gösterir (geçerli uzantı adını belirtir). Bu tarayıcı davranışıdır, PlainTab bunu kodunda kontrol edemez.

Kapatmak için: yeni sekme → sağ alt köşe "Chrome'u Özelleştir" ✏️ → Altbilgi → "Yeni Sekme sayfasında altbilgiyi göster" seçeneğini kapatın. Ayrıntılı bilgi için [Chrome resmi yardımına](https://support.google.com/chrome/answer/11032183?hl=tr) bakın.

</details>

---

## Duvar kağıdı ne kadar hızlı?

PlainTab'ın duvar kağıdı gösterimi bir "resim yüklemek" değil, **üç zaman ölçeğinde ilerleyen** bir süreçtir; her aşama bir öncekinin üzerine deneyimi daha da tamamlar:

| An | Ne oluyor | Kullanıcı ne görüyor |
|------|-----------|-------------|
| **0ms** (ilk kareden önce) | `preload.js`, localStorage'taki base64 küçük resmi senkron olarak okur ve doğrudan `#wallpaperBack.style.backgroundImage`'a yazar | Zaten orada olan bir duvar kağıdı — yüksek çözünürlüklü değil ama **kesinlikle beyaz ekran veya gri zemin yok** |
| **~300ms** | `loadWallpaper()` IndexedDB'den önbelleğe alınmış Blob'u okur ve Blob URL ile gösterir | Yüksek çözünürlüklü duvar kağıdı belirir, CSS opacity geçişiyle küçük resmin yerini alır |
| **Yalnızca önbellek geçersiz olduğunda** | Bing API'sine ağ isteği → Blob indirme → gösterme → IDB'ye asenkron önbellekleme | Kullanıcı fark etmez — önceki duvar kağıdı back katmanında yedek olarak kalır |

Aşağıda açıklanan her teknoloji bu üç ana hizmet eder — ya süreyi kısaltmak ya da görünür geçiş izlerini ortadan kaldırmak için.

---

## Teknik öne çıkanlar

### İlk karede sıfır beyaz ekran: çift katman + senkron ön yükleme

Bu, PlainTab'ın en temel tasarımıdır. Yeni sekme, resim yüklenmeden önce tarayıcının varsayılan arka plan rengini gösterir — genellikle beyaz ekran veya gri zemin. İki `<div>` katmanı bu sorunu tamamen çözer:

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0) — her zaman görünür bir resim tutar. [`preload.js`](../js/preload.js) `<head>` içine yerleştirilir ve senkron olarak çalışır, tarayıcının ilk kareyi çizmesinden önce küçük resim `data:` URL'sini yazar. Bu adım senkrondur — herhangi bir asenkron API'den geçmez, hiçbir ağı beklemez. Çoklu resim döndürme modunda, o an hangi küçük resim indeksini kullanacağını bile bilir.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`) — geçiş efektleri için kullanılır. Yeni resim [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) ile bellekte önceden çözülür → ön katmana arka plan olarak ayarlanır → CSS [`opacity` transition](https://developer.mozilla.org/docs/Web/CSS/transition) ile geçiş yapılır → geçiş tamamlandıktan sonra back katmanına stabilize edilir → front saydam hale döner.

Temel prensip: **herhangi bir anda en az bir katman işlenmiş bir resim içerir**. Back katmanının her zaman gösterecek bir şeyi vardır; front katmanı yalnızca geçiş sırasında kısa bir süre devreye girer. Kullanıcı kare kare izlese bile boş bir an görmez.

### Girdiden piksele: neden orijinal resim değil de küçük resim?

`preload.js` asenkron yüklemeyi bekleyemez — ilk kare kaçırılmış olur. Ancak IndexedDB'deki orijinal resim asenkrondur ve birkaç MB'lık base64 dizesi localStorage'a sığmaz (sınırlı kota). Bu yüzden PlainTab, önceki duvar kağıdını gösterdikten sonra **bir adım daha atar**: Canvas kullanarak resmi 640px genişliğinde JPEG'e dönüştürür, 0,55 kalite, genellikle 30–60 KB sıkıştırma ile, güvenlice localStorage'a kaydeder. Sonraki yeni sekme açıldığında, `preload.js` onu alır ve doğrudan kullanır.

640px, 2K ekranlarda küçük resim olduğu anlaşılmayacak kadar nettir — ve bu birkaç KB'lık boyutun arkasında, [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) ile hassas ölçekleme ve [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL) kalite ayarı vardır. Bu küçük resim aynı zamanda galeri 3×4 ızgarasının da veri kaynağıdır — bir kez oluşturulur, iki yerde kullanılır.

### Çift `requestAnimationFrame` ile CSS geçişlerini yönlendirme

Küçük resimden yüksek çözünürlüklü resme geçiş, CSS transition'ını tetiklemelidir. Ancak tarayıcının stil hesaplaması ve render'ı asenkrondur — `backgroundImage` ayarlandıktan hemen sonra sınıf eklenirse, tarayıcı her iki durumu aynı kare render'ında işleyebilir ve geçiş animasyonu tetiklenmez.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

İlk [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame), `backgroundImage`'ın hesaplandığından emin olur; ikincisi stillerin render hattına gönderildiğini garanti eder. Bu noktada sınıf eklendiğinde, tarayıcı "eski stil → yeni stil" değişimini görür ve doğru geçişi tetikler. Bir kare eksik olursa geçiş atlanır — kullanıcı yumuşak bir geçiş yerine sert bir değişim görür.

### IndexedDB ve localStorage neden birlikte var oluyor?

İki depolama yöntemi birbirinin alternatifi değil, iş bölümü yapar:

| Depolama | Ne içerir | Neden burada |
|------|--------|---------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | Orijinal Blob'lar (Bing günlük duvar kağıdı, kullanıcının yüklediği yerel resimler) | Büyük dosyalar büyük kota gerektirir; asenkron okuma/yazma, ilk kare olmayan yollarda tamamen kabul edilebilir |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | Küçük resim `data:` URL'leri, UI tercihleri, meta veriler, döndürme indeksi | **Senkron okuma** — kritik olan budur. `preload.js` ilk kareden önce çalışır, hiçbir asenkron geri aramayı bekleyemez |

IDB bağlantısı tekil olarak önbelleğe alınır, `onclose` durumunda otomatik olarak yeniden oluşturulur. IDB'den alınan Blob'lar MIME türünü kaybedebilir — `mime` alanı her zaman depolama sırasında kaydedilir ve alınırken `new Blob([blob], {type: img.mime})` ile yeniden oluşturularak Blob URL'nin doğru şekilde işlenmesi sağlanır.

### Küçük resim kendini iyileştirme

`saveLocalImage()` önce IDB'ye (blob), sonra localStorage'a (küçük resim) yazar. İki adım atomik bir işlem değildir — tam arasında sayfa çökerse, küçük resim dizisi resim dizisinden bir eksik olur. PlainTab başlangıçta genel bir kendi kendine kontrol yapmaz (bu daha ciddi veri tutarsızlıklarını gizler), bunun yerine **küçük resmi eksik olan resme sıra geldiğinde anında yeniden oluşturur**. Onarım yalnızca iki dizi aynı uzunluktayken yapılır — uzunluklar eşleşmiyorsa bilinmeyen bir yazma hatası oluşmuştur ve atlamak daha güvenli seçenektir.

### Blob URL yaşam döngüsü

Galeride [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) ile oluşturulan tüm Blob URL'leri bir dizide izlenir ve galeri kapatıldığında [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) ile topluca temizlenir. Ancak bu yol bir fallback'tir — **önceden oluşturulmuş base64 küçük resimler öncelikli olarak kullanılır**, çünkü base64, Blob URL oluşturma/iptal etme gerektirmez ve render'ı daha hızlıdır.

### CSS özel özellikleri ile çalışma zamanı teması

Simge opaklığı (`--icon-opacity`), JS ile bir [CSS özel özelliği](https://developer.mozilla.org/docs/Web/CSS/--*) değiştirilerek tüm köşe düğmeleri ve panellerde tek tip olarak kontrol edilir — tek bir `setProperty` ile tarayıcı, bu değişkene başvuran tüm öğeleri otomatik olarak günceller. Tasarım token'ları (`--glass-bg`, `--glass-border`, `--text-primary` vb.) [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root) üzerinde tanımlanır, koyu/açık tema [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme) medya sorgusu ile değiştirilir.

### Buzlu cam paneller

Ayarlar ve dil panelleri, panelin **arkasındaki** duvar kağıdı içeriğini bulanıklaştırmak için [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) kullanır — yarı saydam maske gibi ucuz bir çözüm değil. `--glass-bg: rgba(18, 18, 22, 0.82)` ile birleşerek gerçek bir derinlik hissi yaratır.

### Fare konumu algılayan UI

Köşe düğmeleri ve arama çubuğu yalnızca ihtiyaç duyulduğunda görünür — `isNearTopRight()` ve `isInCenter()` iki matematiksel fonksiyonu fare konumunu belirler, tam ekran arka plan katmanına `mouseenter`/`mouseleave` bağlamaya gerek kalmaz. Gizleme gecikmelidir (düğmeler 400ms, arama çubuğu 150ms), panel açıkken veya giriş alanı odaklanmışken atlanır. Her etkileşim yolu mümkün olduğunca kısadır: **görünme hızlı, kaybolma kararlı**, yanlış tetiklemeler kullanıcıyı rahatsız etmez.

### Toplu yükleme için seri Promise zinciri

Kullanıcılar aynı anda birden fazla yerel duvar kağıdı seçebilir. Her `saveLocalImage()` IDB'yi okur ve yazar — paralel çalıştırma veri yarışına neden olur. Toplu yükleme, tüm kaydetme işlemlerini serileştirmek için bir Promise zinciri kullanır, her seferinde bir resim yazar. Başarıyla kaydedilen ilk resim duvar kağıdı olarak gösterilir, diğerleri yalnızca depolanır. Böylece kullanıcı sürekli resim değişiminden kaynaklanan titreme görmez.

### `chrome.search.query()` ile CWS uyumluluğu

Uzantı modunda, [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) aramayı tarayıcının varsayılan arama motoruna devreder — Chrome Web Store'un tek amaç politikasına uyumluluk gereğidir. Arama motoru seçici DOM'dan gizlenir, simge statik bir büyütece dönüşür.

---

## Gecikmeyi ortadan kaldırmak için kullanılan teknolojiler

PlainTab herhangi bir framework veya kütüphane kullanmaz. Aşağıdaki her API, **bir asenkron beklemeyi azaltmak, görünür bir titremeyi ortadan kaldırmak veya bir kare gecikmeyi kısaltmak** için seçilmiştir:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — `backgroundImage` ayarlanmadan önce asenkron kod çözme yaparak ilk kare render'ındaki kod çözme duraklamasını önler. `<img>` yüklemesinin tamamlanması kod çözmenin tamamlandığı anlamına gelmez; `decode()` çağrılmazsa ilk çizimde kısa bir boş kare görülebilir
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — ek DOM katmanları ve maske görselleri yerine GPU ile birleştirilmiş bulanıklık kullanır, sıfır ek düzen yükü
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — Dark Reader'ı kilitler, filtrelerinin duvar kağıdı renklerini tersine çevirmesini engeller — duvar kağıdı zaten görsel içeriğin kendisidir, filtre işleme Canvas küçük resim hattının doğruluk çabalarını boşa çıkarır
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — tek bir bildirimle tarayıcının formları, kaydırma çubuklarını ve sistem kontrollerini otomatik olarak uyarlamasını sağlar, iki ayrı stil yazmaya gerek kalmaz
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — tüm solma ve açılma animasyonları için birleşik yumuşatma eğrisi. `ease` veya `ease-in-out` değildir — bu eğri başlangıçta hedefe daha hızlı ulaşır ve sonda daha yumuşak bir azalma gösterir. Milisaniye düzeyindeki UI yanıtları için algısal fark belirgindir
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — uzantı modunda tarayıcı UI dilini alır, `navigator.language`'den daha doğru bir şekilde kullanıcının gerçek niyetini yansıtır
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — render zamanlamasını tahmin etmek için `setTimeout`'a güvenmez, tarayıcının kare ritmine hassas bir şekilde hizalanır. Art arda iki kez kullanımı, stil hesaplaması ve gönderim arasında net bir kare sınırı sağlar
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — Her iki Bing API uç noktasını aynı anda ateşler ve ilk yanıt vereni kullanır, gereksiz beklemeyi ortadan kaldırır
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — Her Bing API isteğini 8 saniyede sınırlar, kaybeden bağlantıyı işletim sistemi seviyesinde TCP zaman aşımına bırakmak yerine temizce sonlandırır

**Kullanılmayan teknolojiler de aynı derecede önemlidir**: sıfır harici bağımlılık. React, Tailwind veya derleme araçları yok. `manifest.json` içindeki CSP, `script-src 'self'` ile sınırlar — tarayıcı saf vanilla JS'yi zorunlu kılar. Eklenmeyen her kütüphane daha az ayrıştırma süresi, daha az ağ yükü ve daha erken bir ilk kare anlamına gelir.

**Font yığını**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` — işletim sistemi yerel fontları, sıfır ağ isteği, sıfır düzen kayması. Font dosyaları genellikle bir sayfanın en büyük bloke edici kaynaklarından biridir; PlainTab tüm sorunu atlar.

---

## İki çalıştırma modu

Aynı kod, çalışma zamanında ortamı otomatik algılama:

| Özellik | Uzantı modu | Web modu |
|------|----------|----------|
| Ortam algılama | `chrome.runtime.id` mevcut | Diğer tüm durumlar |
| Arama motoru | Tarayıcı varsayılanı (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo seçilebilir |
| Motor değiştirme | Değiştirilemez (statik büyüteç) | Simgeye tıklayarak döndürme |
| Dağıtım | Chrome Web Store / geliştirici yüklemesi | Cloudflare Workers / GitHub Pages doğrudan barındırma |
| CSP | `manifest.json` ile bildirilir | CSP gerekmez |

---

## Duvar kağıdı yükleme önceliği

Her yeni sekme açıldığında, mevcut en hızlı duvar kağıdı kaynağı aşağıdaki sırayla aranır:

1. **Yerel duvar kağıdı döndürme** — kullanıcının kendi resimleri (en fazla 12), IDB'de zaten Blob var, doğrudan alınır. Küçük resim önceden oluşturulmuştur. Sıfır ağ yükü.
2. **Bugünün Bing önbelleği** — daha önce bugün alınmış Bing duvar kağıdı, Blob IDB'de, doğrudan Blob URL'ye dönüştürülerek gösterilir. Sıfır ağ yükü.
3. **Bing ağdan alma** — yalnızca önceki iki seviye mevcut değilse ağa gidilir. URL alındıktan hemen sonra gösterilir, Blob asenkron olarak indirilip IDB'ye kaydedilir, bir sonraki sefer için ağ beklemesi ortadan kaldırılır.

Yerel duvar kağıdı modunda, Bing duvar kağıdı arka planda sessizce güncellenir — kullanıcı istediği zaman ağ beklemeye gerek kalmadan Bing moduna geçebilir.

Bing API, `Promise.any` ile her iki uç noktayı aynı anda ateşler, 8 saniyelik `AbortController` zaman aşımı ile — en hızlı yanıt kazanır. JSON yükleri çok küçüktür, bu nedenle ekstra isteğin maliyeti neredeyse sıfırdır, ancak yarış nerede olursanız olun en uygun gecikmeyi sağlar. Dil kodları (örn. `zh-CN`) Bing pazar kodlarına eşlenir, bazı diller `en-US`'e geri döner.

---

## Uluslararasılaştırma

16 dil desteği: 简体中文、繁體中文、English、日本語、한국어、Español、Русский、Deutsch、Français、Italiano、Português、हिन्दी、العربية、Türkçe、Polski、Tiếng Việt.

İki paralel i18n sistemi: Chrome `_locales/` uzantı manifest meta verilerinden sorumludur (yalnızca `extName`, `extDesc` olmak üzere iki anahtar), [`languages.js`](../js/languages.js) ise tüm UI dizelerini yönetir. Dil algılama önceliği: Chrome UI dili (uzantı modu) → `navigator.language` (Web modu) → ana dil eşleşmesi → İngilizce geri dönüş.

Çeviride hata mı var veya yeni bir dil mi eklemek istiyorsunuz? Dil dosyası tek bir dosyadır: [`js/languages.js`](../js/languages.js), saf anahtar-değer eşlemesi. Düzenleyip PR göndermeniz yeterli.

---

## Proje yapısı

```
PlainTab/
├── manifest.json            # Chrome/Edge uzantı manifestosu (Manifest V3)
├── index.html               # Tek HTML sayfası (uzantının yeni sekmesi / Web ana sayfası)
├── 404.html                 # SPA geri dönüş sayfası
├── LICENSE                  # MIT Lisansı
│
├── css/
│   └── newtab.css           # Tüm stiller: çift katman duvar kağıdı, buzlu cam paneller, arama çubuğu, duyarlı
│
├── js/
│   ├── preload.js           # Senkron IIFE: ilk kareden önce back katmanına küçük resim enjekte eder
│   ├── languages.js         # 16 dil için UI dize tablosu + dil listesi
│   └── newtab.js            # Ana program: duvar kağıdı yönetimi, i18n, depolama, UI, arama motoru
│
├── _locales/                # Chrome i18n (16 dil dizini, yalnızca uzantı manifestosu için)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # Uzantı simgeleri (16/48/128/2048 px)
│
├── imgs/                    # Ekran görüntüleri ve tanıtım resimleri
│   ├── chrome_01.jpg ~ chrome_08.jpg  # Özellik ekran görüntüleri
│   └── small_promo.png      # Chrome Web Store küçük tanıtım resmi
│
├── docs/                    # Çok dilli README (16 dil) + CHANGELOG
│
└── changelog/               # Her dil için sürüm güncelleme notları
```

- **[`css/`](../css/)** — tek dosya ~617 satır, koyu/açık tema, buzlu cam tasarım token'ları, 480px duyarlı kesme noktası
- **[`js/`](../js/)** — üç dosya sırayla yüklenir: `preload.js` → `languages.js` → `newtab.js` (sıra değiştirilemez)
- **[`_locales/`](../_locales/)** — yalnızca uzantı manifestosu için `extName` ve `extDesc` içerir; tüm UI dizeleri [`languages.js`](../js/languages.js) tarafından yönetilir
- **[`imgs/`](../imgs/)** — Chrome Web Store için gereken ekran görüntüleri ve tanıtım resimleri
- **[`docs/`](../docs/)** — çok dilli dokümantasyon, 16 dil için ayrı dosyalar

---

## Katkı ve lisans

MIT lisansı ile açık kaynak. Bir hata veya fikir → [Issue açın](https://github.com/kaininx/PlainTab/issues); kod değiştirmek → Fork + PR.

Birkaç kural:
- **Sıfır bağımlılığı koruyun** — npm paketleri, CDN betikleri veya framework'ler eklemeyin
- **Derleme adımı eklemeyin** — `index.html` doğrudan tarayıcıda çalışmalıdır
- **İzin genişletmeyin** — `manifest.json` yalnızca `search` iznini tutar

📋 [Değişiklik günlüğü](changelog.md)

---

## Teşekkürler

- Bing günlük duvar kağıdı görselleri [Bing](https://www.bing.com)'den alınmıştır, Microsoft Bing ekibine yıllardır sağladıkları yüksek kaliteli günlük görseller için teşekkürler
- API proxy: [bing.biturl.top](https://bing.biturl.top) (genel proxy) ve [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (Cloudflare Worker yedeği)
- Ekran görüntülerindeki duvar kağıtları web üzerindeki çeşitli yaratıcılara aittir

MIT · [Kaelri](https://github.com/kaininx)
