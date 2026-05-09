<p align="center">
  <img src="../icon/icon2048.png" alt="شعار PlainTab" width="80">
</p>

<h1 align="center">PlainTab · صفحة بدء بسيطة</h1>


 > يجب أن تفعل علامة التبويب الجديدة شيئًا واحدًا فقط—أن تُفتح، وتُظهر خلفية جميلة، وتُرسلك إلى صفحة الويب التالية. هل تحتاج حقًا إلى ساعة، أو تحية، أو شاشة مليئة بالروابط السريعة؟ إجابة PlainTab: أقصى درجات التبسيط، أقصى درجات السرعة—أعد علامة التبويب الجديدة إلى حالتها الأصلية، جميلة ونظيفة.

<p align="center">
  <a href="../README.md">English</a> · <a href="README_zh-CN.md">中文 (简体)</a> · <a href="README_zh-TW.md">中文 (繁體)</a> · <a href="README_hi.md">हिन्दी</a> · <a href="README_es.md">Español</a> · <a href="README_fr.md">Français</a> · <a href="README_pt_BR.md">Português</a> · <a href="README_ru.md">Русский</a> · <a href="README_de.md">Deutsch</a> · <a href="README_ja.md">日本語</a> · <a href="README_it.md">Italiano</a> · <a href="README_tr.md">Türkçe</a> · <a href="README_vi.md">Tiếng Việt</a> · <a href="README_ko.md">한국어</a> · <a href="README_pl.md">Polski</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.2-blue?style=flat-square" alt="الإصدار">
  <img src="https://img.shields.io/badge/Chrome-≥88-brightgreen?style=flat-square&logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-≥88-brightgreen?style=flat-square&logo=microsoftedge" alt="Edge">
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="الترخيص">
  </a>
  <a href="https://plaintab.netlify.app">
    <img src="https://img.shields.io/badge/جرب_عبر_الإنترنت-Netlify-00c7b7?style=flat-square&logo=netlify" alt="Netlify">
  </a>
</p>

<div align="center">
  <img src="../imgs/chrome_01.jpg" width="45%" />
  <img src="../imgs/chrome_02.jpg" width="45%" />
</div>

<details>
<summary><b>📸 عرض المزيد من لقطات الشاشة</b></summary>
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
فتح علامة تبويب جديدة هو فعل فوري—تضغط `Ctrl+T` وتتوقع أن تكون خلفيتك موجودة بالفعل. لتحقيق ذلك، يدور تصميم PlainTab بالكامل حول هدف واحد: **عرض الخلفية على الشاشة في أسرع وقت ممكن**، دون أي عملية تحميل مرئية. بنية الخلفية ثنائية الطبقة، التحميل المسبق المتزامن، خط أنابيب الصور المصغرة عبر Canvas، استراتيجية التخزين المختلطة—جميع القرارات التقنية تصل إلى نفس النتيجة: أسرع، أكثر سلاسة، أقل شعورًا.

مشروع PlainTab هو في نفس الوقت إضافة متصفح Manifest V3 وصفحة ويب مستقلة. لا تبعيات خارجية، لا خطوات بناء، vanilla JS + CSS نقي. وضع الإضافة ووضع الويب يشتركان في نفس قاعدة الشيفرة، ويكتشفان البيئة تلقائيًا أثناء التشغيل ويغيران السلوك. [جربه عبر الإنترنت](https://plaintab.netlify.app).

---

## بداية سريعة

**إضافة المتصفح**: ثبّتها من [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo).

**صفحة البداية عبر الإنترنت**: زر [plaintab.netlify.app](https://plaintab.netlify.app) واجعله صفحة البداية في إعدادات المتصفح.

**التشغيل المحلي**:

```bash
git clone https://github.com/kaininx/PlainTab.git
```

حمّل الدليل عبر "تحميل الإضافة غير المعبأة" في `chrome://extensions`. لا خطوات بناء، لا حاجة لـ `npm install`.

<details>
<summary><b>🔧 كيف أزيل الشريط الرمادي أسفل علامة التبويب الجديدة؟</b></summary>

بعد تثبيت الإضافة، يعرض Chrome/Edge تذييلاً في الزاوية السفلية اليمنى من علامة التبويب الجديدة (يعرض اسم الإضافة الحالية). هذا سلوك متصفح، لا يمكن لـ PlainTab التحكم فيه من الشيفرة.

طريقة الإيقاف: علامة تبويب جديدة → "تخصيص Chrome" ✏️ في الزاوية السفلية اليمنى → التذييل → إيقاف "إظهار التذييل في صفحة علامة التبويب الجديدة". انظر [مساعدة Chrome الرسمية](https://support.google.com/chrome/answer/11032183?hl=ar).

</details>

---

## ما مدى سرعة الخلفية؟

عرض الخلفية في PlainTab ليس "تحميل صورة"، بل **التقدم عبر ثلاث نطاقات زمنية**، كل مستوى يكمل التجربة على المستوى السابق:

| اللحظة | ماذا يحدث | ماذا يرى المستخدم |
|------|-----------|-------------|
| **0ms** (قبل الإطار الأول) | `preload.js` يقرأ الصورة المصغرة base64 من localStorage بشكل متزامن ويكتبها مباشرة في `#wallpaperBack.style.backgroundImage` | خلفية موجودة بالفعل—ليست عالية الدقة، ولكن **لا شاشة بيضاء ولا خلفية رمادية أبدًا** |
| **~300ms** | `loadWallpaper()` يقرأ Blob المخزن مؤقتًا من IndexedDB ويعرضه عبر عنوان Blob URL | تظهر الخلفية عالية الدقة، مستبدلة الصورة المصغرة بسلاسة عبر انتقال CSS opacity |
| **فقط عندما تنتهي صلاحية التخزين المؤقت** | طلب شبكة إلى Bing API → تحميل Blob → عرض → تخزين مؤقت غير متزامن في IDB | لا يشعر به المستخدم—الخلفية السابقة تبقى في الطبقة الخلفية كاحتياطي |

كل تقنية أدناه تخدم هذه اللحظات الثلاث—إما بتقصير الوقت أو بإزالة آثار الانتقال المرئية.

---

## أبرز النقاط التقنية

### لا شاشة بيضاء في الإطار الأول: طبقتان مزدوجتان + تحميل مسبق متزامن

هذا هو التصميم الأساسي لـ PlainTab. عند فتح علامة تبويب جديدة، قبل اكتمال تحميل الصورة، يعرض المتصفح لون خلفيته الافتراضية—عادةً شاشة بيضاء أو خلفية رمادية. طبقتان `<div>` تحلان هذه المشكلة تمامًا:

- **[`#wallpaperBack`](../index.html#L14)** (z-index: 0)—تحمل دائمًا صورة مرئية. [`preload.js`](../js/preload.js) يُنفَّذ بشكل متزامن في `<head>`، ويكتب عنوان `data: URL` للصورة المصغرة قبل أن يرسم المتصفح إطاره الأول. هذه العملية متزامنة—بدون أي API غير متزامن، بدون انتظار شبكة. في وضع التدوير المتعدد للصور، يعرف حتى أي فهرس صورة مصغرة يجب استخدامه حاليًا.
- **[`#wallpaperFront`](../index.html#L16)** (z-index: 1, `opacity: 0`)—لانتقالات التلاشي. يتم فك تشفير الصورة الجديدة مسبقًا في الذاكرة عبر [`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode) → تُعيّن كخلفية للطبقة الأمامية → تتلاشى عبر انتقال [`opacity`](https://developer.mozilla.org/docs/Web/CSS/transition) في CSS → بعد اكتمال الانتقال، تُثبَّت على الطبقة الخلفية → تعود الطبقة الأمامية إلى الشفافية.

المبدأ الأساسي: **في أي لحظة، طبقة واحدة على الأقل تحتوي على صورة معروضة**. الطبقة الخلفية لديها دائمًا شيء لتظهره، والطبقة الأمامية تتدخل فقط باختصار أثناء الانتقالات. حتى لو نظر المستخدم إلى الشاشة إطارًا بإطار، لن يرى لحظة فارغة واحدة.

### من الإدخال إلى البكسل: لماذا الصورة المصغرة وليس الصورة الأصلية؟

`preload.js` لا يمكنه انتظار التحميل غير المتزامن—سيؤدي ذلك إلى فقدان الإطار الأول. لكن الصور الأصلية تُخزَّن بشكل غير متزامن في IndexedDB، وسلسلة base64 بحجم عدة MB لا يمكن وضعها في localStorage (حصص محدودة). لذلك، بعد عرض الخلفية السابقة، **يأخذ PlainTab خطوة إضافية**: يستخدم Canvas لتصغير الصورة إلى JPEG بعرض 640 بكسل، بجودة 0.55، مضغوطة عادةً إلى 30KB–60KB، مخزنة بأمان في localStorage. في المرة التالية التي تُفتح فيها علامة تبويب جديدة، يأخذها `preload.js` ويستخدمها مباشرة.

640 بكسل حادة بما يكفي على شاشة 2K لدرجة أنها لا تبدو كصورة مصغرة—وخلف التحكم في هذا الحجم الذي يبلغ بضع عشرات من KB، يأتي التحجيم الدقيق لـ [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API) + ضبط جودة [`toDataURL('image/jpeg', 0.55)`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL). هذه الصورة المصغرة هي أيضًا مصدر بيانات شبكة المعرض 3×4—تُنشأ مرة واحدة، وتُستخدم في مكانين.

### انتقال CSS مدفوع بـ `requestAnimationFrame` مزدوج

في لحظة التبديل من الصورة المصغرة إلى الصورة عالية الدقة، يجب تفعيل انتقال CSS. لكن حساب الأنماط والعرض في المتصفح غير متزامنين—إذا أُضيفت class فورًا بعد تعيين `backgroundImage`، قد يعالج المتصفح كلتا الحالتين في نفس إطار العرض، ولن يتم تفعيل حركة الانتقال.

```javascript
requestAnimationFrame(function () {
    requestAnimationFrame(function () {
        front.classList.add('active');
    });
});
```

الأول [`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) يضمن حساب `backgroundImage`؛ الثاني يضمن إرسال النمط إلى خط أنابيب العرض. عند إضافة class بعد ذلك، يرى المتصفح تغيير "النمط القديم → النمط الجديد"، مما يفعّل الانتقال الصحيح. إذا نقصت خطوة، يُتخطى الانتقال مباشرة—يرى المستخدم تبديلاً حادًا بدلاً من تلاشٍ سلس.

### لماذا IndexedDB وlocalStorage معًا؟

ليس الأمر اختيارًا بين تخزينين، بل تقسيم عمل:

| التخزين | ماذا يحتوي | لماذا هنا |
|------|--------|---------------|
| **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** | Blob الأصلي (خلفية Bing اليومية، الصور المحلية المرفوعة من المستخدم) | الملفات الكبيرة تحتاج حصصًا كبيرة، القراءة/الكتابة غير المتزامنة مقبولة تمامًا خارج مسار الإطار الأول |
| **[localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)** | الصور المصغرة `data: URL`، تفضيلات الواجهة، البيانات الوصفية، فهرس التدوير | **القراءة المتزامنة**—هذا هو المفتاح. `preload.js` يُنفَّذ قبل الإطار الأول ولا يمكنه انتظار أي استدعاء غير متزامن |

اتصال IDB مخزّن مؤقتًا كمفردة، ويُعاد بناؤه تلقائيًا عند الإغلاق (`onclose`). قد يفقد Blob المسترجع من IDB نوع MIME—عند التخزين، سجّل دائمًا حقل `mime`؛ عند الاسترجاع، أعد البناء باستخدام `new Blob([blob], {type: img.mime})` لضمان عرض Blob URL بشكل صحيح.

### الشفاء الذاتي للصور المصغرة

`saveLocalImage()` يكتب أولاً في IDB (blob)، ثم في localStorage (صورة مصغرة). هاتان الخطوتين ليستا معاملة ذرية—إذا تعطلت الصفحة بينهما، سيكون مصفوف الصور المصغرة أقل بعنصر واحد من مصفوف الصور. PlainTab لا يقوم بفحص ذاتي شامل عند بدء التشغيل (قد يخفي ذلك تناقضات بيانات أكثر خطورة)، بل **يعيد إنشاء الصورة المصغرة في المكان عندما يصل التدوير إلى صورة تفتقد للصورة المصغرة**. يُصلح فقط عندما يكون طول المصفوفتين متساويًا—عدم تساوي الطول يشير إلى خلل كتابة غير معروف، وتجاوزه هو الخيار الأكثر أمانًا.

### دورة حياة Blob URL

يتم تتبع جميع عناوين Blob URL المنشأة عبر [`URL.createObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) في المعرض ضمن مصفوفة، ويتم تنظيفها دفعة واحدة عبر [`URL.revokeObjectURL()`](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL) عند إغلاق المعرض. لكن هذا المسار هو احتياطي—**يتم إعطاء الأولوية للصور المصغرة base64 المولدة مسبقًا**، لأن base64 لا تحتاج إلى إنشاء/إلغاء Blob URL وعرضها أسرع.

### تخصيص المظهر في وقت التشغيل باستخدام خصائص CSS المخصصة

شفافية الأيقونات (`--icon-opacity`) تتحكم بشكل موحد في جميع أزرار الزوايا واللوحات عبر تعديل [خاصية CSS مخصصة](https://developer.mozilla.org/docs/Web/CSS/--*) من JS—setProperty واحد، والمتصفح يعيد تلقائيًا رسم جميع العناصر التي تشير إلى ذلك المتغير. رموز التصميم (`--glass-bg`، `--glass-border`، `--text-primary` إلخ) كلها محددة في [`:root`](https://developer.mozilla.org/docs/Web/CSS/:root)، ويتم التبديل بين السمة الداكنة/الفاتحة عبر استعلام الوسائط [`prefers-color-scheme`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme).

### ألواح الزجاج المصنفر

لوحات الإعدادات واللغة تستخدم [`backdrop-filter: blur()`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) لتشويش محتوى الخلفية **خلف** اللوحة—وليس حل التراكب شبه الشفاف الرخيص. بالاقتران مع `--glass-bg: rgba(18, 18, 22, 0.82)`، يخلق إحساسًا حقيقيًا بالعمق.

### واجهة مستخدم واعية بموضع الماوس

تظهر أزرار الزوايا وشريط البحث فقط عند الحاجة—`isNearTopRight()` و `isInCenter()` دالتان رياضيتان تحددان موضع الماوس، دون الحاجة لربط `mouseenter`/`mouseleave` بطبقة الخلفية كاملة الشاشة. الإخفاء مع تأخير (400ms للأزرار، 150ms لشريط البحث)، ويُتجاوز عند فتح لوحة أو تركيز حقل إدخال. كل مسار تفاعل هو الأقصر: **الظهور سريعًا، الاختفاء بثبات**، دون مقاطعة المستخدم بتنشيطات خاطئة.

### التحميل المجمع عبر سلسلة Promise متسلسلة

يمكن للمستخدمين اختيار عدة خلفيات محلية في وقت واحد. كل `saveLocalImage()` يقرأ ويكتب في IDB—التنفيذ المتوازي قد يسبب سباق بيانات. التحميل المجمع يسلسل جميع عمليات الحفظ عبر سلسلة Promise، ويكتب صورة واحدة فقط في كل مرة؛ أول صورة تُحفظ بنجاح تُعرض كخلفية، والباقي يُخزَّن فقط. بهذه الطريقة، لا يرى المستخدم وميضًا ناتجًا عن التبديل المتكرر للصور.

### `chrome.search.query()` للامتثال لـ CWS

في وضع الإضافة، يُستخدم [`chrome.search.query()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/search/query) لتفويض البحث إلى محرك البحث الافتراضي للمتصفح—متطلب امتثال لسياسة الغرض الواحد من Chrome Web Store. مُحدد المحرك مخفي من DOM، وتصبح الأيقونة عدسة مكبرة ثابتة.

---

## التقنيات المستخدمة لإزالة التأخير

PlainTab لم يستخدم أي إطار عمل أو مكتبة. كل API من التالية تم اختياره **لتوفير انتظار غير متزامن، إزالة وميض مرئي، تقليل تأخير إطار واحد**:

- **[`Image.decode()`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/decode)** — يفك التشفير بشكل غير متزامن قبل تعيين `backgroundImage`، متجنبًا توقف فك التشفير أثناء عرض الإطار الأول. تحميل `<img>` لا يعني اكتمال فك التشفير—عدم استدعاء `decode()` قد يظهر إطارًا فارغًا قصيرًا في أول عرض
- **[`backdrop-filter`](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter)** — يستخدم تشويشًا مركبًا عبر GPU لإزالة طبقات DOM الإضافية وصور القناع، بدون تكلفة تخطيط إضافية
- **[`<meta name="darkreader-lock">`](https://github.com/darkreader/darkreader/blob/main/tips/website-lock-meta-tag.md)** — يقفل Dark Reader، ويمنعه من عكس ألوان الخلفية باستخدام المرشحات—الخلفية هي محتوى بصري بحد ذاتها؛ معالجتها بالمرشحات ستبطل جهود دقة خط أنابيب الصور المصغرة Canvas
- **[`color-scheme: dark light`](https://developer.mozilla.org/docs/Web/CSS/color-scheme)** — تصريح واحد يسمح للمتصفح بتكييف ألوان النماذج وأشرطة التمرير وعناصر التحكم في النظام تلقائيًا، دون الحاجة لكتابة مجموعتي أنماط يدويًا
- **[`cubic-bezier(0.4, 0, 0.2, 1)`](https://developer.mozilla.org/docs/Web/CSS/easing-function#cubic-bezier)** — منحنى تسريع موحد، تشاركه جميع رسوم التلاشي والظهور. ليس `ease` أو `ease-in-out`—هذا المنحنى يصل إلى الهدف أسرع في البداية ويضمحل بلطف أكبر في النهاية؛ لاختلافات استجابة واجهة المستخدم على مستوى الميلي ثانية، الفرق في الإحساس ملحوظ
- **[`chrome.i18n.getUILanguage()`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getUILanguage)** — يحصل على لغة واجهة المتصفح في وضع الإضافة، مما يعكس نية المستخدم الحقيقية بدقة أكبر من `navigator.language`
- **[`requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame)** — لا يعتمد على `setTimeout` لتخمين توقيت العرض، بل يتوافق بدقة مع إيقاع إطارات المتصفح. استخدامه مرتين يضمن حدًا واضحًا للإطار بين حساب الأنماط وإرسالها
- **[`Promise.any()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)** — يطلق نقطتي نهاية Bing API في وقت واحد ويستخدم أيهما يستجيب أولاً، مما يلغي الانتظار غير الضروري
- **[`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController)** — يحدد كل طلب Bing API بـ 8 ثوانٍ، وينهي الاتصال الخاسر بشكل نظيف بدلاً من تركه معلقاً حتى انتهاء مهلة TCP على مستوى نظام التشغيل

**التقنيات غير المستخدمة لا تقل أهمية**: لا تبعيات خارجية. لا React، Tailwind، أو أدوات بناء. CSP في `manifest.json` يقيد `script-src 'self'`—المتصفح يفرض vanilla JS نقي. كل مكتبة لم تُضمَّن تعني وقت تحليل أقل، حمل شبكة أقل، إطار أول أبكر.

**مجموعة الخطوط**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`—خطوط أصلية لنظام التشغيل، بدون طلبات شبكة، بدون إزاحة تخطيط. ملفات الخطوط عادةً ما تكون أحد أكبر موارد الحظر في الصفحة؛ PlainTab تجاوزت المشكلة بأكملها.

---

## وضعا التشغيل

نفس الشيفرة، اكتشاف تلقائي للبيئة أثناء التشغيل:

| الميزة | وضع الإضافة | وضع الويب |
|------|----------|----------|
| اكتشاف البيئة | `chrome.runtime.id` موجود | جميع الحالات الأخرى |
| محرك البحث | افتراضي المتصفح (`chrome.search.query`) | Google / Bing / Baidu / DuckDuckGo اختياري |
| تبديل المحرك | لا يمكن التبديل (عدسة مكبرة ثابتة) | تبديل دوري بالنقر على الأيقونة |
| النشر | Chrome Web Store / تحميل المطور | Netlify / GitHub Pages استضافة مباشرة |
| CSP | مُعلَن في `manifest.json` | لا حاجة لـ CSP |

---

## أولوية تحميل الخلفية

في كل مرة تُفتح فيها علامة تبويب جديدة، يُبحث عن أسرع مصدر خلفية متاح بالترتيب التالي:

1. **تدوير الخلفيات المحلية**—صور المستخدم الخاصة (بحد أقصى 12)، Blob موجود بالفعل في IDB، يُؤخذ مباشرة. الصور المصغرة مولّدة مسبقًا. بدون حمل شبكة.
2. **ذاكرة Bing المؤقتة لليوم**—خلفية Bing التي تم جلبها اليوم، Blob في IDB، يتم تحويلها مباشرة إلى Blob URL للعرض. بدون حمل شبكة.
3. **جلب Bing من الشبكة**—فقط عندما يكون المستويان السابقان غير متاحين يتم استخدام الشبكة. بعد الحصول على URL، يُعرض فورًا، مع تحميل Blob بشكل غير متزامن إلى IDB لتجنب انتظار الشبكة في المرة القادمة.

في وضع الخلفيات المحلية، يتم تحديث خلفية Bing أيضًا بصمت في الخلفية—يمكن للمستخدم التبديل إلى وضع Bing في أي وقت دون انتظار الشبكة.

API Bing يطلق كلا نقطتي النهاية في وقت واحد عبر `Promise.any` مع مهلة 8 ثوانٍ باستخدام `AbortController` — أسرع استجابة هي الفائزة. حمولات JSON صغيرة جداً، لذا فإن الطلب الإضافي لا يكاد يكلف شيئاً، ومع ذلك فإن السباق يضمن أفضل زمن وصول أينما كنت. رموز اللغة (مثل `zh-CN`) تُربط برموز سوق Bing، وبعض اللغات ترتد إلى `en-US`.

---

## التدويل

يدعم 16 لغة: 简体中文، 繁體中文، English، 日本語، 한국어، Español، Русский، Deutsch، Français، Italiano، Português، हिन्दी، العربية، Türkçe، Polski، Tiếng Việt.

نظاما i18n بالتوازي: Chrome `_locales/` مسؤول عن بيانات وصف الإضافة (مفتاحان فقط `extName`، `extDesc`)، و[`languages.js`](../js/languages.js) مسؤول عن جميع سلاسل واجهة المستخدم. أولوية اكتشاف اللغة: لغة واجهة Chrome (وضع الإضافة) → `navigator.language` (وضع الويب) → مطابقة اللغة الرئيسية → الرجوع إلى English.

هناك نقص في الترجمة أو تريد إضافة لغة جديدة؟ ملف اللغات هو ملف واحد فقط [`js/languages.js`](../js/languages.js)، مجرد mapping key-value. بعد إجراء التغييرات، أرسل PR.

---

## هيكل المشروع

```
PlainTab/
├── manifest.json            # بيان إضافة Chrome/Edge (Manifest V3)
├── index.html               # صفحة HTML الوحيدة (علامة تبويب جديدة للإضافة / الصفحة الرئيسية للويب)
├── 404.html                 # صفحة الرجوع SPA لـ Netlify
├── LICENSE                  # ترخيص MIT
│
├── css/
│   └── newtab.css           # جميع الأنماط: خلفية ثنائية الطبقة، ألواح زجاج مصنفر، شريط بحث، تصميم متجاوب
│
├── js/
│   ├── preload.js           # IIFE متزامن: حقن الصورة المصغرة في الطبقة الخلفية قبل الإطار الأول
│   ├── languages.js         # جدول سلاسل واجهة المستخدم لـ 16 لغة + قائمة اللغات
│   └── newtab.js            # البرنامج الرئيسي: إدارة الخلفية، i18n، التخزين، الواجهة، محرك البحث
│
├── _locales/                # i18n من Chrome (16 دليل لغة، فقط لبيان الإضافة)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   └── ...
│
├── icon/                    # أيقونات الإضافة (16/48/128/2048 px)
│
├── imgs/                    # لقطات شاشة وصور ترويجية
│   ├── chrome_01.jpg ~ chrome_08.jpg  # لقطات شاشة للميزات
│   └── small_promo.png      # صورة ترويجية صغيرة لمتجر Chrome
│
├── docs/                    # README متعدد اللغات (16 لغة) + CHANGELOG
│
└── changelog/               # سجل تحديثات الإصدار لكل لغة
```

- **[`css/`](../css/)** — ملف واحد ~617 سطرًا، سمة داكنة/فاتحة، رموز تصميم الزجاجية، نقطة توقف متجاوبة عند 480px
- **[`js/`](../js/)** — ثلاثة ملفات تُحمّل بالترتيب: `preload.js` ← `languages.js` ← `newtab.js` (الترتيب لا يمكن تغييره)
- **[`_locales/`](../_locales/)** — يحتوي فقط على `extName` و `extDesc` لبيان الإضافة؛ جميع سلاسل واجهة المستخدم تُدار بواسطة [`languages.js`](../js/languages.js)
- **[`imgs/`](../imgs/)** — لقطات شاشة وصور ترويجية مطلوبة لمتجر Chrome Web Store
- **[`docs/`](../docs/)** — توثيق متعدد اللغات، 16 لغة كل منها في ملف مستقل

---

## المساهمة والترخيص

مفتوح المصدر بموجب ترخيص MIT. وجدت خطأ أو لديك فكرة؟ → [أرسل Issue](https://github.com/kaininx/PlainTab/issues)؛ تريد تغيير شيفرة؟ ← Fork + PR.

بعض الاتفاقيات:
- **حافظ على عدم وجود تبعيات**—لا تضمّن حزم npm أو نصوص CDN أو أطر عمل
- **لا تضف خطوات بناء**—`index.html` يُشغّل مباشرة في المتصفح
- **لا توسع الأذونات**—`manifest.json` يحتفظ فقط بإذن `search`

📋 [سجل التحديثات](changelog.md)

---

## الشكر

- صور خلفية Bing اليومية مأخوذة من [Bing](https://www.bing.com)، شكرًا لفريق Microsoft Bing على توفير صور يومية عالية الجودة على مر السنين
- وسطاء API: [bing.biturl.top](https://bing.biturl.top) (وسيط عام) و [bing.kaininx.workers.dev](https://bing.kaininx.workers.dev) (احتياطي Cloudflare Worker)
- الخلفيات الظاهرة في لقطات الشاشة من مبدعين مختلفين على الإنترنت

MIT · [Kaelri](https://github.com/kaininx)
