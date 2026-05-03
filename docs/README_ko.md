<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab V3 · 미니멀 스타트 페이지</h1>

> **새 탭이 해야 할 일은 단 하나:**
> 열기 → 마음에 드는 배경화면 보여주기 → 필요한 페이지로 보내주기.
> 시계, 인사말, 바로가기로 가득 찬 화면이 정말 필요한가요?
> **PlainTab의 답: 철저한 빼기. 이중 레이어 배경화면 아키텍처로 처음부터 다시 작성. 깜빡임 제로 — 새 탭을 순수한 「PLAIN」으로 되돌리세요.**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.1-blue?style=flat-square" alt="버전">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="라이선스">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/라이브_데모-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<p align="center">
  <strong>깨끗하고 빠르며 방해되지 않는 시작 페이지 및 새 탭 솔루션.</strong><br>
  <a href="https://plaintab.netlify.app">plaintab.netlify.app</a>에서 사용 가능 · 깜빡임 제로 · 파일 크기 제한 없음<br>
  Bing 매일 배경 · 로컬 이미지 · 16개 언어 · 유연한 검색창 · <strong>프라이버시 우선</strong>
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

## 🆕 v3의 새로운 기능

v3는 **처음부터 완전히 새로 작성**되었습니다. 획기적인 점: **깜빡임 제로 이중 레이어 배경화면 시스템**.

<details>
<summary><b>💡 v2가 깜빡인 이유는?</b></summary>

이전 버전은 단일 `<div>`에서 CSS `background-image`를 전환했습니다. 썸네일(stylesheet 규칙)에서 전체 이미지(inline style)로 전환할 때 캐스케이드 변경이 발생하여, 최소 한 프레임 동안 렌더링된 배경이 사라지고 회색 배경이 드러났습니다.

</details>

**v3의 해결책 — 이중 레이어 합성:**
1. `#wallpaperBack` — 항상 보이는 이미지를 유지. `preload.js`가 브라우저 첫 페인트 전에 640px 썸네일을 동기적으로 기록
2. `#wallpaperFront` — 처음에는 투명. 전체 이미지 디코딩 완료 후 위로 페이드 인
3. 항상 최소 한 레이어에 보이는 이미지가 있음 → **회색 깜빡임 제로**

자세한 내용은 [CHANGELOG.md](./CHANGELOG.md)를 참조하세요.

---

## ✨ PlainTab을 선택하는 이유

- 🔒 **완벽히 깨끗한 프라이버시** — 개인 데이터 수집 없음. 모든 배경화면은 로컬에 저장
- 🚀 **1분 만에 통일된 브라우징 시작** — 홈페이지로 설정 + 확장 프로그램 설치. 확장 프로그램은 홈페이지 설정을 강제로 변경하지 않음
- 🧩 **느껴지지 않을 만큼 가벼움** — 의존성 제로, 순수 바닐라 JavaScript, 즉시 시작
- 🌍 **바로 사용 가능, 당신을 이해** — 브라우저 언어 자동 감지(16개), Google / Bing / Baidu / DuckDuckGo 지원

---

## 🚀 두 가지 사용 방법

| 방법 | 설명 | 적합한 경우 |
|------|------|------------|
| 🌐 **온라인 시작 페이지** | [plaintab.netlify.app](https://plaintab.netlify.app)을 브라우저 홈페이지로 설정 | 설치 없이 깨끗한 홈페이지를 원하는 분 |
| 🧩 **브라우저 확장** | Chrome 또는 Edge 스토어에서 확장 프로그램 설치 | 모든 새 탭에서 미니멀한 경험을 원하는 분 |

### 브라우저 확장 · 스토어 설치
- **Chrome Web Store**: [출시 예정]()
- **Edge Add-ons**: [출시 예정]()

> 💡 아직 출시되지 않았나요? 개발자 모드로 수동 로드: `chrome://extensions` → **개발자 모드** 활성화 → **압축 해제된 확장 프로그램 로드** → 프로젝트 폴더 선택

---

## 💡 개발자 추천: 세 개의 배경화면, 세 개의 입구

확장 프로그램을 설치했습니다. 새 탭이 이미 멋져 보입니다. 하지만 모르실 수도 있습니다——PlainTab은 두 군데 더 배포되어 있습니다:

| 입구 | 설정 | URL |
|------|--------|----------|
| 🧩 **새 탭** | 브라우저 확장 프로그램 | 이 확장 프로그램 로드 |
| 🌐 **시작 페이지** | 브라우저 시작 시 | `plaintab.netlify.app` |
| 🏠 **홈페이지** | 홈 버튼 | `kaininx.github.io/PlainTab` |

`plaintab.netlify.app`을 브라우저의 시작 페이지로 설정하고 Bing의 매일 업데이트를 따르게 하세요. 브라우저를 실행할 때마다 그것이 **두 번째 배경화면**입니다.

네, 아직 끝이 아닙니다. 브라우저 외관 설정에서 "홈 버튼"을 찾아 `kaininx.github.io/PlainTab`을 입력하고, 다른 마음에 드는 배경화면을 고르세요. 이제 **세 번째 배경화면**이 생겼습니다.

세 개의 입구는 완전히 분리되어 있습니다. 각각 다른 로컬 배경화면을 지정하거나, 각각 Bing의 매일 업데이트를 따르도록 할 수 있습니다. 브라우저 실행: 하나의 배경화면. 홈 버튼 클릭: 또 다른 배경화면. 새 탭 열기: 세 번째 배경화면. 돌아가며 보여집니다.

**설정 방법:**
1. 확장 프로그램 설치 → 새 탭 ✓
2. 브라우저 설정 → 시작 시 → 특정 페이지 열기 → `https://plaintab.netlify.app`
3. 브라우저 설정 → 외관 → 홈 버튼 표시 → `https://kaininx.github.io/PlainTab`

---

## 🛠️ 사용법

| 동작 | 효과 |
|------|------|
| 오른쪽 상단으로 마우스 이동 | 언어 / 설정 아이콘 표시 |
| 페이지 중앙 근처로 마우스 이동 | 검색창 페이드 인 (호버 모드 시) |
| 톱니바퀴 아이콘 클릭 | 배경화면 및 고급 옵션 패널 열기 |
| 지구본 아이콘 클릭 | 인터페이스 언어 전환 |
| 검색 엔진 아이콘 클릭 | Google → Bing → Baidu → DuckDuckGo 순환 |
| 검색창에서 `Enter` 누르기 | 현재 검색 엔진으로 검색 |
| `Esc` 누르기 | 모든 패널 닫기 |

### 배경화면
- **Bing 매일 배경**: 하루에 한 번 자동으로 가져옴. 오늘의 이미지만 로컬에 캐시.
- **로컬 배경화면**: 모든 크기의 이미지 업로드 (IndexedDB, **파일 크기 제한 없음**). 마지막으로 업로드한 이미지만 유지. 원클릭으로 Bing 매일로 초기화.

### 고급 옵션
| 옵션 | 설명 |
|------|------|
| 검색창 모드 | 호버 / 항상 / 숨김 |
| 아이콘 불투명도 | 0 – 1 (기본값 0.45) |
| 검색 엔진 | Google / Bing / Baidu / DuckDuckGo |

> **Chrome 확장 프로그램 vs Web 버전의 검색 차이:** Chrome Web Store의 "Single Purpose" 정책을 준수하기 위해, 확장 프로그램 버전은 Chrome Search API를 사용하여 사용자가 브라우저 설정에서 선택한 기본 검색 엔진을 사용합니다. 확장 프로그램 모드에서는 엔진 전환 기능을 사용할 수 없습니다. Web 버전(Netlify / GitHub Pages)은 이 제한의 적용을 받지 않으며 전체 검색 엔진 선택기를 유지합니다. 검색 구현 외에는 두 버전이 기능적으로 동일합니다.

> 모든 설정은 `localStorage`에 저장. 계정 불필요, 클라우드 동기화 없음.

---

## 🔧 새 탭 바닥글 막대

확장 프로그램을 설치한 후 Chrome / Edge 새 탭 페이지 오른쪽 아래에 바닥글(확장 프로그램 이름 표시)이 나타납니다. 이는 브라우저 동작이며 PlainTab이 추가한 것이 아닙니다.

**숨기는 방법 ([Chrome 도움말](https://support.google.com/chrome/answer/11032183?hl=ko) 참조):**

새 탭 열기 → 오른쪽 아래의 "Chrome 맞춤설정" ✏️ 아이콘 클릭 → 바닥글 → "새 탭 페이지에 바닥글 표시" 끄기.

---

## 🌐 다국어 지원

16개 내장 언어, 브라우저 언어에서 자동 감지, 언제든지 수동 선택 가능:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 기여

이슈와 Pull Request를 환영합니다. PlainTab의 미니멀 스타일을 유지해 주세요—바닐라 JS, 빌드 단계 없음, 의존성 없음.

---

## 📄 라이선스

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 감사의 말

- Bing 배경화면 API: [bing.img.run](https://bing.img.run) & [bing.biturl.top](https://bing.biturl.top)
- 스크린샷의 일부 배경화면은 웹에서 가져왔습니다. 모든 재능 있는 크리에이터에게 감사드립니다.

---

<p align="center">
  <sub>깨끗함 · 빠름 · 광고 없음 · 오직 당신의 것</sub>
</p>
