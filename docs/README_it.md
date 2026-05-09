<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Nuova pagina minimalista</h1>

 > Una nuova scheda dovrebbe fare una sola cosa: aprirsi, mostrare una bella immagine di sfondo e portarti alla prossima pagina web. Hai davvero bisogno di un orologio, di un saluto personalizzato o di una schermata piena di collegamenti rapidi? La risposta di PlainTab: minimalismo estremo, velocità massima — riporta la tua nuova scheda a ciò che dovrebbe essere: bella e pulita.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt_BR.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.1-blue?style=flat-square" alt="Versione">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licenza">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Provalo_online-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 Vedi altri screenshot</b></summary>
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
Aprire una nuova scheda è un gesto istantaneo: premi `Ctrl+T` e ti aspetti che lo sfondo sia già lì. Per fare questo bene, l'intero design di PlainTab ruota attorno a un unico obiettivo: **far apparire lo sfondo sullo schermo il più rapidamente possibile**, senza alcun caricamento visibile. Architettura a doppio strato, pre-caricamento sincrono, pipeline di miniature Canvas, strategia di archiviazione ibrida: tutte le decisioni tecniche convergono verso la stessa cosa: più veloce, più fluido, più invisibile.

PlainTab è sia un'estensione per browser Manifest V3 sia una pagina Web indipendente. Zero dipendenze esterne, nessun processo di build, puro vanilla JS + CSS. La modalità estensione e la modalità Web condividono lo stesso codice, con rilevamento automatico dell'ambiente in fase di esecuzione. [Provalo online](https://plaintab.netlify.app).

---

## Guida rapida

**Estensione browser**: installala dal [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo).

**Pagina iniziale online**: visita [plaintab.netlify.app](https://plaintab.netlify.app) e impostala come pagina di avvio nelle impostazioni del browser.

**Esecuzione locale**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

Carica la directory in `chrome://extensions` usando "Carica estensione non pacchettizzata". Nessun processo di build, nessun `npm install`.

<details>
<summary><b>🔧 Come rimuovere la barra grigia in fondo alla nuova scheda?</b></summary>

Dopo aver installato l'estensione, Chrome / Edge mostra un footer nell'angolo in basso a destra della nuova scheda (con il nome dell'estensione). Questo comportamento è del browser, PlainTab non può controllarlo dal proprio codice.

Per disattivarlo: nuova scheda → angolo in basso a destra "Personalizza Chrome" ✏️ → Footer → disattiva "Mostra footer nella pagina 'Nuova scheda'". Vedi la [guida ufficiale di Chrome](https://support.google.com/chrome/answer/11032183?hl=it).

</details>

---

## Quanto è veloce lo sfondo?

PlainTab non si limita a "caricare un'immagine", ma procede **su tre scale temporali**, ciascuna delle quali perfeziona l'esperienza della precedente:

| Istante | Cosa succede | Cosa vede l'utente |
|------|-----------|-------------|
| **0ms** (prima del primo frame) | `preload.js` legge in modo sincrono la miniatura base64 da localStorage e la scrive direttamente in `#wallpaperBack.style.backgroundImage` | Uno sfondo già presente — non in alta definizione, ma **nessuna schermata bianca o grigia** |
| **~300ms** | `loadWallpaper()` legge il Blob memorizzato nella cache da IndexedDB e lo mostra tramite Blob URL | Lo sfondo in alta definizione appare, sostituendo dolcemente la miniatura con una transizione di opacità CSS |
| **Solo quando la cache non è valida** | Richiesta di rete all'API Bing → download del Blob → visualizzazione → caching asincrono in IDB | L'utente non se ne accorge — lo sfondo precedente rimane visibile nello strato back come riserva |

Ogni tecnologia descritta di seguito serve questi tre momenti: o per ridurre i tempi, o per eliminare le tracce visibili delle transizioni.

---

## Punti salienti tecnici

### Zero schermata bianca al primo frame: doppio strato + pre-caricamento sincrono

Questa è la caratteristica più importante di PlainTab. Prima che l'immagine venga caricata, la nuova scheda mostrerebbe il colore di sfondo predefinito del browser — di solito bianco o grigio. Due strati `<div>` risolvono completamente il problema:

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0) — contiene sempre un'immagine visibile. [`preload.js`](../js/preload.js) è inserito in `<head>` e viene eseguito in modo sincrono, scrivendo il `data:` URL della miniatura prima che il browser effettui la prima renderizzazione. Questo passaggio è sincrono: non passa attraverso alcuna API asincrona e non attende alcuna rete. Per la modalità di rotazione multi-immagine, sa persino quale indice di miniatura utilizzare in quel momento.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`) — utilizzato per le transizioni di dissolvenza. La nuova immagine viene pre-decodificata in memoria tramite [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) → impostata come sfondo del livello anteriore → dissolvenza CSS [`opacity` transition](https://developer.mozilla.org/docs/Web/CSS/transition) → una volta completata la transizione, viene stabilizzata nello strato back → front si resetta a trasparente.

Principio fondamentale: **in qualsiasi momento, almeno uno strato contiene un'immagine renderizzata**. Lo strato back ha sempre qualcosa da mostrare; lo strato front entra in azione solo brevemente durante la transizione. Anche se l'utente osserva fotogramma per fotogramma, non vedrà mai un istante vuoto.

### Dall'input ai pixel: perché la miniatura invece dell'immagine originale?

`preload.js` non può attendere un caricamento asincrono — si perderebbe il primo frame. Ma l'immagine originale in IndexedDB è asincrona, e una stringa base64 di diversi megabyte non può essere inserita in localStorage (quota limitata). Ecco perché PlainTab, dopo aver mostrato lo sfondo precedente, **fa un passo in più**: utilizza Canvas per ridimensionare l'immagine a un JPEG largo 640px, qualità 0,55, con una compressione solitamente tra 30 e 60 KB, memorizzata in modo sicuro in localStorage. Alla successiva apertura di una nuova scheda, `preload.js` la recupera e la usa direttamente.

640px sono sufficientemente nitidi su uno schermo 2K da non sembrare una miniatura — e per contenere quei pochi KB, dietro le quinte c'è il ridimensionamento preciso di [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) combinato con la regolazione della qualità di [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL). Questa miniatura è anche la fonte di rendering per la griglia 3×4 della galleria: generata una volta, riutilizzata in due punti.

### Doppio `requestAnimationFrame` per guidare le transizioni CSS

Il passaggio dalla miniatura all'immagine ad alta definizione deve attivare una transizione CSS. Ma il calcolo degli stili e il rendering del browser sono asincroni — se si aggiunge la classe subito dopo aver impostato `backgroundImage`, il browser potrebbe elaborare entrambi gli stati nella stessa renderizzazione, e la transizione non verrebbe attivata.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

Il primo [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) garantisce che `backgroundImage` sia stato calcolato; il secondo garantisce che gli stili siano stati inviati alla pipeline di rendering. Solo a questo punto l'aggiunta della classe fa sì che il browser veda un cambiamento da "vecchio stile" a "nuovo stile", attivando la transizione corretta. Con un solo frame, la transizione viene saltata — l'utente vede un cambio brusco invece di una dissolvenza.

### Perché IndexedDB e localStorage coesistono?

I due metodi di archiviazione non sono in alternativa, ma hanno ruoli distinti:

| Archivio | Cosa contiene | Perché qui |
|------|--------|---------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | Blob originali (sfondo giornaliero Bing, immagini locali caricate dall'utente) | I file grandi necessitano di quote elevate; la lettura/scrittura asincrona è perfettamente accettabile nei percorsi non relativi al primo frame |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | `data:` URL delle miniature, preferenze UI, metadati, indice di rotazione | **Lettura sincrona** — questo è fondamentale. `preload.js` viene eseguito prima del primo frame e non può attendere alcun callback asincrono |

La connessione IDB è memorizzata nella cache come singleton, con ricostruzione automatica in caso di `onclose`. I Blob recuperati da IDB potrebbero aver perso il MIME type — il campo `mime` viene sempre registrato al momento della memorizzazione, e al recupero si ricrea con `new Blob([blob], {type: img.mime})` per garantire che il Blob URL venga visualizzato correttamente.

### Autoguarigione delle miniature

`saveLocalImage()` scrive prima in IDB (blob), poi in localStorage (miniatura). I due passaggi non sono una transazione atomica — se la pagina si blocca esattamente tra i due, l'array delle miniature avrà un elemento in meno rispetto all'array delle immagini. PlainTab non esegue un'autoverifica globale all'avvio (che maschererebbe incongruenze di dati più gravi), ma **rigenera la miniatura al momento quando si passa a un'immagine con la miniatura mancante**. La riparazione avviene solo quando i due array hanno la stessa lunghezza — se le lunghezze non coincidono, significa che si è verificata un'eccezione di scrittura sconosciuta, e saltare è la scelta più sicura.

### Ciclo di vita dei Blob URL

Tutti i Blob URL creati tramite [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) nella galleria vengono tracciati in un array e revocati in blocco alla chiusura della galleria tramite [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL). Tuttavia, questo percorso è un fallback — **vengono utilizzate in priorità le miniature base64 pregenerate**, perché base64 non richiede creazione/revoca di Blob URL e il rendering è più veloce.

### Tema runtime con proprietà personalizzate CSS

L'opacità delle icone (`--icon-opacity`) viene controllata modificando una [proprietà personalizzata CSS](https://developer.mozilla.org/docs/Web/CSS/--*) tramite JS, uniformando tutti i pulsanti angolari e i pannelli — una sola `setProperty` e il browser aggiorna automaticamente tutti gli elementi che fanno riferimento a quella variabile. I token di design (`--glass-bg`, `--glass-border`, `--text-primary`, ecc.) sono tutti definiti su [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root), con il tema scuro/chiaro che passa attraverso la media query [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme).

### Pannelli in vetro satinato

I pannelli delle impostazioni e della lingua utilizzano [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) per sfocare il contenuto dello sfondo **dietro** il pannello — non una soluzione economica con mascherina semitrasparente. Combinato con `--glass-bg: rgba(18, 18, 22, 0.82)` per creare una vera sensazione di profondità.

### UI sensibile alla posizione del mouse

I pulsanti angolari e la barra di ricerca appaiono solo quando necessario — `isNearTopRight()` e `isInCenter()` sono due funzioni matematiche che determinano la posizione del mouse, senza bisogno di assegnare `mouseenter`/`mouseleave` sull'intero sfondo. La scomparsa è ritardata (400ms per i pulsanti, 150ms per la barra di ricerca), e viene saltata quando un pannello è aperto o un campo di input è focalizzato. Ogni percorso di interazione è il più breve possibile: **apparire velocemente, scomparire con stabilità**, senza interrompere l'utente con falsi attivazioni.

### Catena di Promise seriali per il caricamento batch

Gli utenti possono selezionare più sfondi locali contemporaneamente. Ogni `saveLocalImage()` legge e scrive in IDB — l'esecuzione in parallelo causerebbe race condition. Il caricamento batch utilizza una catena di Promise per serializzare tutte le operazioni di salvataggio, scrivendo un'immagine alla volta. La prima immagine salvata con successo viene mostrata come sfondo, le altre vengono solo archiviate. In questo modo l'utente non vede sfarfallii dovuti al cambio continuo di immagini.

### `chrome.search.query()` per la conformità CWS

In modalità estensione, [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) delega la ricerca al motore di ricerca predefinito del browser — requisito di conformità con la politica per scopi singoli del Chrome Web Store. Il selettore del motore di ricerca è nascosto dal DOM e l'icona diventa una lente di ingrandimento statica.

---

## Tecnologie utilizzate per eliminare la latenza

PlainTab non utilizza framework o librerie. Ogni API seguente è stata scelta per **risparmiare un'attesa asincrona, eliminare uno sfarfallio visibile o ridurre un frame di latenza**:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — decodifica asincrona prima di impostare `backgroundImage`, evitando la pausa di decodifica durante il rendering del primo frame. Il completamento del caricamento di `<img>` non significa che la decodifica sia completa; senza chiamare `decode()`, al primo rendering potrebbe apparire un breve frame vuoto
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — utilizza la sfocatura compositata dalla GPU invece di livelli DOM aggiuntivi e maschere immagine, zero overhead di layout aggiuntivo
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — blocca Dark Reader, impedendo che i suoi filtri invertano i colori dello sfondo — lo sfondo è esso stesso contenuto visivo, e l'elaborazione con filtri vanificherebbe gli sforzi di fedeltà della pipeline di miniature Canvas
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — una singola dichiarazione che fa sì che il browser adatti automaticamente i colori di moduli, barre di scorrimento e controlli di sistema, senza bisogno di scrivere due serie di stili di override
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — curva di easing unificata per tutte le animazioni di dissolvenza e comparsa. Non è `ease` o `ease-in-out` — questa curva raggiunge il target più velocemente all'inizio e ha un decadimento più morbido alla fine. Per risposte UI dell'ordine di millisecondi, la differenza percettiva è notevole
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — in modalità estensione, recupera la lingua UI del browser, riflettendo in modo più accurato l'intenzione reale dell'utente rispetto a `navigator.language`
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — non si basa su `setTimeout` per indovinare i tempi di rendering, ma si allinea precisamente al ritmo dei fotogrammi del browser. L'uso doppio consecutivo garantisce un confine di frame netto tra il calcolo degli stili e l'invio
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — Attiva entrambi gli endpoint dell'API Bing simultaneamente e usa quello che risponde per primo, eliminando attese inutili
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — Limita ogni richiesta all'API Bing a 8 secondi, abortendo pulitamente la connessione perdente invece di lasciarla in sospeso fino al timeout TCP del sistema operativo

**Le tecnologie non utilizzate sono altrettanto importanti**: zero dipendenze esterne. Niente React, Tailwind o strumenti di build. La CSP in `manifest.json` limita `script-src 'self'` — il browser applica rigorosamente il vanilla JS puro. Ogni libreria non introdotta significa meno tempo di parsing, meno overhead di rete e un primo frame più anticipato.

**Font stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` — font nativi del sistema operativo, zero richieste di rete, zero layout shift. I file dei font sono di solito una delle risorse bloccanti più grandi per una pagina; PlainTab aggira l'intero problema.

---

## Due modalità di esecuzione

Lo stesso codice, rilevamento automatico dell'ambiente in fase di esecuzione:

| Caratteristica | Modalità estensione | Modalità Web |
|------|----------|----------|
| Rilevamento ambiente | `chrome.runtime.id` esiste | Tutti gli altri casi |
| Motore di ricerca | Predefinito del browser (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo selezionabile |
| Cambio motore | Non commutabile (lente di ingrandimento statica) | Rotazione cliccando sull'icona |
| Distribuzione | Chrome Web Store / sviluppo locale | Netlify / GitHub Pages hosting diretto |
| CSP | Dichiarato in `manifest.json` | Nessun CSP necessario |

---

## Priorità di caricamento dello sfondo

Ogni volta che si apre una nuova scheda, viene cercata la fonte di sfondo più veloce disponibile nel seguente ordine:

1. **Rotazione sfondi locali** — immagini personali dell'utente (massimo 12), Blob già presenti in IDB, recupero diretto. Miniatura già pregenerata. Zero overhead di rete.
2. **Cache Bing del giorno** — lo sfondo Bing già recuperato oggi, Blob in IDB, convertito direttamente in Blob URL per la visualizzazione. Zero overhead di rete.
3. **Recupero Bing dalla rete** — solo se i primi due livelli non sono disponibili si passa alla rete. Una volta ottenuto l'URL, viene visualizzato immediatamente, mentre il Blob viene scaricato in modo asincrono e memorizzato in IDB per evitare l'attesa della rete alla prossima apertura.

In modalità sfondi locali, lo sfondo Bing viene comunque aggiornato silenziosamente in background — l'utente può passare alla modalità Bing in qualsiasi momento senza dover attendere la rete.

L'API Bing attiva entrambi gli endpoint simultaneamente tramite `Promise.any` con un timeout di 8 secondi via `AbortController` — la risposta piu veloce vince. I payload JSON sono minuscoli, quindi la richiesta extra costa praticamente nulla, eppure la competizione garantisce la latenza ottimale indipendentemente da dove ti trovi. I codici lingua (ad es. `zh-CN`) vengono mappati ai codici mercato Bing, con alcune lingue che ricadono su `en-US`.

---

## Internazionalizzazione

Supporto per 16 lingue: 简体中文、繁體中文、English、日本語、한국어、Español、Русский、Deutsch、Français、Italiano、Português、हिन्दी、العربية、Türkçe、Polski、Tiếng Việt.

Due sistemi i18n paralleli: Chrome `_locales/` gestisce i metadati del manifest dell'estensione (solo due chiavi: `extName`, `extDesc`), mentre [`languages.js`](../js/languages.js) gestisce tutte le stringhe UI. Priorità di rilevamento lingua: lingua UI di Chrome (modalità estensione) → `navigator.language` (modalità Web) → corrispondenza lingua principale → fallback all'inglese.

Traduzioni imperfette o vuoi aggiungere una nuova lingua? Il file delle lingue è un unico file [`js/languages.js`](../js/languages.js), una mappa chiave-valore. Dopo averlo modificato, apri una PR.

---

## Struttura del progetto

```
PlainTab/
├── manifest.json            # Manifest dell'estensione Chrome/Edge (Manifest V3)
├── index.html               # Unica pagina HTML (nuova scheda dell'estensione / homepage Web)
├── 404.html                 # Pagina di fallback SPA per Netlify
├── LICENSE                  # Licenza MIT
│
├── css/
│   └── newtab.css           # Tutti gli stili: doppio strato sfondo, pannelli vetro satinato, barra di ricerca, responsive
│
├── js/
│   ├── preload.js           # IIFE sincrono: inietta la miniatura nello strato back prima del primo frame
│   ├── languages.js         # Tabella stringhe UI per 16 lingue + elenco lingue
│   └── newtab.js            # Programma principale: gestione sfondi, i18n, storage, UI, motore di ricerca
│
├── _locales/                # i18n di Chrome (16 directory lingua, solo per il manifest dell'estensione)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # Icone estensione (16/48/128/2048 px)
│
├── imgs/                    # Screenshot e immagini promozionali
│   ├── chrome_01.jpg ~ chrome_08.jpg  # Screenshot funzionali
│   └── small_promo.png      # Immagine promozionale piccola per Chrome Web Store
│
├── docs/                    # README multilingua (16 lingue) + CHANGELOG
│
└── changelog/               # Log delle versioni per ogni lingua
```

- **[`css/`](../css/)** — file singolo ~617 righe, tema scuro/chiaro, token di design vetro satinato, breakpoint responsive 480px
- **[`js/`](../js/)** — tre file caricati in ordine: `preload.js` → `languages.js` → `newtab.js` (ordine non modificabile)
- **[`_locales/`](../_locales/)** — contiene solo `extName` e `extDesc` per il manifest dell'estensione; tutte le stringhe UI sono gestite da [`languages.js`](../js/languages.js)
- **[`imgs/`](../imgs/)** — screenshot e immagini promozionali richieste da Chrome Web Store
- **[`docs/`](../docs/)** e **[`changelog/`](../changelog/)** — documentazione multilingua, file separati per ciascuna delle 16 lingue

---

## Contributi e licenza

Open source sotto licenza MIT. Hai trovato un bug o hai un'idea? [Apri una Issue](https://github.com/kaininx/PlainTab/issues). Vuoi modificare il codice? Fork + PR.

Alcune convenzioni:
- **Mantenere zero dipendenze** — niente pacchetti npm, script CDN o framework
- **Nessun processo di build** — `index.html` deve funzionare direttamente nel browser
- **Nessuna estensione dei permessi** — `manifest.json` mantiene solo il permesso `search`

📋 [Registro delle modifiche](CHANGELOG.md)

---

## Ringraziamenti

- Le immagini dello sfondo giornaliero Bing provengono da [Bing](https://www.bing.com), ringraziamenti al team di Microsoft Bing per la fornitura costante di immagini quotidiane di alta qualità
- Proxy API: [bing.biturl.top](https://bing.biturl.top) (proxy pubblico) e [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (Cloudflare Worker di riserva)
- Gli sfondi mostrati negli screenshot provengono da vari creatori online

MIT · [Kaelri](https://github.com/kaininx)
