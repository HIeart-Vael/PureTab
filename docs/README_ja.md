<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab ロゴ" width="80">
</p>

<h1 align="center">PlainTab · ミニマルスタートページ</h1>


> 新しいタブがやるべきことはたった一つ——開く、美しい壁紙を表示する、次のページへと送り出す。時計や挨拶、ショートカットリンクの羅列は本当に必要だろうか？
>
> PlainTab の答え：極限までの引き算、圧倒的な速さ——あなたの新しいタブを、本来の姿である美しく清らかな状態に戻すこと。

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt_BR.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.2-blue?style=flat-square" alt="バージョン">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="ライセンス">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/オンライン体験-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 スクリーンショットをもっと見る</b></summary>
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
新しいタブを開くのは一瞬の動作——`Ctrl+T` を押せば、壁紙がすでにそこにあることを期待する。その期待に応えるため、PlainTab の設計はすべて一つの目標に集約されている：**壁紙を可能な限り高速に画面に表示し**、目に見えるロード処理を一切排除すること。二層壁紙アーキテクチャ、同期プリロード、Canvas サムネイルパイプライン、ハイブリッドストレージ戦略——すべての技術的判断の果てにあるのは同じもの：より速く、より滑らかに、より意識させないこと。

PlainTab プロジェクトは、Manifest V3 ブラウザ拡張機能であると同時に、独立した Web ページでもある。ゼロ外部依存、ビルドステップ不要、純粋な vanilla JS + CSS。拡張モードと Web モードは同一のコードベースを共有し、実行時に自動的に環境を検出して動作を切り替える。[オンラインで即利用可能](https://plaintab.netlify.app)。

---

## クイックスタート

**ブラウザ拡張機能**：[Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) からインストール。

**オンラインスタートページ**：[plaintab.netlify.app](https://plaintab.netlify.app) にアクセスし、ブラウザ設定でスタートページに設定。

**ローカルで実行**：

```bash
git clone https://github.com/kaininx/PlainTab.git
```

`chrome://extensions` で「パッケージ化されていない拡張機能を読み込む」から該当ディレクトリを選択。ビルドステップも `npm install` も不要。

<details>
<summary><b>🔧 新しいタブの下部にグレーのバーが表示される場合</b></summary>

拡張機能インストール後、Chrome / Edge の新しいタブページ右下にフッター（現在の拡張機能名を表示）が表示されることがある。これはブラウザの動作であり、PlainTab がコードで制御できるものではない。

非表示にする方法：新しいタブ → 右下「Chrome をカスタマイズ」✏️ → フッター → 「新しいタブページにフッターを表示」をオフ。詳しくは [Chrome 公式ヘルプ](https://support.google.com/chrome/answer/11032183?hl=ja) を参照。

</details>

---

## 壁紙の速さはどのくらい？

PlainTab の壁紙表示は「画像を一枚ロードする」ではなく、**三つの時間スケールで段階的に**、各段階で前の段階より完全な体験を提供する：

| タイミング | 何が起きているか | ユーザーにどう見えるか |
|-----------|----------------|---------------------|
| **0ms（最初のフレームより前）** | `preload.js` が localStorage の base64 サムネイルを同期的に読み取り、`#wallpaperBack.style.backgroundImage` に直接書き込む | すでにそこにある壁紙——高解像度ではないが、**白画面や灰色背景は絶対にない** |
| **~300ms** | `loadWallpaper()` が IndexedDB からキャッシュされた Blob を読み取り、Blob URL で表示 | 高解像度の壁紙が表示され、CSS opacity トランジションでサムネイルを滑らかに置き換える |
| **キャッシュが無効な場合のみ** | ネットワーク経由で Bing API をリクエスト → Blob をダウンロード → 表示 → 非同期で IDB にキャッシュ | ユーザーは認識しない——前の壁紙が back 層で常に表示を担保している |

以下で説明する各技術は、すべてこの三つのタイミングに貢献している——時間を短縮するか、見える遷移の痕跡をなくすかのいずれかだ。

---

## 技術ハイライト

### 最初のフレームで白画面ゼロ：二層壁紙 + 同期プリロード

これが PlainTab の中核設計である。新しいタブは画像のロードが完了するまでブラウザのデフォルト背景色——通常は白または灰色——を表示してしまう。二枚の `<div>` がこの問題を根本的に解決する：

- **[`#wallpaperBack`](../index.html#L14)**（z-index: 0）——常に可視画像を保持する。[`preload.js`](../js/preload.js) は `<head>` 内で同期的に実行され、ブラウザが最初のフレームを描画する前にサムネイルの `data: URL` を書き込む。この処理は同期的である——非同期 API もネットワーク待ちも一切発生しない。複数画像ローテーションモードでは、どのサムネイルを使うべきかインデックスまで把握している。
- **[`#wallpaperFront`](../index.html#L16)**（z-index: 1, `opacity: 0`）——フェードイン遷移に使用する。新しい画像は [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) でメモリ上で事前デコード → 前面レイヤーの背景に設定 → CSS [`opacity` transition](https://developer.mozilla.org/docs/Web/CSS/transition) でフェードイン → 遷移完了後に back 層に安定化 → front は透明にリセット。

中核原則：**いかなる瞬間にも少なくとも一つのレイヤーがレンダリング済み画像を保持している**。back 層は常に表示可能な状態にあり、front 層は遷移中のみ一時的に機能する。ユーザーが画面をフレーム単位で凝視しても、空白の瞬間は決して発生しない。

### 入力からピクセルへ：なぜ原画ではなくサムネイルなのか？

`preload.js` は非同期ロードを待てない——最初のフレームに間に合わなくなる。しかし原画を IndexedDB に保存するのは非同期処理であり、数 MB にも及ぶ base64 文字列は localStorage（容量制限あり）に格納できない。そこで PlainTab は前の壁紙の表示が完了した後、**もう一手間かける**：Canvas で画像を 640px 幅の JPEG にリサイズ、品質 0.55、圧縮後は通常 30KB～60KB に収まり、安全に localStorage へ格納される。次に新しいタブが開かれたとき、`preload.js` が即座にそれを取り出す。

640px は 2K ディスプレイ上でサムネイルと気づかれないほど十分にシャープだ——そしてこの十数 KB のサイズを実現する背後には、[Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) による正確なリサイズと、[`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL) による品質調整がある。このサムネイルはギャラリーの 3×4 グリッド表示のデータソースとしても使われる——一度生成して二箇所で再利用。

### 二重 `requestAnimationFrame` で CSS トランジションを駆動

サムネイルから高解像度画像への切り替えでは、CSS transition を確実に発火させる必要がある。しかしブラウザのスタイル計算とレンダリングは非同期で行われる——`backgroundImage` を設定した直後に class を追加すると、ブラウザが同一フレーム内で二つの状態を同時に処理してしまい、トランジションアニメーションが発動しない。

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

一つ目の [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) は `backgroundImage` が確実に計算されたことを保証し、二つ目はスタイルがレンダリングパイプラインに送信されたことを保証する。その後に class を追加することで、ブラウザは「古いスタイル → 新しいスタイル」の変化として認識し、正しいトランジションが発動する。これが一段階不足するとトランジションは完全にスキップされ——ユーザーにはフェードインではなく、ハードな切り替えとして見えてしまう。

### IndexedDB と localStorage はなぜ併用するのか？

二つのストレージは二者択一ではなく、役割分担である：

| ストレージ | 格納するもの | なぜそこに格納するか |
|-----------|-------------|-------------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | 生 Blob（Bing 日替わり壁紙、ユーザーアップロードのローカル画像） | 大容量ファイルには大きなクォータが必要。非同期の読み書きは最初のフレーム以外のパスで十分許容できる |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | サムネイル `data: URL`、UI 設定、メタデータ、ローテーションインデックス | **同期的に読み取れる**——これが鍵。`preload.js` は最初のフレームより前に実行されるため、非同期コールバックを待てない |

IDB 接続はシングルトンとしてキャッシュされ、`onclose` 時に自動的に再構築される。IDB から取り出した Blob は MIME type が失われる可能性がある——保存時に常に `mime` フィールドを記録し、取り出し時に `new Blob([blob], {type: img.mime})` で再構築することで、Blob URL が正しくレンダリングされることを保証する。

### サムネイルの自己修復

`saveLocalImage()` は先に IDB（blob）に書き込み、次に localStorage（サムネイル）に書き込む。この二段階はアトミックなトランザクションではない——もしちょうどその間にページがクラッシュすると、サムネイル配列が画像配列より一つ少なくなる。PlainTab は起動時にグローバルな自己チェックを行わない（それはより深刻なデータ不整合を隠してしまう）が、**サムネイルが欠けている画像にローテーションで当たった時点で**、その場で再生成する。配列の長さが一致している場合にのみ修復する——長さが不一致なら未知の書き込み異常が発生した証拠であり、スキップする方が安全な判断である。

### Blob URL のライフサイクル

ギャラリー内で [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) によって作成されたすべての Blob URL は配列で追跡され、ギャラリーが閉じられるときに [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) で一括クリーンアップされる。ただしこのパスはフォールバックである——**優先的に事前生成された base64 サムネイルを使用する**。base64 は Blob URL の作成/取り消しが不要で、レンダリングも高速だからだ。

### CSS カスタムプロパティによる実行時テーマ

アイコンの透明度（`--icon-opacity`）は、JS から一つの [CSS カスタムプロパティ](https://developer.mozilla.org/docs/Web/CSS/--*) を変更することで、すべてのコーナーボタンとパネルを一括制御する——setProperty を一度呼べば、ブラウザが自動的にその変数を参照する全要素を再描画する。デザイントークン（`--glass-bg`、`--glass-border`、`--text-primary` など）はすべて [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root) に定義され、ダーク/ライトテーマは [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme) メディアクエリで切り替わる。

### すりガラスパネル

設定と言語パネルは [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) を使用してパネルの**後方**にある壁紙コンテンツをぼかす——半透明オーバーレイのような安易な手法ではない。`--glass-bg: rgba(18, 18, 22, 0.82)` と組み合わせることで、本物の奥行き感を生み出す。

### マウス位置検出 UI

コーナーボタンと検索バーは必要なときだけ表示される——`isNearTopRight()` と `isInCenter()` という二つの数学関数でマウス位置を判定し、全画面背景レイヤーに `mouseenter`/`mouseleave` をバインドする必要がない。非表示には遅延が設定されており（ボタン 400ms、検索バー 150ms）、パネルが開いているときや入力フィールドにフォーカスがあるときは非表示をスキップする。各インタラクションのパスは最短に設計されている：**表示は素早く、非表示は安定して**、誤発動でユーザーを妨げない。

### 直列 Promise チェーンによる一括アップロード処理

ユーザーは一度に複数のローカル壁紙を選択できる。各 `saveLocalImage()` は IDB に対して読み書きを行う——並列実行するとデータ競合が発生する。一括アップロードでは Promise チェーンですべての保存操作を直列化し、一度に一枚だけ書き込む。最初に保存成功した画像を壁紙として表示し、残りはストレージにのみ格納する。これにより、画像が切り替わるたびに発生するちらつきをユーザーが見ることはない。

### `chrome.search.query()` による CWS 準拠

拡張モードでは [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) を使用して検索をブラウザのデフォルト検索エンジンに委譲する——Chrome Web Store の単一目的ポリシーへの準拠要件である。エンジンセレクターは DOM から非表示になり、アイコンは静的な虫眼鏡に変わる。

---

## レイテンシ排除に使われている技術

PlainTab はフレームワークやライブラリを一切使用していない。以下に挙げる各 API はすべて、**一段階の非同期待機を省き、一度の目に見えるちらつきを消し、一フレームの遅延を削減する**ために選ばれている：

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — `backgroundImage` を設定する前に非同期でデコードすることで、最初のフレーム描画時のデコード停止を回避する。`<img>` のロード完了はデコード完了を意味しない。`decode()` を呼ばないと、最初の描画時に一瞬の空白フレームが見える可能性がある
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — GPU 合成によるぼかしで、余分な DOM レイヤーやマスク画像を不要にし、レイアウトの追加オーバーヘッドをゼロにする
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — Dark Reader をロックし、フィルターによる壁紙の色反転を防止する——壁紙はそれ自体が視覚コンテンツであり、フィルター処理されると Canvas サムネイルパイプラインの忠実性への努力が無駄になる
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — 一度の宣言でブラウザがフォーム、スクロールバー、システムコントロールの色を自動的に適応させ、二セットのスタイルを手書きで上書きする必要がなくなる
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — 統一されたイージングカーブ。すべてのフェードインとポップアップアニメーションで共有。`ease` や `ease-in-out` ではない——このカーブは開始時により速く目標に到達し、終端ではよりソフトに減衰する。ミリ秒単位の UI 応答差において、体感の違いは明確だ
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — 拡張モードでブラウザの UI 言語を取得する。`navigator.language` よりもユーザーの本当の意図を正確に反映する
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — `setTimeout` でレンダリングタイミングを推測するのではなく、ブラウザのフレームリズムに正確に同期する。二回連続で使用することで、スタイル計算とその送信の間に明確なフレーム境界が確保される
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — 両方の Bing API エンドポイントを同時に呼び出し、先に応答した方を使用することで不要な待機を排除する
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — 各 Bing API リクエストを 8 秒に制限し、負けた接続を OS レベルの TCP タイムアウトまで放置する代わりに、クリーンに中断する

**使わない技術も同様に重要である**：ゼロ外部依存。React も Tailwind もビルドツールもない。`manifest.json` の CSP は `script-src 'self'` に制限されている——ブラウザが純粋な vanilla JS を強制する。導入しなかったすべてのライブラリは、より少ない解析時間、より小さいネットワークオーバーヘッド、より早い最初のフレームを意味する。

**フォントスタック**：`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`——OS ネイティブフォントを使用し、ネットワークリクエストもレイアウトシフトもゼロ。フォントファイルは一般的にページ最大のブロッキングリソースの一つだが、PlainTab はその問題全体を回避している。

---

## 二つの実行モード

同一のコードベースで、実行時に自動的に環境を検出する：

| 特性 | 拡張モード | Web モード |
|------|-----------|-----------|
| 環境検出 | `chrome.runtime.id` が存在 | それ以外のすべてのケース |
| 検索エンジン | ブラウザデフォルト（`chrome.search.query`） | Google / Bing / Baidu / DuckDuckGo から選択可能 |
| エンジン切替 | 不可（静的な虫眼鏡） | アイコンクリックで順に切り替え |
| デプロイ方法 | Chrome Web Store / デベロッパーロード | Netlify / GitHub Pages で直接ホスティング |
| CSP | `manifest.json` で宣言 | CSP 不要 |

---

## 壁紙読み込みの優先順位

新しいタブが開かれるたびに、以下の順序で利用可能な最速の壁紙ソースを探す：

1. **ローカル壁紙ローテーション**——ユーザー自身の画像（最大 12 枚）。IDB 内に既に Blob があるため直接取得。サムネイルは事前生成済み。ネットワークオーバーヘッドはゼロ。
2. **本日の Bing キャッシュ**——当日既に取得した Bing 壁紙。Blob は IDB にあるため、そのまま Blob URL で表示。ネットワークオーバーヘッドはゼロ。
3. **Bing ネットワーク取得**——前の二段階がどちらも利用できない場合のみネットワーク経由。URL を取得後すぐに表示し、同時に非同期で Blob をダウンロードして IDB に保存、次回のネットワーク待ちを省く。

ローカル壁紙モードでも、Bing 壁紙はバックグラウンドで静かに更新される——ユーザーがいつ Bing モードに戻しても、ネットワーク待ちは発生しない。

Bing API は `Promise.any` で両方のエンドポイントを同時に呼び出し、8 秒の `AbortController` タイムアウトで制御する——最も速く応答した方が勝ち。JSON ペイロードはごく小さいため、追加リクエストのコストはほぼゼロでありながら、競争により世界中どこでも最適なレイテンシを確保できる。言語コード（例：`zh-CN`）は Bing のマーケットコードにマッピングされ、一部の言語は `en-US` にフォールバックする。

---

## 国際化

16 言語に対応：简体中文、繁體中文、English、日本語、한국어、Español、Русский、Deutsch、Français、Italiano、Português、हिन्दी、العربية、Türkçe、Polski、Tiếng Việt。

二つの i18n システムが並行して動作する：Chrome `_locales/` は拡張機能マニフェストのメタデータ（`extName`、`extDesc` の二つのキーのみ）を担当し、[`languages.js`](../js/languages.js) がすべての UI 文字列を担当する。言語検出の優先順位：Chrome UI 言語（拡張モード）→ `navigator.language`（Web モード）→ メイン言語マッチング → English へのフォールバック。

翻訳に問題がある場合や新しい言語を追加したい場合？言語ファイルは [`js/languages.js`](../js/languages.js) ただ一つで、純粋な key-value マッピングである。修正して PR を送ってほしい。

---

## プロジェクト構成

```
PlainTab/
├── manifest.json            # Chrome/Edge 拡張機能マニフェスト (Manifest V3)
├── index.html               # 唯一の HTML ページ（拡張機能の新規タブ / Web トップページ）
├── 404.html                 # Netlify SPA フォールバックページ
├── LICENSE                  # MIT ライセンス
│
├── css/
│   └── newtab.css           # 全スタイル：二層壁紙、すりガラスパネル、検索バー、レスポンシブ
│
├── js/
│   ├── preload.js           # 同期 IIFE：最初のフレーム前にサムネイルを back 層に注入
│   ├── languages.js         # 16 言語の UI 文字列テーブル + 言語リスト
│   └── newtab.js            # メインプログラム：壁紙管理、i18n、ストレージ、UI、検索エンジン
│
├── _locales/                # Chrome i18n（16 言語ディレクトリ、拡張機能マニフェストのみ）
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # 拡張機能アイコン（16/48/128/2048 px）
│
├── imgs/                    # スクリーンショットとプロモーション画像
│   ├── chrome_01.jpg ~ chrome_08.jpg  # 機能スクリーンショット
│   └── small_promo.png      # Chrome Web Store プロモーション小画像
│
├── docs/                    # 多言語 README（16 言語）+ CHANGELOG
│
└── changelog/               # 各言語のバージョン更新履歴
```

- **[`css/`](../css/)** — 単一ファイル ~617 行、ダーク/ライトテーマ、ガラスモーフィズムデザイントークン、480px レスポンシブブレークポイント
- **[`js/`](../js/)** — 三つのファイルが順番にロードされる：`preload.js` → `languages.js` → `newtab.js`（順序は変更不可）
- **[`_locales/`](../_locales/)** — 拡張機能マニフェスト用の `extName` と `extDesc` のみ；すべての UI 文字列は [`languages.js`](../js/languages.js) が管理
- **[`imgs/`](../imgs/)** — Chrome Web Store に必要なスクリーンショットとプロモーション画像
- **[`docs/`](../docs/)** — 多言語ドキュメント、16 言語それぞれ独立したファイル

---

## コントリビュート & ライセンス

MIT ライセンスでオープンソース。バグやアイデアがあれば → [Issue を送信](https://github.com/kaininx/PlainTab/issues)。コードの修正は → Fork して PR。

いくつかの取り決め：
- **ゼロ依存を維持する**——npm パッケージ、CDN スクリプト、フレームワークを導入しない
- **ビルドステップを追加しない**——`index.html` をブラウザで直接実行できるままにする
- **権限を拡大しない**——`manifest.json` には `search` 一つのみを維持する

📋 [更新履歴](changelog.md)

---

## 謝辞

- Bing 日替わり壁紙画像は [Bing](https://www.bing.com) から。長年にわたり高品質な日替わり画像を提供し続ける Microsoft Bing チームに感謝
- API プロキシ：[bing.biturl.top](https://bing.biturl.top)（公開プロキシ）と [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev)（Cloudflare Worker バックアップ）
- スクリーンショットに登場する壁紙は、ネット上の各クリエイターによるもの

MIT · [Kaelri](https://github.com/kaininx)
