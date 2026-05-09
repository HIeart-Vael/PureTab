# 待解决问题

---

## Critical

### 1. Canvas toDataURL SecurityError 导致 Promise 永不 resolve

**位置：** `js/newtab.js` → `generateThumbnail()`

**原因：** 图片来自 Bing CDN，若服务器未返回正确的 CORS 头，Canvas 会被标记为 tainted。`canvas.toDataURL()` 在 tainted canvas 上抛出 `SecurityError`。该异常在 `img.onload` 回调中抛出，未被 try-catch 捕获，导致 Promise 永远不 resolve 也不 reject，后续 `.then()` 链永久挂起。

**影响：** Bing 壁纸能正常显示（大图双图层淡入流程在缩略图生成之前已完成），但缩略图未写入 localStorage。下一次新标签页 preload.js 找不到缩略图，CSS fallback 渐变短暂闪现。

**修复方案：** `toDataURL` 包 try-catch，catch 中 resolve(null)。

---

### 2. deleteLocalImage 读-改-写竞态条件

**位置：** `js/newtab.js` → `deleteLocalImage()`

**原因：** 删除流程为「读 IDB 数组 → filter 掉目标 → 写回」。两次快速连续删除（连点两张删除按钮）会基于同一份旧数据执行写回，后写的覆盖先写的，导致一张图片被"复活"而另一张被错误删除。

**影响：** 用户快速删除两张本地壁纸后，其中一张意外恢复，另一张丢失。

**修复方案：** 用 Promise 队列串行执行所有删除操作（与批量上传的 chain 模式一致）。

---

## Important

### 3. saveBingMeta 写入早于 idbPut

**位置：** `js/newtab.js` → `cacheBingBlob()` 中的 `downloadAndStore()`

**原因：** `saveBingMeta(meta)` 在 `idbPut(KEY_BING_BLOB, blob)` 之前调用。若 IDB 写入失败（quota 满等），meta 声称 blob 已缓存，但实际没有。虽然 `cacheBingBlob` 的 dedup 逻辑做了防御（发现 IDB 中无 blob 会重新下载），但正确的写入顺序应为先确认 blob 落盘成功，再更新 meta。

**影响：** 极少触发（IDB 配额满非正常状态），且有防御。主要是代码韧性问题。

**修复方案：** 将 `saveBingMeta(meta)` 移到 `idbPut` 成功后的 `.then()` 中。

---

### 4. saveLocalImage show=false 路径 blob URL 泄漏

**位置：** `js/newtab.js` → `saveLocalImage()`

**原因：** 函数开头 `URL.createObjectURL(file)` 创建 blob URL。批量上传时只有第一张（show=true）通过壁纸 DOM 引用该 URL，后续 11 张（show=false）仅用 `generateThumbnail(blobUrl)` 临时读取，完成后 blob URL 未 revoke。

**影响：** 一次性上传多张图片后内存占用偏高，关闭标签页后释放。

**修复方案：** 非展示路径在 `generateThumbnail` 完成后 `URL.revokeObjectURL(blobUrl)`。

---

### 5. 壁纸切换时旧 blob URL 未释放

**位置：** `js/newtab.js` → `tryLoadLocalWallpaper()` / `tryLoadCachedBing()` / `cacheBingInBackground()`

**原因：** 每次切壁纸用 `URL.createObjectURL(blob)` 创建临时 URL 赋给 `#wallpaperBack`。切换下一张时旧 URL 被覆盖但未 revoke。每个新标签页漏一个 blob URL。

**影响：** 轻微内存累积，关闭标签页释放。

**修复方案：** `applyWallpaper` 中记录上一个 blob URL，新图设完后 `URL.revokeObjectURL(prevUrl)`。

---

### 6. 删除当前显示的本地壁纸后屏幕残留旧图

**位置：** `js/newtab.js` → `deleteLocalImage()`

**原因：** 删除非最后一张图片时，IDB 和 localStorage 缩略图被清理，画廊刷新，但 `#wallpaperBack` 的 `backgroundImage` 仍持有旧 blob URL（该 URL 尚未 revoke）。用户看到壁纸未变但画廊中已无该图。

**影响：** 视觉不一致，切换标签页后恢复。

**修复方案：** 删除当前显示的图片后调用 `loadWallpaper()` 重新加载下一张。

---

### 7. preload.js 不检查 ptab_mode

**位置：** `js/preload.js`

**原因：** `preload.js` 判断 `local_thumbs` 数组非空即优先使用本地缩略图，不检查 `ptab_mode`。若 `resetToBing()` 执行到一半崩溃（local_thumbs 已清空但 mode 未改），或出现不一致状态，可能闪现错误缩略图。

**影响：** 极端边界情况，几乎不可复现。

**修复方案：** preload.js 额外读取 `ptab_mode`，仅当 mode 为 `'local'` 且 local_thumbs 非空时使用本地缩略图。

---

### 8. cacheBingInBackground Bing 模式冗余缩略图生成

**位置：** `js/newtab.js` → `cacheBingInBackground()`

**原因：** 本地模式下后台预缓存 Bing 图。若用户已切回 Bing 模式且当前壁纸已是今日的图，`applyWallpaper` 再次运行完整双图层淡入 + 缩略图生成流程，与已显示的壁纸完全相同，纯属冗余。

**影响：** 浪费少量 CPU，无可见体验影响。

**修复方案：** 比对 URL，相同则跳过 `applyWallpaper`。

---

## Minor

### 9. 轮播游标在壁纸确认前递增

**位置：** `js/newtab.js` → `tryLoadLocalWallpaper()`

**原因：** `localStorage.setItem(KEY_LOCAL_INDEX, (idx + 1) % N)` 在 `applyWallpaper` 之前执行。若图片损坏，展示失败但仍消耗一次轮播位置。

**影响：** 损坏图片每 N 次轮播闪现一次破损图标后跳到下一张。

**修复方案：** 游标递增移至 `applyWallpaper` 成功后的 `.then()` 中。

---

### 10. fetchBingUrl AbortController timer 未清理

**位置：** `js/newtab.js` → `fetchBingUrl()` 中的 `tryFetch()`

**原因：** `clearTimeout(timer)` 仅在 fetch 成功回调中调用。若 fetch 因网络错误 reject，timer 继续运行到 8 秒才调用 `ctrl.abort()`（在已 reject 的 fetch 上 abort 是 no-op）。

**影响：** timer 空转至超时，无功能影响。

**修复方案：** 将 `clearTimeout` 移到 `.finally()` 中，或使用 `AbortSignal.timeout(8000)`。

---

### 11. deleteLocalImage 删除失败静默

**位置：** `js/newtab.js` → `deleteLocalImage()`

**原因：** `.catch(function () { })` 空体，删除过程中任何异常完全静默。

**影响：** 删除操作失败时用户无感知（图片仍在，无错误提示，无日志）。

**修复方案：** catch 中使用 `warn('Local', 'delete failed: ' + (e && e.message))` 打日志。

---

### 12. resetToBing 先删 bing_thumb 再异步生成新图

**位置：** `js/newtab.js` → `resetToBing()`

**原因：** `localStorage.removeItem(KEY_BING_THUMB)` 同步执行，然后 `loadWallpaper()` 异步执行。若同时有另一个 PlainTab 标签页在 preload.js 执行时 Bing 新缩略图尚未生成，`ptab_bing_thumb` 为空 → CSS fallback 渐变短暂闪现。

**影响：** 极窄时间窗口（毫秒级），极少遇到。

**修复方案：** 延迟删除 `ptab_bing_thumb` 到 `loadWallpaper` 成功后。

---

### 13. dead code: setLocalWallpaper

**位置：** `js/newtab.js` → `setLocalWallpaper()`

**原因：** 该函数定义后从未被调用。所有上传路径均直接触发 `fileInput.click()` 走 change 事件处理。

**影响：** 无，纯粹代码冗余。

**修复方案：** 删除该函数。

---

### 14. engineSelect.closest() 未判空

**位置：** `js/newtab.js` → `setupExtensionMode()`

**原因：** `engineSelect.closest('.setting-row').style.display = 'none'`。若将来 HTML 结构调整导致 `engineSelect` 不在 `.setting-row` 内，`closest()` 返回 null → `.style` 访问抛 TypeError，`setupExtensionMode` 崩溃。

**影响：** 当前 HTML 正确时不触发，纯防御性编程。

**修复方案：** `closest()` 结果判空后再访问 `.style`。

---

### 15. preload.js 每次标签页同步 JSON.parse 大数组

**位置：** `js/preload.js`

**原因：** 12 张缩略图可达 ~200KB base64 字符串，每个新标签页 `JSON.parse` 同步解析。是零白屏架构的必要代价，无法规避。

**影响：** 微小的同步阻塞（毫秒级），可接受。

**修复方案：** 无需修复，设计 trade-off。
