<p align="center">
  <img src="../icon/icon2048.png" alt="Logo PlainTab" width="80">
</p>

<h1 align="center">PlainTab v3 · Pagina iniziale minimalista</h1>

> **Una nuova scheda dovrebbe fare solo una cosa:**
> Aprirsi → mostrarti uno sfondo che ti piace → portarti alla pagina che ti serve.
> Hai davvero bisogno dell'ora, di un saluto o di una schermata piena di scorciatoie?
> **La risposta di PlainTab: sottrazione radicale. Una riscrittura completa con architettura a doppio strato per lo sfondo. Zero sfarfallio — lascia che la tua nuova scheda torni al puro «PLAIN».**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.0-blue?style=flat-square" alt="Versione">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licenza">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Demo dal vivo">
  </a>
</p>

<p align="center">
  <strong>Una pagina iniziale pulita, veloce e non invadente per le nuove schede.</strong><br>
  Disponibile su <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · sfondo a doppio strato · zero sfarfallio · nessun limite di dimensione file<br>
  Sfondo giornaliero Bing · Immagini locali · 16 lingue · Barra di ricerca flessibile · <strong>Privacy al primo posto</strong>
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

## 🆕 Novità della v3

La v3 è una **riscrittura completa da zero** con un'innovazione: **sistema di sfondo a doppio strato con zero sfarfallio**.

<details>
<summary><b>💡 Perché la v2 sfarfallava?</b></summary>

La vecchia versione usava un singolo `<div>` con commutazione di `background-image` in CSS. Passare dalla miniatura (regola del foglio di stile) all'immagine completa (stile inline) richiedeva un cambiamento a cascata — durante il quale il browser eliminava lo sfondo renderizzato per almeno un fotogramma, rivelando lo sfondo grigio.

</details>

**Soluzione della v3 — Composizione a doppio strato:**
1. `#wallpaperBack` — contiene sempre un'immagine visibile. `preload.js` scrive in modo sincrono una miniatura di 640px prima del primo rendering del browser
2. `#wallpaperFront` — inizia trasparente. Dopo che l'immagine completa è stata decodificata, appare gradualmente sopra
3. Almeno uno strato ha sempre un'immagine visibile → **nessun flash grigio**

Consulta [CHANGELOG.md](./CHANGELOG.md) per i dettagli tecnici completi.

---

## ✨ Perché PlainTab?

- 🔒 **Privacy assolutamente pulita** — Nessun dato personale raccolto. Tutti gli sfondi sono memorizzati localmente.
- 🚀 **Avvio di navigazione unificato in un minuto** — Imposta come homepage + installa l'estensione. L'estensione non forza mai cambiamenti alla homepage.
- 🧩 **Così leggero che lo senti a malapena** — Zero dipendenze, JavaScript puro, avvio istantaneo.
- 🌍 **Funziona subito** — Rileva automaticamente la lingua del browser (16), supporta Google / Bing / Baidu / DuckDuckGo.

---

## 🚀 Due modi per provarlo

| Metodo | Descrizione | Ideale per |
|--------|-------------|-----------|
| 🌐 **Pagina iniziale online** | Visita [plaintab.netlify.app](https://plaintab.netlify.app), impostala come homepage del browser | Una homepage pulita senza installare nulla |
| 🧩 **Estensione del browser** | Installa dal Chrome o Edge Store | Esperienza minimalista su ogni nuova scheda |

### Estensione Browser · Installazione dallo Store
- **Chrome Web Store**: [Prossimamente]()
- **Edge Add-ons**: [Prossimamente]()

> 💡 Non ancora pubblicata? Carica manualmente in modalità sviluppatore: vai su `chrome://extensions` → attiva la **Modalità sviluppatore** → **Carica estensione non pacchettizzata** → seleziona la cartella del progetto

---

## 🛠️ Utilizzo

| Azione | Effetto |
|--------|---------|
| Spostare il mouse nell'angolo in alto a destra | Mostrare le icone di lingua / impostazioni |
| Spostare il mouse vicino al centro | La barra di ricerca appare (modalità hover) |
| Cliccare sull'icona dell'ingranaggio | Aprire il pannello sfondo e opzioni avanzate |
| Cliccare sull'icona del globo | Cambiare la lingua dell'interfaccia |
| Cliccare sull'icona del motore di ricerca | Alternare Google → Bing → Baidu → DuckDuckGo |
| Premere `Invio` nella barra di ricerca | Cercare con il motore corrente |
| Premere `Esc` | Chiudere tutti i pannelli |

### Sfondo
- **Bing Giornaliero**: Recuperato automaticamente una volta al giorno. Solo l'immagine di oggi viene memorizzata nella cache locale.
- **Sfondo locale**: Carica immagini di qualsiasi dimensione (IndexedDB, **nessun limite di dimensione file**). Viene conservata solo l'ultima immagine caricata. Ripristino con un clic a Bing giornaliero.

### Opzioni avanzate
| Opzione | Descrizione |
|---------|-------------|
| Modalità barra di ricerca | Hover / Sempre / Nascosta |
| Opacità icone | 0 – 1 (predefinito 0.45) |
| Motore di ricerca | Google / Bing / Baidu / DuckDuckGo |

> Tutte le impostazioni sono salvate in `localStorage`. Nessun account, nessuna sincronizzazione cloud.

---

## 🌐 Supporto multilingua

16 lingue integrate, rilevate automaticamente dal browser, selezionabili manualmente in qualsiasi momento:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Contributi

Issue e Pull Requests sono benvenute. Mantieni PlainTab minimalista — JavaScript puro, nessun passaggio di build, nessuna dipendenza.

---

## 📄 Licenza

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Riconoscimenti

- API sfondi Bing: [bing.img.run](https://bing.img.run) e [bing.biturl.top](https://bing.biturl.top)
- Alcuni sfondi negli screenshot provengono dal web — grazie a ogni creatore di talento.

---

<p align="center">
  <sub>Pulito · Veloce · Senza pubblicità · Solo tuo</sub>
</p>
