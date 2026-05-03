<p align="center">
  <img src="../icon/icon2048.png" alt="Logo PlainTab" width="80">
</p>

<h1 align="center">PlainTab v3 · Minimalistyczna Strona Startowa</h1>

> **Nowa karta powinna robić tylko jedną rzecz:**
> Otwierać się → pokazywać tapetę, która ci się podoba → przenosić cię do strony, której potrzebujesz.
> Czy naprawdę potrzebujesz zegara, powitania lub ekranu pełnego skrótów?
> **Odpowiedź PlainTab: radykalne odejmowanie. Całkowity przepisany od podstaw z dwuwarstwową architekturą tapety. Zero migotania — pozwól, aby twoja nowa karta wróciła do czystego «PLAIN».**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.1-blue?style=flat-square" alt="Wersja">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licencja">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Demo na żywo">
  </a>
</p>

<p align="center">
  <strong>Czysta, szybka i nienachalna strona startowa i rozwiazanie dla nowych kart.</strong><br>
  Dostępne na <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · dwuwarstwowa tapeta · zero migotania · bez ograniczenia rozmiaru pliku<br>
  Codzienna tapeta Bing · Obrazy lokalne · 16 języków · Elastyczny pasek wyszukiwania · <strong>Prywatność przede wszystkim</strong>
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

## 🆕 Nowości w v3

v3 to **całkowity przepisany od podstaw** z przełomem: **system dwuwarstwowej tapety z zerowym migotaniem**.

<details>
<summary><b>💡 Dlaczego v2 migotało?</b></summary>

Stara wersja używała pojedynczego `<div>` z przełączaniem `background-image` w CSS. Przejście z miniatury (reguła arkusza stylów) do pełnego obrazu (styl wbudowany) wymagało zmiany kaskadowej — podczas której przeglądarka usuwala wyrenderowane tło na co najmniej jedną klatkę, odsłaniając szare tło.

</details>

**Rozwiazanie v3 — Kompozycja dwuwarstwowa:**
1. `#wallpaperBack` — zawsze zawiera widoczny obraz. `preload.js` synchronicznie zapisuje miniature 640px przed pierwszym malowaniem przeglądarki
2. `#wallpaperFront` — zaczyna przezroczysty. Po zdekodowaniu pełnego obrazu, pojawia się stopniowo na wierzchu
3. Co najmniej jedna warstwa zawsze ma widoczny obraz → **brak szarego błysku**

Pełne szczegóły techniczne znajdziesz w [CHANGELOG.md](./CHANGELOG.md).

---

## ✨ Dlaczego PlainTab?

- 🔒 **Absolutnie czysta prywatność** — Żadne dane osobowe nie są zbierane. Wszystkie tapety przechowywane lokalnie.
- 🚀 **Zjednoczony start przeglądania w minutę** — Ustaw jako stronę główną + zainstaluj rozszerzenie. Rozszerzenie nigdy nie wymusza zmiany strony głównej.
- 🧩 **Tak lekki, że ledwo go czujesz** — Zero zależności, czysty vanilla JavaScript, natychmiastowy start.
- 🌍 **Działa od razu po wyjęciu z pudełka** — Automatycznie wykrywa język przeglądarki (16), obsługuje Google / Bing / Baidu / DuckDuckGo.

---

## 🚀 Dwa sposoby na wypróbowanie

| Metoda | Opis | Najlepsze dla |
|--------|-------------|---------------|
| 🌐 **Strona startowa online** | Odwiedź [plaintab.netlify.app](https://plaintab.netlify.app), ustaw jako stronę główną przeglądarki | Czysta strona główna bez instalowania czegokolwiek |
| 🧩 **Rozszerzenie przeglądarki** | Zainstaluj ze sklepu Chrome lub Edge | Minimalistyczne doświadczenie na każdej nowej karcie |

### Rozszerzenie przeglądarki · Instalacja ze sklepu
- **Chrome Web Store**: [Wkrótce]()
- **Edge Add-ons**: [Wkrótce]()

> 💡 Jeszcze nie opublikowane? Załaduj ręcznie w trybie programisty: przejdź do `chrome://extensions` → włącz **Tryb programisty** → **Załaduj rozpakowane** → wybierz folder projektu

---

## 🛠️ Użycie

| Akcja | Efekt |
|-------|-------|
| Przesuń mysz w prawy górny róg | Pokaż ikony języka / ustawień |
| Przesuń mysz blisko środka | Pasek wyszukiwania pojawia się (tryb najechania) |
| Kliknij ikonę koła zębatego | Otwórz panel tapety i zaawansowanych opcji |
| Kliknij ikonę globusa | Zmień język interfejsu |
| Kliknij ikonę wyszukiwarki | Przełącz Google → Bing → Baidu → DuckDuckGo |
| Naciśnij `Enter` w pasku wyszukiwania | Szukaj za pomocą bieżącej wyszukiwarki |
| Naciśnij `Esc` | Zamknij wszystkie panele |

### Tapeta
- **Bing Codziennie**: Pobierana automatycznie raz dziennie. Tylko dzisiejszy obraz jest przechowywany lokalnie w pamięci podręcznej.
- **Tapeta lokalna**: Przesyłaj obrazy o dowolnym rozmiarze (IndexedDB, **bez ograniczenia rozmiaru pliku**). Przechowywany jest tylko ostatnio przesłany obraz. Reset jednym kliknięciem do Bing codziennie.

### Opcje zaawansowane
| Opcja | Opis |
|-------|------|
| Tryb paska wyszukiwania | Najechanie / Zawsze / Ukryty |
| Nieprzezroczystość ikon | 0 – 1 (domyślnie 0.45) |
| Wyszukiwarka | Google / Bing / Baidu / DuckDuckGo |

> Wszystkie ustawienia zapisywane w `localStorage`. Bez konta, bez synchronizacji w chmurze.

---

## 🌐 Wsparcie wielojęzyczne

16 wbudowanych języków, automatycznie wykrywanych z przeglądarki, ręcznie wybieralnych w dowolnym momencie:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Wkład

Issue i Pull Requesty są mile widziane. Utrzymuj PlainTab minimalistycznym — czysty JavaScript, bez etapów budowania, bez zależności.

---

## 📄 Licencja

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Podziękowania

- API tapet Bing: [bing.img.run](https://bing.img.run) i [bing.biturl.top](https://bing.biturl.top)
- Niektóre tapety na zrzutach ekranu pochodzą z sieci — dzięki każdemu utalentowanemu twórcy.

---

<p align="center">
  <sub>Czysty · Szybki · Bez reklam · Tylko twój</sub>
</p>
