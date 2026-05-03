// preload.js — 在浏览器首帧绘制前，将缩略图写入 back 层
(function () {
    var back = document.getElementById('wallpaperBack');
    if (!back) return;

    var thumb = localStorage.getItem('__pt3_thumb');

    if (thumb && typeof thumb === 'string' && thumb.indexOf('data:image') === 0) {
        var style = document.createElement('style');
        style.id = '__pt3_wp';
        var escaped = thumb.replace(/['"\\]/g, function (c) {
            if (c === "'") return "\\'";
            if (c === '"') return '\\"';
            if (c === '\\') return '\\\\';
            return c;
        });
        style.textContent = '#wallpaperBack{background-image:url(\'' + escaped + '\')}';
        document.head.appendChild(style);
    }
})();
