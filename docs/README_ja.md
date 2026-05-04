<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab V3 · ミニマルなスタートページ</h1>

> **新しいタブがすべきことはひとつだけ：**
> 開く → 美しい壁紙を表示する → 必要なページへ送り出す。
> 時計や挨拶、ショートカットだらけの画面は本当に必要ですか？
> **PlainTab の答え：徹底的な引き算。二層壁紙アーキテクチャをゼロから再構築。ちらつきゼロ——あなたの新しいタブを純粋な「PLAIN」へ。**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.3-blue?style=flat-square" alt="バージョン">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="ライセンス">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/ライブデモ-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<p align="center">
  <strong>クリーンで高速、邪魔にならないスタートページと新規タブのソリューション。</strong><br>
  <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> で公開中 · ちらつきゼロ · ファイルサイズ制限なし<br>
  Bing 毎日壁紙 · ローカル画像 · 16 言語 · 柔軟な検索バー · <strong>プライバシー重視</strong>
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

## 🆕 v3 の新機能

v3 は**ゼロからの完全な書き直し**です。画期的なのは：**ちらつきゼロの二層壁紙システム**。

<details>
<summary><b>💡 v2 がちらついた理由は？</b></summary>

旧バージョンでは単一の `<div>` で CSS `background-image` を切り替えていました。サムネイル（stylesheet ルール）からフル画像（inline style）への切り替え時にカスケード変更が発生し、その間少なくとも 1 フレームは背景がレンダリングされず、灰色の背景が見えていました。

</details>

**v3 の解決策 — 二層合成：**
1. `#wallpaperBack` — 常に可視画像を保持。`preload.js` はブラウザの最初の描画前に640pxのサムネイルを同期的に書き込みます
2. `#wallpaperFront` — 初期状態は透明。フル画像のデコード完了後に前面にフェードイン
3. 少なくとも1つのレイヤーが常に可視画像を持つ → **灰色のちらつきゼロ**

詳細は [CHANGELOG.md](./CHANGELOG.md) をご覧ください。

---

## ✨ PlainTab を選ぶ理由

- 🔒 **完全にクリーンなプライバシー** — 個人データ収集なし。すべての壁紙はローカルに保存
- 🚀 **1分で統一されたブラウジングを** — ホームページに設定 + 拡張機能をインストール。拡張機能はホームページ設定を強制変更しません
- 🧩 **感じないほど軽量** — 依存ゼロ、純粋なバニラ JavaScript、即時起動
- 🌍 **すぐに使えて、あなたを理解** — ブラウザ言語を自動検出（16言語）、Google / Bing / Baidu / DuckDuckGo 対応

---

## 🚀 二つの使い方

| 方法 | 説明 | 適している人 |
|------|------|-------------|
| 🌐 **オンラインスタートページ** | [plaintab.netlify.app](https://plaintab.netlify.app) をブラウザのホームページに設定 | 拡張機能なしでクリーンなホームページが欲しい方 |
| 🧩 **ブラウザ拡張機能** | Chrome または Edge ストアから拡張機能をインストール | すべての新しいタブでミニマルな体験が欲しい方 |

### ブラウザ拡張機能 · ストアインストール
- **Chrome Web Store**: [近日公開]()
- **Edge Add-ons**: [近日公開]()

> 💡 まだ公開されていませんか？デベロッパーモードで手動読み込み：`chrome://extensions` → **デベロッパーモード** を有効 → **パッケージ化されていない拡張機能を読み込む** → プロジェクトフォルダを選択

---

## 💡 開発者おすすめ：3つの壁紙、3つの入口

拡張機能をインストールしましたね。新しいタブはもう見栄えがいいはずです。でも、知らないかもしれません——PlainTab はさらに2つの場所にもデプロイされています：

| 入口 | 設定 | URL |
|------|--------|----------|
| 🧩 **新しいタブ** | ブラウザ拡張機能 | この拡張機能を読み込む |
| 🌐 **スタートページ** | ブラウザ起動時 | `plaintab.netlify.app` |
| 🏠 **ホームページ** | ホームボタン | `kaininx.github.io/PlainTab` |

`plaintab.netlify.app` をブラウザのスタートページに設定して、Bing の毎日更新に任せましょう。ブラウザを起動するたびに、それがあなたの**2つ目の壁紙**です。

そう、まだあります。ブラウザの外観設定で「ホームボタン」を見つけて、`kaininx.github.io/PlainTab` を入力し、好きな壁紙をもう一枚選んでください。これで**3つ目の壁紙**のできあがりです。

3つの入口は完全に分離されています。それぞれに異なるローカル壁紙を設定したり、それぞれを Bing の毎日更新に任せたりできます。ブラウザを起動する：1つの壁紙。ホームボタンをクリックする：別の壁紙。新しいタブを開く：さらに別の壁紙。入れ替わりはおまかせです。

**セットアップ：**
1. 拡張機能をインストール → 新しいタブ ✓
2. ブラウザ設定 → 起動時 → 特定のページを開く → `https://plaintab.netlify.app`
3. ブラウザ設定 → 外観 → ホームボタンを表示 → `https://kaininx.github.io/PlainTab`

---

## 🛠️ 使い方

| 操作 | 効果 |
|------|------|
| 右上隅にマウスを移動 | 言語 / 設定アイコンを表示 |
| ページ中央付近にマウスを移動 | 検索バーがフェードイン（ホバーモード時） |
| 歯車アイコンをクリック | 壁紙と詳細オプションパネルを開く |
| 地球アイコンをクリック | インターフェース言語を切り替え |
| 検索エンジンアイコンをクリック | Google → Bing → Baidu → DuckDuckGo を循環 |
| 検索バーで `Enter` を押す | 現在の検索エンジンで検索 |
| `Esc` を押す | すべてのパネルを閉じる |

### 壁紙
- **Bing 毎日壁紙**：1日1回自動取得。今日の画像のみローカルにキャッシュ。
- **ローカル壁紙**：任意のサイズの画像をアップロード（IndexedDB、**ファイルサイズ制限なし**）。最後にアップロードした画像のみ保持。ワンクリックで Bing 毎日にリセット。

### 詳細オプション
| オプション | 説明 |
|-----------|------|
| 検索バーモード | ホバー / 常に表示 / 非表示 |
| アイコン不透明度 | 0 – 1（デフォルト 0.45） |
| 検索エンジン | Google / Bing / Baidu / DuckDuckGo |

> **Chrome拡張機能 vs Web版 の検索の違い：** Chrome Web Storeの「Single Purpose」ポリシーに準拠するため、拡張機能版はChrome Search APIを使用し、ユーザーがブラウザ設定で選択したデフォルトの検索エンジンを尊重します。拡張機能モードでは検索エンジン切り替え機能は利用できません。Web版（Netlify / GitHub Pages）はこの制限を受けず、完全な検索エンジンセレクターを保持しています。検索実装以外は、両バージョンとも機能的に同一です。

> すべての設定は `localStorage` に保存。アカウント不要、クラウド同期なし。

---

## 🔧 新しいタブのフッターバー

拡張機能をインストールすると、Chrome / Edge の新しいタブページの右下にフッター（拡張機能名を表示）が表示されます。これはブラウザの動作であり、PlainTab が追加したものではありません。

**非表示にする方法（[Chrome ヘルプ](https://support.google.com/chrome/answer/11032183?hl=ja)より）：**

新しいタブを開く → 右下の「Chrome をカスタマイズ」✏️ アイコンをクリック → フッター → 「新しいタブページにフッターを表示」をオフにする。

---

## 🌐 多言語サポート

16の組み込み言語、ブラウザ言語から自動検出、いつでも手動選択可能：
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 貢献

Issue と Pull Request を歓迎します。PlainTab のミニマルなスタイルを維持してください——バニラ JS、ビルドステップなし、依存なし。

---

## 📄 ライセンス

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 謝辞

- Bing 壁紙 API：[bing.img.run](https://bing.img.run) & [bing.biturl.top](https://bing.biturl.top)
- スクリーンショット内の一部の壁紙はウェブからのものです。すべての才能あるクリエイターに感謝します。

---

<p align="center">
  <sub>クリーン · 高速 · 広告なし · あなただけのもの</sub>
</p>
