@echo off
setlocal

set "ROOT=%~dp0.."
set "EMSDK=E:\Users\CoffeeCat\Desktop\Study\emsdk"

if exist "%EMSDK%\emsdk_env.bat" (
    call "%EMSDK%\emsdk_env.bat" >nul 2>nul
)

where emcc >nul 2>nul
if errorlevel 1 (
    echo [PlainTab] emcc was not found. Update EMSDK in this script or open an emsdk shell.
    exit /b 1
)

echo [PlainTab] Building js\wallpaper\theme_engine.wasm...

call emcc "%~dp0theme_engine.cpp" -O3 -std=c++17 ^
    -s STANDALONE_WASM=1 ^
    -s WASM=1 ^
    -s INITIAL_MEMORY=1048576 ^
    -s ALLOW_MEMORY_GROWTH=0 ^
    -s EXPORTED_FUNCTIONS="['_theme_input_buffer','_theme_result_buffer','_theme_max_pixels','_theme_result_ints','_theme_abi_version','_theme_analyze']" ^
    --no-entry ^
    -o "%ROOT%\js\wallpaper\theme_engine.wasm"

if errorlevel 1 (
    echo [PlainTab] Build failed.
    exit /b 1
)

echo [PlainTab] Build complete.
