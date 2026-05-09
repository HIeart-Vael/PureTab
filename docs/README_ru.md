<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Minimalistichnaia novaia vkladka</h1>


 > Novaia vkladka dolzhna delat tolko odno — otkrytsia, pokazat krasivyi fon i otpravit vas na sleduiushchii sait. Vam deistvitelno nuzhny chasy, privetstvie ili ekran, zabityi bystrymi ssylkami? Otvet PlainTab: predelnoe uproshchenie, maksimalnaia skorost — vernite vashei novoi vkladke ee istinnyi oblik: krasivyi i chistyi.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt_BR.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.4-blue?style=flat-square" alt="Versiia">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licenziia">
  </a>
  <a href="https://plaintab.kaininx.workers.dev">
    <img src="https://img.shields.io/badge/Poprobovat%20onlain-Cloudflare-00c7b7?style=flat-square&logo=cloudflare" alt="Cloudflare">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 Bolshe skrinshotov</b></summary>
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
Otkrytie novoi vkladki — mgnovennoe deistvie: vy nazhimaete `Ctrl+T` i ozhidaete, chto vash fon uzhe tam. Chtoby sdelat eto pravilno, ves dizain PlainTab postroen vokrug odnoi tseli: **pokazat oboi na ekrane kak mozhno bystree**, bez kakogo-libo vidimogo protsessa zagruzki. Dvukhsloinaia arkhitektura, sinkhronnaia predzagruzka, konveier miniatiur cherez Canvas, gibridnaia strategiia khraneniia — kazhdoe tekhnicheskoe reshenie vedet k odnomu i tomu zhe: bystree, plavnee, nezametnee.

PlainTab — eto odnovremenno rasshirenie dlia brauzera na Manifest V3 i nezavisimaia veb-stranitsa. Nol vneshnikh zavisimostei, bez etapa sborki, chistyi vanilla JS + CSS. Rezhim rasshireniia i veb-rezhim ispolzuiut odin i tot zhe kod s avtomaticheskim opredeleniem sredy vypolneniia. [Poprobuitte onlain](https://plaintab.kaininx.workers.dev).

---

## Bystryi start

**Rasshirenie dlia brauzera**: ustanovite iz [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo).

**Onlain-stranitsa**: pereidite na [plaintab.kaininx.workers.dev](https://plaintab.kaininx.workers.dev) i ustanovite ee kak domashniuiu stranitsu v nastroikakh brauzera.

**Lokalnyi zapusk**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

Zagruzite direktoriu v `chrome://extensions` cherez «Zagruzit raspakovannoe rasshirenie». Bez etapa sborki, bez `npm install`.

<details>
<summary><b>🔧 Kak ubrat seruiu polosu vnizu novoi vkladki?</b></summary>

Posle ustanovki rasshireniia Chrome / Edge mozhet pokazyvat nizhnii kolontitul v pravom nizhnem uglu novoi vkladki (s ukazaniem imeni rasshireniia). Eto povedenie brauzera, i PlainTab ne mozhet upravliat im cherez kod.

Chtoby otkliuchit: novaia vkladka → «Nastroit Chrome» ✏️ v pravom nizhnem uglu → Nizhnii kolontitul → otkliuchite «Pokazyvat nizhnii kolontitul na stranitse "Novaia vkladka"». Sm. [ofitsialnuiu spravku Chrome](https://support.google.com/chrome/answer/11032183?hl=ru).

</details>

---

## Naskolko bystry oboi?

Otobrazhenie oboev v PlainTab — eto ne «zagruzka izobrazheniia», a **progressiia po trem vremennym shkalam**, kazhdaia iz kotorykh uluchshaet opyt predydushchei:

| Moment | Chto proiskhodit | Chto vidit polzovatel |
|--------|----------------|----------------------|
| **0ms** (do pervogo kadra) | `preload.js` sinkhronno chitaet miniatiuru base64 iz `localStorage` i zapisyvaet ee napriamuiu v `#wallpaperBack.style.backgroundImage` | Oboi uzhe na meste — ne v HD, no **nikakogo belogo ekrana ili serogo fona** |
| **~300ms** | `loadWallpaper()` chitaet keshirovannyi Blob iz IndexedDB i otobrazhaet ego cherez Blob URL | Oboi v vysokom razreshenii poiavliaiutsia, plavno smeniaia miniatiuru cherez CSS-perekhod opacity |
| **Tolko pri invalidatsii kesha** | Setevoi zapros k Bing API → zagruzka Blob → otobrazhenie → asinkhronnoe keshirovanie v IDB | Polzovat ne zamechaet — predydushchie oboi ostaiutsia na zadnem sloe kak podstrakhovka |

Kazhdaia iz sleduiushchikh tekhnik sluzhit etim trem momentam — libo sokrashchaia vremia, libo ustraniaia vidimye sledy perekhoda.

---

## Tekhnicheskie osobennosti

### Nikakogo belogo ekrana na pervom kadre: dvoinoi sloi + sinkhronnaia predzagruzka

Eto samaia vazhnaia osobennost PlainTab. Pered zagruzkoi izobrazheniia novaia vkladka pokazyvaet tset fona brauzera po umolchaniiu — obychno belyi ekran ili seryi fon. Dva sloia `<div>` polnostiu reshaiut etu problemu:

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0) — vsegda soderzhit vidimoe izobrazhenie. [`preload.js`](../js/preload.js) pomeshchaetsia v `<head>` i vypolniaetsia sinkhronno, zapisyvaia miniatiuru `data: URL` do togo, kak brauzer otrisuet pervyi kadr. Etot shag sinkhronnyi — nikakikh asinkhronnykh API, nikakogo ozhidaniia seti. V rezhime rotatsii neskolkikh izobrazhenii on dazhe znaet, kakoi indeks miniatiury ispolzovat.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`) — ispolzuetsia dlia perekhodov s poiavleniem. Novoe izobrazhenie predvaritelno dekodiruetsia v pamiati cherez [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) → ustanavlivaetsia kak fon perednego sloia → CSS-perekhod [`opacity`](https://developer.mozilla.org/docs/Web/CSS/transition) → posle zaversheniia stabiliziruetsia na zadnem sloe → perednii sloi vozvrashchaetsia k prozrachnosti.

Kliuchevoi printsip: **v liuboi moment vremeni khotia by odin sloi soderzhit otrederennoe izobrazhenie**. Zadnii sloi vsegda imeet chto pokazat; perednii poiavliaetsia lish na vremia perekhoda. Dazhe esli polzovat budet vsmatrivatsia pokadrovo, on ne uvidit pustogo mgnoveniia.

### Ot vvoda k pikseliu: pochemu miniatiura, a ne original?

`preload.js` ne mozhet zhdat asinkhronnoi zagruzki — eto privedet k propusku pervogo kadra. No khranenie iskhodnogo izobrazheniia v IndexedDB asinkhronno, a stroka base64 razmerom v neskolko megabait ne pomeshchaetsia v `localStorage` (ogranichennaia kvota). Poetomu posle otobrazheniia predydushchikh oboev PlainTab **delaet dopolnitelnyi shag**: szhimaet izobrazhenie cherez Canvas v JPEG shirinoi 640px s kachestvom 0.55, obychno uzhimaia do 30–60 KB, i bezopasno sokhraniaet v `localStorage`. Pri sleduiushchem otkrytii novoi vkladki `preload.js` ispolzuet ego napriamuiu.

640px dostatochno chetko na 2K-ekranakh, chtoby ne vygliadet miniatiuroi — a za kontrol nad etimi desiatkami KB stoiat tochnoe masshtabirovanie [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) + nastroika kachestva [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL). Eta miniatiura takzhe iavliaetsia istochnikom dannykh dlia setki galerei 3x4 — sozdaetsia odin raz, ispolzuetsia v dvukh mestakh.

### Dvoinoi `requestAnimationFrame` dlia CSS-perekhoda

Na etape perekhoda ot miniatiury k izobrazheniiu v vysokom razreshenii neobkhodimo initsiirovat CSS-perekhod. No vychislenie stilei i rendering brauzera asinkhronny — esli dobavit klass srazu posle ustanovki `backgroundImage`, brauzer mozhet obrabotat oba sostoianiia v odnom kadre renderinga, i animatsiia perekhoda ne zapustitsia.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

Pervyi [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) garantiruet, chto `backgroundImage` byl vychislen; vtoroi — chto stil otpravlen v konveier renderinga. Tolko posle etogo, pri dobavlenii klassa, brauzer vidit izmenenie «staryi stil → novyi stil» i mozhet korrektno zapustit perekhod. Propustite odin shag — i perekhod budet proignorirovannym: polzovat uvidit rezkuiu smenu vmesto plavnogo poiavleniia.

### Pochemu IndexedDB i localStorage sosushchestvuiut?

Dva khranilishcha — eto ne binarnyi vybor, a razdelenie truda:

| Khranilishche | Chto soderzhit | Pochemu zdes |
|-----------|-------------|--------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | Iskhodnye Blob (Bing daily, zagruzhennye polzovatelem izobrazheniia) | Bolshim failam nuzhna bolshaia kvota; asinkhronnoe chtenie/zapis vpolne priemlemo vne puti pervogo kadra |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | Miniatiury `data: URL`, nastroiki UI, metadannye, indeks rotatsii | **Sinkhronnoe chtenie** — eto kliuchevoi moment. `preload.js` vypolniaetsia do pervogo kadra i ne mozhet zhdat asinkhronnykh kolbekov |

Soedinenie s IDB keshiruetsia kak singlton, avtomaticheski peresozdaetsia pri `onclose`. Blob, poluchennye iz IDB, mogut poteriať MIME type — pri sokhranenii vsegda zapisyvaetsia pole `mime`, a pri izvlechenii ispolzuetsia `new Blob([blob], {type: img.mime})` dlia vosstanovleniia, garantiruja korrektnyi rendering cherez Blob URL.

### Samovosstanovlenie miniatiur

`saveLocalImage()` snachala zapisyvaet v IDB (blob), zatem v localStorage (miniatium). Eti dva shaga ne iavliaiutsia atomarnoi tranzaktsiei — esli stranitsa upadet rovno mezhdu nimi, massiv miniatiur budet na odin element koro che massiva izobrazhenii. PlainTab ne vypolniaet globalnuiu samoproverku pri zapuske (eto maskirovalo by bolee sereznye nesootvetstviia dannykh), a **regeneriruet miniatium na meste** pri rotatsii k izobrazheniiu s otsutstvuiushehei miniatiuroi. Vosstanovlenie proiskhodit tolko kogda oba massiva imeiut odinakovuiu dlinu — raznaia dlina ukazyvaet na neizvestnuiu anomaliu zapisi; propusk — bolee bezopasnyi vybor.

### Zhiznennyi tsikl Blob URL

Vse Blob URL, sozdannye cherez [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) v galeree, otslezhivaiutsia v massive i massovo ochishchaiutsia cherez [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) pri zakrytii galerei. No etot put — zapasnoi: **prioritet odaetsia predvaritelno sgenerirovannym miniatiuram base64**, tak kak base64 ne trebuet sozdaniia/otzyva Blob URL i renderitsia bystree.

### CSS-kastomnye svoistva dlia temy vo vremia vypolneniia

Prozrachnost ikonok (`--icon-opacity`) upravliaetsia cherez JS izmeneniem odnogo [CSS-kastomnogo svoistva](https://developer.mozilla.org/docs/Web/CSS/--*), edinoobrazno kontroliruia vse uglovye knopki i panely — odin `setProperty`, i brauzer avtomaticheski pererisovyvaet vse elementy, ssylaiushchiesia na etu peremennuiu. Dizain-tokeny (`--glass-bg`, `--glass-border`, `--text-primary` i dr.) vse opredeleny v [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root), s perekliucheniem temnoi/svetloi temy cherez media-zapros [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme).

### Matovye stekliannye panely

Panely nastroek i iazyka ispolzuiut [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) dlia razmytiia soderzhimogo oboev **pozadi** paneli — a ne deshevoe reshenie s poluprozrachnoi maskoi. V sochetanii s `--glass-bg: rgba(18, 18, 22, 0.82)` sozdaetsia nastoiashchee oshchushchenie glubiny.

### UI, chuvstvitelnyi k polozheniiu myshi

Uglovye knopki i stroka poiska poiavliaiutsia tolko kogda nuzhno — dve matematicheskie funktsii `isNearTopRight()` i `isInCenter()` opredeliaiut polozhenie myshi bez priviazki `mouseenter`/`mouseleave` na polnoekrannom fone. Skrytie proiskhodit s zaderzhkoi (400ms dlia knopok, 150ms dlia stroki poiska) i propuskaetsia, kogda panel otkryta ili pole vvoda v fokuse. Kazhdyi put vzaimodeistviia maksimalno korotkii: **poiavliatsia bystro, ischezat stabilno**, ne preryvaia polzovatelia sluchainymi srabatyvaniiami.

### Posledovatelnaia tsepochka Promise dlia paketnoi zagruzki

Polzovateli mogut vybrat neskolko lokalnykh izobrazhenii za raz. Kazhdyi `saveLocalImage()` chitaet i zapisyvaet v IDB — parallelnoe vypolnenie privelo by k sostoianiiam gonki. Paketnaia zagruzka ispolzuet posledovatelnuiu tsepochku Promise dlia vsekh operatsii sokhraneniia, zapisyvaia po odnomu izobrazheniiu za raz; pervoe uspeshno sokhranennoe izobrazhenie otobrazhaetsia kak oboi, ostalnye tolko sokhraniaiutsia. Takim obrazom polzovat ne vidit mertsaniia ot mnogokratnoi smeny izobrazhenii.

### `chrome.search.query()` dlia sootvetstviia CWS

V rezhime rasshireniia [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) delegiruet poisk standartnomu poiskovomu dvizhku brauzera — trebovanie politiki edinogo naznacheniia Chrome Web Store. Selektor dvizhka skryt iz DOM, ikonka stanovitsia statichnoi lupoi.

---

## Tekhnologii, ispolzovannye dlia ustraneniia zaderzhek

PlainTab ne ispolzuet nikakikh freimvorkov i bibliotek. Kazhdyi iz sleduiushchikh API byl vybran dlia **ustraneniia odnogo asinkhronnogo ozhidaniia, ustraneniia odnogo vidimogo mertsaniia, sokrashcheniia odnogo kadra zaderzhki**:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — asinkhronno dekodiruet pered ustanovkoi `backgroundImage`, ustraniaia pauzu na dekodirovanie pri pervom kadre. Zagruzka `<img>` ne oznachaet zavershenie dekodirovaniia; bez vyzova `decode()` pri pervoi otrisovke mozhet poiavitsia kratkii pustoi kadr
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — ispolzuet razmytie, sintezirovannoe GPU, vmesto dopolnitelnykh DOM-sloev i izobrazhenii-masok, nulevye dopolnitelnye zatraty na layout
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — blokiruet Dark Reader, predotvrashchaia invertertovanie tsvetov oboev filtrami — oboi iavliaiutsia vizualnym kontentom, i filtratsiia svela by na net usiliia konveiera miniatiur Canvas po sokhraneniiu tochnosti
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — odno obiavlenie zastavliaet brauzer avtomaticheski adaptirovat tsveta form, polos prokrutki i sistemnykh elementov upravleniia, bez neobkhodimosti pisat dva nabora stilei vruchnuiu
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — edinaia krivaia easing dlia vsekh poiavlenii i vsplyvaiushchikh animatsii. Ne `ease` i ne `ease-in-out` — eta krivaia bystree dostigaet tseli v nachale i imeet bolee miagkoe zatukhanie v kontse; dlia razlichii v otklike UI na urovne millisekund raznitsa oshchutima
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — v rezhime rasshireniia poluchaet iazyk UI brauzera, otrazhaia realnoe namerenie polzovatelia tochnee, chem `navigator.language`
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — ne polagaetsia na `setTimeout` dlia ugadyvaniia momenta renderinga, a tochno sinkhroniziruetsia s kadrovym ritmom brauzera. Dvoinoi vyzov garantiruet chetkuiu granitsu kadra mezhdu vychisleniem stilei i ikh otpravkoi
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — Odnovremenno zapuskaet obe konechnye tochki Bing API i ispolzuet otvet toi, kotoraia otvetit pervoi, ustraniaia nuzhnoe ozhidanie
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — Ogranichivaet kazhdyi zapros k Bing API 8 sekundami, chisto preryvaia proigravshee soedinenie vmesto togo, chtoby ostavliat ego viset do taimauta TCP na urovne OS

**Neispolzuemye tekhnologii ne menee vazhny**: nol vneshnikh zavisimostei. Bez React, Tailwind ili instrumentov sborki. CSP v `manifest.json` ogranichivaet `script-src 'self'` — brauzer obespechivaet vypolnenie chistogo vanilla JS. Kazhdaia nevkliuchennaia biblioteka oznachaet menshe vremeni na parsing, menshe setevykh nakladnykh raskhodov, bolee rannii pervyi kadr.

**Font stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` — sistemnye shrifty OS, nol setevykh zaprosov, nol smeshcheniia maketa. Faily shriftov obychno iavliaiutsia odnimi iz samykh bolshikh blokiruiushchikh resursov stranitsy; PlainTab obkhodit vsiu problemu.

---

## Dva rezhima raboty

Odin i tot zhe kod, avtomaticheskoe opredelenie sredy vypolneniia:

| Kharakteristika | Rezhim rasshireniia | Veb-rezhim |
|----------------|------------------|-----------|
| Opredelenie sredy | `chrome.runtime.id` sushchestvuet | Vse ostalnye sluchai |
| Poiskovaia sistema | Po umolchaniiu v brauzere (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo na vybor |
| Perekliuchenie dvizhka | Nedostupno (statichnaia lupa) | Perekliuchenie po kliku na ikonku |
| Razvertyvanie | Chrome Web Store / zagruzka razrabotchikom | Cloudflare Workers / GitHub Pages priamaia publikatsiia |
| CSP | Ukazan v `manifest.json` | Bez CSP |

---

## Prioritet zagruzki oboev

Pri kazhdom otkrytii novoi vkladki poisk samogo bystrogo istochnika oboev proiskhodit v sleduiushchem poriadke:

1. **Lokalnaia rotatsiia** — sobstvennye izobrazheniia polzovatelia (do 12 sht.), Blob uzhe v IDB, priamoi dostup. Miniatiura predvaritelno sgenerirovana. Nulevye setevye zatraty.
2. **Kesh Bing na segodnia** — uzhe poluchennoe segodnia izobrazhenie Bing, Blob v IDB, preobrazuetsia napriamuiu v Blob URL. Nulevye setevye zatraty.
3. **Setevoi zapros k Bing** — set zadeistvuetsia tolko esli dva predydushchikh urovnia nedostupny. Posle polucheniia URL izobrazhenie srazu otobrazhaetsia, odnovremenno asinkhronno zagruzhaetsia Blob v IDB, ustraniaia ozhidanie seti v sleduiushchii raz.

V rezhime lokalnykh oboev izobrazhenie Bing takzhe tikho obnovliaetsia v fone — polzovat mozhet v liuboi moment perekliuchitsia na rezhim Bing bez ozhidaniia seti.

API Bing zapuskaet obe konechnye tochki odnovremenno cherez `Promise.any` s 8-sekundnym taimautom cherez `AbortController` — samyi bystryi otvet pobezhdaet. Nagruzka JSON minimalna, poetomu dopolnitelnyi zapros prakticheski nichego ne stoit, no gonka obespechivaet optimalnuiu zaderzhku nezavisimo ot vashego mestopolozheniia. Kod iazyka (naprimer, `zh-CN`) sopostavliaetsia s rynochnym kodom Bing, nekotorye iazyki perekhodiat na `en-US`.

---

## Internatsionalizatsiia

Podderzhka 16 iazykov: English, 简体中文, 繁體中文, 日本語, 한국어, Español, Russkiĭ, Deutsch, Français, Italiano, Português, हिन्दी, العربية, Türkçe, Polski, Tiếng Việt.

Dve parallelnye sistemy i18n: Chrome `_locales/` otvechaet za metadannye manifesta rasshireniia (vsego dva kliucha: `extName`, `extDesc`), a [`languages.js`](../js/languages.js) upravliaet vsemi strokovymi resursami UI. Prioritet opredeleniia iazyka: iazyk UI Chrome (rezhim rasshireniia) → `navigator.language` (veb-rezhim) → sopostavlenie osnovnogo iazyka → zapasnoi variant English.

Perevod imeet netochnosti ili khotite dobavit novyi iazyk? Fail iazykov — eto vsego lish [`js/languages.js`](../js/languages.js), prostoe key-value sopostavlenie. Vnesite izmeneniia i otpravte PR.

---

## Struktura proekta

```
PlainTab/
├── manifest.json            # Manifest rasshireniia Chrome/Edge (Manifest V3)
├── index.html               # Edinstvennaia HTML-stranitsa (novaia vkladka rasshireniia / veb-glavnaia)
├── 404.html                 # Stranitsa fallback SPA
├── LICENSE                  # Litsenziia MIT
│
├── css/
│   └── newtab.css           # Vse stili: dvoinoi sloi, matovoe steklo, stroka poiska, adaptivnost
│
├── js/
│   ├── preload.js           # Sinkhronnyi IIFE: vstavka miniatiury v zadnii sloi do pervogo kadra
│   ├── languages.js         # Tablitsa UI-strok na 16 iazykakh + spisok iazykov
│   └── newtab.js            # Osnovnaia programma: upravlenie oboiami, i18n, khranilishche, UI, poisk
│
├── _locales/                # i18n Chrome (16 iazykovykh direktorii, tolko dlia manifesta)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # Ikonki rasshireniia (16/48/128/2048 px)
│
├── imgs/                    # Skrinshoty i promo-izobrazheniia
│   ├── chrome_01.jpg ~ chrome_08.jpg  # Skrinshoty funktsii
│   └── small_promo.png      # Maloe promo-izobrazhenie dlia Chrome Web Store
│
├── docs/                    # Mnogoiazychnye README (16 iazykov) + CHANGELOG
│
└── changelog/               # Zhurnaly izmenenii po iazykam
```

- **[`css/`](../css/)** — odin fail ~617 strok, temnaia/svetlaia tema, dizain-tokeny glassmorphism, adaptivnyi breikpoint 480px
- **[`js/`](../js/)** — tri faila, zagruzhaemye po poriadku: `preload.js` → `languages.js` → `newtab.js` (poriadok nelzia meniat)
- **[`_locales/`](../_locales/)** — soderzhit tolko `extName` i `extDesc` dlia manifesta rasshireniia; vse stroki UI upravliaiutsia [`languages.js`](../js/languages.js)
- **[`imgs/`](../imgs/)** — skrinshoty i promo-izobrazheniia, neobkhodimye dlia Chrome Web Store
- **[`docs/`](../docs/)** — mnogoiazychnaia dokumentatsiia, 16 iazykov v otdelnykh failakh

---

## Vklad i litsenziia

Otkrytyi iskhodnyi kod po litsenzii MIT. Nashli bag ili est ideia? → [Otkroite Issue](https://github.com/kaininx/PlainTab/issues); khotite izmenit kod? → Fork + PR.

Neskolko dogovorennostei:
- **Sokhraniaite nulevye zavisimosti** — bez npm-paketov, CDN-skriptov ili freimvorkov
- **Ne dobavliaite etapy sborki** — `index.html` dolzhen rabotat napriamuiu v brauzere
- **Ne rasshiriaite razresheniia** — `manifest.json` soderzhit tolko razreshenie `search`

📋 [Zhurnal izmenenii](changelog.md)

---

## Blagodarnosti

- Ezhednevnye izobrazheniia Bing predostavleny [Bing](https://www.bing.com), spasibo komande Microsoft Bing za mnogoletnee predostavlenie kachestvennykh izobrazhenii
- Proksi API: [bing.biturl.top](https://bing.biturl.top) (publichnyi proksi) i [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (Cloudflare Worker — zapasnoi)
- Oboi na skrinshotakh prinadlezhat ikh avtoram iz interneta

MIT · [Kaelri](https://github.com/kaininx)
