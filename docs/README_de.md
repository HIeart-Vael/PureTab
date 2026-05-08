<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Minimalistische neue Tab-Seite</h1>


 > Ein neuer Tab sollte nur eines tun — geoffnet werden, ein schones Hintergrundbild zeigen und dich zur nachsten Seite bringen. Brauchst du wirklich eine Uhr, eine Begrußung oder einen Bildschirm voller Schnellzugriffe? Die Antwort von PlainTab: maximale Reduktion, hochste Geschwindigkeit — mach deinen neuen Tab wieder zu dem, was er sein sollte: schon und sauber.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Lizenz">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Online%20testen-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 Weitere Screenshots anzeigen</b></summary>
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
Einen neuen Tab zu offnen ist eine Augenblickshandlung — du druckst `Ctrl+T` und erwartest, dass dein Hintergrundbild bereits da ist. Um das richtig zu machen, ist das gesamte Design von PlainTab auf ein Ziel ausgerichtet: **das Hintergrundbild so schnell wie moglich auf dem Bildschirm erscheinen zu lassen**, ohne sichtbaren Ladevorgang. Zweischichtarchitektur, synchrones Vorladen, Canvas-Miniaturbild-Pipeline, hybride Speicherstrategie — jede technische Entscheidung fuhrt zum selben Ziel: schneller, flussiger, unbemerkter.

PlainTab ist sowohl eine Manifest-V3-Browsererweiterung als auch eine eigenstandige Webseite. Null externe Abhangigkeiten, kein Build-Schritt, reines Vanilla-JS + CSS. Der Erweiterungsmodus und der Webmodus teilen sich denselben Code mit automatischer Umgebungserkennung zur Laufzeit. [Online testen](https://plaintab.netlify.app).

---

## Schnellstart

**Browser-Erweiterung**: installieren aus dem [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo).

**Online-Startseite**: besuche [plaintab.netlify.app](https://plaintab.netlify.app) und lege sie in den Browsereinstellungen als Startseite fest.

**Lokale Ausfuhrung**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

Lade das Verzeichnis in `chrome://extensions` uber „Entpackte Erweiterung laden". Kein Build-Schritt, kein `npm install`.

<details>
<summary><b>🔧 Wie entferne ich die graue Leiste am unteren Rand des neuen Tabs?</b></summary>

Nach der Installation der Erweiterung zeigt Chrome / Edge moglicherweise eine Fußzeile in der unteren rechten Ecke des neuen Tabs an (mit dem Namen der Erweiterung). Dies ist ein Browserverhalten, das PlainTab nicht uber Code steuern kann.

Zum Deaktivieren: neuer Tab → „Chrome anpassen" ✏️ unten rechts → Fußzeile → deaktiviere „Fußzeile auf der Seite 'Neuer Tab' anzeigen". Siehe die [offizielle Chrome-Hilfe](https://support.google.com/chrome/answer/11032183?hl=de).

</details>

---

## Wie schnell ist das Hintergrundbild?

Die Anzeige des Hintergrundbilds in PlainTab ist kein „Bild laden", sondern **eine Progression uber drei Zeitskalen**, von denen jede die Erfahrung der vorherigen verbessert:

| Zeitpunkt | Was passiert | Was der Benutzer sieht |
|-----------|-------------|------------------------|
| **0ms** (vor dem ersten Frame) | `preload.js` liest synchron das Base64-Miniaturbild aus dem `localStorage` und schreibt es direkt in `#wallpaperBack.style.backgroundImage` | Ein Hintergrundbild, das bereits da ist — nicht in HD, aber **kein weißer Bildschirm oder grauer Hintergrund** |
| **~300ms** | `loadWallpaper()` liest den gecacheten Blob aus IndexedDB und zeigt ihn uber eine Blob-URL an | Das HD-Hintergrundbild erscheint und lost das Miniaturbild sanft uber einen CSS-opacity-Ubergang ab |
| **Nur bei Cache-Ungultigkeit** | Netzwerkanfrage an die Bing-API → Blob herunterladen → anzeigen → asynchron in IDB cachen | Der Benutzer merkt nichts — das vorherige Hintergrundbild bleibt auf der Ruckebene als Absicherung |

Jede der folgenden Techniken dient diesen drei Zeitpunkten — entweder durch Zeitverkurzung oder durch Beseitigung sichtbarer Ubergangsspuren.

---

## Technische Highlights

### Kein weißer Bildschirm beim ersten Frame: Doppelschicht + synchrones Vorladen

Dies ist das zentrale Designmerkmal von PlainTab. Bevor das Bild geladen ist, zeigt ein neuer Tab die Standard-Hintergrundfarbe des Browsers an — normalerweise einen weißen Bildschirm oder grauen Hintergrund. Zwei `<div>`-Schichten losen dieses Problem vollstandig:

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0) — enthalt immer ein sichtbares Bild. [`preload.js`](../js/preload.js) wird in den `<head>` gesetzt und synchron ausgefuhrt, wobei das Miniaturbild als `data: URL` geschrieben wird, bevor der Browser den ersten Frame zeichnet. Dieser Schritt ist synchron — keine asynchronen APIs, kein Warten auf das Netzwerk. Im Rotationsmodus mehrerer Bilder weiß es sogar, welcher Index des Miniaturbilds zu verwenden ist.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`) — wird fur Einblendubergange verwendet. Das neue Bild wird uber [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) im Speicher vordekodiert → als Hintergrund der vorderen Schicht gesetzt → CSS-[`opacity`-Ubergang](https://developer.mozilla.org/docs/Web/CSS/transition) → nach Abschluss auf der Ruckebene stabilisiert → vordere Schicht wird auf transparent zuruckgesetzt.

Kernprinzip: **Zu jeder Zeit halt mindestens eine Schicht ein gerendertes Bild**. Die Ruckebene hat immer etwas anzuzeigen; die vordere Schicht kommt nur wahrend des Ubergangs kurz zum Einsatz. Selbst wenn der Benutzer Frame fur Frame hinsieht, wird er keinen leeren Augenblick sehen.

### Vom Input zum Pixel: Warum Miniaturbild statt Original?

`preload.js` kann nicht auf asynchrones Laden warten — das wurde den ersten Frame verpassen. Aber das Speichern des Originalbilds in IndexedDB ist asynchron, und ein mehrere MB großer Base64-String passt nicht in den `localStorage` (begrenztes Kontingent). Also macht PlainTab nach der Anzeige des vorherigen Hintergrundbilds **einen zusatzlichen Schritt**: das Bild wird uber Canvas auf 640px Breite als JPEG mit Qualitat 0.55 skaliert, typischerweise auf 30–60 KB komprimiert und sicher im `localStorage` gespeichert. Beim nachsten Offnen eines neuen Tabs verwendet `preload.js` es direkt.

640px ist auf 2K-Bildschirmen scharf genug, um nicht wie ein Miniaturbild auszusehen — und hinter der Kontrolle dieser wenigen Kilobyte stehen die prazise Skalierung der [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) + die Qualitatseinstellung von [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL). Dieses Miniaturbild dient auch als Datenquelle fur das 3x4-Raster der Galerie — einmal generiert, zweifach genutzt.

### Doppelter `requestAnimationFrame` fur CSS-Ubergange

Beim Ubergang vom Miniaturbild zum HD-Bild muss der CSS-Ubergang ausgelost werden. Aber die Stilberechnung und das Rendern des Browsers sind asynchron — wenn die Klasse unmittelbar nach dem Setzen des `backgroundImage` hinzugefugt wird, konnte der Browser beide Zustande im selben Render-Frame verarbeiten, und die Ubergangsanimation wurde nicht ausgelost.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

Der erste [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) stellt sicher, dass `backgroundImage` berechnet wurde; der zweite, dass der Stil an die Rendering-Pipeline ubergeben wurde. Erst dann, beim Hinzufugen der Klasse, sieht der Browser die Anderung von „altem Stil zu neuem Stil" und kann den Ubergang korrekt auslosen. Fehlt ein Schritt, wird der Ubergang ubersprungen — der Benutzer sieht einen harten Wechsel statt einer sanften Einblendung.

### Warum koexistieren IndexedDB und localStorage?

Die beiden Speicher sind keine binare Wahl, sondern eine Arbeitsteilung:

| Speicher | Was er enthalt | Warum hier |
|----------|---------------|------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | Original-Blobs (Bing-Tagesbild, vom Benutzer hochgeladene Bilder) | Große Dateien brauchen großes Kontingent; asynchrones Lesen/Schreiben ist außerhalb des Erst-Frame-Pfads vollkommen akzeptabel |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | Miniaturbilder als `data: URL`, UI-Einstellungen, Metadaten, Rotationsindex | **Synchrons Lesen** — das ist der entscheidende Punkt. `preload.js` wird vor dem ersten Frame ausgefuhrt und kann nicht auf asynchrone Callbacks warten |

Die IDB-Verbindung wird als Singleton gecached und bei `onclose` automatisch neu erstellt. Aus IDB abgerufene Blobs konnen ihren MIME-Typ verlieren — beim Speichern wird immer das Feld `mime` aufgezeichnet, und beim Abrufen wird `new Blob([blob], {type: img.mime})` zur Wiederherstellung verwendet, um eine korrekte Darstellung uber Blob-URL sicherzustellen.

### Selbstheilung von Miniaturbildern

`saveLocalImage()` schreibt zuerst in IDB (Blob), dann in localStorage (Miniaturbild). Diese beiden Schritte sind keine atomare Transaktion — wenn die Seite genau dazwischen absturzt, ist das Miniaturbild-Array um einen Eintrag kurzer als das Bilder-Array. PlainTab fuhrt beim Start keine globale Selbstprufung durch (das wurde schwerwiegendere Dateninkonsistenzen uberdecken), sondern **regeneriert das Miniaturbild direkt**, wenn die Rotation auf das Bild mit fehlendem Miniaturbild stößt. Die Reparatur erfolgt nur, wenn beide Arrays die gleiche Lange haben — unterschiedliche Langen weisen auf eine unbekannte Schreibanomalie hin; uberspringen ist die sicherere Wahl.

### Lebenszyklus von Blob-URLs

Alle uber [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) in der Galerie erstellten Blob-URLs werden in einem Array verfolgt und beim Schließen der Galerie uber [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) massenhaft bereinigt. Aber dieser Weg ist ein Fallback — **vorgenerierte Base64-Miniaturbilder haben Prioritats**, da Base64 keine Erstellung/Widerrufung von Blob-URLs erfordert und schneller rendert.

### CSS-Benutzerdefinierte Eigenschaften fur Laufzeit-Theme

Die Symboldurchsichtigkeit (`--icon-opacity`) wird uber JS durch Andern einer [CSS-benutzerdefinierten Eigenschaft](https://developer.mozilla.org/docs/Web/CSS/--*) gesteuert und kontrolliert einheitlich alle Eckenschaltflachen und Panels — ein `setProperty`, und der Browser zeichnet automatisch alle Elemente neu, die diese Variable referenzieren. Die Design-Tokens (`--glass-bg`, `--glass-border`, `--text-primary` usw.) sind alle in [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root) definiert, mit Umschaltung zwischen Dunkel-/Hell-Theme uber die Media-Query [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme).

### Glas-Morphismus-Panels

Die Einstellungs- und Sprachpanels verwenden [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter), um den Hintergrund **hinter** dem Panel unscharf zu machen — keine billige Losung mit halbtransparenter Maske. In Kombination mit `--glass-bg: rgba(18, 18, 22, 0.82)` entsteht ein echtes Tiefengefuhl.

### Mauspositionserkennung fur die UI

Die Eckenschaltflachen und die Suchleiste erscheinen nur bei Bedarf — zwei mathematische Funktionen `isNearTopRight()` und `isInCenter()` bestimmen die Mausposition, ohne `mouseenter`/`mouseleave` an den Vollbildhintergrund binden zu mussen. Das Ausblenden erfolgt verzogert (400ms fur Schaltflachen, 150ms fur die Suchleiste) und wird ubersprungen, wenn ein Panel geoffnet oder das Eingabefeld fokussiert ist. Jeder Interaktionspfad ist so kurz wie moglich: **erscheinen schnell, verschwinden stabil**, ohne den Benutzer durch versehentliche Auslosungen zu storen.

### Serielle Promise-Kette fur Batch-Upload

Benutzer konnen mehrere lokale Bilder auf einmal auswahlen. Jeder `saveLocalImage()` liest und schreibt in IDB — parallele Ausfuhrung wurde zu Wettlaufsituationen fuhren. Batch-Uploads verwenden eine serielle Promise-Kette fur alle Speichervorgange, wobei jeweils nur ein Bild geschrieben wird; das erste erfolgreich gespeicherte Bild wird als Hintergrundbild angezeigt, die ubrigen werden nur gespeichert. So sieht der Benutzer kein Flackern durch wiederholte Bildwechsel.

### `chrome.search.query()` fur CWS-Konformitat

Im Erweiterungsmodus delegiert [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) die Suche an die Standardsuchmaschine des Browsers — eine Anforderung der Einzweckrichtlinie des Chrome Web Store. Der Suchmaschinenwahler wird aus dem DOM ausgeblendet und das Symbol wird zu einer statischen Lupe.

---

## Technologien zur Beseitigung von Latenz

PlainTab verwendet keine Frameworks oder Bibliotheken. Jede der folgenden APIs wurde ausgewahlt, um **eine asynchrone Wartezeit zu vermeiden, ein sichtbares Flackern zu beseitigen, eine Frame-Verzogerung zu reduzieren**:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — dekodiert asynchron vor dem Setzen des `backgroundImage` und vermeidet so die Dekodierungspause beim ersten Frame. Das Laden von `<img>` bedeutet nicht, dass die Dekodierung abgeschlossen ist; ohne `decode()` kann beim ersten Rendern ein kurzer leerer Frame erscheinen
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — verwendet GPU-synthetisierte Unscharke anstelle zusatzlicher DOM-Ebenen und Maskenbilder, keine zusatzlichen Layoutkosten
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — sperrt Dark Reader und verhindert, dass es die Hintergrundbildfarben mit Filtern umkehrt — das Hintergrundbild ist visueller Inhalt, und eine Filterung wurde die Treue der Canvas-Miniaturbild-Pipeline zunichtemachen
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — eine einzige Deklaration lasst den Browser die Farben von Formularen, Scrollleisten und Systemsteuerelementen automatisch anpassen, ohne dass zwei Stilsatze manuell geschrieben werden mussen
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — einheitliche Easing-Kurve fur alle Einblend- und Pop-in-Animationen. Nicht `ease` oder `ease-in-out` — diese Kurve erreicht das Ziel am Anfang schneller und hat am Ende eine sanftere Abklingung; bei Unterschieden in der UI-Reaktion im Millisekundenbereich ist der Unterschied spurbar
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — im Erweiterungsmodus wird die UI-Sprache des Browsers abgerufen, die die wahre Absicht des Benutzers genauer widerspiegelt als `navigator.language`
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — verlasst sich nicht auf `setTimeout`, um den Render-Zeitpunkt zu erraten, sondern synchronisiert sich prazise mit dem Frame-Rhythmus des Browsers. Die doppelte Verwendung stellt eine klare Framegrenze zwischen Stilberechnung und -ubergabe sicher

**Die nicht verwendeten Technologien sind ebenso wichtig**: null externe Abhangigkeiten. Kein React, Tailwind oder Build-Tools. Das CSP in `manifest.json` schrankt `script-src 'self'` ein — der Browser erzwingt reines Vanilla-JS. Jede nicht eingebundene Bibliothek bedeutet weniger Parsing-Zeit, weniger Netzwerk-Overhead, einen fruheren ersten Frame.

**Font Stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` — systemeigene Schriftarten des Betriebssystems, null Netzwerkanfragen, null Layout-Verschiebung. Schriftdateien gehoren normalerweise zu den großten blockierenden Ressourcen einer Seite; PlainTab umgeht das gesamte Problem.

---

## Zwei Betriebsmodi

Derselbe Code, automatische Umgebungserkennung zur Laufzeit:

| Eigenschaft | Erweiterungsmodus | Webmodus |
|-------------|------------------|----------|
| Umgebungserkennung | `chrome.runtime.id` existiert | Alle anderen Falle |
| Suchmaschine | Standard des Browsers (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo auswahlbar |
| Wechsel der Suchmaschine | Nicht wechselbar (statische Lupe) | Wechsel per Klick auf das Symbol |
| Bereitstellung | Chrome Web Store / Entwickler laden | Netlify / GitHub Pages direkt hosten |
| CSP | In `manifest.json` deklariert | Kein CSP |

---

## Prioritat der Hintergrundbildladung

Bei jedem Offnen eines neuen Tabs wird in der folgenden Reihenfolge nach der schnellsten verfugbaren Quelle gesucht:

1. **Lokale Rotation** — eigene Bilder des Benutzers (maximal 12), Blob bereits in IDB, direkter Zugriff. Miniaturbild vorgeneriert. Keine Netzwerkkosten.
2. **Bing-Cache des Tages** — das heute bereits abgerufene Bing-Bild, Blob in IDB, direkt in Blob-URL umgewandelt. Keine Netzwerkkosten.
3. **Netzwerkabruf von Bing** — das Netzwerk wird nur genutzt, wenn die beiden vorherigen Ebenen nicht verfugbar sind. Nach Erhalt der URL wird das Bild sofort angezeigt, wahrend der Blob asynchron in IDB heruntergeladen wird, um die Netzwerkwartezeit beim nachsten Mal zu vermeiden.

Im lokalen Hintergrundbildmodus wird das Bing-Bild auch im Hintergrund still aktualisiert — der Benutzer kann jederzeit ohne Netzwerkwartezeit in den Bing-Modus wechseln.

Die Bing-API hat zwei Endpunkte fur aktive/passive Ausfallsicherung; der Sprachcode (z. B. `zh-CN`) wird auf den Bing-Marktcode abgebildet, wobei einige Sprachen auf `en-US` zuruckfallen.

---

## Internationalisierung

Unterstutzung von 16 Sprachen: English, 简体中文, 繁體中文, 日本語, 한국어, Español, Русский, Deutsch, Français, Italiano, Português, हिन्दी, العربية, Türkçe, Polski, Tiếng Việt.

Zwei parallele i18n-Systeme: Chrome `_locales/` ist fur die Metadaten des Erweiterungsmanifests zustandig (nur zwei Schlussel: `extName`, `extDesc`), wahrend [`languages.js`](../js/languages.js) alle UI-Strings verwaltet. Spracherkennungsprioritat: Chrome-UI-Sprache (Erweiterungsmodus) → `navigator.language` (Webmodus) → Hauptsprachzuordnung → Englisch als Fallback.

Die Ubersetzung hat Mangel oder du mochtest eine neue Sprache hinzufugen? Die Sprachdatei ist nur [`js/languages.js`](../js/languages.js), eine einfache Key-Value-Zuordnung. Andere es und sende einen PR.

---

## Projektstruktur

```
PlainTab/
├── manifest.json            # Erweiterungsmanifest fur Chrome/Edge (Manifest V3)
├── index.html               # Einzige HTML-Seite (neuer Tab der Erweiterung / Web-Startseite)
├── 404.html                 # Netlify SPA-Fallback-Seite
├── LICENSE                  # MIT-Lizenz
│
├── css/
│   └── newtab.css           # Alle Stile: Doppelschicht, Glas-Morphismus, Suchleiste, responsiv
│
├── js/
│   ├── preload.js           # Synchrones IIFE: Miniaturbild vor dem ersten Frame in die Ruckebene einfugen
│   ├── languages.js         # UI-String-Tabelle in 16 Sprachen + Sprachliste
│   └── newtab.js            # Hauptprogramm: Hintergrundbildverwaltung, i18n, Speicher, UI, Suchmaschine
│
├── _locales/                # Chrome i18n (16 Sprachverzeichnisse, nur fur das Manifest)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # Erweiterungssymbole (16/48/128/2048 px)
│
├── imgs/                    # Screenshots und Werbebilder
│   ├── chrome_01.jpg ~ chrome_08.jpg  # Funktions-Screenshots
│   └── small_promo.png      # Kleines Werbebild fur den Chrome Web Store
│
├── docs/                    # Mehrsprachige READMEs (16 Sprachen) + CHANGELOG
│
└── changelog/               # Versionsanderungsprotokolle pro Sprache
```

- **[`css/`](../css/)** — einzelne Datei mit ~617 Zeilen, Dunkel-/Hell-Theme, Glassmorphismus-Design-Tokens, responsiver Breakpoint bei 480px
- **[`js/`](../js/)** — drei Dateien, die in dieser Reihenfolge geladen werden: `preload.js` → `languages.js` → `newtab.js` (Reihenfolge darf nicht geandert werden)
- **[`_locales/`](../_locales/)** — enthalt nur `extName` und `extDesc` fur das Erweiterungsmanifest; alle UI-Strings werden von [`languages.js`](../js/languages.js) verwaltet
- **[`imgs/`](../imgs/)** — Screenshots und Werbebilder, die fur den Chrome Web Store benotigt werden
- **[`docs/`](../docs/)** und **[`changelog/`](../changelog/)** — mehrsprachige Dokumentation, 16 Sprachen in separaten Dateien

---

## Beitrag & Lizenz

Open Source unter der MIT-Lizenz. Einen Fehler gefunden oder eine Idee? → [Issue eroffnen](https://github.com/kaininx/PlainTab/issues); Code andern? → Fork + PR.

Einige Konventionen:
- **Null Abhangigkeiten beibehalten** — keine npm-Pakete, CDN-Skripte oder Frameworks
- **Keine Build-Schritte hinzufugen** — `index.html` muss direkt im Browser laufen
- **Keine Berechtigungen erweitern** — `manifest.json` enthalt nur die Berechtigung `search`

📋 [Anderungsprotokoll](CHANGELOG.md)

---

## Danksagungen

- Die Bing-Tagesbilder stammen von [Bing](https://www.bing.com), Dank an das Microsoft Bing-Team fur die jahrelange Bereitstellung hochwertiger taglicher Bilder
- API-Proxys: [bing.biturl.top](https://bing.biturl.top) (offentlicher Proxy) und [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (Cloudflare Worker als Backup)
- Die auf den Screenshots gezeigten Hintergrundbilder stammen von verschiedenen Kreativen im Internet

MIT · [Kaelri](https://github.com/kaininx)
