<p align="center">
  <img src="icon/icon2048.png" alt="PlainTab ロゴ" width="80">
</p>

<h1 align="center">PlainTab · ミニマルスタートページ</h1>
<p align="center">
  <a href="README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.2.0-blue?style=flat-square" alt="バージョン">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="ライセンス">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/ライブデモ-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<p align="center">
  <strong>クリーンで高速、邪魔にならないスタートページ＆新しいタブのソリューション。</strong><br>
  オンライン版：<a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · ブラウザ拡張機能は Edge / Chrome ストアに近日公開予定<br>
  Bing 毎日壁紙 · ローカル画像 · 16 言語 · 柔軟な検索バー · <strong>プライバシー最優先</strong>
</p>

<div align="center">
  <img src="imgs/chrome_01.jpg" width="45%" />
  <img src="imgs/chrome_02.jpg" width="45%" /> 
  <img src="imgs/chrome_03.jpg" width="45%" />
  <img src="imgs/chrome_04.jpg" width="45%" /> 
  <img src="imgs/chrome_05.jpg" width="45%" />
  <img src="imgs/chrome_06.jpg" width="45%" /> 
  <img src="imgs/chrome_07.jpg" width="45%" />
  <img src="imgs/chrome_08.jpg" width="45%" /> 
</div>

---

## ✨ PlainTab を選ぶ理由

- 🔒 **完全にクリーンなプライバシー**  
  個人情報を一切収集せず、機密性の高い権限も要求しません。すべての壁紙はお使いの端末にのみ保存され、閲覧履歴は完全にあなただけのものです。

- 🚀 **1 分で統一されたブラウジングの起点を**  
  `plaintab.netlify.app` をブラウザのホームページに設定し、拡張機能をインストールして新しいタブを置き換えるだけ。ホームページ、スタートページ、新しいタブがすべて同じミニマルなスタイルに統一されます——拡張機能が**ホームページ設定を強制的に変更することはありません**。お好みのスタートページ URL を自由にお使いいただけます。

- 🧩 **感じないほどの軽さ**  
  外部依存ゼロ、ピュアなバニラ JavaScript。起動は一瞬で、クリックを一切遅くしません。

- 🌍 **すぐに使えて、あなたに寄り添う**  
  ブラウザの言語を自動検出（全 16 言語）。Google / Bing / Baidu / DuckDuckGo の 4 つの検索エンジンに対応。検索バーは「ホバー時」「常に表示」「非表示」から選択可能です。

---

## 🚀 2 つの体験方法

| 方法 | 説明 | こんな方に |
|------|------|------------|
| 🌐 **オンラインスタートページ** | [plaintab.netlify.app](https://plaintab.netlify.app) にアクセスし、ブラウザの設定でホームページ/スタートページとして設定 | 拡張機能をインストールせずに、すっきりしたホームページだけ欲しい方 |
| 🧩 **ブラウザ拡張機能** | 拡張機能を手動で読み込み（Edge / Chrome ストアに近日公開予定）。新しいタブが自動的に PlainTab になります | すべての新しいタブで同じミニマルな体験を求める方 |

> 💡 両方の併用をおすすめします：ホームページはオンライン版、新しいタブは拡張機能で、毎回のブラウジングの起点をクリーンに。

### ブラウザ拡張機能 · 手動インストール（デベロッパーモード）
1. リポジトリをクローン  
   `git clone https://github.com/kaininx/PlainTab.git`
2. Chrome または Edge を開き、`chrome://extensions` にアクセス
3. 右上の**デベロッパーモード**をオンにする
4. **パッケージ化されていない拡張機能を読み込む**をクリックし、プロジェクトフォルダを選択
5. 完了！新しいタブを開くと PlainTab が表示されます

---

## 🛠️ 使い方

| 操作 | 効果 |
|------|------|
| マウスを右上に移動 | 言語 / 設定アイコンを表示 |
| マウスをページ中央付近に移動 | 検索バーがフェードイン（「ホバー時」モードの場合） |
| 歯車アイコンをクリック | 壁紙と詳細オプションパネルを開く |
| 地球アイコンをクリック | インターフェース言語を切り替え |
| 検索エンジンアイコンをクリック | Google → Bing → Baidu → DuckDuckGo を順に切り替え |
| 検索バーで `Enter` を押す | 現在の検索エンジンで検索 |
| `Esc` を押す | すべてのパネルを閉じる |

### 壁紙
PlainTab の壁紙保存は意図的に抑制されており、**キャッシュが膨張することはありません**：

- **Bing 毎日壁紙**：1 日 1 回自動取得し、**その日の壁紙 1 枚のみ**をキャッシュします。古いキャッシュは自動的に置き換えられ、翌日オフラインでも昨日の画像を表示できる一方、ストレージの肥大化を防ぎます。
- **ローカル壁紙**：お手持ちの画像をアップロードできます（IndexedDB に保存）。システムは常に**最後にアップロードされた 1 枚**のみを保持し、新しいアップロードで古いものは置き換えられます。「Bing 毎日壁紙に戻す」をワンクリックするだけで、ローカル画像が削除され、毎日の自動更新に戻ります。

### 詳細オプション
| オプション | 説明 |
|------------|------|
| 検索バー表示 | ホバー時 / 常に表示 / 非表示 |
| アイコン不透明度 | 0 – 1（デフォルト 0.45） |
| デフォルト検索エンジン | Google / Bing / Baidu / DuckDuckGo |

> すべての設定は自動的に `localStorage` に保存されます。アカウント不要、クラウド同期なし。

---

## 🌐 多言語対応

ブラウザの言語に応じて自動切り替え、またはいつでも手動選択可能な 16 言語を内蔵：  
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

新しい言語を追加したいですか？`languages.js` を編集して Pull Request を送ってください。

---

## 🤝 コントリビューション

Issue や Pull Request を歓迎します。  
ただし、始める前に、私たちの共通の目標をご理解ください：

- **PlainTab のスタイルは「ミニマル」です**。すべてのコード行、すべての機能は、肥大化しないように慎重に検討されています。一見素晴らしい提案が最終的に採用されなかったとしても、それはその価値を否定するものではなく、この节制の精神を守るためのものです。
- 既存のコーディングスタイルに従ってください——バニラ JS、ビルドステップなし、サードパーティ依存なし。

基本フロー：
1. リポジトリをフォーク  
2. 新しいブランチを作成 (`feat/your-feature`)  
3. 変更をコミット  
4. ブランチにプッシュ  
5. Pull Request を作成

---

## 📄 ライセンス

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 謝辞

- Bing 壁紙 API は [bing.img.run](https://bing.img.run) と [bing.biturl.top](https://bing.biturl.top) によるものです。安定したサービス提供に感謝します。
- スクリーンショットで使用されている壁紙の一部はインターネットからのものです。**すべての才能あるクリエイターに感謝します**。本プロジェクトは完全に非営利の個人プロジェクトであるため、すべての出典を追跡することはできませんでした。もしあなたが作品の著作権者であり、その表示が権利を侵害していると思われる場合は、ぜひご連絡ください——速やかに使用許諾の取得、または該当画像の差し替えを行います。すべてのクリエイターの権利を深く尊重します。

---

<p align="center">
  <sub>クリーン · 高速 · 広告なし · あなただけのもの</sub>
</p>