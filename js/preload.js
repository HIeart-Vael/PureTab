// preload.js — 在浏览器首帧绘制前，将缩略图写入 back 层
(function () {
    var b = document.getElementById('wallpaperBack');
    if (b) {
        var t = localStorage.getItem('ptab_thumb');
        if (t) b.style.backgroundImage = t;
    }
})();
