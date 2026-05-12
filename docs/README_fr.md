<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Page d'accueil minimaliste</h1>


 > Un nouvel onglet ne devrait faire qu'une seule chose : s'ouvrir, afficher un joli fond d'écran, puis vous emmener vers la page web suivante. Avez-vous vraiment besoin d'une horloge, d'un message de bienvenue ou d'un écran rempli de raccourcis ? La réponse de PlainTab : une simplification extrême, une vitesse extrême — rendez son aspect original à votre nouvel onglet, beau et épuré.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licence">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Essayer_en_ligne-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 Voir plus de captures d'ecran</b></summary>
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
Ouvrir un nouvel onglet est une action instantanee — vous appuyez sur `Ctrl+T` et vous vous attendez a ce que votre fond d'ecran soit deja la. Pour y parvenir, toute la conception de PlainTab s'articule autour d'un objectif : **afficher le fond d'ecran a l'ecran le plus rapidement possible**, sans aucun processus de chargement visible. Architecture a deux couches, prechargement synchrone, pipeline de miniatures Canvas, strategie de stockage hybride — toutes les decisions techniques convergent vers une seule chose : plus rapide, plus fluide, plus imperceptible.

Le projet PlainTab est a la fois une extension de navigateur Manifest V3 et une page web independante. Zero dependances externes, aucune etape de construction, du vanilla JS + CSS pur. Le mode extension et le mode web partagent la meme base de code, detectant automatiquement l'environnement au moment de l'execution pour adapter le comportement. [Essayez-le en ligne](https://plaintab.netlify.app).

---

## Demarrage rapide

**Extension de navigateur** : Installez-la depuis le [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo).

**Page d'accueil en ligne** : Rendez-vous sur [plaintab.netlify.app](https://plaintab.netlify.app) et definissez-la comme page de demarrage dans les parametres de votre navigateur.

**Execution locale** :

```bash
git clone https://github.com/kaininx/PlainTab.git
```

Chargez le repertoire via "Charger l'extension non empaquetee" dans `chrome://extensions`. Aucune etape de construction, pas besoin de `npm install`.

<details>
<summary><b>🔧 Comment supprimer la barre grise en bas du nouvel onglet ?</b></summary>

Apres installation de l'extension, Chrome/Edge affiche un pied de page dans le coin inferieur droit du nouvel onglet (indiquant le nom de l'extension). Il s'agit d'un comportement du navigateur, PlainTab ne peut pas le controler dans le code.

Pour le desactiver : nouvel onglet → "Personnaliser Chrome" ✏️ dans le coin inferieur droit → Pied de page → desactiver "Afficher le pied de page sur la page de nouvel onglet". Voir l'[Aide officielle de Chrome](https://support.google.com/chrome/answer/11032183?hl=fr).

</details>

---

## Quelle est la rapidite du fond d'ecran ?

La presentation du fond d'ecran de PlainTab n'est pas "charger une image", mais **une progression sur trois echelles de temps**, chaque niveau perfectionnant l'experience sur le precedent :

| Moment | Ce qui se passe | Ce que l'utilisateur voit |
|------|-----------|-------------|
| **0ms** (avant la premiere image) | `preload.js` lit de maniere synchrone la miniature base64 depuis localStorage et l'ecrit directement dans `#wallpaperBack.style.backgroundImage` | Un fond d'ecran deja present — pas en HD, mais **jamais d'ecran blanc ni de fond gris** |
| **~300ms** | `loadWallpaper()` lit le Blob mis en cache depuis IndexedDB et l'affiche via une URL de Blob | Le fond HD apparait, remplacant en douceur la miniature via une transition d'opacite CSS |
| **Uniquement lorsque le cache expire** | Requete reseau vers l'API Bing → telechargement du Blob → affichage → mise en cache asynchrone dans IDB | L'utilisateur ne le remarque pas — le fond precedent reste dans la couche back en secours |

Chacune des techniques ci-dessous sert ces trois moments — soit en raccourcissant le temps, soit en eliminant les traces de transition visibles.

---

## Points forts techniques

### Pas d'ecran blanc sur la premiere image : double couche + prechargement synchrone

C'est la conception la plus fondamentale de PlainTab. Lors de l'ouverture d'un nouvel onglet, avant que l'image ne soit entierement chargee, le navigateur affiche sa couleur d'arriere-plan par defaut — generalement un ecran blanc ou un fond gris. Deux couches `<div>` resolvent completement ce probleme :

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0) — contient toujours une image visible. [`preload.js`](../js/preload.js) s'execute de maniere synchrone dans `<head>`, ecrivant la miniature `data: URL` avant que le navigateur n'affiche sa premiere image. C'est synchrone — sans aucune API asynchrone, sans attendre le reseau. En mode de rotation multi-images, il sait meme quel index de miniature utiliser a ce moment-la.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`) — pour les transitions d'apparition progressive. La nouvelle image est pre-decodee en memoire via [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) → definie comme fond de la couche avant → apparait en fondu via la [transition CSS `opacity`](https://developer.mozilla.org/docs/Web/CSS/transition) → une fois la transition terminee, se stabilise sur la couche back → la couche front revient a la transparence.

Principe fondamental : **a tout moment, au moins une couche contient une image rendue**. La couche back a toujours quelque chose a afficher ; la couche front n'intervient que brievement pendant les transitions. Meme si l'utilisateur observe l'ecran image par image, il ne verra jamais un seul instant vide.

### De l'entree au pixel : pourquoi une miniature et pas l'image originale ?

`preload.js` ne peut pas attendre le chargement asynchrone — cela lui ferait rater la premiere image. Mais les images originales sont stockees de maniere asynchrone dans IndexedDB, et une chaine base64 de plusieurs Mo ne tient pas dans localStorage (quota limite). C'est pourquoi PlainTab, apres avoir affiche le fond d'ecran precedent, **fait un pas supplementaire** : il utilise Canvas pour reduire l'image en JPEG de 640 px de large, qualite 0.55, compressee generalement entre 30 Ko et 60 Ko, stockee en toute securite dans localStorage. La prochaine fois qu'un nouvel onglet s'ouvre, `preload.js` la recupere et l'utilise directement.

640 px est assez net sur un ecran 2K pour ne pas ressembler a une miniature — et derriere le controle de cette taille de quelques dizaines de Ko se trouvent le redimensionnement precis de l'[API Canvas](https://developer.mozilla.org/docs/Web/API/Canvas_API) + le reglage de qualite de [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL). Cette miniature est aussi la source de donnees pour la grille 3×4 de la galerie — generee une fois, reutilisee a deux endroits.

### Transition CSS pilotee par deux `requestAnimationFrame`

Au moment du passage de la miniature a l'image HD, il est necessaire de declencher la transition CSS. Mais le calcul des styles et le rendu du navigateur sont asynchrones — si la classe est ajoutee immediatement apres avoir defini `backgroundImage`, le navigateur pourrait traiter les deux etats dans le meme rendu d'image, et l'animation de transition ne se declencherait pas.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

Le premier [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) garantit que `backgroundImage` a ete calcule ; le second garantit que le style a ete soumis au pipeline de rendu. Ce n'est qu'en ajoutant la classe a ce moment-la que le navigateur voit un changement de "style ancien → style nouveau", declenchant ainsi la transition correcte. S'il manque une etape, la transition est directement sautee — l'utilisateur voit un changement brusque au lieu d'un fondu en douceur.

### Pourquoi IndexedDB et localStorage coexistent-ils ?

Il ne s'agit pas d'un choix entre deux stockages, mais d'une division du travail :

| Stockage | Ce qu'il contient | Pourquoi ici |
|------|--------|---------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | Blobs originaux (fond quotidien Bing, images locales importees par l'utilisateur) | Les fichiers volumineux necessitent des quotas importants ; la lecture/ecriture asynchrone est parfaitement acceptable en dehors du chemin de la premiere image |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | Miniatures `data: URL`, preferences UI, metadonnees, index de rotation | **Lecture synchrone** — c'est la cle. `preload.js` s'execute avant la premiere image et ne peut attendre aucun rappel asynchrone |

La connexion IDB est mise en cache en singleton et se reconstruit automatiquement a la fermeture (`onclose`). Les Blobs recuperes depuis IDB peuvent perdre leur type MIME — lors du stockage, enregistrez toujours le champ `mime` ; lors de la recuperation, reconstruisez avec `new Blob([blob], {type: img.mime})` pour garantir un rendu correct du Blob URL.

### Auto-guérison des miniatures

`saveLocalImage()` ecrit d'abord dans IDB (blob), puis dans localStorage (miniature). Ces deux etapes ne constituent pas une transaction atomique — si la page plante entre les deux, le tableau de miniatures aura un element de moins que le tableau d'images. PlainTab n'effectue pas d'auto-verification globale au demarrage (cela pourrait masquer des incoherences de donnees plus graves), mais **regenere la miniature a la volee lorsque la rotation atteint une image dont la miniature est manquante**. Il ne repare que lorsque les deux tableaux ont la meme longueur — une difference de longueur indique une anomalie d'ecriture inconnue, et le sauter est l'option la plus sure.

### Cycle de vie des Blob URLs

Toutes les Blob URLs creees via [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) dans la galerie sont suivies dans un tableau et nettoyees en lot via [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) a la fermeture de la galerie. Mais ce chemin est un fallback — **la priorite est donnee aux miniatures base64 pregenerees**, car le base64 ne necessite ni creation ni revocation de Blob URL, et son rendu est plus rapide.

### Thematisation a l'execution avec les proprietes personnalisees CSS

L'opacite des icones (`--icon-opacity`) est controlee en modifiant une [propriete personnalisee CSS](https://developer.mozilla.org/docs/Web/CSS/--*) depuis JS, controlant de maniere unifiee tous les boutons de coin et panneaux — un seul setProperty, et le navigateur reaffice automatiquement tous les elements qui referencent cette variable. Les jetons de conception (`--glass-bg`, `--glass-border`, `--text-primary`, etc.) sont tous definis sur [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root), et les themes sombre/clair sont changes via la requete media [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme).

### Panneaux en verre fume

Les panneaux de parametres et de langue utilisent [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) pour flouter le contenu du fond d'ecran **derriere** le panneau — pas la solution bon marche d'une superposition semi-transparente. Combine avec `--glass-bg: rgba(18, 18, 22, 0.82)`, il cree une veritable sensation de profondeur.

### Interface utilisateur sensible a la position de la souris

Les boutons de coin et la barre de recherche n'apparaissent que lorsque necessaire — `isNearTopRight()` et `isInCenter()` sont deux fonctions mathematiques qui determinent la position de la souris, sans avoir a lier `mouseenter`/`mouseleave` a la couche de fond plein ecran. Le masquage est differe (400 ms pour les boutons, 150 ms pour la barre de recherche) et est ignore lorsqu'un panneau est ouvert ou qu'un champ de saisie a le focus. Chaque chemin d'interaction est le plus court possible : **apparaitre vite, disparaitre stablement**, sans interrompre l'utilisateur par des declenchements accidentels.

### Chargement par lots avec chaine de Promesses en serie

Les utilisateurs peuvent selectionner plusieurs fonds d'ecran locaux a la fois. Chaque `saveLocalImage()` lit et ecrit dans IDB — l'execution en parallele provoquerait des conditions de concurrence. Le chargement par lots serialise toutes les operations de sauvegarde via une chaine de Promesses, n'ecrivant qu'une seule image a la fois ; la premiere image sauvegardee avec succes est affichee comme fond d'ecran, les autres sont simplement stockees. Ainsi, l'utilisateur ne voit pas de scintillement cause par des changements repetitifs d'image.

### `chrome.search.query()` pour la conformite CWS

En mode extension, [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) est utilise pour deleguer la recherche au moteur de recherche par defaut du navigateur — une exigence de conformite a la politique d'usage unique du Chrome Web Store. Le selecteur de moteur est masque du DOM et l'icone devient une loupe statique.

---

## Technologies utilisees pour eliminer la latence

PlainTab n'utilise aucun framework ni bibliotheque. Chaque API suivante a ete choisie pour **economiser une attente asynchrone, eliminer un scintillement visible, reduire un delai d'une image** :

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — decode de maniere asynchrone avant de definir `backgroundImage`, evitant la pause de decodage lors du rendu de la premiere image. Le chargement d'une `<img>` ne signifie pas qu'elle est decodee — ne pas appeler `decode()` pourrait afficher une breve image vide lors du premier rendu
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — utilise un flou synthetise par GPU pour eliminer les couches DOM supplementaires et les images de masque, sans cout de disposition supplementaire
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — verrouille Dark Reader, l'empechant d'inverser les couleurs du fond d'ecran avec des filtres — le fond d'ecran est lui-meme un contenu visuel ; etre traite par des filtres reduirait a neant les efforts de fidelite du pipeline de miniatures Canvas
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — une seule declaration permet au navigateur d'adapter automatiquement les couleurs des formulaires, barres de defilement et controles systeme, sans avoir a ecrire deux ensembles de styles manuellement
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — courbe d'acceleration unifiee, partagee par toutes les animations d'apparition et de fenetre contextuelle. Ce n'est pas `ease` ni `ease-in-out` — cette courbe atteint l'objectif plus rapidement au debut et a une attenuation plus douce a la fin ; pour des differences de reponse UI de l'ordre de la milliseconde, la difference de ressenti est notable
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — obtient la langue de l'interface du navigateur en mode extension, refletee l'intention reelle de l'utilisateur plus precisement que `navigator.language`
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — ne depend pas de `setTimeout` pour deviner le moment du rendu, mais s'aligne precisement sur le rythme d'images du navigateur. L'utiliser deux fois garantit une limite d'image claire entre le calcul des styles et leur soumission

**Les technologies non utilisees sont tout aussi importantes** : zero dependances externes. Pas de React, Tailwind ou outils de construction. La CSP dans `manifest.json` restreint `script-src 'self'` — le navigateur impose du vanilla JS pur. Chaque bibliotheque non incluse signifie moins de temps d'analyse, moins de surcharge reseau, une premiere image plus precoce.

**Pile de polices** : `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` — polices natives du systeme d'exploitation, zero requete reseau, zero decalage de disposition. Les fichiers de polices sont generalement l'une des plus grandes ressources de blocage d'une page ; PlainTab contourne tout le probleme.

---

## Deux modes d'execution

Le meme code, detection automatique de l'environnement a l'execution :

| Fonctionnalite | Mode extension | Mode web |
|------|----------|----------|
| Detection d'environnement | `chrome.runtime.id` existe | Tous les autres cas |
| Moteur de recherche | Defaut du navigateur (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo selectionnable |
| Changement de moteur | Non modifiable (loupe statique) | Alternance par clic sur l'icone |
| Deploiement | Chrome Web Store / chargement developpeur | Netlify / GitHub Pages hebergement direct |
| CSP | Declare dans `manifest.json` | CSP non necessaire |

---

## Priorite de chargement du fond d'ecran

Chaque fois qu'un nouvel onglet s'ouvre, la source de fond d'ecran la plus rapide disponible est recherchee dans l'ordre suivant :

1. **Rotation des fonds locaux** — les propres images de l'utilisateur (12 maximum), Blob deja dans IDB, recuperees directement. Les miniatures sont deja pregenerees. Zero cout reseau.
2. **Cache Bing du jour** — le fond Bing deja recupere aujourd'hui, le Blob est dans IDB, directement converti en Blob URL pour affichage. Zero cout reseau.
3. **Recuperation reseau Bing** — le reseau n'est sollicite que lorsque les deux niveaux precedents ne sont pas disponibles. Une fois l'URL obtenue, affichage immediat, tout en telechargeant le Blob de maniere asynchrone dans IDB pour eviter l'attente reseau la prochaine fois.

En mode fonds locaux, le fond Bing est egalement mis a jour silencieusement en arriere-plan — l'utilisateur peut revenir au mode Bing a tout moment sans attendre le reseau.

L'API Bing dispose de deux points d'acces pour la bascule principale/secours, les codes de langue (comme `zh-CN`) sont mappes aux codes de marche Bing, et certaines langues tombent en secours sur `en-US`.

---

## Internationalisation

Prend en charge 16 langues : 简体中文, 繁體中文, English, 日本語, 한국어, Español, Русский, Deutsch, Français, Italiano, Português, हिन्दी, العربية, Türkçe, Polski, Tiếng Việt.

Deux systemes i18n en parallele : Chrome `_locales/` gere les metadonnees du manifeste de l'extension (seulement deux cles `extName`, `extDesc`), [`languages.js`](../js/languages.js) gere toutes les chaines de l'interface utilisateur. Ordre de detection de la langue : langue de l'interface Chrome (mode extension) → `navigator.language` (mode web) → correspondance de la langue principale → secours vers English.

Une imperfection dans la traduction ou vous souhaitez ajouter une nouvelle langue ? Le fichier de langues est unique, [`js/languages.js`](../js/languages.js), un pur mappage cle-valeur. Faites les modifications et soumettez une PR.

---

## Structure du projet

```
PlainTab/
├── manifest.json            # Manifeste d'extension Chrome/Edge (Manifest V3)
├── index.html               # Page HTML unique (nouvel onglet de l'extension / page d'accueil web)
├── 404.html                 # Page de repli SPA Netlify
├── LICENSE                  # Licence MIT
│
├── css/
│   └── newtab.css           # Tous les styles : fond a double couche, panneaux en verre fume, barre de recherche, responsive
│
├── js/
│   ├── preload.js           # IIFE synchrone : injecte la miniature dans la couche back avant la premiere image
│   ├── languages.js         # Tableau de chaines UI pour 16 langues + liste des langues
│   └── newtab.js            # Programme principal : gestion des fonds, i18n, stockage, UI, moteur de recherche
│
├── _locales/                # i18n Chrome (16 repertoires de langues, uniquement pour le manifeste de l'extension)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # Icônes de l'extension (16/48/128/2048 px)
│
├── imgs/                    # Captures d'ecran et images promotionnelles
│   ├── chrome_01.jpg ~ chrome_08.jpg  # Captures d'ecran des fonctionnalites
│   └── small_promo.png      # Petite image promotionnelle Chrome Web Store
│
├── docs/                    # README multilingue (16 langues) + CHANGELOG
│
└── changelog/               # Journal des mises a jour par langue
```

- **[`css/`](../css/)** — Fichier unique ~617 lignes, theme sombre/clair, jetons de conception verre-morphisme, point de rupture responsive a 480 px
- **[`js/`](../js/)** — Trois fichiers charges dans l'ordre : `preload.js` → `languages.js` → `newtab.js` (l'ordre ne peut pas etre modifie)
- **[`_locales/`](../_locales/)** — Contient uniquement `extName` et `extDesc` pour le manifeste de l'extension ; toutes les chaines UI sont gerees par [`languages.js`](../js/languages.js)
- **[`imgs/`](../imgs/)** — Captures d'ecran et images promotionnelles requises par le Chrome Web Store
- **[`docs/`](../docs/)** et **[`changelog/`](../changelog/)** — Documentation multilingue, 16 langues chacune dans son propre fichier independant

---

## Contribution et licence

Code source ouvert sous licence MIT. Vous avez trouve un bug ou une idee ? → [Ouvrez une Issue](https://github.com/kaininx/PlainTab/issues) ; vous voulez modifier le code ? → Fork + PR.

Quelques conventions :
- **Maintenir zero dependance** — n'inclure aucun paquet npm, script CDN ou framework
- **Ne pas ajouter d'etape de construction** — `index.html` s'execute directement dans le navigateur
- **Ne pas etendre les permissions** — `manifest.json` ne conserve que la permission `search`

📋 [Journal des mises a jour](CHANGELOG.md)

---

## Remerciements

- Les images quotidiennes de Bing proviennent de [Bing](https://www.bing.com), merci a l'equipe Microsoft Bing pour fournir constamment des images quotidiennes de haute qualite
- Proxys API : [bing.biturl.top](https://bing.biturl.top) (proxy public) et [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (secours Cloudflare Worker)
- Les fonds d'ecran apparaissant dans les captures d'ecran proviennent de divers createurs sur le web

MIT · [Kaelri](https://github.com/kaininx)
