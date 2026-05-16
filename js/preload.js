(function () {
    var b = document.getElementById('wallpaperBack');
    if (!b) return;

    var t = localStorage.getItem('ptab_wallpaper_preview');

    if (t) b.style.backgroundImage = t;
})();
