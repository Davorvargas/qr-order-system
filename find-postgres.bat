@echo off
echo ========================================
echo BUSCANDO INSTALACIÓN DE POSTGRESQL
echo ========================================
echo.

REM Buscar PostgreSQL en ubicaciones comunes
set POSTGRES_FOUND=0

echo Buscando PostgreSQL...
echo.

if exist "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" (
    echo ✅ Encontrado: C:\Program Files\PostgreSQL\17\bin\
    set POSTGRES_PATH=C:\Program Files\PostgreSQL\17\bin
    set POSTGRES_FOUND=1
)

if exist "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" (
    echo ✅ Encontrado: C:\Program Files\PostgreSQL\16\bin\
    set POSTGRES_PATH=C:\Program Files\PostgreSQL\16\bin
    set POSTGRES_FOUND=1
)

if exist "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" (
    echo ✅ Encontrado: C:\Program Files\PostgreSQL\15\bin\
    set POSTGRES_PATH=C:\Program Files\PostgreSQL\15\bin
    set POSTGRES_FOUND=1
)

if exist "C:\Program Files (x86)\PostgreSQL\17\bin\pg_dump.exe" (
    echo ✅ Encontrado: C:\Program Files (x86)\PostgreSQL\17\bin\
    set POSTGRES_PATH=C:\Program Files (x86)\PostgreSQL\17\bin
    set POSTGRES_FOUND=1
)

if exist "C:\Program Files (x86)\PostgreSQL\16\bin\pg_dump.exe" (
    echo ✅ Encontrado: C:\Program Files (x86)\PostgreSQL\16\bin\
    set POSTGRES_PATH=C:\Program Files (x86)\PostgreSQL\16\bin
    set POSTGRES_FOUND=1
)

if exist "C:\Program Files (x86)\PostgreSQL\15\bin\pg_dump.exe" (
    echo ✅ Encontrado: C:\Program Files (x86)\PostgreSQL\15\bin\
    set POSTGRES_PATH=C:\Program Files (x86)\PostgreSQL\15\bin
    set POSTGRES_FOUND=1
)

if %POSTGRES_FOUND%==0 (
    echo ❌ No se encontró PostgreSQL en ubicaciones comunes
    echo.
    echo Busca manualmente en:
    echo - C:\Program Files\PostgreSQL\
    echo - C:\Program Files (x86)\PostgreSQL\
    echo.
    echo Busca la carpeta que contenga pg_dump.exe
    pause
    exit /b 1
)

echo.
echo PostgreSQL encontrado en: %POSTGRES_PATH%
echo.

REM Mostrar versión
"%POSTGRES_PATH%\pg_dump.exe" --version

echo.
echo ========================================
echo CREANDO CONFIGURADOR CON RUTA COMPLETA
echo ========================================

REM Crear versión del configurador que use la ruta completa
(
echo @echo off
echo REM Configurador con ruta completa de PostgreSQL
echo set POSTGRES_PATH=%POSTGRES_PATH%
echo set PATH=%POSTGRES_PATH%;%%PATH%%
echo.
echo echo PostgreSQL configurado en: %POSTGRES_PATH%
echo echo.
echo.
type setup-backup.bat | findstr /v "pg_dump --version"
echo.
echo REM Verificar PostgreSQL con ruta completa
echo echo Verificando PostgreSQL...
echo "%POSTGRES_PATH%\pg_dump.exe" --version
) > setup-backup-fixed.bat

echo ✅ Nuevo configurador creado: setup-backup-fixed.bat
echo.
echo ========================================
echo AHORA EJECUTA EL CONFIGURADOR CORREGIDO
echo ========================================
echo.
echo Ejecuta: setup-backup-fixed.bat
echo.
pause