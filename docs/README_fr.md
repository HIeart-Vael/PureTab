<p align="center">
  <img src="../icon/icon2048.png" alt="Logo PlainTab" width="80">
</p>

<h1 align="center">PlainTab V3 · Page de démarrage minimaliste</h1>

> **Un nouvel onglet ne devrait faire qu'une seule chose :**
> S'ouvrir → vous montrer un fond d'écran que vous aimez → vous envoyer vers la page dont vous avez besoin.
> Avez-vous vraiment besoin de l'heure, d'un message de bienvenue ou d'un écran rempli de raccourcis ?
> **La réponse de PlainTab : la soustraction radicale. Une réécriture complète avec une architecture de fond d'écran à double couche. Zéro scintillement — que votre nouvel onglet retrouve sa pureté « PLAIN ».**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.4-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Licence">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Démo en direct">
  </a>
</p>

<p align="center">
  <strong>Une page de démarrage propre, rapide et non intrusive pour votre nouvel onglet.</strong><br>
  Disponible sur <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · zéro scintillement · aucune limite de taille de fichier<br>
  Fond d'écran Bing du jour · Images locales · 16 langues · Barre de recherche flexible · <strong>Confidentialité avant tout</strong>
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

## 🆕 Nouveautés de la v3

La v3 est une **réécriture complète à partir de zéro** avec une avancée majeure : **un système de fond d'écran à double couche sans scintillement**.

<details>
<summary><b>💡 Pourquoi la v2 scintillait-elle ?</b></summary>

L'ancienne version utilisait un seul `<div>` avec un changement de `background-image` en CSS. Passer de la vignette (règle de feuille de style) à l'image complète (style en ligne) nécessitait un changement en cascade — pendant lequel le navigateur supprimait l'arrière-plan rendu pendant au moins une image, révélant le fond gris.

</details>

**Solution de la v3 — Composition à double couche :**
1. `#wallpaperBack` — contient toujours une image visible. `preload.js` écrit de manière synchrone une vignette de 640px avant le premier rendu du navigateur
2. `#wallpaperFront` — commence transparent. Après le décodage de l'image complète, elle apparaît progressivement par-dessus
3. Au moins une couche a toujours une image visible → **aucun flash gris**

Voir [V3_NOTE.md](./V3_NOTE.md) pour tous les détails techniques.

---

## ✨ Pourquoi PlainTab ?

- 🔒 **Confidentialité absolument propre** — Aucune donnée personnelle collectée. Tous les fonds d'écran sont stockés localement.
- 🚀 **Démarrage de navigation unifié en une minute** — Définir comme page d'accueil + installer l'extension. L'extension ne force jamais de changement de page d'accueil.
- 🧩 **Tellement léger que vous le sentez à peine** — Zéro dépendance, JavaScript pur, démarrage instantané.
- 🌍 **Fonctionne immédiatement** — Détecte automatiquement la langue du navigateur (16), prend en charge Google / Bing / Baidu / DuckDuckGo.

---

## 🚀 Deux façons de l'essayer

| Méthode | Description | Idéal pour |
|--------|-------------|-----------|
| 🌐 **Page de démarrage en ligne** | Visitez [plaintab.netlify.app](https://plaintab.netlify.app), définissez-la comme page d'accueil du navigateur | Une page d'accueil propre sans rien installer |
| 🧩 **Extension de navigateur** | Installez depuis le Chrome ou Edge Store | Expérience minimaliste sur chaque nouvel onglet |

### Extension Navigateur · Installation depuis le Store
- **Chrome Web Store**: [Bientôt disponible]()
- **Edge Add-ons**: [Bientôt disponible]()

> 💡 Pas encore en ligne? Chargez manuellement en mode développeur: allez à `chrome://extensions` → activez le **Mode développeur** → **Charger l'extension non empaquetée** → sélectionnez le dossier du projet

---

## 💡 Le choix du développeur : trois fonds d'écran, trois entrées

Vous avez installé l'extension — votre nouvel onglet a déjà fière allure. Mais voici quelque chose que vous ne savez peut-être pas : PlainTab est aussi déployé à deux autres endroits :

| Entrée | Paramètre | URL |
|--------|-----------|-----|
| 🧩 **Nouvel onglet** | Extension navigateur | Charger cette extension |
| 🌐 **Page de démarrage** | Lancement du navigateur | `plaintab.netlify.app` |
| 🏠 **Page d'accueil** | Bouton d'accueil | `kaininx.github.io/PlainTab` |

Définissez `plaintab.netlify.app` comme page de démarrage de votre navigateur, laissez-la suivre la mise à jour quotidienne de Bing. Chaque fois que vous lancez le navigateur, c'est votre **deuxième fond d'écran**.

Oui, il y a plus. Trouvez le "Bouton d'accueil" dans les paramètres d'apparence de votre navigateur, mettez `kaininx.github.io/PlainTab`, choisissez un autre fond d'écran que vous aimez. Voilà, vous avez un **troisième fond d'écran**.

Les trois entrées sont complètement isolées. Donnez à chacune un fond d'écran local différent, ou laissez-les suivre la mise à jour quotidienne de Bing. Lancez le navigateur : un fond d'écran. Cliquez sur le bouton d'accueil : un autre. Ouvrez un nouvel onglet : un troisième. Rotation garantie.

**Configuration :**
1. Installez l'extension → Nouvel onglet ✓
2. Paramètres du navigateur → Au démarrage → Ouvrir une page spécifique → `https://plaintab.netlify.app`
3. Paramètres du navigateur → Apparence → Afficher le bouton d'accueil → `https://kaininx.github.io/PlainTab`

---

## 🛠️ Utilisation

| Action | Effet |
|--------|-------|
| Déplacer la souris en haut à droite | Afficher les icônes de langue / paramètres |
| Déplacer la souris près du centre | La barre de recherche apparaît (mode survol) |
| Cliquer sur l'icône d'engrenage | Ouvrir le panneau des fonds d'écran et options avancées |
| Cliquer sur l'icône du globe | Changer la langue de l'interface |
| Cliquer sur l'icône du moteur de recherche | Passer de Google → Bing → Baidu → DuckDuckGo |
| Appuyer sur `Entrée` dans la barre de recherche | Rechercher avec le moteur actuel |
| Appuyer sur `Échap` | Fermer tous les panneaux |

### Fond d'écran
- **Bing du jour** : Récupéré automatiquement une fois par jour. Seule l'image du jour est mise en cache localement.
- **Fond d'écran local** : Importez des images de n'importe quelle taille (IndexedDB, **aucune limite de taille de fichier**). Seule la dernière image importée est conservée. Réinitialisation en un clic vers Bing du jour.

### Options avancées
| Option | Description |
|--------|-------------|
| Mode barre de recherche | Survol / Toujours / Masquée |
| Opacité des icônes | 0 – 1 (par défaut 0.45) |
| Moteur de recherche | Google / Bing / Baidu / DuckDuckGo |

> **Extension Chrome vs. Version Web — Différence de recherche :** Pour se conformer à la politique d'« Usage unique » du Chrome Web Store, l'extension utilise l'API Chrome Search, qui respecte le moteur de recherche par défaut défini dans les paramètres du navigateur de l'utilisateur. La fonction de changement de moteur n'est pas disponible en mode extension. La version web (Netlify / GitHub Pages) n'est pas soumise à cette restriction et conserve le sélecteur de moteur de recherche complet. Hormis l'implémentation de la recherche, les deux versions sont fonctionnellement identiques.

> Tous les paramètres sont sauvegardés dans `localStorage`. Pas de compte, pas de synchronisation cloud.

---

## 🔧 Barre de pied de page du nouvel onglet

Après avoir installé l'extension, Chrome / Edge affiche un pied de page en bas à droite de la page du nouvel onglet (affichant le nom de l'extension). Il s'agit d'un comportement du navigateur, pas de quelque chose que PlainTab ajoute.

**Comment le masquer (d'après l'[Aide Chrome](https://support.google.com/chrome/answer/11032183?hl=fr)):**

Ouvrez un nouvel onglet → cliquez sur l'icône "Personnaliser Chrome" ✏️ en bas à droite → Pied de page → désactivez "Afficher le pied de page sur la page Nouvel onglet".

---

## 🌐 Support multilingue

16 langues intégrées, détectées automatiquement depuis le navigateur, sélectionnables manuellement à tout moment :
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Contribution

Les issues et Pull Requests sont les bienvenues. Gardez PlainTab minimaliste — JavaScript pur, sans étape de construction, sans dépendance.

---

## 📄 Licence

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Remerciements

- API de fonds d'écran Bing : [bing.img.run](https://bing.img.run) et [bing.biturl.top](https://bing.biturl.top)
- Certains fonds d'écran dans les captures d'écran proviennent du web — merci à chaque créateur talentueux.

---

<p align="center">
  <sub>Propre · Rapide · Sans pub · Rien qu'à vous</sub>
</p>
