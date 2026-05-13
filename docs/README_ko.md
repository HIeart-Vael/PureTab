<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab 로고" width="80">
</p>

<h1 align="center">PlainTab · 미니멀 시작 페이지</h1>


> 새 탭이 해야 할 일은 단 하나——열리고, 예쁜 배경화면을 보여주고, 다음 웹페이지로 보내는 것이다. 정말로 시계, 인사말, 가득한 바로가기 링크가 필요한가?
>
> PlainTab의 답변: 극단적인 제거, 극한의 속도——새 탭을 본래의 아름답고 깨끗한 모습으로 되돌린다.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt_BR.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.2-blue?style=flat-square" alt="버전">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="라이선스">
  </a>
  <a href="https://plaintab.kaininx.workers.dev">
    <img src="https://img.shields.io/badge/온라인_체험-Cloudflare-00c7b7?style=flat-square&logo=cloudflare" alt="Cloudflare">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 더 많은 스크린샷 보기</b></summary>
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
새 탭을 여는 것은 순간적인 동작이다——`Ctrl+T`를 누르면, 당신은 배경화면이 이미 거기에 있기를 기대한다. 그 기대에 부응하기 위해 PlainTab의 모든 설계는 하나의 목표에 집중되어 있다: **배경화면을 가능한 한 가장 빠르게 화면에 표시하는 것**, 눈에 보이는 로딩 과정을 완전히 없애는 것이다. 이중 레이어 배경화면 아키텍처, 동기 사전 로드, Canvas 썸네일 파이프라인, 하이브리드 저장소 전략——모든 기술적 결정의 종착지는 같은 것이다: 더 빠르게, 더 매끄럽게, 더 의식되지 않게.

PlainTab 프로젝트는 Manifest V3 브라우저 확장 프로그램이자 동시에 독립적인 웹 페이지이다. 제로 외부 의존성, 빌드 단계 불필요, 순수 vanilla JS + CSS. 확장 모드와 웹 모드는 동일한 코드베이스를 공유하며, 런타임에 자동으로 환경을 감지하여 동작을 전환한다. [온라인에서 즉시 사용 가능](https://plaintab.kaininx.workers.dev).

---

## 빠른 시작

**브라우저 확장 프로그램**: [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo)에서 설치.

**온라인 시작 페이지**: [plaintab.kaininx.workers.dev](https://plaintab.kaininx.workers.dev)에 방문하여 브라우저 설정에서 시작 페이지로 지정.

**로컬에서 실행**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

`chrome://extensions`에서 "압축해제된 확장 프로그램 로드"로 해당 디렉토리를 로드. 빌드 단계도, `npm install`도 필요 없음.

<details>
<summary><b>🔧 새 탭 하단의 회색 바를 없애는 방법</b></summary>

확장 프로그램 설치 후, Chrome / Edge 새 탭 페이지 오른쪽 하단에 푸터(현재 확장 프로그램 이름 표시)가 나타납니다. 이는 브라우저 동작이며, PlainTab이 코드로 제어할 수 없습니다.

끄는 방법: 새 탭 → 오른쪽 하단 'Chrome 맞춤설정' ✏️ → 푸터 → '새 탭 페이지에 푸터 표시' 끄기. 자세한 내용은 [Chrome 공식 도움말](https://support.google.com/chrome/answer/11032183?hl=ko) 참조.

</details>

---

## 배경화면은 얼마나 빠른가?

PlainTab의 배경화면 표시는 "이미지 하나 로드"가 아니라, **세 가지 시간 척도로 단계적으로 진행**되며, 각 단계마다 이전 단계보다 더 완전한 경험을 제공한다:

| 시점 | 어떤 일이 일어나는가 | 사용자에게 어떻게 보이는가 |
|------|--------------------|------------------------|
| **0ms (첫 번째 프레임 이전)** | `preload.js`가 localStorage의 base64 썸네일을 동기적으로 읽어 `#wallpaperBack.style.backgroundImage`에 직접 기록 | 이미 거기에 있는 배경화면——고해상도는 아니지만 **절대 하얗거나 회색 바탕이 아님** |
| **~300ms** | `loadWallpaper()`가 IndexedDB에서 캐시된 Blob을 읽어 Blob URL로 표시 | 고해상도 배경화면이 나타나며 CSS opacity 전환으로 썸네일을 부드럽게 대체 |
| **캐시가 무효화된 경우에만** | 네트워크를 통해 Bing API 요청 → Blob 다운로드 → 표시 → 비동기적으로 IDB에 캐시 | 사용자는 인지하지 못함——이전 배경화면이 back 레이어에서 계속 표시를 보장 |

아래에서 설명하는 각 기술은 모두 이 세 가지 시점에 기여한다——시간을 단축하거나, 눈에 보이는 전환 흔적을 없애는 것이다.

---

## 기술 하이라이트

### 첫 프레임 흰 화면 제로: 이중 레이어 배경화면 + 동기 사전 로드

이것이 PlainTab의 핵심 설계이다. 새 탭은 이미지 로드가 완료되기 전까지 브라우저의 기본 배경색——보통 흰색이나 회색——을 노출한다. 두 개의 `<div>` 레이어가 이 문제를 근본적으로 해결한다:

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0) —— 항상 보이는 이미지를 유지한다. [`preload.js`](../js/preload.js)는 `<head>` 내에서 동기적으로 실행되어, 브라우저가 첫 번째 프레임을 그리기 전에 썸네일 `data: URL`을 기록한다. 이 과정은 동기적이다——어떤 비동기 API나 네트워크 대기도 발생하지 않는다. 다중 이미지 순환 모드에서는 현재 어떤 썸네일 인덱스를 사용해야 하는지까지 알고 있다.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`) —— 페이드인 전환에 사용된다. 새 이미지는 [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)로 메모리에서 사전 디코딩 → 전면 레이어 배경으로 설정 → CSS [`opacity` transition](https://developer.mozilla.org/docs/Web/CSS/transition) 페이드인 → 전환 완료 후 back 레이어로 안정화 → front는 투명으로 리셋.

핵심 원칙: **어떤 순간에도 최소 하나의 레이어가 렌더링된 이미지를 보유한다**. back 레이어는 항상 표시 가능한 상태이며, front 레이어는 전환 중에만 일시적으로 작동한다. 사용자가 화면을 프레임 단위로 응시해도 빈 순간은 절대 발생하지 않는다.

### 입력에서 픽셀로: 왜 원본이 아니라 썸네일인가?

`preload.js`는 비동기 로드를 기다릴 수 없다——첫 번째 프레임을 놓치게 된다. 하지만 원본 이미지를 IndexedDB에 저장하는 것은 비동기 처리이며, 수 MB에 달하는 base64 문자열은 localStorage(용량 제한 있음)에 담을 수 없다. 그래서 PlainTab은 이전 배경화면 표시가 완료된 후, **한 걸음을 더 나아간다**: Canvas로 이미지를 640px 너비의 JPEG로 리사이즈, 품질 0.55, 압축 후 보통 30KB~60KB로 안전하게 localStorage에 저장한다. 다음 번 새 탭이 열릴 때 `preload.js`가 즉시 꺼내 사용한다.

640px는 2K 디스플레이에서 썸네일임을 알아채기 어려울 정도로 선명하다——그리고 이 수십 KB 크기를 구현하는 배경에는 [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API)의 정밀한 리사이즈와 [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL)의 품질 조정이 있다. 이 썸네일은 갤러리의 3×4 그리드 렌더링 데이터 소스로도 사용된다——한 번 생성, 두 곳에서 재사용.

### 이중 `requestAnimationFrame`으로 CSS 전환 구동

썸네일에서 고해상도 이미지로 전환할 때는 반드시 CSS transition을 트리거해야 한다. 하지만 브라우저의 스타일 계산과 렌더링은 비동기적이다——`backgroundImage`를 설정한 직후에 class를 추가하면 브라우저가 동일한 프레임에서 두 상태를 동시에 처리하여 전환 애니메이션이 발동하지 않는다.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

첫 번째 [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)은 `backgroundImage`가 확실히 계산되었음을 보장하고, 두 번째는 스타일이 렌더링 파이프라인에 제출되었음을 보장한다. 그 후에 class를 추가하면 브라우저가 "이전 스타일 → 새 스타일"의 변화로 인식하여 올바른 전환이 발동한다. 한 단계가 부족하면 전환은 완전히 건너뛰며——사용자에게는 페이드인이 아닌 하드한 전환으로 보이게 된다.

### IndexedDB와 localStorage는 왜 함께 쓰는가?

두 저장소는 이분법적 선택이 아니라 역할 분담이다:

| 저장소 | 저장하는 것 | 왜 여기에 저장하는가 |
|--------|-----------|-------------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | 원본 Blob (Bing 일일 배경화면, 사용자 업로드 로컬 이미지) | 대용량 파일에는 큰 할당량이 필요. 비동기 읽기/쓰기는 첫 프레임 이후 경로에서 충분히 허용 가능 |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | 썸네일 `data: URL`, UI 환경설정, 메타데이터, 순환 인덱스 | **동기적으로 읽을 수 있음**——이것이 핵심. `preload.js`는 첫 프레임 이전에 실행되므로 비동기 콜백을 기다릴 수 없음 |

IDB 연결은 싱글톤으로 캐시되며, `onclose` 시 자동으로 재구성된다. IDB에서 꺼낸 Blob은 MIME type이 손실될 수 있다——저장 시 항상 `mime` 필드를 기록하고, 꺼낼 때 `new Blob([blob], {type: img.mime})`으로 재구성하여 Blob URL이 올바르게 렌더링되도록 보장한다.

### 썸네일 자가 치유

`saveLocalImage()`는 먼저 IDB(blob)에 쓰고, 그다음 localStorage(썸네일)에 쓴다. 이 두 단계는 원자적 트랜잭션이 아니다——만약 그 사이에 페이지가 크래시되면 썸네일 배열이 이미지 배열보다 하나 적어진다. PlainTab은 시작 시 전역 자가 점검을 하지 않지만(그건 더 심각한 데이터 불일치를 가릴 수 있다), **썸네일이 누락된 이미지로 순환되었을 때** 즉석에서 재생성한다. 두 배열의 길이가 일치하는 경우에만 복구한다——길이가 불일치하면 알 수 없는 쓰기 예외가 발생했다는 증거이며, 건너뛰는 것이 더 안전한 선택이다.

### Blob URL 생명 주기

갤러리 내에서 [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL)로 생성된 모든 Blob URL은 배열로 추적되며, 갤러리가 닫힐 때 [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL)로 일괄 정리된다. 하지만 이 경로는 폴백이다——**사전 생성된 base64 썸네일을 우선 사용**하는데, base64는 Blob URL 생성/취소가 필요 없고 렌더링도 더 빠르기 때문이다.

### CSS 커스텀 속성으로 런타임 테마

아이콘 투명도(`--icon-opacity`)는 JS에서 하나의 [CSS 커스텀 속성](https://developer.mozilla.org/docs/Web/CSS/--*)을 변경하여 모든 코너 버튼과 패널을 일괄 제어한다——setProperty를 한 번 호출하면 브라우저가 자동으로 해당 변수를 참조하는 모든 요소를 다시 그린다. 디자인 토큰(`--glass-bg`, `--glass-border`, `--text-primary` 등)은 모두 [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root)에 정의되며, 다크/라이트 테마는 [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme) 미디어 쿼리로 전환된다.

### 유리 질감(Glassmorphism) 패널

설정과 언어 패널은 [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)를 사용하여 패널 **뒤쪽**의 배경화면 콘텐츠를 흐리게 한다——반투명 오버레이 같은 저급한 방식이 아니다. `--glass-bg: rgba(18, 18, 22, 0.82)`와 결합하여 진정한 깊이감을 만들어낸다.

### 마우스 위치 감지 UI

코너 버튼과 검색창은 필요할 때만 나타난다——`isNearTopRight()`와 `isInCenter()`라는 두 개의 수학 함수로 마우스 위치를 판단하며, 전체 화면 배경 레이어에 `mouseenter`/`mouseleave`를 바인딩할 필요가 없다. 숨김에는 지연이 설정되어 있으며(버튼 400ms, 검색창 150ms), 패널이 열려 있거나 입력 필드에 포커스가 있을 때는 숨김을 건너뛴다. 각 상호작용 경로는 최단으로 설계되어 있다: **나타날 때는 빠르게, 사라질 때는 안정적으로**, 오발동으로 사용자를 방해하지 않는다.

### 직렬 Promise 체인으로 일괄 업로드 처리

사용자는 한 번에 여러 장의 로컬 배경화면을 선택할 수 있다. 각 `saveLocalImage()`는 IDB를 읽고 쓴다——병렬 실행하면 데이터 경합이 발생한다. 일괄 업로드는 Promise 체인으로 모든 저장 작업을 직렬화하여 한 번에 하나씩만 쓰고, 첫 번째로 저장 성공한 이미지를 배경화면으로 표시하며 나머지는 저장소에만 보관한다. 이렇게 하면 사용자가 이미지가 전환될 때마다 발생하는 깜빡임을 보지 않게 된다.

### `chrome.search.query()`로 CWS 준수

확장 모드에서는 [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query)를 사용하여 검색을 브라우저 기본 검색 엔진에 위임한다——Chrome Web Store 단일 목적 정책 준수 요구사항이다. 엔진 선택기는 DOM에서 숨겨지고, 아이콘은 정적 돋보기로 변경된다.

---

## 지연 제거를 위해 사용된 기술

PlainTab은 어떤 프레임워크나 라이브러리도 사용하지 않았다. 아래 각 API는 모두 **한 단계의 비동기 대기를 줄이고, 한 번의 눈에 띄는 깜빡임을 없애고, 한 프레임의 지연을 줄이기 위해** 선택되었다:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — `backgroundImage`를 설정하기 전에 비동기적으로 디코딩하여 첫 프레임 그리기 시의 디코딩 중단을 방지한다. `<img>`의 로드 완료가 디코딩 완료를 의미하지는 않는다. `decode()`를 호출하지 않으면 첫 번째 그리기에서 일시적인 빈 프레임이 보일 수 있다
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — GPU 합성 블러를 사용하여 불필요한 DOM 레이어와 마스크 이미지를 없애고 레이아웃 오버헤드를 제로로 만든다
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — Dark Reader를 잠가 필터로 배경화면 색상이 반전되는 것을 방지한다——배경화면은 그 자체가 시각적 콘텐츠이며, 필터 처리는 Canvas 썸네일 파이프라인의 충실도를 무의미하게 만든다
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — 한 번의 선언으로 브라우저가 폼, 스크롤바, 시스템 컨트롤의 색상을 자동으로 적용하게 하여 두 벌의 스타일을 수동으로 덮어쓸 필요가 없게 한다
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — 통일된 이징 곡선. 모든 페이드인과 팝업 애니메이션에서 공유된다. `ease`나 `ease-in-out`이 아니다——이 곡선은 시작 부분에서 더 빠르게 목표에 도달하고 끝부분에서는 더 부드럽게 감쇠한다. 밀리초 단위의 UI 응답 차이에서 체감상 차이는 명확하다
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — 확장 모드에서 브라우저 UI 언어를 가져온다. `navigator.language`보다 사용자의 실제 의도를 더 정확하게 반영한다
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — `setTimeout`으로 렌더링 타이밍을 추측하지 않고, 브라우저의 프레임 리듬에 정확히 동기화한다. 두 번 연속 사용하여 스타일 계산과 제출 사이에 명확한 프레임 경계를 확보한다
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — 두 Bing API 엔드포인트를 동시에 호출하여 먼저 응답하는 쪽을 사용함으로써 불필요한 대기를 제거
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — 각 Bing API 요청을 8초로 제한하고, 지는 쪽 연결을 OS 수준 TCP 타임아웃에 맡기는 대신 깔끔하게 중단

**사용하지 않는 기술도 마찬가지로 중요하다**: 제로 외부 의존성. React도, Tailwind도, 빌드 도구도 없다. `manifest.json`의 CSP는 `script-src 'self'`로 제한된다——브라우저가 순수 vanilla JS를 강제한다. 도입하지 않은 모든 라이브러리는 더 적은 파싱 시간, 더 작은 네트워크 오버헤드, 더 빠른 첫 번째 프레임을 의미한다.

**폰트 스택**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`——OS 네이티브 폰트, 네트워크 요청 제로, 레이아웃 시프트 제로. 폰트 파일은 일반적으로 페이지에서 가장 큰 차단 리소스 중 하나이지만, PlainTab은 이 문제 자체를 우회한다.

---

## 두 가지 실행 모드

동일한 코드베이스, 런타임에 자동으로 환경 감지:

| 특성 | 확장 모드 | 웹 모드 |
|------|----------|---------|
| 환경 감지 | `chrome.runtime.id` 존재 | 그 외 모든 경우 |
| 검색 엔진 | 브라우저 기본값 (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo 선택 가능 |
| 엔진 전환 | 전환 불가 (정적 돋보기) | 아이콘 클릭 시 순환 |
| 배포 방식 | Chrome Web Store / 개발자 로드 | Cloudflare Workers / GitHub Pages 직접 호스팅 |
| CSP | `manifest.json`에서 선언 | CSP 불필요 |

---

## 배경화면 로드 우선순위

새 탭이 열릴 때마다 다음 순서로 사용 가능한 가장 빠른 배경화면 소스를 찾는다:

1. **로컬 배경화면 순환**——사용자 자신의 이미지 (최대 12장). IDB 내에 이미 Blob이 있어 직접 가져옴. 썸네일은 사전 생성됨. 네트워크 오버헤드 제로.
2. **오늘의 Bing 캐시**——당일 이미 가져온 Bing 배경화면. Blob이 IDB에 있으므로 바로 Blob URL로 표시. 네트워크 오버헤드 제로.
3. **Bing 네트워크 가져오기**——앞의 두 단계를 모두 사용할 수 없을 때만 네트워크를 사용. URL을 가져온 후 즉시 표시하는 동시에 비동기로 Blob을 다운로드하여 IDB에 저장, 다음 번 네트워크 대기를 없앰.

로컬 배경화면 모드에서도 Bing 배경화면은 백그라운드에서 조용히 업데이트된다——사용자가 언제든 Bing 모드로 돌아와도 네트워크를 기다릴 필요가 없다.

Bing API는 `Promise.any`를 통해 두 엔드포인트를 동시에 호출하며, 8초 `AbortController` 타임아웃으로 제어한다——가장 빠른 응답이 승리한다. JSON 페이로드는 매우 작아서 추가 요청 비용이 거의 없지만, 경쟁을 통해 전 세계 어디서나 최적의 지연 시간을 보장한다. 언어 코드(예: `zh-CN`)는 Bing 마켓 코드로 매핑되고, 일부 언어는 `en-US`로 폴백된다.

---

## 국제화(i18n)

16개 언어 지원: 简体中文、繁體中文、English、日本語、한국어、Español、Русский、Deutsch、Français、Italiano、Português、हिन्दी、العربية、Türkçe、Polski、Tiếng Việt.

두 가지 i18n 시스템이 병행된다: Chrome `_locales/`는 확장 프로그램 매니페스트 메타데이터(오직 `extName`, `extDesc` 두 개의 키만)를 담당하고, [`languages.js`](../js/languages.js)가 모든 UI 문자열을 담당한다. 언어 감지 우선순위: Chrome UI 언어(확장 모드) → `navigator.language`(웹 모드) → 주요 언어 매칭 → English 폴백.

번역에 문제가 있거나 새 언어를 추가하고 싶은가? 언어 파일은 [`js/languages.js`](../js/languages.js) 단 하나이며, 순수한 key-value 매핑이다. 수정 후 PR을 보내면 된다.

---

## 프로젝트 구조

```
PlainTab/
├── manifest.json            # Chrome/Edge 확장 프로그램 매니페스트 (Manifest V3)
├── index.html               # 유일한 HTML 페이지 (확장 프로그램의 새 탭 / 웹 첫 페이지)
├── 404.html                 # SPA 폴백 페이지
├── LICENSE                  # MIT 라이선스
│
├── css/
│   └── newtab.css           # 모든 스타일: 이중 레이어 배경화면, 유리 질감 패널, 검색창, 반응형
│
├── js/
│   ├── preload.js           # 동기 IIFE: 첫 프레임 전에 썸네일을 back 레이어에 주입
│   ├── languages.js         # 16개 언어 UI 문자열 테이블 + 언어 목록
│   └── newtab.js            # 메인 프로그램: 배경화면 관리, i18n, 저장소, UI, 검색 엔진
│
├── _locales/                # Chrome i18n (16개 언어 디렉토리, 확장 프로그램 매니페스트만)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # 확장 프로그램 아이콘 (16/48/128/2048 px)
│
├── imgs/                    # 스크린샷 및 프로모션 이미지
│   ├── chrome_01.jpg ~ chrome_08.jpg  # 기능 스크린샷
│   └── small_promo.png      # Chrome Web Store 프로모션 소형 이미지
│
├── docs/                    # 다국어 README (16개 언어) + CHANGELOG
│
└── changelog/               # 각 언어별 버전 변경 내역
```

- **[`css/`](../css/)** — 단일 파일 ~617줄, 다크/라이트 테마, 글라스모피즘 디자인 토큰, 480px 반응형 중단점
- **[`js/`](../js/)** — 세 파일이 순서대로 로드됨: `preload.js` → `languages.js` → `newtab.js` (순서 변경 불가)
- **[`_locales/`](../_locales/)** — 확장 프로그램 매니페스트용 `extName`과 `extDesc`만 포함; 모든 UI 문자열은 [`languages.js`](../js/languages.js)에서 관리
- **[`imgs/`](../imgs/)** — Chrome Web Store에 필요한 스크린샷 및 프로모션 이미지
- **[`docs/`](../docs/)** — 다국어 문서, 16개 언어 각각 독립 파일

---

## 기여 & 라이선스

MIT 라이선스로 오픈소스. 버그나 아이디어 발견 → [Issue 제출](https://github.com/kaininx/PlainTab/issues); 코드 수정 → Fork + PR.

몇 가지 약속:
- **제로 의존성 유지**——npm 패키지, CDN 스크립트, 프레임워크를 도입하지 않음
- **빌드 단계를 추가하지 않음**——`index.html`이 브라우저에서 직접 실행되도록 유지
- **권한을 확장하지 않음**——`manifest.json`에는 `search` 하나만 유지

📋 [변경 로그](changelog.md)

---

## 감사의 말

- Bing 일일 배경화면 이미지는 [Bing](https://www.bing.com)에서 제공합니다. Microsoft Bing 팀이 오랫동안 고품질의 일일 이미지를 제공해준 것에 감사드립니다
- API 프록시: [bing.biturl.top](https://bing.biturl.top)(공용 프록시) 및 [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev)(Cloudflare Worker 백업)
- 스크린샷에 등장하는 배경화면은 웹상의 각 크리에이터 작품입니다

MIT · [Kaelri](https://github.com/kaininx)
