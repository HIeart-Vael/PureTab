// preload.js — 在浏览器首帧绘制前，将缩略图写入 back 层
(function () {
    var b = document.getElementById('wallpaperBack');
    if (b) {
        var t = localStorage.getItem('ptab_bing_thumb');
        // 多图轮播：按当前索引取对应缩略图，没有则回退到 ptab_bing_thumb
        try {
            var idx = parseInt(localStorage.getItem('ptab_local_index')) || 0;
            var thumbs = JSON.parse(localStorage.getItem('ptab_local_thumbs') || '[]');
            if (thumbs.length) t = thumbs[idx % thumbs.length] || t;
        } catch (e) {}
        if (t) b.style.backgroundImage = t;
    }
})();
