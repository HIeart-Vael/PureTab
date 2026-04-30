// preload.js - 同步恢复壁纸，消除首帧深蓝色闪烁
(function () {
    const layer = document.getElementById('wallpaperLayer');
    if (!layer) return;

    // 1. 优先使用 sessionStorage 保存的上一帧背景（非 blob）
    const preloadStyle = sessionStorage.getItem('__puretab_wallpaper_preload');
    if (preloadStyle) {
        layer.style.backgroundImage = preloadStyle;
        return;
    }

    // 2. 尝试本地壁纸缩略图（localStorage 中的 base64 图片）
    const localThumb = localStorage.getItem('__puretab_local_thumb');
    if (localThumb) {
        layer.style.backgroundImage = `url(${localThumb})`;
        return;
    }

    // 3. 回退：Bing 每日图片缓存（localStorage）
    const cachedUrl = localStorage.getItem('wallpaper_bing_url');
    const cachedDate = localStorage.getItem('wallpaper_bing_date');
    const today = new Date().toDateString();
    if (cachedUrl && cachedDate === today) {
        layer.style.backgroundImage = `url(${cachedUrl})`;
    }
    // 如果都拿不到，保持透明，让 newtab.js 正常执行
})();