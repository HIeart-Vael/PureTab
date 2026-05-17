(function () {
    var MAX_PREVIEW_LENGTH = 350000;
    var b = document.getElementById('wallpaperBack');
    if (!b) return;

    var t = localStorage.getItem('ptab_wallpaper_preview');
    if (t && t.length > MAX_PREVIEW_LENGTH) {
        localStorage.removeItem('ptab_wallpaper_preview');
        return;
    }

    if (t) b.style.backgroundImage = t;
})();
