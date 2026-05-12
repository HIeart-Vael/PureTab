<p align="center">
  <img src="../icon/icon2048.png" alt="PlainTab Logo" width="80">
</p>

<h1 align="center">PlainTab · Trang tab mới tối giản</h1>

 > Một tab mới chỉ nên làm tốt một việc: mở ra, hiển thị một hình nền đẹp, và đưa bạn đến trang web tiếp theo. Bạn có thực sự cần đồng hồ, lời chào hay một màn hình đầy các liên kết tắt không? Câu trả lời của PlainTab: sự tối giản tối đa, tốc độ tối đa — hãy đưa tab mới của bạn trở về đúng như nó vốn có, đẹp và sạch sẽ.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_ar.md">العربية</a> · <a href="README_fr.md">Français</a> · <a href="README_pt.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.0-blue?style=flat-square" alt="Phiên bản">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Giấy phép">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Dung_thu_truc_tuyen-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 Xem thêm ảnh chụp màn hình</b></summary>
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
Mở một tab mới là một hành động tức thì — nhấn `Ctrl+T` và bạn kỳ vọng hình nền đã ở đó rồi. Để làm tốt điều này, toàn bộ thiết kế của PlainTab xoay quanh một mục tiêu duy nhất: **hiển thị hình nền trên màn hình nhanh nhất có thể**, không có bất kỳ quá trình tải nào hiển thị. Kiến trúc hai lớp hình nền, tải trước đồng bộ, đường ống ảnh thu nhỏ Canvas, chiến lược lưu trữ kết hợp — tất cả các quyết định kỹ thuật đều hướng về cùng một đích: nhanh hơn, mượt hơn, vô hình hơn.

PlainTab vừa là một tiện ích mở rộng trình duyệt Manifest V3 vừa là một trang Web độc lập. Không phụ thuộc bên ngoài, không bước xây dựng, vanilla JS + CSS thuần túy. Chế độ tiện ích mở rộng và chế độ Web dùng chung một mã nguồn, tự động phát hiện môi trường khi chạy. [Dùng thử trực tuyến](https://plaintab.netlify.app).

---

## Bắt đầu nhanh

**Tiện ích mở rộng trình duyệt**: cài đặt từ [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo).

**Trang chủ trực tuyến**: truy cập [plaintab.netlify.app](https://plaintab.netlify.app) và đặt nó làm trang khởi động trong cài đặt trình duyệt.

**Chạy tại địa phương**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

Tải thư mục trong `chrome://extensions` bằng "Tải tiện ích chưa đóng gói". Không cần bước xây dựng, không cần `npm install`.

<details>
<summary><b>🔧 Làm thế nào để xóa thanh xám ở cuối tab mới?</b></summary>

Sau khi cài đặt tiện ích, Chrome / Edge hiển thị chân trang ở góc dưới bên phải của tab mới (ghi tên tiện ích hiện tại). Đây là hành vi của trình duyệt, PlainTab không thể kiểm soát trong mã nguồn.

Cách tắt: tab mới → góc dưới bên phải "Tùy chỉnh Chrome" ✏️ → Chân trang → tắt "Hiển thị chân trang trên trang Tab mới". Xem [hướng dẫn chính thức của Chrome](https://support.google.com/chrome/answer/11032183?hl=vi).

</details>

---

## Hình nền nhanh đến mức nào?

PlainTab không chỉ đơn thuần "tải một hình ảnh", mà tiến hành **theo ba mốc thời gian**, mỗi cấp độ hoàn thiện trải nghiệm dựa trên cấp độ trước đó:

| Thời điểm | Điều gì xảy ra | Người dùng thấy gì |
|------|-----------|-------------|
| **0ms** (trước khung hình đầu tiên) | `preload.js` đọc đồng bộ ảnh thu nhỏ base64 từ localStorage và ghi trực tiếp vào `#wallpaperBack.style.backgroundImage` | Một hình nền đã ở đó — không phải HD, nhưng **tuyệt đối không màn hình trắng hoặc nền xám** |
| **~300ms** | `loadWallpaper()` đọc Blob đã lưu trong bộ nhớ đệm từ IndexedDB và hiển thị qua Blob URL | Hình nền HD xuất hiện, thay thế mượt mà ảnh thu nhỏ qua hiệu ứng chuyển tiếp CSS opacity |
| **Chỉ khi bộ nhớ đệm hết hạn** | Yêu cầu mạng tới API Bing → tải Blob → hiển thị → lưu đệm không đồng bộ vào IDB | Người dùng không nhận thấy — hình nền trước đó luôn ở lớp back làm dự phòng |

Mỗi công nghệ được mô tả dưới đây phục vụ ba mốc thời gian này — hoặc rút ngắn thời gian, hoặc loại bỏ dấu vết chuyển tiếp có thể thấy được.

---

## Điểm nổi bật kỹ thuật

### Không màn hình trắng ở khung hình đầu tiên: hai lớp + tải trước đồng bộ

Đây là thiết kế cốt lõi nhất của PlainTab. Trước khi hình ảnh được tải xong, tab mới sẽ để lộ màu nền mặc định của trình duyệt — thường là màn hình trắng hoặc nền xám. Hai lớp `<div>` giải quyết triệt để vấn đề này:

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0) — luôn giữ một hình ảnh hiển thị. [`preload.js`](../js/preload.js) được đặt trong `<head>` và thực thi đồng bộ, ghi `data:` URL của ảnh thu nhỏ trước khi trình duyệt vẽ khung hình đầu tiên. Bước này là đồng bộ — không qua bất kỳ API không đồng bộ nào, không chờ đợi mạng. Đối với chế độ xoay vòng nhiều hình, nó thậm chí biết chỉ số ảnh thu nhỏ nào cần dùng vào thời điểm đó.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`) — dùng cho chuyển tiếp fade-in. Hình ảnh mới được giải mã trước trong bộ nhớ qua [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) → đặt làm nền lớp trước → chuyển tiếp CSS [`opacity` transition](https://developer.mozilla.org/docs/Web/CSS/transition) → sau khi chuyển tiếp hoàn tất, ổn định vào lớp back → front trở lại trong suốt.

Nguyên tắc cốt lõi: **bất kỳ lúc nào, ít nhất một lớp giữ hình ảnh đã được render**. Lớp back luôn có thứ để hiển thị; lớp front chỉ xuất hiện trong thời gian ngắn khi chuyển tiếp. Dù người dùng có nhìn từng khung hình, họ cũng không thấy một khoảnh khắc trống nào.

### Từ đầu vào đến pixel: tại sao dùng ảnh thu nhỏ thay vì ảnh gốc?

`preload.js` không thể chờ tải không đồng bộ — sẽ lỡ mất khung hình đầu tiên. Nhưng ảnh gốc trong IndexedDB là không đồng bộ, và chuỗi base64 lên đến vài MB không thể nhồi vào localStorage (hạn ngạch có giới hạn). Vì vậy PlainTab, sau khi hiển thị hình nền trước đó, **đi thêm một bước nữa**: dùng Canvas để thu nhỏ ảnh thành JPEG rộng 640px, chất lượng 0,55, nén thường ở 30–60 KB, lưu an toàn vào localStorage. Lần mở tab mới tiếp theo, `preload.js` lấy ra và dùng ngay.

640px đủ sắc nét trên màn hình 2K đến mức không thể nhận ra là ảnh thu nhỏ — và để đạt được vài KB đó, đằng sau là sự thu phóng chính xác của [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) kết hợp với điều chỉnh chất lượng của [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL). Ảnh thu nhỏ này cũng là nguồn dữ liệu để render lưới 3×4 của thư viện — tạo một lần, dùng hai nơi.

### Hai `requestAnimationFrame` điều khiển chuyển tiếp CSS

Bước chuyển từ ảnh thu nhỏ sang ảnh HD phải kích hoạt transition CSS. Nhưng việc tính toán kiểu và render của trình duyệt là không đồng bộ — nếu thêm class ngay sau khi đặt `backgroundImage`, trình duyệt có thể xử lý cả hai trạng thái trong cùng một lần render, và hiệu ứng chuyển tiếp sẽ không được kích hoạt.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) đầu tiên đảm bảo `backgroundImage` đã được tính toán; cái thứ hai đảm bảo kiểu đã được gửi đến pipeline render. Lúc này thêm class, trình duyệt mới thấy được sự thay đổi từ "kiểu cũ → kiểu mới" và kích hoạt chuyển tiếp chính xác. Thiếu một bước, chuyển tiếp bị bỏ qua — người dùng thấy chuyển đổi cứng thay vì fade-in.

### Tại sao IndexedDB và localStorage cùng tồn tại?

Hai phương thức lưu trữ không phải là lựa chọn thay thế, mà là phân công công việc:

| Lưu trữ | Chứa gì | Tại sao ở đây |
|------|--------|---------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | Blob gốc (hình nền Bing hằng ngày, ảnh địa phương do người dùng tải lên) | Tệp lớn cần hạn ngạch lớn; đọc/ghi không đồng bộ hoàn toàn chấp nhận được trên các luồng không phải khung hình đầu tiên |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | URL dạng `data:` của ảnh thu nhỏ, tùy chọn UI, siêu dữ liệu, chỉ số xoay vòng | **Đọc đồng bộ** — đây là điều quan trọng. `preload.js` chạy trước khung hình đầu tiên, không thể chờ bất kỳ callback không đồng bộ nào |

Kết nối IDB được lưu đệm dưới dạng singleton, tự động xây dựng lại khi `onclose`. Blob lấy từ IDB có thể mất kiểu MIME — trường `mime` luôn được ghi lại khi lưu trữ, khi lấy ra thì tạo lại bằng `new Blob([blob], {type: img.mime})` để đảm bảo Blob URL được hiển thị chính xác.

### Tự phục hồi ảnh thu nhỏ

`saveLocalImage()` ghi vào IDB (blob) trước, sau đó ghi vào localStorage (ảnh thu nhỏ). Hai bước không phải là giao dịch nguyên tử — nếu trang bị sập ngay giữa hai bước, mảng ảnh thu nhỏ sẽ thiếu một phần tử so với mảng ảnh. PlainTab không kiểm tra toàn cục khi khởi động (điều đó sẽ che giấu các bất nhất dữ liệu nghiêm trọng hơn), mà **tái tạo ảnh thu nhỏ ngay khi xoay đến ảnh bị thiếu**. Chỉ sửa khi hai mảng có cùng độ dài — độ dài không khớp cho thấy đã xảy ra ngoại lệ ghi không xác định, bỏ qua là lựa chọn an toàn hơn.

### Vòng đời Blob URL

Tất cả Blob URL được tạo qua [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) trong thư viện được theo dõi trong một mảng và thu hồi hàng loạt khi đóng thư viện qua [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL). Tuy nhiên, đường dẫn này là fallback — **ưu tiên sử dụng ảnh thu nhỏ base64 được tạo sẵn**, vì base64 không cần tạo/thu hồi Blob URL và render nhanh hơn.

### Thuộc tính tùy chỉnh CSS cho chủ đề runtime

Độ mờ biểu tượng (`--icon-opacity`) được kiểm soát bằng cách thay đổi một [thuộc tính tùy chỉnh CSS](https://developer.mozilla.org/docs/Web/CSS/--*) qua JS, đồng nhất kiểm soát tất cả nút góc và bảng — một lần `setProperty`, trình duyệt tự động cập nhật tất cả phần tử tham chiếu biến đó. Các token thiết kế (`--glass-bg`, `--glass-border`, `--text-primary`, v.v.) đều được định nghĩa trên [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root), chủ đề tối/sáng được chuyển đổi qua media query [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme).

### Bảng kính mờ

Bảng cài đặt và ngôn ngữ sử dụng [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) để làm mờ nội dung hình nền **phía sau** bảng — không phải giải pháp rẻ tiền bằng mặt nạ bán trong suốt. Kết hợp với `--glass-bg: rgba(18, 18, 22, 0.82)` tạo cảm giác chiều sâu thực sự.

### Giao diện nhận biết vị trí chuột

Các nút góc và thanh tìm kiếm chỉ xuất hiện khi cần — `isNearTopRight()` và `isInCenter()` là hai hàm toán học xác định vị trí chuột, không cần gắn `mouseenter`/`mouseleave` cho lớp nền toàn màn hình. Ẩn có độ trễ (nút 400ms, thanh tìm kiếm 150ms), bỏ qua khi bảng đang mở hoặc ô nhập đang được focus. Mỗi đường dẫn tương tác đều ngắn nhất có thể: **xuất hiện nhanh, biến mất ổn định**, không làm gián đoạn người dùng vì kích hoạt nhầm.

### Chuỗi Promise nối tiếp cho tải lên hàng loạt

Người dùng có thể chọn nhiều hình nền địa phương cùng lúc. Mỗi `saveLocalImage()` đều đọc và ghi IDB — thực thi song song sẽ gây ra tranh chấp dữ liệu. Tải lên hàng loạt dùng chuỗi Promise để nối tiếp hóa tất cả thao tác ghi, mỗi lần ghi một ảnh. Ảnh đầu tiên được lưu thành công sẽ hiển thị làm hình nền, các ảnh còn lại chỉ được nhập vào kho. Nhờ vậy người dùng không thấy nhấp nháy do chuyển đổi ảnh liên tục.

### `chrome.search.query()` để tuân thủ CWS

Trong chế độ tiện ích mở rộng, [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) ủy thác tìm kiếm cho công cụ tìm kiếm mặc định của trình duyệt — yêu cầu tuân thủ chính sách một mục đích của Chrome Web Store. Bộ chọn công cụ tìm kiếm bị ẩn khỏi DOM, biểu tượng trở thành kính lúp tĩnh.

---

## Công nghệ được dùng để loại bỏ độ trễ

PlainTab không dùng bất kỳ framework hay thư viện nào. Mỗi API sau đây được chọn để **tiết kiệm một lần chờ không đồng bộ, loại bỏ một lần nhấp nháy thấy được, giảm một khung hình trễ**:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — giải mã không đồng bộ trước khi đặt `backgroundImage`, tránh dừng giải mã khi render khung hình đầu tiên. `<img>` tải xong không có nghĩa là giải mã đã hoàn tất; không gọi `decode()` có thể thấy khung hình trống ngắn ở lần vẽ đầu tiên
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — dùng hiệu ứng mờ tổng hợp GPU thay vì lớp DOM và ảnh mặt nạ phụ, không tốn thêm chi phí bố cục
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — khóa Dark Reader, ngăn bộ lọc của nó đảo ngược màu hình nền — hình nền tự nó là nội dung thị giác, bị lọc sẽ làm phí công sức duy trì độ trung thực của đường ống ảnh thu nhỏ Canvas
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — một khai báo duy nhất để trình duyệt tự động thích ứng màu sắc của biểu mẫu, thanh cuộn và điều khiển hệ thống, không cần viết hai bộ style ghi đè
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — đường cong easing thống nhất cho tất cả hiệu ứng xuất hiện và fade-in. Không phải `ease` hay `ease-in-out` — đường cong này đạt mục tiêu nhanh hơn ở đoạn đầu và có suy giảm mềm mại hơn ở đoạn cuối. Đối với phản hồi UI ở cấp độ mili-giây, khác biệt cảm nhận rõ rệt
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — trong chế độ tiện ích, lấy ngôn ngữ giao diện trình duyệt, phản ánh chính xác hơn ý định thực sự của người dùng so với `navigator.language`
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — không dựa vào `setTimeout` để đoán thời điểm render, mà căn chỉnh chính xác theo nhịp khung hình của trình duyệt. Dùng hai lần liên tiếp đảm bảo ranh giới khung hình rõ ràng giữa tính toán kiểu và gửi đi

**Công nghệ không được dùng cũng quan trọng không kém**: không phụ thuộc bên ngoài. Không React, Tailwind hay công cụ xây dựng. CSP trong `manifest.json` giới hạn `script-src 'self'` — trình duyệt thực thi vanilla JS thuần túy. Mỗi thư viện không được đưa vào đồng nghĩa với ít thời gian phân tích hơn, ít chi phí mạng hơn, khung hình đầu tiên sớm hơn.

**Font stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` — font gốc của hệ điều hành, không yêu cầu mạng, không layout shift. Tệp font thường là một trong những tài nguyên chặn lớn nhất của trang; PlainTab bỏ qua toàn bộ vấn đề này.

---

## Hai chế độ chạy

Cùng một mã nguồn, tự động phát hiện môi trường khi chạy:

| Tính năng | Chế độ tiện ích | Chế độ Web |
|------|----------|----------|
| Phát hiện môi trường | `chrome.runtime.id` tồn tại | Mọi trường hợp khác |
| Công cụ tìm kiếm | Mặc định của trình duyệt (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo có thể chọn |
| Chuyển đổi công cụ | Không thể chuyển (kính lúp tĩnh) | Nhấp biểu tượng để xoay vòng |
| Triển khai | Chrome Web Store / nhà phát triển tải lên | Netlify / GitHub Pages lưu trữ trực tiếp |
| CSP | Khai báo trong `manifest.json` | Không cần CSP |

---

## Ưu tiên tải hình nền

Mỗi lần mở tab mới, thứ tự tìm kiếm nguồn hình nền nhanh nhất có sẵn:

1. **Xoay vòng hình nền địa phương** — ảnh của người dùng (tối đa 12), Blob đã có trong IDB, lấy trực tiếp. Ảnh thu nhỏ đã được tạo sẵn. Không tốn mạng.
2. **Bộ nhớ đệm Bing hôm nay** — hình nền Bing đã lấy trong ngày, Blob trong IDB, chuyển trực tiếp thành Blob URL để hiển thị. Không tốn mạng.
3. **Tải Bing từ mạng** — chỉ khi hai cấp trước không khả dụng mới dùng mạng. Khi có URL, hiển thị ngay lập tức, đồng thời tải Blob không đồng bộ và lưu vào IDB, lần sau không cần chờ mạng.

Trong chế độ hình nền địa phương, hình nền Bing vẫn được cập nhật ngầm ở nền — người dùng có thể chuyển sang chế độ Bing bất cứ lúc nào mà không cần chờ mạng.

API Bing có hai điểm cuối chính/dự phòng. Mã ngôn ngữ (ví dụ `zh-CN`) được ánh xạ sang mã thị trường Bing, một số ngôn ngữ rơi về `en-US`.

---

## Quốc tế hóa

Hỗ trợ 16 ngôn ngữ: 简体中文、繁體中文、English、日本語、한국어、Español、Русский、Deutsch、Français、Italiano、Português、हिन्दी、العربية、Türkçe、Polski、Tiếng Việt.

Hai hệ thống i18n song song: Chrome `_locales/` chịu trách nhiệm siêu dữ liệu manifest tiện ích (chỉ hai key `extName`, `extDesc`), [`languages.js`](../js/languages.js) chịu trách nhiệm tất cả chuỗi UI. Ưu tiên phát hiện ngôn ngữ: ngôn ngữ giao diện Chrome (chế độ tiện ích) → `navigator.language` (chế độ Web) → khớp ngôn ngữ chính → dự phòng tiếng Anh.

Bản dịch có lỗi hoặc muốn thêm ngôn ngữ mới? Tệp ngôn ngữ chỉ là một tệp duy nhất [`js/languages.js`](../js/languages.js), ánh xạ key-value thuần túy. Sửa xong gửi PR là được.

---

## Cấu trúc dự án

```
PlainTab/
├── manifest.json            # Tệp kê khai tiện ích Chrome/Edge (Manifest V3)
├── index.html               # Trang HTML duy nhất (tab mới của tiện ích / trang chủ Web)
├── 404.html                 # Trang dự phòng Netlify SPA
├── LICENSE                  # Giấy phép MIT
│
├── css/
│   └── newtab.css           # Tất cả kiểu dáng: hai lớp hình nền, bảng kính mờ, thanh tìm kiếm, responsive
│
├── js/
│   ├── preload.js           # IIFE đồng bộ: đưa ảnh thu nhỏ vào lớp back trước khung hình đầu tiên
│   ├── languages.js         # Bảng chuỗi UI cho 16 ngôn ngữ + danh sách ngôn ngữ
│   └── newtab.js            # Chương trình chính: quản lý hình nền, i18n, lưu trữ, UI, công cụ tìm kiếm
│
├── _locales/                # i18n Chrome (16 thư mục ngôn ngữ, chỉ dùng cho manifest tiện ích)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # Biểu tượng tiện ích (16/48/128/2048 px)
│
├── imgs/                    # Ảnh chụp màn hình và ảnh quảng bá
│   ├── chrome_01.jpg ~ chrome_08.jpg  # Ảnh chụp màn hình tính năng
│   └── small_promo.png      # Ảnh quảng bá nhỏ cho Chrome Web Store
│
├── docs/                    # README đa ngôn ngữ (16 ngôn ngữ) + CHANGELOG
│
└── changelog/               # Nhật ký cập nhật phiên bản theo từng ngôn ngữ
```

- **[`css/`](../css/)** — tệp đơn ~617 dòng, chủ đề tối/sáng, token thiết kế kính mờ, điểm ngắt responsive 480px
- **[`js/`](../js/)** — ba tệp tải theo thứ tự: `preload.js` → `languages.js` → `newtab.js` (không thể đảo thứ tự)
- **[`_locales/`](../_locales/)** — chỉ chứa `extName` và `extDesc` cho manifest tiện ích; tất cả chuỗi UI do [`languages.js`](../js/languages.js) quản lý
- **[`imgs/`](../imgs/)** — ảnh chụp màn hình và ảnh quảng bá cần thiết cho Chrome Web Store
- **[`docs/`](../docs/)** và **[`changelog/`](../changelog/)** — tài liệu đa ngôn ngữ, tệp riêng cho mỗi ngôn ngữ trong số 16 ngôn ngữ

---

## Đóng góp và giấy phép

Mã nguồn mở theo giấy phép MIT. Gặp lỗi hoặc có ý tưởng? → [Gửi Issue](https://github.com/kaininx/PlainTab/issues). Sửa mã? → Fork + PR.

Một vài quy ước:
- **Giữ không phụ thuộc** — không thêm gói npm, tập lệnh CDN hay framework
- **Không thêm bước xây dựng** — `index.html` chạy trực tiếp trong trình duyệt
- **Không mở rộng quyền** — `manifest.json` chỉ giữ quyền `search`

📋 [Nhật ký thay đổi](CHANGELOG.md)

---

## Lời cảm ơn

- Hình nền Bing hằng ngày đến từ [Bing](https://www.bing.com), cảm ơn đội ngũ Microsoft Bing đã cung cấp những ảnh đẹp chất lượng cao mỗi ngày trong nhiều năm qua
- Proxy API: [bing.biturl.top](https://bing.biturl.top) (proxy công cộng) và [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (Cloudflare Worker dự phòng)
- Hình nền xuất hiện trong ảnh chụp màn hình đến từ các nhà sáng tạo trên mạng

MIT · [Kaelri](https://github.com/kaininx)
