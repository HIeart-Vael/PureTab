<p align="center">
  <img src="../icon/icon2048.png" alt="Logotipo PlainTab" width="80">
</p>

<h1 align="center">PlainTab V3 · Página Inicial Minimalista</h1>

> **Uma nova aba deve fazer apenas uma coisa:**
> Abrir → mostrar um papel de parede que você aprecia → enviá-lo para a página que precisa.
> Você realmente precisa da hora, uma saudação ou uma tela cheia de atalhos?
> **A resposta do PlainTab: subtração radical. Uma reescrita completa com arquitetura de papel de parede de camada dupla. Zero cintilação — deixe sua nova aba retornar ao puro «PLAIN».**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.1-blue?style=flat-square" alt="Versão">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licença">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Demonstração ao vivo">
  </a>
</p>

<p align="center">
  <strong>Uma página inicial limpa, rápida e não intrusiva para novas abas.</strong><br>
  Disponível em <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · zero cintilação · sem limite de tamanho de arquivo<br>
  Papel de parede diário do Bing · Imagens locais · 16 idiomas · Barra de pesquisa flexível · <strong>Privacidade em primeiro lugar</strong>
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

## 🆕 Novidades na v3

A v3 é uma **reescrita completa do zero** com um avanço: **sistema de papel de parede de camada dupla com zero cintilação**.

<details>
<summary><b>💡 Por que a v2 cintilava?</b></summary>

A versão antiga usava uma única `<div>` com alternância de `background-image` via CSS. Passar da miniatura (regra de folha de estilo) para a imagem completa (estilo inline) exigia uma mudança em cascata — durante a qual o navegador descartava o fundo renderizado por pelo menos um quadro, revelando o fundo cinza.

</details>

**Solução da v3 — Composição de camada dupla:**
1. `#wallpaperBack` — sempre mantém uma imagem visível. `preload.js` escreve sincronamente uma miniatura de 640px antes da primeira pintura do navegador
2. `#wallpaperFront` — começa transparente. Após a imagem completa ser decodificada, aparece gradualmente por cima
3. Pelo menos uma camada sempre tem uma imagem visível → **sem flash cinza**

Consulte [CHANGELOG.md](./CHANGELOG.md) para detalhes técnicos completos.

---

## ✨ Por que PlainTab?

- 🔒 **Privacidade absolutamente limpa** — Nenhum dado pessoal coletado. Todos os papéis de parede armazenados localmente.
- 🚀 **Início de navegação unificado em um minuto** — Defina como página inicial + instale a extensão. A extensão nunca força alterações na página inicial.
- 🧩 **Tão leve que você mal sente** — Zero dependências, JavaScript puro, inicialização instantânea.
- 🌍 **Funciona de imediato** — Detecta automaticamente o idioma do navegador (16), suporta Google / Bing / Baidu / DuckDuckGo.

---

## 🚀 Duas formas de experimentar

| Método | Descrição | Melhor para |
|--------|-------------|----------|
| 🌐 **Página inicial online** | Visite [plaintab.netlify.app](https://plaintab.netlify.app), defina como página inicial do navegador | Uma página inicial limpa sem instalar nada |
| 🧩 **Extensão do navegador** | Instale da Chrome ou Edge Store | Experiência minimalista em cada nova aba |

### Extensão de Navegador · Instalação da Loja
- **Chrome Web Store**: [Em breve]()
- **Edge Add-ons**: [Em breve]()

> 💡 Ainda não está no ar? Carregue manualmente no modo desenvolvedor: vá a `chrome://extensions` → ative o **Modo desenvolvedor** → **Carregar sem compactação** → selecione a pasta do projeto

---

## 💡 Escolha do desenvolvedor: três papéis de parede, três entradas

Você instalou a extensão — sua nova aba já está ótima. Mas aqui está algo que você talvez não saiba: o PlainTab também está implantado em mais dois lugares:

| Entrada | Configuração | URL |
|---------|-------------|------|
| 🧩 **Nova aba** | Extensão do navegador | Carregar esta extensão |
| 🌐 **Página inicial** | Inicialização do navegador | `plaintab.netlify.app` |
| 🏠 **Homepage** | Botão inicial | `kaininx.github.io/PlainTab` |

Defina `plaintab.netlify.app` como a página inicial do seu navegador, deixe-a seguir a atualização diária do Bing. Cada vez que você iniciar o navegador, esse será seu **segundo papel de parede**.

Sim, tem mais. Encontre o "Botão inicial" nas configurações de aparência do seu navegador, coloque `kaininx.github.io/PlainTab`, escolha outro papel de parede que você goste. Agora você tem um **terceiro papel de parede**.

As três entradas são completamente isoladas. Dê a cada uma um papel de parede local diferente, ou deixe cada uma seguir a atualização diária do Bing. Abra o navegador: um papel de parede. Clique no botão inicial: outro. Abra uma nova aba: um terceiro. Rotação garantida.

**Configuração:**
1. Instale a extensão → Nova aba ✓
2. Configurações do navegador → Ao iniciar → Abrir uma página específica → `https://plaintab.netlify.app`
3. Configurações do navegador → Aparência → Mostrar botão inicial → `https://kaininx.github.io/PlainTab`

---

## 🛠️ Uso

| Ação | Efeito |
|--------|--------|
| Mover o mouse para o canto superior direito | Mostrar ícones de idioma / configurações |
| Mover o mouse perto do centro | Barra de pesquisa aparece (modo flutuante) |
| Clicar no ícone de engrenagem | Abrir painel de papel de parede e opções avançadas |
| Clicar no ícone do globo | Alternar idioma da interface |
| Clicar no ícone do mecanismo de pesquisa | Alternar Google → Bing → Baidu → DuckDuckGo |
| Pressionar `Enter` na barra de pesquisa | Pesquisar com o mecanismo atual |
| Pressionar `Esc` | Fechar todos os painéis |

### Papel de parede
- **Bing Diário**: Obtido automaticamente uma vez por dia. Apenas a imagem de hoje é armazenada em cache localmente.
- **Papel de parede local**: Envie imagens de qualquer tamanho (IndexedDB, **sem limite de tamanho de arquivo**). Apenas a última imagem enviada é mantida. Redefinição com um clique para o Bing diário.

### Opções avançadas
| Opção | Descrição |
|--------|-------------|
| Modo da barra de pesquisa | Flutuante / Sempre / Oculta |
| Opacidade do ícone | 0 – 1 (padrão 0.45) |
| Mecanismo de pesquisa | Google / Bing / Baidu / DuckDuckGo |

> **Extensão Chrome vs. Versão Web — Diferença de pesquisa:** Para cumprir a política de "Propósito Único" da Chrome Web Store, a extensão usa a Chrome Search API, que respeita o mecanismo de pesquisa padrão definido nas configurações do navegador do usuário. O recurso de alternância de mecanismo não está disponível no modo de extensão. A versão web (Netlify / GitHub Pages) não está sujeita a esta restrição e mantém o seletor completo de mecanismo de pesquisa. Além da implementação de pesquisa, ambas as versões são funcionalmente idênticas.

> Todas as configurações salvas no `localStorage`. Sem conta, sem sincronização na nuvem.

---

## 🔧 Barra de rodapé da nova guia

Após instalar a extensão, o Chrome / Edge mostra um rodapé no canto inferior direito da página de nova guia (exibindo o nome da extensão). Isso é um comportamento do navegador, não algo que o PlainTab adiciona.

**Como ocultar (de acordo com a [Ajuda do Chrome](https://support.google.com/chrome/answer/11032183?hl=pt)):**

Abra uma nova guia → clique no ícone "Personalizar o Chrome" ✏️ no canto inferior direito → Rodapé → desative "Mostrar rodapé na página Nova guia".

---

## 🌐 Suporte multilíngue

16 idiomas integrados, detectados automaticamente pelo navegador, selecionáveis manualmente a qualquer momento:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Contribuição

Issues e Pull Requests são bem-vindas. Mantenha o PlainTab minimalista — JavaScript puro, sem etapas de compilação, sem dependências.

---

## 📄 Licença

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Agradecimentos

- APIs de papel de parede do Bing: [bing.img.run](https://bing.img.run) e [bing.biturl.top](https://bing.biturl.top)
- Alguns papéis de parede nas capturas de tela são da web — agradecimentos a cada criador talentoso.

---

<p align="center">
  <sub>Limpo · Rápido · Sem anúncios · Apenas seu</sub>
</p>
