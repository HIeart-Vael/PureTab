# PlainTab Release Notes

---

**PlainTab v3.1.2**

- It is recommended to install online from the [Chrome Web Store](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) – this enables automatic updates and is more hassle‑free.
- For manual installation: download the `Source code (zip)` archive below, unzip it, then go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the unzipped folder. We do not provide a `.crx` file (since Chrome M76+, external sideloading of `.crx` files is disallowed).

**Changelog (v3.1.2)**

- `fix`: renamed `_locales/pt` to `pt_BR` for Chrome Web Store compliance — Chrome only recognizes `pt_BR`/`pt_PT`, not bare `pt`
- `style`: unified all 16-language changelog format to compact single-line `• vX.Y.Z · ...` style
- `chore`: renamed Portuguese README and changelog files to `pt_BR` for consistency

**Summary (v3.1.2)**

v3.1.2 is a maintenance release focused on Chrome Web Store compliance and internal consistency. Chrome's localization system requires Portuguese locale directories to use the region-qualified names `pt_BR` (Brazil) or `pt_PT` (Portugal) — the bare `pt` directory is rejected during store review. All `_locales/pt`, `changelog/pt.txt`, and `docs/README_pt.md` files have been renamed to their `pt_BR` counterparts. Additionally, the changelog format has been unified across all 16 languages to a compact single-line style for cleaner release tracking.

---

**PlainTab v3.1.2**

- 建议前往 [Chrome 网上应用店](https://chromewebstore.google.com/detail/plaintab-%C2%B7-minimal-new-ta/jhpfjcefcmooplmaimgdafohdlhacjdo) 在线安装，这样能自动更新，更省心。
- 如需本地安装：请下载下方的 `Source code (zip)` 压缩包，解压后进入 `chrome://extensions` 页面，开启「开发者模式」，然后点击「加载已解压的扩展程序」，选择解压后的文件夹即可。我们不提供 `.crx` 文件（自 Chrome M76 起，已禁止外部侧载 `.crx` 文件）。

**更新日志 (v3.1.2)**

- `fix`: 将 `_locales/pt` 重命名为 `pt_BR` 以符合 Chrome Web Store 规范——Chrome 只识别 `pt_BR`/`pt_PT`，不识别裸 `pt`
- `style`: 统一全部 16 语言 changelog 格式为紧凑单行 `• vX.Y.Z · ...` 风格
- `chore`: 葡萄牙语 README 和 changelog 文件同步重命名为 `pt_BR`

**总结 (v3.1.2)**

v3.1.2 是一次维护性版本，专注于 Chrome Web Store 合规与内部一致性。Chrome 本地化系统要求葡萄牙语区域目录使用带地区后缀的名称 `pt_BR`（巴西）或 `pt_PT`（葡萄牙）——裸 `pt` 目录会被商店审核拒绝。所有 `_locales/pt`、`changelog/pt.txt` 和 `docs/README_pt.md` 文件均已重命名为 `pt_BR`。此外，全部 16 种语言的 changelog 格式已统一为紧凑单行风格，便于更清晰地追踪版本记录。
