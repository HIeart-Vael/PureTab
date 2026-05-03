<p align="center">
  <img src="../icon/icon2048.png" alt="Logo PlainTab" width="80">
</p>

<h1 align="center">PlainTab V3 · Trang Bắt đầu Tối giản</h1>

> **Một tab mới chỉ nên làm một việc:**
> Mở ra → cho bạn thấy hình nền bạn thích → đưa bạn đến trang bạn cần.
> Bạn có thực sự cần đồng hồ, lời chào hay một màn hình đầy phím tắt?
> **Câu trả lời của PlainTab: sự tối giản triệt để. Viết lại hoàn toàn từ đầu với kiến trúc hình nền hai lớp. Không giật lag — hãy để tab mới của bạn trở về với sự thuần khiết «PLAIN».**

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.1-blue?style=flat-square" alt="Phien bản">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="Giấy phép">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Dung thử trực tuyên">
  </a>
</p>

<p align="center">
  <strong>Một trang bắt đầu sạch sẽ, nhanh chong và không xam nhập cho cac tab mới.</strong><br>
  Trực tuyên tại <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · khong giật lag · khong giới hạn kich thước tệp<br>
  Hinh nền Bing hang ngay · Hinh ảnh địa phương · 16 ngon ngữ · Thanh tim kiếm linh hoạt · <strong>Quyền rieng tư được đặt len hăng đầu</strong>
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

## 🆕 Tinh năng mới trong v3

v3 được **viết lại hoan toan từ đầu** với một bước đột pha: **hệ thống hinh nền hai lớp khong giật lag**.

<details>
<summary><b>💡 Tại sao v2 bị giật lag?</b></summary>

Phien bản cũ sử dụng một `<div>` duy nhất với việc chuyển đổi `background-image` trong CSS. Chuyển từ hinh thu nhỏ (quy tắc stylesheet) sang hinh ảnh đầy đủ (style nội tuyến) đoi hỏi một sự thay đổi theo tầng — trong đo trinh duyệt loại bỏ nền đa render trong it nhất một khung hinh, để lộ nền xam.

</details>

**Giải phap của v3 — Kết hợp hai lớp:**
1. `#wallpaperBack` — luon giữ một hinh ảnh co thể nhin thấy. `preload.js` ghi đồng bộ một hinh thu nhỏ 640px trước lần ve đầu tien của trinh duyệt
2. `#wallpaperFront` — bắt đầu trong suốt. Sau khi hinh ảnh đầy đủ được giải ma, mờ dần len phia tren
3. It nhất một lớp luon co hinh ảnh co thể nhin thấy → **khong co flash xam**

Xem [CHANGELOG.md](./CHANGELOG.md) để biết chi tiết kỹ thuật đầy đủ.

---

## ✨ Tại sao chọn PlainTab?

- 🔒 **Quyền rieng tư tuyệt đối** — Khong thu thập dữ liệu ca nhan. Tất cả hinh nền được lưu trữ cục bộ.
- 🚀 **Khởi động duyệt web thống nhat trong một pht** — Đặt lam trang chủ + cai đặt tiện ich. Tiện ich khong bao giờ buộc thay đổi trang chủ.
- 🧩 **Nhe đến mức bạn hầu như khong cảm thấy** — Khong phụ thuộc, JavaScript thuần túy, khởi động tức thi.
- 🌍 **Hoạt động ngay khi cai đặt** — Tự động phat hiện ngon ngữ trinh duyệt (16), hỗ trợ Google / Bing / Baidu / DuckDuckGo.

---

## 🚀 Hai cach để trải nghiệm

| Cach thức | Mo tả | Phu hợp nhất cho |
|-----------|-------|------------------|
| 🌐 **Trang bắt đầu trực tuyến** | Truy cập [plaintab.netlify.app](https://plaintab.netlify.app), đặt lam trang chủ trinh duyệt | Một trang chủ sạch sẽ ma khong cần cai đặt g |
| 🧩 **Tiện ich trinh duyệt** | Cai đặt từ cửa hang Chrome hoặc Edge | Trai nghiệm tối giản tren mỗi tab mới |

### Tiện ích mở rộng · Cài đặt từ cửa hàng
- **Chrome Web Store**: [Sắp ra mắt]()
- **Edge Add-ons**: [Sắp ra mắt]()

> 💡 Chưa có trên cửa hàng? Tải thủ công ở chế độ nhà phát triển: vào `chrome://extensions` → bật **Chế độ nhà phát triển** → **Tải tiện ích đã giải nén** → chọn thư mục dự án

---

## 💡 Đề xuất của nhà phát triển: Ba hình nền, ba lối vào

Bạn đã cài đặt tiện ích mở rộng — tab mới của bạn đã trông rất tuyệt. Nhưng đây là điều bạn có thể chưa biết: PlainTab còn được triển khai ở hai nơi nữa:

| Lối vào | Thiết lập | URL |
|---------|----------|-----|
| 🧩 **Tab mới** | Tiện ích mở rộng trình duyệt | Tải tiện ích này |
| 🌐 **Trang bắt đầu** | Khởi động trình duyệt | `plaintab.netlify.app` |
| 🏠 **Trang chủ** | Nút trang chủ | `kaininx.github.io/PlainTab` |

Đặt `plaintab.netlify.app` làm trang bắt đầu của trình duyệt, để nó theo dõi cập nhật hàng ngày của Bing. Mỗi lần bạn khởi động trình duyệt, đó là **hình nền thứ hai** của bạn.

Đúng vậy, còn nữa. Tìm "Nút trang chủ" trong cài đặt giao diện trình duyệt của bạn, nhập `kaininx.github.io/PlainTab`, chọn một hình nền khác mà bạn thích. Bây giờ bạn đã có **hình nền thứ ba**.

Ba lối vào hoàn toàn độc lập với nhau. Gán cho mỗi lối vào một hình nền địa phương khác nhau, hoặc để mỗi lối vào theo dõi làm mới hàng ngày của Bing. Khởi động trình duyệt: một hình nền. Nhấp nút trang chủ: một hình nền khác. Mở tab mới: hình nền thứ ba. Luân phiên thay đổi được đảm bảo.

**Thiết lập:**
1. Cài đặt tiện ích mở rộng → Tab mới ✓
2. Cài đặt trình duyệt → Khi khởi động → Mở một trang cụ thể → `https://plaintab.netlify.app`
3. Cài đặt trình duyệt → Giao diện → Hiển thị nút trang chủ → `https://kaininx.github.io/PlainTab`

---

## 🛠️ Cach sử dụng

| Hnh động | Hiệu ứng |
|----------|----------|
| Di chuyển chuột lên goc trn bền phải | Hiển thị biểu tượng ngon ngữ / cai đặt |
| Di chuyển chuột đến gần trung tam | Thanh tim kiếm hiện ra (chế độ di chuột) |
| Nhấp vao biểu tượng bảnh răng | Mở bảng hinh nền va tiy chọn nang cao |
| Nhấp vao biểu tượng qua địa cầu | Chuyển đổi ngon ngữ giao diện |
| Nhấp vao biểu tượng cong cụ tim kiếm | Chuyển đổi Google → Bing → Baidu → DuckDuckGo |
| Nhấn `Enter` trong thanh tim kiếm | Tim kiếm với cong cụ hiện tại |
| Nhấn `Esc` | Đong tất cả cac bảng |

### Hinh nền
- **Bing Hang ngay**: Tự động lấy mỗi ngay một lần. Chỉ hinh ảnh hom nay được lưu vao bộ nhớ đệm cục bộ.
- **Hinh nền địa phương**: Tải lên hinh ảnh với kich thước bất kỳ (IndexedDB, **khong giới hạn kich thước tệp**). Chỉ giữ lại hinh ảnh tải lên gần nhat. Đặt lại về Bing hang ngay chỉ với một cú nhấp chuột.

### Tiy chọn nang cao
| Tiy chọn | Mo tả |
|-----------|-------|
| Chế độ thanh tim kiếm | Di chuột / Luon hiển thị / Ẩn |
| Độ mờ biểu tượng | 0 – 1 (mặc định 0.45) |
| Cong cụ tim kiếm | Google / Bing / Baidu / DuckDuckGo |

> **Tiện ích Chrome vs. Phiên bản Web — Sự khác biệt về tìm kiếm:** Để tuân thủ chính sách "Mục đích duy nhất" của Chrome Web Store, phiên bản tiện ích sử dụng Chrome Search API, công cụ này tôn trọng công cụ tìm kiếm mặc định được đặt trong cài đặt trình duyệt của người dùng. Tính năng chuyển đổi công cụ tìm kiếm không có sẵn trong chế độ tiện ích. Phiên bản web (Netlify / GitHub Pages) không chịu sự hạn chế này và giữ lại bộ chọn công cụ tìm kiếm đầy đủ. Ngoài việc triển khai tìm kiếm, cả hai phiên bản đều giống nhau về chức năng.

> Tất cả cài đặt được lưu trong `localStorage`. Không tài khoản, không đồng bộ đám mây.

---

## 🔧 Thanh chân trang tab mới

Sau khi cài đặt tiện ích, Chrome / Edge hiển thị chân trang ở góc dưới bên phải của trang tab mới (hiển thị tên tiện ích). Đây là hành vi của trình duyệt, không phải thứ PlainTab thêm vào.

**Cách ẩn nó (từ [Trợ giúp Chrome](https://support.google.com/chrome/answer/11032183?hl=vi)):**

Mở tab mới → nhấp vào biểu tượng "Tùy chỉnh Chrome" ✏️ ở góc dưới bên phải → Chân trang → tắt "Hiển thị chân trang trên trang Tab mới".

---

## 🌐 Hỗ trợ đa ngon ngữ

16 ngon ngữ được tch hợp sẵn, tự động phat hiện từ trinh duyệt, co thể chọn thủ cong bất cứ luc nao:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 Đong gop

Cac vấn đề (Issue) va Pull Request đều được chao đon. Hay giữ PlainTab tối giản — JavaScript thuần túy, khong bước xay dựng, khong phụ thuộc.

---

## 📄 Giấy phép

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 Lời cảm ơn

- API hinh nền Bing: [bing.img.run](https://bing.img.run) va [bing.biturl.top](https://bing.biturl.top)
- Một số hinh nền trong ảnh chụp man hinh lấy từ web — cảm ơn mỗi người sang tạo tai nang.

---

<p align="center">
  <sub>Sạch sẽ · Nhanh chong · Khong quảng cao · Chỉ của bạn</sub>
</p>
