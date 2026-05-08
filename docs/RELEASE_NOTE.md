# PlainTab Release Notes

---

**PlainTab v3.1.1**

- It is recommended to install online from the [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) – this enables automatic updates and is more hassle‑free.
- For manual installation: download the `Source code (zip)` archive below, unzip it, then go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the unzipped folder. We do not provide a `.crx` file (since Chrome M76+, external sideloading of `.crx` files is disallowed).

**Changelog (v3.1.1)**

- `perf`: concurrent Bing API fetching via `Promise.any` — both endpoints fired simultaneously, fastest response wins
- `perf`: add 8-second `AbortController` timeout on Bing API requests for clean connection teardown
- `docs`: update all 16 READMEs to reflect concurrent race pattern and add `Promise.any`/`AbortController` latency techniques

**Summary (v3.1.1)**

v3.1.1 is a performance-focused release that makes Bing wallpaper fetching faster and more reliable. Instead of trying endpoints sequentially (primary → fallback), both Bing API proxy URLs are now fetched concurrently via `Promise.any` — the first endpoint to respond wins, cutting worst-case latency in half. An 8-second `AbortController` timeout prevents hung requests from lingering, ensuring clean connection lifecycle management. All 16 language READMEs have been updated to document the concurrent race pattern and the new latency-optimization techniques.

---

**PlainTab v3.1.1**

- 建议前往 [Chrome 网上应用店](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) 在线安装，这样能自动更新，更省心。
- 如需本地安装：请下载下方的 `Source code (zip)` 压缩包，解压后进入 `chrome://extensions` 页面，开启「开发者模式」，然后点击「加载已解压的扩展程序」，选择解压后的文件夹即可。我们不提供 `.crx` 文件（自 Chrome M76 起，已禁止外部侧载 `.crx` 文件）。

**更新日志 (v3.1.1)**

- `perf`: 通过 `Promise.any` 并发请求两个 Bing API 端点，最快响应胜出，大幅缩短最差情况延迟
- `perf`: 添加 8 秒 `AbortController` 超时机制，防止请求挂起，确保连接生命周期安全关闭
- `docs`: 更新全部 16 语言 README，反映并发竞速模式，新增 `Promise.any`/`AbortController` 延迟优化技术说明

**总结 (v3.1.1)**

v3.1.1 是一次性能优化版本，让 Bing 壁纸获取更快更可靠。不再按顺序尝试端点（主→备用），两个 Bing API 代理 URL 现在通过 `Promise.any` 同时发起请求——先响应的端点胜出，将最差情况延迟减半。8 秒 `AbortController` 超时机制防止请求挂起，确保连接生命周期干净可控。所有 16 种语言的 README 均已更新，记录了并发竞速模式及新的延迟优化技术。
