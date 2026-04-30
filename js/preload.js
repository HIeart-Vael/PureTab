(function () {
    const layer = document.getElementById('wallpaperLayer');
    if (!layer) return;

    // 仅使用 localStorage 中的统一缩略图（base64）
    const thumb = localStorage.getItem('__puretab_local_thumb');
    if (thumb) {
        layer.style.backgroundImage = `url(${thumb})`;
    }
    // 如果没有缩略图，什么都不设置，保留 body 的灰色背景
})();