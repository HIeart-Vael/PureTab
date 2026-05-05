<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab V3 · Minimale Startseite</h1>

> **Ein neuer Tab sollte nur eines tun:**
> Offnen → dir ein Hintergrundbild zeigen, das dir gefallt → dich zu der Seite bringen, die du brauchst.
> Brauchst du wirklich die Uhrzeit, eine Begrußung oder einen Bildschirm voller Verknupfungen?
> **PlainTabs Antwort: radikale Reduktion. Eine komplette Neuentwicklung mit zweischichtiger Hintergrundbild-Architektur. Null Flackern — lass deinen neuen Tab zur reinen »PLAIN«-Oase zuruckkehren.**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.4-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Lizenz">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Live-Demo">
  </a>
</p>

<p align="center">
  <strong>Eine saubere, schnelle und nicht aufdringliche Startseite und Neuer-Tab-Losung.</strong><br>
  Live auf <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · null Flackern · keine Dateigroßenbeschrankung<br>
  Bing-Tageshintergrund · Lokale Bilder · 16 Sprachen · Flexible Suchleiste · <strong>Datenschutz an erster Stelle</strong>
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

## 🆕 Neuerungen in v3

v3 ist eine **komplette Neuentwicklung von Grund auf** mit einem Durchbruch: **flackerfreies Zweischicht-Hintergrundbildsystem**.

<details>
<summary><b>💡 Warum hat v2 geflackert?</b></summary>

Die alte Version verwendete ein einzelnes `<div>` mit CSS `background-image`-Wechsel. Vom Thumbnail (Stylesheet-Regel) zum Vollbild (Inline-Stil) zu wechseln, erforderte eine Kaskadenanderung — wahrend der der Browser den gerenderten Hintergrund fur mindestens einen Frame fallen ließ und den grauen Hintergrund sichtbar machte.

</details>

**v3s Losung — Zweischicht-Zusammensetzung:**
1. `#wallpaperBack` — halt stets ein sichtbares Bild bereit. `preload.js` schreibt synchron ein 640px-Thumbnail vor dem ersten Paint des Browsers
2. `#wallpaperFront` — startet transparent. Nachdem das vollstandige Bild dekodiert ist, blendet es daruber ein
3. Mindestens eine Schicht hat immer ein sichtbares Bild → **kein grauer Blitz**

Vollstandige technische Details in [V3_NOTE.md](./V3_NOTE.md).

---

## ✨ Warum PlainTab?

- 🔒 **Absolut saubere Privatsphare** — Keine personlichen Daten gesammelt. Alle Hintergrundbilder werden lokal gespeichert.
- 🚀 **Einheitlicher Browserstart in einer Minute** — Als Startseite festlegen + Erweiterung installieren. Die Erweiterung andert nie die Startseite.
- 🧩 **So leicht, dass du es kaum spurst** — Keine Abhangigkeiten, reines Vanilla-JavaScript, sofortiger Start.
- 🌍 **Funktioniert sofort** — Erkennt automatisch die Browsersprache (16), unterstutzt Google / Bing / Baidu / DuckDuckGo.

---

## 🚀 Zwei Moglichkeiten, es auszuprobieren

| Methode | Beschreibung | Am besten fur |
|--------|-------------|----------|
| 🌐 **Online-Startseite** | Besuche [plaintab.netlify.app](https://plaintab.netlify.app), als Browser-Startseite festlegen | Eine saubere Startseite ohne Installation |
| 🧩 **Browser-Erweiterung** | Installiere aus dem Chrome- oder Edge-Store | Minimalistische Erfahrung bei jedem neuen Tab |

### Browser-Erweiterung · Store-Installation
- **Chrome Web Store**: [Demnächst]()
- **Edge Add-ons**: [Demnächst]()

> 💡 Noch nicht verfügbar? Lade manuell im Entwicklermodus: gehe zu `chrome://extensions` → aktiviere den **Entwicklermodus** → **Entpackte Erweiterung laden** → wahle den Projektordner

---

## 💡 Entwickler-Tipp: Drei Hintergrundbilder, drei Zugänge

Du hast die Erweiterung installiert — dein neuer Tab sieht schon toll aus. Aber hier ist etwas, das du vielleicht nicht weißt: PlainTab ist auch an zwei weiteren Orten bereitgestellt:

| Zugang | Einstellung | URL |
|--------|-------------|-----|
| 🧩 **Neuer Tab** | Browser-Erweiterung | Diese Erweiterung laden |
| 🌐 **Startseite** | Browser-Start | `plaintab.netlify.app` |
| 🏠 **Homepage** | Home-Button | `kaininx.github.io/PlainTab` |

Setze `plaintab.netlify.app` als Startseite deines Browsers, lass es dem täglichen Bing-Update folgen. Jedes Mal, wenn du den Browser startest, ist das dein **zweites Hintergrundbild**.

Ja, es gibt noch mehr. Finde den "Home-Button" in den Darstellungseinstellungen deines Browsers, trage `kaininx.github.io/PlainTab` ein, wähle ein weiteres Hintergrundbild aus, das dir gefällt. Jetzt hast du ein **drittes Hintergrundbild**.

Die drei Zugänge sind vollständig isoliert. Gib jedem ein lokales Hintergrundbild oder lass sie alle dem täglichen Bing-Update folgen. Browser starten: ein Hintergrundbild. Home-Button klicken: ein anderes. Neuen Tab öffnen: ein drittes. Abwechslung garantiert.

**Einrichtung:**
1. Erweiterung installieren → Neuer Tab ✓
2. Browser-Einstellungen → Beim Start → Bestimmte Seite öffnen → `https://plaintab.netlify.app`
3. Browser-Einstellungen → Darstellung → Home-Button anzeigen → `https://kaininx.github.io/PlainTab`

---

## 🛠️ Verwendung

| Aktion | Effekt |
|--------|--------|
| Maus in die obere rechte Ecke bewegen | Sprach-/Einstellungssymbole anzeigen |
| Maus in die Nahe der Mitte bewegen | Suchleiste erscheint (Schwebemodus) |
| Auf das Zahnradsymbol klicken | Hintergrundbild- und erweiterte Optionen offnen |
| Auf das Globussymbol klicken | Oberflachensprache wechseln |
| Auf das Suchmaschinensymbol klicken | Wechseln Google → Bing → Baidu → DuckDuckGo |
| `Enter` in der Suchleiste drucken | Mit aktueller Suchmaschine suchen |
| `Esc` drucken | Alle Panels schließen |

### Hintergrundbild
- **Bing Taglich**: Wird automatisch einmal taglich abgerufen. Nur das heutige Bild wird lokal zwischengespeichert.
- **Lokales Hintergrundbild**: Bilder jeder Große hochladen (IndexedDB, **keine Dateigroßenbeschrankung**). Nur das zuletzt hochgeladene Bild wird behalten. Mit einem Klick auf Bing taglich zurucksetzen.

### Erweiterte Optionen
| Option | Beschreibung |
|--------|-------------|
| Suchleistenmodus | Schweben / Immer / Ausgeblendet |
| Symboltransparenz | 0 – 1 (Standard 0.45) |
| Suchmaschine | Google / Bing / Baidu / DuckDuckGo |

> **Chrome-Erweiterung vs. Web-Version — Suchunterschied:** Um die Richtlinie zur "Einzweckigkeit" des Chrome Web Stores einzuhalten, verwendet die Erweiterung die Chrome Search API, die die vom Benutzer in den Browsereinstellungen festgelegte Standardsuchmaschine respektiert. Die Suchmaschinenumschaltung ist im Erweiterungsmodus nicht verfügbar. Die Web-Version (Netlify / GitHub Pages) unterliegt dieser Einschränkung nicht und behält die vollständige Suchmaschinenauswahl. Abgesehen von der Suchimplementierung sind beide Versionen funktional identisch.

> Alle Einstellungen werden in `localStorage` gespeichert. Kein Konto, keine Cloud-Synchronisation.

---

## 🔧 Fußzeile im neuen Tab

Nach der Installation der Erweiterung zeigt Chrome / Edge eine Fußzeile in der unteren rechten Ecke der neuen Tab-Seite an (mit dem Namen der Erweiterung). Dies ist ein Browserverhalten und wird nicht von PlainTab hinzugefügt.

**So wird sie ausgeblendet (laut [Chrome-Hilfe](https://support.google.com/chrome/answer/11032183?hl=de)):**

Öffnen Sie einen neuen Tab → klicken Sie auf das Symbol "Chrome anpassen" ✏️ in der unteren rechten Ecke → Fußzeile → deaktivieren Sie "Fußzeile auf der Seite 'Neuer Tab' anzeigen".

---

## 🌐 Mehrsprachige Unterstutzung

16 integrierte Sprachen, automatisch vom Browser erkannt, jederzeit manuell auswahlbar:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Mitwirken

Issues und Pull Requests sind willkommen. Halte PlainTab minimalistisch — reines JavaScript, keine Build-Schritte, keine Abhangigkeiten.

---

## 📄 Lizenz

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Danksagungen

- Bing-Hintergrundbild-APIs: [bing.img.run](https://bing.img.run) und [bing.biturl.top](https://bing.biturl.top)
- Einige Hintergrundbilder in Screenshots stammen aus dem Web — Dank an jede talentierte Person.

---

<p align="center">
  <sub>Sauber · Schnell · Keine Werbung · Nur deins</sub>
</p>
