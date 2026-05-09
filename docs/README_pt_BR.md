<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Nova Guia Minimalista</h1>


 > Uma nova guia so precisa fazer uma coisa — ser aberta, exibir um belo papel de parede e te levar para a proxima pagina. Voce realmente precisa de um relogio, uma saudacao ou uma tela cheia de atalhos? A resposta do PlainTab: subtracao maxima, velocidade maxima — faca sua nova guia voltar a ser o que sempre deveria ser: bonita e limpa.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.4-blue?style=flat-square" alt="Versao">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licenca">
  </a>
  <a href="https://plaintab.kaininx.workers.dev">
    <img src="https://img.shields.io/badge/Experimente%20online-Cloudflare-00c7b7?style=flat-square&logo=cloudflare" alt="Cloudflare">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 Veja mais capturas de tela</b></summary>
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
Abrir uma nova guia e um gesto instantaneo — voce aperta `Ctrl+T` e espera que o papel de parede ja esteja la. Para fazer isso direito, todo o design do PlainTab gira em torno de um objetivo: **fazer o papel de parede aparecer na tela o mais rapido possivel**, sem nenhum processo de carregamento visivel. Arquitetura de camada dupla, pre-carregamento sincrono, pipeline de miniaturas via Canvas, estrategia de armazenamento hibrida — toda decisao tecnica leva a mesma coisa: mais rapido, mais suave, mais imperceptivel.

O PlainTab e ao mesmo tempo uma extensao de navegador Manifest V3 e uma pagina web independente. Zero dependencias externas, sem etapa de build, vanilla JS + CSS puro. O modo extensao e o modo web compartilham o mesmo codigo, com deteccao automatica de ambiente em tempo de execucao. [Experimente online](https://plaintab.kaininx.workers.dev).

---

## Comeco rapido

**Extensao de navegador**: instale pela [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo).

**Pagina inicial online**: acesse [plaintab.kaininx.workers.dev](https://plaintab.kaininx.workers.dev) e defina-a como pagina inicial nas configuracoes do seu navegador.

**Execucao local**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

Carregue o diretorio em `chrome://extensions` usando "Carregar extensao descompactada". Sem etapa de build, sem `npm install`.

<details>
<summary><b>🔧 Como remover a barra cinza no final da nova guia?</b></summary>

Apos instalar a extensao, o Chrome / Edge pode exibir um rodape no canto inferior direito da nova guia (indicando o nome da extensao). Isso e comportamento do navegador e nao pode ser controlado pelo PlainTab via codigo.

Para desativar: nova guia → "Personalizar Chrome" ✏️ no canto inferior direito → Rodape → desative "Mostrar rodape na pagina 'Nova guia'". Consulte a [Ajuda oficial do Chrome](https://support.google.com/chrome/answer/11032183?hl=pt-BR).

</details>

---

## Quao rapido e o papel de parede?

A exibicao do papel de parede no PlainTab nao e "carregar uma imagem", mas sim **uma progressao em tres escalas de tempo**, cada uma aprimorando a experiencia da anterior:

| Momento | O que acontece | O que o usuario ve |
|---------|---------------|-------------------|
| **0ms** (antes do primeiro quadro) | `preload.js` le de forma sincrona a miniatura base64 do `localStorage` e a escreve diretamente em `#wallpaperBack.style.backgroundImage` | Um papel de parede ja visivel — nao em alta definicao, mas **sem tela branca ou fundo cinza** |
| **~300ms** | `loadWallpaper()` le o blob em cache do IndexedDB e o exibe via Blob URL | O papel de parede em alta definicao aparece, substituindo suavemente a miniatura com uma transicao de opacidade CSS |
| **Apenas quando o cache expira** | Requisicao de rede a API do Bing → download do Blob → exibicao → cache assincrono no IDB | O usuario nao percebe — o papel de parede anterior permanece na camada de fundo como fallback |

Cada tecnica a seguir serve a esses tres momentos — seja reduzindo o tempo, seja eliminando vestigios visiveis da transicao.

---

## Destaques tecnicos

### Zero tela branca no primeiro quadro: camada dupla + pre-carregamento sincrono

Este e o design mais central do PlainTab. Antes do carregamento da imagem, uma nova guia exibe a cor de fundo padrao do navegador — geralmente uma tela branca ou fundo cinza. Duas camadas `<div>` resolvem este problema completamente:

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0) — sempre mantem uma imagem visivel. [`preload.js`](../js/preload.js) e colocado no `<head>` e executado de forma sincrona, escrevendo a miniatura `data: URL` antes mesmo do primeiro quadro do navegador. Esta etapa e sincrona — nao passa por nenhuma API assincrona, nao espera por rede. No modo de rotacao de multiplas imagens, ele ate sabe qual indice de miniatura usar.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`) — usado para transicoes de fade-in. A nova imagem e pre-decodificada em memoria via [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) → definida como fundo da camada frontal → transicao CSS de [`opacity`](https://developer.mozilla.org/docs/Web/CSS/transition) → apos a conclusao, estabilizada na camada traseira → front reseta para transparente.

Principio central: **em qualquer momento, pelo menos uma camada contem uma imagem renderizada**. A camada traseira sempre tem algo para exibir; a frontal so entra em cena brevemente durante a transicao. Mesmo que o usuario observe quadro a quadro, nunca vera um instante vazio.

### Da entrada ao pixel: por que miniatura em vez da imagem original?

O `preload.js` nao pode esperar carregamento assincrono — isso perderia o primeiro quadro. Mas armazenar a imagem original no IndexedDB e assincrono, e uma string base64 de varios MB nao cabe no `localStorage` (cota limitada). Entao, apos exibir o papel de parede anterior, o PlainTab **da um passo extra**: usa o Canvas para redimensionar a imagem para um JPEG de 640px de largura com qualidade 0.55, geralmente comprimindo para 30KB–60KB, armazenando com seguranca no `localStorage`. Na proxima abertura de nova guia, o `preload.js` o utiliza diretamente.

640px e nitido o suficiente em telas 2K para nao parecer uma miniatura — e para controlar esses poucos KB de tamanho, por tras estao o dimensionamento preciso da [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) + o ajuste de qualidade de [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL). Esta miniatura tambem e a fonte de dados para o grid 3x4 da galeria — gerada uma vez, reutilizada em dois lugares.

### Duplo `requestAnimationFrame` impulsionando transicao CSS

Na etapa de transicao da miniatura para a imagem em alta definicao, a transicao CSS deve ser acionada. Mas o calculo de estilo e a renderizacao do navegador sao assincronos — se voce adicionar a classe imediatamente apos definir o `backgroundImage`, o navegador pode processar ambos os estados no mesmo quadro de renderizacao, e a animacao de transicao nao sera acionada.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

O primeiro [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) garante que o `backgroundImage` foi computado; o segundo garante que o estilo foi submetido ao pipeline de renderizacao. So entao, ao adicionar a classe, o navegador ve a mudanca de "estilo antigo → novo estilo" e pode acionar a transicao corretamente. Falte um passo, e a transicao e ignorada — o usuario ve uma troca brusca em vez de um fade-in suave.

### Por que IndexedDB e localStorage coexistem?

Os dois armazenamentos nao sao uma escolha binaria, mas uma divisao de trabalho:

| Armazenamento | O que contem | Por que aqui |
|--------------|-------------|--------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | Blobs originais (Bing daily, imagens locais enviadas pelo usuario) | Arquivos grandes precisam de cota grande; leitura/escrita assincrona e perfeitamente aceitavel em caminhos fora do primeiro quadro |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | Miniaturas `data: URL`, preferencias de UI, metadados, indice de rotacao | **Leitura sincrona** — este e o ponto-chave. `preload.js` executa antes do primeiro quadro e nao pode esperar por callbacks assincronos |

A conexao IDB e armazenada em cache como singleton, recriada automaticamente em `onclose`. Blobs recuperados do IDB podem perder o MIME type — o campo `mime` e sempre registrado ao armazenar, e ao recuperar usa-se `new Blob([blob], {type: img.mime})` para reconstruir, garantindo que o Blob URL renderize corretamente.

### Auto-cura de miniaturas

`saveLocalImage()` primeiro escreve no IDB (blob), depois no localStorage (miniatura). As duas etapas nao sao uma transacao atomica — se a pagina falhar exatamente entre elas, o array de miniaturas tera um item a menos que o array de imagens. O PlainTab nao faz uma auto-verificacao global na inicializacao (isso mascararia inconsistencias de dados mais graves), mas sim **regenera a miniatura no local** quando a rotacao encontra a imagem com a miniatura ausente. A correcao so ocorre quando os dois arrays tem o mesmo comprimento — comprimentos diferentes indicam uma anomalia de gravacao desconhecida; ignorar e a escolha mais segura.

### Ciclo de vida de Blob URLs

Todas as Blob URLs criadas via [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) na galeria sao rastreadas em um array e limpas em lote via [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) ao fechar a galeria. Mas este caminho e um fallback — **miniaturas base64 pre-geradas sao prioritarias**, pois base64 nao requer criacao/revogacao de Blob URL e renderiza mais rapido.

### Propriedades customizadas CSS para tema em tempo de execucao

A opacidade dos icones (`--icon-opacity`) e controlada via JS modificando uma [propriedade customizada CSS](https://developer.mozilla.org/docs/Web/CSS/--*), unificando todos os botoes de canto e Paineis — uma unica `setProperty` faz o navegador redesenhar automaticamente todos os elementos que referenciam essa variavel. Os tokens de design (`--glass-bg`, `--glass-border`, `--text-primary`, etc.) sao todos definidos em [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root), com tema escuro/claro alternado via media query [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme).

### Paineis de vidro fosco

Os Paineis de configuracoes e idioma usam [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) para desfocar o conteudo do papel de parede **atras** do Painel — nao e uma solucao barata de mascara semitransparente. Combinado com `--glass-bg: rgba(18, 18, 22, 0.82)`, produz uma verdadeira sensacao de profundidade.

### UI sensivel a posicao do mouse

Os botoes de canto e a barra de pesquisa so aparecem quando necessarios — duas funcoes matematicas `isNearTopRight()` e `isInCenter()` determinam a posicao do mouse, sem necessidade de bind `mouseenter`/`mouseleave` no fundo da tela inteira. O ocultamento tem atraso (400ms para botoes, 150ms para a barra de pesquisa) e e ignorado quando o painel esta aberto ou o campo de entrada esta focado. Cada caminho de interacao e o mais curto possivel: **aparecer rapido, desaparecer estavel**, sem interromper o usuario por disparos acidentais.

### Cadeia de Promises serial para upload em lote

Usuarios podem selecionar varias imagens locais de uma vez. Cada `saveLocalImage()` le e escreve no IDB — execucao paralela causaria condicoes de corrida. Uploads em lote usam uma cadeia de Promises serial para todas as operacoes de salvamento, escrevendo uma imagem de cada vez; a primeira imagem salva com sucesso e exibida como papel de parede, as demais sao apenas armazenadas. Assim, o usuario nao ve cintilacoes causadas por trocas repetidas de imagem.

### `chrome.search.query()` para conformidade com CWS

No modo extensao, [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) delega a pesquisa ao mecanismo de busca padrao do navegador — requisito de conformidade com a politica de proposito unico da Chrome Web Store. O seletor de mecanismo e ocultado do DOM e o icone se torna uma lupa estatica.

---

## Tecnologias usadas para eliminar latencia

O PlainTab nao usa nenhum framework ou biblioteca. Cada API abaixo foi escolhida para **eliminar uma espera assincrona, eliminar uma cintilacao visivel, reduzir um quadro de latencia**:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — decodifica assincronamente antes de definir o `backgroundImage`, evitando a pausa de decodificacao no primeiro quadro. O carregamento do `<img>` nao significa que a decodificacao terminou; sem chamar `decode()`, pode aparecer um quadro branco breve na primeira renderizacao
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — usa desfoque sintetizado por GPU em vez de camadas DOM extras e mascaras de imagem, zero custo adicional de layout
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — bloqueia o Dark Reader, impedindo que ele inverta as cores do papel de parede com filtros — o papel de parede e conteudo visual, e ser filtrado anularia o esforco de fidelidade do pipeline de miniaturas via Canvas
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — uma unica declaracao faz o navegador adaptar automaticamente as cores de formularios, barras de rolagem e controles do sistema, sem necessidade de dois conjuntos de estilos manuais
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — curva de easing unificada para todos os fades e animacoes de pop-in. Nao e `ease` ou `ease-in-out` — esta curva chega ao alvo mais rapido no inicio e tem uma atenuacao mais suave no final; para diferencas de resposta de UI na escala de milissegundos, a diferenca perceptivel e clara
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — no modo extensao, obtem o idioma da UI do navegador, refletindo a real intencao do usuario com mais precisao do que `navigator.language`
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — nao depende de `setTimeout` para adivinhar o momento da renderizacao, mas alinha-se precisamente ao ritmo de quadros do navegador. Usado duas vezes consecutivas para garantir uma fronteira de quadro clara entre o calculo de estilo e a submissao
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — Dispara ambos os endpoints da API do Bing simultaneamente e usa o que responder primeiro, eliminando esperas desnecessarias
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — Limita cada requisicao a API do Bing em 8 segundos, abortando limpidamente a conexao perdedora em vez de deixa-la pendurada no timeout TCP do sistema operacional

**As tecnologias nao usadas sao igualmente importantes**: zero dependencias externas. Sem React, Tailwind ou ferramentas de build. O CSP no `manifest.json` restringe `script-src 'self'` — o navegador impoe vanilla JS puro. Cada biblioteca nao incluida significa menos tempo de parsing, menor sobrecarga de rede, primeiro quadro mais cedo.

**Font stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` — fontes nativas do sistema operacional, zero requisicoes de rede, zero deslocamento de layout. Arquivos de fonte estao entre os maiores recursos de bloqueio de pagina; o PlainTab contorna todo o problema.

---

## Dois modos de operacao

Mesmo codigo, deteccao automatica de ambiente em tempo de execucao:

| Caracteristica | Modo Extensao | Modo Web |
|---------------|---------------|----------|
| Deteccao de ambiente | `chrome.runtime.id` existe | Todos os outros casos |
| Mecanismo de busca | Padrao do navegador (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo selecionavel |
| Alternancia de mecanismo | Nao alternavel (lupa estatica) | Rotacao ao clicar no icone |
| Implantacao | Chrome Web Store / carregamento pelo desenvolvedor | Cloudflare Workers / GitHub Pages hospedagem direta |
| CSP | Declarado no `manifest.json` | Sem CSP |

---

## Prioridade de carregamento do papel de parede

Cada vez que uma nova guia e aberta, a seguinte ordem de fontes de papel de parede mais rapidas e consultada:

1. **Rodizio de wallpapers locais** — imagens do proprio usuario (ate 12), blob ja no IDB, acesso direto. Miniatura pre-gerada. Zero custo de rede.
2. **Cache Bing do dia** — o wallpaper Bing ja obtido no dia, blob no IDB, convertido diretamente para Blob URL. Zero custo de rede.
3. **Requisicao de rede ao Bing** — so acessa a rede se os dois niveis anteriores nao estiverem disponiveis. Apos obter a URL, exibe imediatamente enquanto faz o download assincrono do blob para o IDB, eliminando a espera de rede na proxima vez.

No modo de wallpapers locais, o wallpaper Bing tambem e atualizado silenciosamente em segundo plano — o usuario pode mudar para o modo Bing a qualquer momento sem esperar pela rede.

A API do Bing dispara ambos os endpoints simultaneamente via `Promise.any` com um tempo limite de 8 segundos via `AbortController` — a resposta mais rapida vence. Os payloads JSON sao minusculos, entao a requisicao extra custa praticamente nada, mas a disputa garante latencia ideal independentemente de onde voce estiver. O codigo de idioma (ex.: `zh-CN`) e mapeado para o codigo de mercado Bing, com alguns idiomas fallback para `en-US`.

---

## Internacionalizacao

Suporte a 16 idiomas: English, 简体中文, 繁體中文, 日本語, 한국어, Español, Русский, Deutsch, Français, Italiano, Portugues, हिन्दी, العربية, Türkçe, Polski, Tiếng Việt.

Dois sistemas i18n paralelos: o Chrome `_locales/` cuida dos metadados do manifesto da extensao (apenas duas chaves: `extName`, `extDesc`), enquanto o [`languages.js`](../js/languages.js) gerencia todas as strings de UI. Prioridade de deteccao de idioma: idioma da UI do Chrome (modo extensao) → `navigator.language` (modo web) → correspondencia de idioma principal → fallback para English.

A traducao tem falhas ou quer adicionar um novo idioma? O arquivo de idiomas e apenas o [`js/languages.js`](../js/languages.js), um mapeamento chave-valor simples. Faca as alteracoes e abra um PR.

---

## Estrutura do projeto

```
PlainTab/
├── manifest.json            # Manifesto da extensao Chrome/Edge (Manifest V3)
├── index.html               # Unica pagina HTML (nova guia da extensao / pagina inicial web)
├── 404.html                 # Pagina de fallback SPA
├── LICENSE                  # Licenca MIT
│
├── css/
│   └── newtab.css           # Todos os estilos: camada dupla, vidro fosco, barra de pesquisa, responsivo
│
├── js/
│   ├── preload.js           # IIFE sincrono: injeta miniatura na camada traseira antes do primeiro quadro
│   ├── languages.js         # Tabela de strings de UI em 16 idiomas + lista de idiomas
│   └── newtab.js            # Programa principal: gerenciamento de wallpaper, i18n, armazenamento, UI, mecanismo de busca
│
├── _locales/                # i18n do Chrome (16 diretorios de idioma, apenas manifesto)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # Icones da extensao (16/48/128/2048 px)
│
├── imgs/                    # Capturas de tela e imagens promocionais
│   ├── chrome_01.jpg ~ chrome_08.jpg  # Capturas de tela de funcionalidades
│   └── small_promo.png      # Imagem promocional pequena da Chrome Web Store
│
├── docs/                    # READMEs multilingues (16 idiomas) + CHANGELOG
│
└── changelog/               # Registros de alteracoes por idioma
```

- **[`css/`](../css/)** — arquivo unico de ~617 linhas, tema escuro/claro, tokens de design glassmorphism, breakpoint responsivo 480px
- **[`js/`](../js/)** — tres arquivos carregados em ordem: `preload.js` → `languages.js` → `newtab.js` (ordem nao pode ser alterada)
- **[`_locales/`](../_locales/)** — contem apenas `extName` e `extDesc` para o manifesto da extensao; todas as strings de UI sao gerenciadas por [`languages.js`](../js/languages.js)
- **[`imgs/`](../imgs/)** — capturas de tela e imagens promocionais necessarias para a Chrome Web Store
- **[`docs/`](../docs/)** — documentacao multilingue, 16 idiomas em arquivos independentes

---

## Contribuicao & Licenca

Codigo aberto sob licenca MIT. Encontrou um bug ou tem uma ideia? → [Abra uma Issue](https://github.com/kaininx/PlainTab/issues); quer modificar o codigo? → Fork + PR.

Algumas convencoes:
- **Mantenha zero dependencias** — sem pacotes npm, scripts CDN ou frameworks
- **Nao adicione etapas de build** — `index.html` deve rodar diretamente no navegador
- **Nao expanda permissoes** — `manifest.json` mantem apenas a permissao `search`

📋 [Registro de alteracoes](changelog.md)

---

## Agradecimentos

- As imagens diarias do Bing vem do [Bing](https://www.bing.com), agradecimentos a equipe da Microsoft Bing por fornecer imagens de alta qualidade diariamente
- Proxies da API: [bing.biturl.top](https://bing.biturl.top) (proxy publico) e [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (Cloudflare Worker de backup)
- Os papeis de parede exibidos nas capturas de tela sao de varios criadores da internet

MIT · [Kaelri](https://github.com/kaininx)
