(function () {
    var b = document.getElementById('wallpaperBack');
    if (!b) return;

    // ★ 优先读预计算缓存（1次 getItem，无 JSON.parse）
    var t = localStorage.getItem('ptab_wallpaper_preview');

    // 缓存未命中时 fallback 到原始逻辑（兼容旧版本数据）
    if (!t) {
        t = localStorage.getItem('ptab_preview_thumb');
    }
    if (!t) {
        t = localStorage.getItem('ptab_bing_thumb');
    }
    if (!t) {
        t = localStorage.getItem('__pt3_thumb') || localStorage.getItem('bing_thumb');
    }
    if (!t) {
        try {
            var mode = localStorage.getItem('ptab_mode');
            if (mode === 'local') {
                var idx = parseInt(localStorage.getItem('ptab_local_index')) || 0;
                var order = JSON.parse(localStorage.getItem('ptab_img_order') || '[]');
                if (order.length) {
                    var id = order[idx % order.length];
                    var thumbs = JSON.parse(localStorage.getItem('ptab_img_thumbs') || '{}');
                    t = thumbs[id] || t;
                }
            }
        } catch (e) { }
    }

    if (t) b.style.backgroundImage = t;
})();
