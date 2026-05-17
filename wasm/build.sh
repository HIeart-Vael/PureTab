#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

: "${EMSDK:=/e/Users/CoffeeCat/Desktop/Study/emsdk}"

if [ -f "$EMSDK/emsdk_env.sh" ]; then
    # shellcheck disable=SC1091
    . "$EMSDK/emsdk_env.sh" >/dev/null 2>/dev/null || true
fi

if ! command -v emcc >/dev/null 2>/dev/null; then
    echo "[PlainTab] emcc was not found. Set EMSDK or run this from an emsdk shell." >&2
    exit 1
fi

echo "[PlainTab] Building js/wallpaper/theme_engine.wasm..."

emcc "$SCRIPT_DIR/theme_engine.cpp" -O3 -std=c++17 \
    -s STANDALONE_WASM=1 \
    -s WASM=1 \
    -s INITIAL_MEMORY=1048576 \
    -s ALLOW_MEMORY_GROWTH=0 \
    -s "EXPORTED_FUNCTIONS=['_theme_input_buffer','_theme_result_buffer','_theme_max_pixels','_theme_result_ints','_theme_abi_version','_theme_analyze']" \
    --no-entry \
    -o "$ROOT/js/wallpaper/theme_engine.wasm"

echo "[PlainTab] Build complete."
