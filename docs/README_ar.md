<p align="center">
  <img src="../icon/icon2048.png" alt="شعار PlainTab" width="80">
</p>

<h1 align="center">PlainTab v3 · صفحة بداية بسيطة</h1>

<blockquote>
<p dir="rtl"><strong>العلامة التبويب الجديدة يجب أن تفعل شيئاً واحداً فقط:</strong><br>
تفتح → تُظهر لك خلفية تستمتع بها → تُرسلك إلى الصفحة التي تحتاجها.<br>
هل تحتاج حقاً إلى الوقت، تحية، أو شاشة مليئة بالاختصارات؟<br>
<strong>إجابة PlainTab: الطرح الجذري. إعادة كتابة كاملة مع بنية خلفية مزدوجة الطبقة. لا وميض — دع علامة التبويب الجديدة تعود إلى «البساطة» الخالصة.</strong></p>
</blockquote>

<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README_en.md">English</a> · <a href="README_ja.md">日本語</a> · <a href="README_ru.md">Русский</a> · <a href="README_ko.md">한국어</a> · <a href="README_es.md">Español</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_ar.md">العربية</a> · <a href="README_pt.md">Português</a> · <a href="README_de.md">Deutsch</a> · <a href="README_fr.md">Français</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_pl.md">Polski</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.0-blue?style=flat-square" alt="الإصدار">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="الرخصة">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00c7b7?style=flat-square&logo=netlify" alt="عرض مباشر">
  </a>
</p>

<p align="center" dir="rtl">
  <strong>صفحة بداية نظيفة وسريعة وغير اقتحامية للعلامات التبويب الجديدة.</strong><br>
  متاح على <a href="https://plaintab.netlify.app">plaintab.netlify.app</a> · خلفية مزدوجة الطبقة · لا وميض · بدون حد لحجم الملف<br>
  خلفية Bing اليومية · صور محلية · 16 لغة · شريط بحث مرن · <strong>الخصوصية أولاً</strong>
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

## 🆕 الجديد في v3

v3 هي **إعادة كتابة كاملة من الصفر** مع اختراق: **نظام خلفية مزدوجة الطبقة بدون وميض**.

<details>
<summary><b>💡 لماذا كان v2 يومض؟</b></summary>

<p dir="rtl">الإصدار القديم استخدم `<div>` واحد مع تبديل `background-image` في CSS. الانتقال من الصورة المصغرة (قاعدة ورقة الأنماط) إلى الصورة الكاملة (نمط مضمن) تطلب تغييراً متتالياً — وخلاله أسقط المتصفح الخلفية المعروضة لإطار واحد على الأقل، كاشفاً عن الخلفية الرمادية.</p>

</details>

**حل v3 — التركيب مزدوج الطبقة:**
1. `#wallpaperBack` — يحمل دائماً صورة مرئية. `preload.js` يكتب بشكل متزامن صورة مصغرة بحجم 640px قبل أول رسم للمتصفح
2. `#wallpaperFront` — يبدأ شفافاً. بعد فك تشفير الصورة الكاملة، يتلاشى إلى الأعلى
3. طبقة واحدة على الأقل تحتوي دائماً على صورة مرئية → **لا وميض رمادي**

اطلع على [CHANGELOG.md](./CHANGELOG.md) للتفاصيل التقنية الكاملة.

---

## ✨ لماذا PlainTab؟

- 🔒 **خصوصية نظيفة تماماً** — لا يتم جمع أي بيانات شخصية. جميع الخلفيات تُخزن محلياً.
- 🚀 **بداية تصفح موحدة في دقيقة واحدة** — عيّن كصفحة رئيسية + ثبت الإضافة. الإضافة لا تفرض تغيير الصفحة الرئيسية أبداً.
- 🧩 **خفيف جداً لدرجة لا تكاد تشعر به** — بدون تبعيات، جافا سكريبت نقي، بدء فوري.
- 🌍 **يعمل فوراً** — يكتشف لغة المتصفح تلقائياً (16)، يدعم Google / Bing / Baidu / DuckDuckGo.

---

## 🚀 طريقتان للتجربة

| الطريقة | الوصف | الأفضل لـ |
|--------|-------------|----------|
| 🌐 **صفحة بداية عبر الإنترنت** | زر [plaintab.netlify.app](https://plaintab.netlify.app)، عيّنها كصفحة رئيسية للمتصفح | صفحة رئيسية نظيفة بدون تثبيت أي شيء |
| 🧩 **إضافة المتصفح** | ثبّت من متجر Chrome أو Edge | تجربة بسيطة في كل علامة تبويب جديدة |

### إضافة المتصفح · تثبيت من المتجر
- **Chrome Web Store**: [قريباً]()
- **Edge Add-ons**: [قريباً]()

> 💡 لم تنشر بعد؟ حمّل يدوياً في وضع المطور: افتح `chrome://extensions` → فعّل **وضع المطور** → **تحميل غير مضغوط** → اختر مجلد المشروع

---

## 🛠️ الاستخدام

| الإجراء | التأثير |
|--------|--------|
| حرّك الماوس إلى الزاوية العلوية اليمنى | إظهار أيقونات اللغة / الإعدادات |
| حرّك الماوس بالقرب من المنتصف | يظهر شريط البحث (وضع التمرير) |
| انقر على أيقونة الترس | فتح لوحة الخلفية والخيارات المتقدمة |
| انقر على أيقونة الكرة الأرضية | تبديل لغة الواجهة |
| انقر على أيقونة محرك البحث | التبديل Google → Bing → Baidu → DuckDuckGo |
| اضغط `Enter` في شريط البحث | ابحث بالمحرك الحالي |
| اضغط `Esc` | إغلاق جميع اللوحات |

### الخلفية
- **Bing اليومية**: تُجلب تلقائياً مرة يومياً. فقط صورة اليوم تُخزن مؤقتاً محلياً.
- **خلفية محلية**: ارفع صوراً بأي حجم (IndexedDB، **بدون حد لحجم الملف**). فقط آخر صورة مرفوعة تُحفظ. إعادة تعيين بنقرة واحدة إلى Bing اليومية.

### الخيارات المتقدمة
| الخيار | الوصف |
|--------|-------------|
| وضع شريط البحث | تمرير / دائماً / مخفي |
| شفافية الأيقونة | 0 – 1 (الافتراضي 0.45) |
| محرك البحث | Google / Bing / Baidu / DuckDuckGo |

> جميع الإعدادات محفوظة في `localStorage`. لا حساب، لا مزامنة سحابية.

---

## 🌐 دعم متعدد اللغات

16 لغة مدمجة، تُكتشف تلقائياً من المتصفح، ويمكن اختيارها يدوياً في أي وقت:
`English` `简体中文` `繁體中文` `Español` `हिन्दी` `العربية` `Português` `Русский` `日本語` `Deutsch` `한국어` `Français` `Italiano` `Türkçe` `Polski` `Tiếng Việt`

---

## 🤝 المساهمة

نرحب بالمشكلات وطلبات السحب. حافظ على PlainTab بسيطاً — جافا سكريبت نقي، بدون خطوات بناء، بدون تبعيات.

---

## 📄 الرخصة

MIT © [Kaelri](https://github.com/kaininx)

---

## 🙏 الشكر والتقدير

- واجهات برمجة تطبيقات خلفيات Bing: [bing.img.run](https://bing.img.run) و [bing.biturl.top](https://bing.biturl.top)
- بعض الخلفيات في لقطات الشاشة من الويب — شكراً لكل مبدع موهوب.

---

<p align="center" dir="rtl">
  <sub>نظيف · سريع · بدون إعلانات · ملكك فقط</sub>
</p>
