/**
 * Wallpaper Theme — 壁纸主题色提取
 * 纯内存，不落盘。每次新标签页重新计算。
 */
(function () {
    'use strict';

    var SIZE = 36;

    function lum(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }
    function clamp(v) { return Math.max(0, Math.min(255, v)); }
    function clampColor(c) {
        return { r: clamp(c.r), g: clamp(c.g), b: clamp(c.b) };
    }
    function mix(a, b, amount) {
        return {
            r: Math.round(a.r + (b.r - a.r) * amount),
            g: Math.round(a.g + (b.g - a.g) * amount),
            b: Math.round(a.b + (b.b - a.b) * amount)
        };
    }
    function rgb(c) { return c.r + ',' + c.g + ',' + c.b; }
    function shade(c, amount) {
        return clampColor({ r: Math.round(c.r * amount), g: Math.round(c.g * amount), b: Math.round(c.b * amount) });
    }
    function lift(c, amount) {
        return mix(c, { r: 255, g: 255, b: 255 }, amount);
    }
    function sat(c, l) {
        var max = Math.max(c.r, c.g, c.b), min = Math.min(c.r, c.g, c.b);
        return max === 0 ? 0 : (max - min) / max;
    }
    function hue(c) {
        var r = c.r / 255, g = c.g / 255, b = c.b / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var d = max - min;
        if (d === 0) return 0;
        var h;
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        return (h * 60 + 360) % 360;
    }
    function hueDistance(a, b) {
        var d = Math.abs(a - b) % 360;
        return d > 180 ? 360 - d : d;
    }
    function weightedAverage(items, limit) {
        var total = 0, r = 0, g = 0, b = 0;
        for (var i = 0; i < items.length && i < limit; i++) {
            var w = items[i].n || 1;
            total += w;
            r += items[i].r * w;
            g += items[i].g * w;
            b += items[i].b * w;
        }
        if (!total) return items[0] || { r: 28, g: 31, b: 40 };
        return {
            r: Math.round(r / total),
            g: Math.round(g / total),
            b: Math.round(b / total)
        };
    }
    function fitLum(c, minL, maxL) {
        var adjusted = c;
        var guard = 0;
        while (lum(adjusted.r, adjusted.g, adjusted.b) < minL && guard < 8) {
            adjusted = lift(adjusted, 0.10);
            guard++;
        }
        guard = 0;
        while (lum(adjusted.r, adjusted.g, adjusted.b) > maxL && guard < 8) {
            adjusted = shade(adjusted, 0.88);
            guard++;
        }
        return adjusted;
    }
    function scoreAccent(c, mood, avgL) {
        var l = lum(c.r, c.g, c.b);
        var moodHue = hue(mood);
        var cHue = hue(c);
        var distance = hueDistance(cHue, moodHue);
        var presence = Math.min(26, Math.sqrt(c.n || 1) * 2.6);
        var diversity = distance > 60 ? 44 : distance * 0.22;
        var neutralPenalty = sat(c) < 0.16 ? 36 : 0;
        return sat(c) * 96 + presence + diversity - Math.abs(l - 128) * 0.16 - Math.abs(l - avgL) * 0.06 - neutralPenalty;
    }
    function selectAccent(items, mood, avgL, isLight) {
        var accent = items.slice().sort(function (a, b) {
            return scoreAccent(b, mood, avgL) - scoreAccent(a, mood, avgL);
        })[0] || mood;

        if (sat(accent) < 0.16) {
            accent = isLight ? mix(mood, { r: 34, g: 42, b: 58 }, 0.42) : mix(mood, { r: 150, g: 170, b: 200 }, 0.46);
        }
        return isLight ? fitLum(accent, 62, 138) : fitLum(accent, 108, 168);
    }
    function textFor(surface) {
        var l = lum(surface.r, surface.g, surface.b);
        if (l > 154) {
            return {
                primary: { r: 24, g: 28, b: 36 },
                muted: { r: 76, g: 86, b: 102 },
                accentContrast: { r: 255, g: 255, b: 255 }
            };
        }
        return {
            primary: { r: 246, g: 248, b: 252 },
            muted: { r: 180, g: 190, b: 206 },
            accentContrast: { r: 12, g: 15, b: 21 }
        };
    }

    function ensureContrast(a, b, minDelta, lightenB) {
        var adjusted = b;
        var delta = Math.abs(lum(a.r, a.g, a.b) - lum(adjusted.r, adjusted.g, adjusted.b));
        var guard = 0;
        while (delta < minDelta && guard < 8) {
            adjusted = lightenB ? lift(adjusted, 0.10) : shade(adjusted, 0.86);
            delta = Math.abs(lum(a.r, a.g, a.b) - lum(adjusted.r, adjusted.g, adjusted.b));
            guard++;
        }
        return adjusted;
    }

    // 当前壁纸的主题色（内存变量，跨新标签页不保留）
    var _current = null;

    function extract(img) {
        try {
            var SHIFT = 4;
            var canvas = document.createElement('canvas');
            canvas.width = SIZE; canvas.height = SIZE;
            var ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, SIZE, SIZE);
            var data = ctx.getImageData(0, 0, SIZE, SIZE).data;

            var freq = {}, totalL = 0, count = 0;

            for (var i = 0; i < data.length; i += 4) {
                var r = data[i] >> SHIFT << SHIFT;
                var g = data[i + 1] >> SHIFT << SHIFT;
                var b = data[i + 2] >> SHIFT << SHIFT;
                var l = lum(r, g, b);
                if (l < 12 || l > 245) continue;
                freq[r + ',' + g + ',' + b] = (freq[r + ',' + g + ',' + b] || 0) + 1;
                totalL += l; count++;
            }

            if (count === 0) { _current = fallback(); return _current; }

            var sorted = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; });
            function parse(k) {
                var p = k.split(',').map(Number);
                return { r: p[0], g: p[1], b: p[2], n: freq[k] };
            }
            var top = sorted.slice(0, 28).map(parse);
            var avgL = totalL / count;

            var white = { r: 255, g: 255, b: 255 };
            var black = { r: 0, g: 0, b: 0 };
            var dominant = top[0];
            var mood = weightedAverage(top, 12);
            var isLight = avgL > 150;

            var surfaceBase = isLight ? mix(mood, white, 0.62) : mix(mood, { r: 14, g: 16, b: 21 }, 0.82);
            var surfaceElevated = isLight ? mix(mood, white, 0.84) : mix(mood, { r: 34, g: 37, b: 45 }, 0.66);
            surfaceBase = isLight ? fitLum(surfaceBase, 166, 214) : fitLum(surfaceBase, 16, 34);
            surfaceElevated = isLight ? fitLum(surfaceElevated, 190, 232) : fitLum(surfaceElevated, 34, 62);
            surfaceElevated = ensureContrast(surfaceBase, surfaceElevated, 14, true);

            var tint = isLight ? mix(dominant, white, 0.54) : mix(dominant, white, 0.24);
            tint = isLight ? fitLum(tint, 156, 220) : fitLum(tint, 82, 150);

            var accent = selectAccent(top, mood, avgL, isLight);

            var text = textFor(surfaceBase);
            var stroke = isLight ? mix(surfaceBase, black, 0.24) : mix(surfaceElevated, white, 0.18);

            _current = {
                surfaceBase: rgb(surfaceBase),
                surfaceElevated: rgb(surfaceElevated),
                tint: rgb(tint),
                stroke: rgb(stroke),
                onSurface: rgb(text.primary),
                onSurfaceMuted: rgb(text.muted),
                accent: rgb(accent),
                accentContrast: rgb(text.accentContrast)
            };
            return _current;
        } catch (e) {
            _current = fallback();
            return _current;
        }
    }

    function fallback() {
        return {
            surfaceBase: '18,20,27',
            surfaceElevated: '28,31,40',
            tint: '64,70,92',
            stroke: '54,61,78',
            onSurface: '244,247,251',
            onSurfaceMuted: '166,176,193',
            accent: '99,102,241',
            accentContrast: '255,255,255'
        };
    }

    function applyCurrent() {
        if (!_current) return;
        var r = document.documentElement.style;
        r.setProperty('--theme-surface-base-rgb', _current.surfaceBase);
        r.setProperty('--theme-surface-elevated-rgb', _current.surfaceElevated);
        r.setProperty('--theme-tint-rgb', _current.tint);
        r.setProperty('--theme-stroke-rgb', _current.stroke);
        r.setProperty('--theme-on-surface-rgb', _current.onSurface);
        r.setProperty('--theme-on-surface-muted-rgb', _current.onSurfaceMuted);
        r.setProperty('--theme-accent-rgb', _current.accent);
        r.setProperty('--theme-accent-contrast-rgb', _current.accentContrast);
    }

    window.WallpaperTheme = {
        extract: extract,
        applyCurrent: applyCurrent,
        hasCurrent: function () { return _current !== null; }
    };

})();
