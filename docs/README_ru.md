<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab v3 · Минималистичная стартовая страница</h1>

> **Новая вкладка должна делать только одно:**
> Открыться → показать вам красивые обои → отправить вас на нужную страницу.
> Вам действительно нужны часы, приветствие или экран, полный ярлыков?
> **Ответ PlainTab: радикальное вычитание. Полная переработка с двухслойной архитектурой обоев. Ноль мерцания — верните вашу новую вкладку к чистому «PLAIN».**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.0-blue?style=flat-square" alt="Версия">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Лицензия">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Демо-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<p align="center">
  <strong>Чистое, быстрое и ненавязчивое решение для стартовой страницы и новой вкладки.</strong><br>
  Доступно на <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · двухслойные обои · ноль мерцания · без ограничений на размер файла<br>
  Ежедневные обои Bing · Локальные изображения · 16 языков · Гибкая строка поиска · <strong>Приватность прежде всего</strong>
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

## 🆕 Что нового в v3

v3 — это **полная переработка с нуля** с прорывом: **двухслойная система обоев с нулевым мерцанием**.

<details>
<summary><b>💡 Почему v2 мерцала?</b></summary>

Старая версия использовала один `<div>` с переключением CSS `background-image`. При переходе от миниатюры (правило stylesheet) к полному изображению (inline style) происходила смена каскада — в течение как минимум одного кадра отрисованный фон исчезал, обнажая серую подложку.

</details>

**Решение v3 — Двухслойная композиция:**
1. `#wallpaperBack` — всегда содержит видимое изображение. `preload.js` синхронно записывает миниатюру 640px до первой отрисовки браузера
2. `#wallpaperFront` — изначально прозрачен. После декодирования полного изображения плавно появляется сверху
3. Всегда хотя бы один слой содержит видимое изображение → **ноль серого мерцания**

Подробнее см. [CHANGELOG.md](./CHANGELOG.md).

---

## ✨ Почему PlainTab?

- 🔒 **Абсолютно чистая приватность** — Никакого сбора личных данных. Все обои хранятся локально
- 🚀 **Единый старт за одну минуту** — Установите как домашнюю страницу + установите расширение
- 🧩 **Настолько лёгкий, что вы его не чувствуете** — Ноль зависимостей, чистый JavaScript
- 🌍 **Работает из коробки** — Автоопределение языка браузера (16), поддержка Google / Bing / Baidu / DuckDuckGo

---

## 🚀 Два способа использования

| Способ | Описание | Для кого |
|--------|----------|----------|
| 🌐 **Онлайн стартовая страница** | [plaintab.netlify.app](https://plaintab.netlify.app) как домашняя страница | Чистая домашняя страница без установки |
| 🧩 **Расширение браузера** | Установите из Chrome или Edge Store | Минимализм на каждой новой вкладке |

### Расширение для браузеров · Установка из магазина
- **Chrome Web Store**: [Скоро]()
- **Edge Add-ons**: [Скоро]()

> 💡 Ещё не опубликовано? Загрузите вручную в режиме разработчика: откройте `chrome://extensions` → включите **Режим разработчика** → **Загрузить распакованное расширение** → выберите папку проекта

---

## 🛠️ Использование

| Действие | Эффект |
|----------|--------|
| Навести мышь на правый верхний угол | Показать значки языка / настроек |
| Навести мышь ближе к центру | Строка поиска появляется (режим Hover) |
| Нажать на шестерёнку | Открыть панель обоев и дополнительных опций |
| Нажать на глобус | Сменить язык интерфейса |
| Нажать на иконку поисковика | Цикл: Google → Bing → Baidu → DuckDuckGo |
| Нажать `Enter` в строке поиска | Поиск выбранным поисковиком |
| Нажать `Esc` | Закрыть все панели |

### Обои
- **Bing дня**: Автоматически загружается раз в день. Кэшируется только сегодняшнее изображение.
- **Локальные обои**: Загружайте изображения любого размера (IndexedDB, **без ограничений**). Сохраняется только последнее изображение. Сброс в один клик.

### Дополнительные опции
| Опция | Описание |
|-------|----------|
| Режим строки поиска | При наведении / Всегда / Скрыта |
| Прозрачность значка | 0 – 1 (по умолчанию 0.45) |
| Поисковая система | Google / Bing / Baidu / DuckDuckGo |

> Все настройки сохраняются в `localStorage`. Без аккаунта, без облачной синхронизации.

---

## 🌐 Многоязычная поддержка

16 встроенных языков, автоопределение по браузеру, ручной выбор в любое время:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Участие

Приветствуются Issue и Pull Request. Сохраняйте минималистичный стиль PlainTab — ванильный JS, без сборки, без зависимостей.

---

## 📄 Лицензия

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Благодарности

- API обоев Bing: [bing.img.run](https://bing.img.run) & [bing.biturl.top](https://bing.biturl.top)
- Некоторые обои на скриншотах взяты из интернета — спасибо всем талантливым авторам.

---

<p align="center">
  <sub>Чисто · Быстро · Без рекламы · Только ваше</sub>
</p>
