@echo off
REM ========================================
REM RESTAURAR BACKUP - QR ORDER SYSTEM
REM ========================================

echo ========================================
echo RESTAURAR BACKUP - QR ORDER SYSTEM
echo ========================================
echo.

REM Verificar si existen backups
if not exist "backups\*.zip" (
    echo ❌ No se encontraron backups en la carpeta 'backups\'
    echo.
    echo Asegúrate de:
    echo 1. Haber ejecutado al menos un backup
    echo 2. Los archivos estén en la carpeta 'backups\'
    echo.
    pause
    exit /b 1
)

echo Backups disponibles:
echo.
set count=0
for %%i in (backups\backup_*.zip) do (
    set /a count+=1
    echo !count!^) %%i
)

if %count%==0 (
    echo ❌ No se encontraron backups válidos
    pause
    exit /b 1
)

echo.
echo ⚠️  ADVERTENCIA: Restaurar un backup SOBRESCRIBIRÁ todos los datos actuales
echo.
set /p CONFIRM="¿Estás seguro que quieres continuar? (escribe SI): "

if not "%CONFIRM%"=="SI" (
    echo Operación cancelada
    pause
    exit /b 0
)

echo.
set /p BACKUP_CHOICE="Selecciona el número del backup a restaurar: "

REM Obtener el archivo seleccionado
set selected_file=
set current=0
for %%i in (backups\backup_*.zip) do (
    set /a current+=1
    if !current!==%BACKUP_CHOICE% set selected_file=%%i
)

if "%selected_file%"=="" (
    echo ❌ Selección inválida
    pause
    exit /b 1
)

echo.
echo Restaurando backup: %selected_file%
echo.

REM Extraer el archivo ZIP
echo [%date% %time%] Extrayendo backup...
powershell -command "Expand-Archive -Path '%selected_file%' -DestinationPath 'temp_restore' -Force"

if %errorlevel% neq 0 (
    echo ❌ Error al extraer backup
    pause
    exit /b 1
)

REM Buscar el archivo SQL extraído
set sql_file=
for %%i in (temp_restore\*.sql) do set sql_file=%%i

if "%sql_file%"=="" (
    echo ❌ No se encontró archivo SQL en el backup
    rmdir /s /q temp_restore
    pause
    exit /b 1
)

REM Leer configuración de base de datos
if not exist "backup.env" (
    echo ❌ Archivo de configuración backup.env no encontrado
    echo Ejecuta backup-config.bat primero
    rmdir /s /q temp_restore
    pause
    exit /b 1
)

for /f "tokens=1,2 delims==" %%a in (backup.env) do (
    if "%%a"=="DB_URL" set DB_URL=%%b
)

echo [%date% %time%] Restaurando base de datos...
echo.
echo ⏳ Esto puede tomar varios minutos...
echo.

REM Ejecutar restauración
psql "%DB_URL%" --file="%sql_file%"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE
    echo ========================================
    echo Backup restaurado: %selected_file%
    echo Fecha: %date% %time%
    echo ========================================
    echo.
    echo Tu base de datos ha sido restaurada al estado del backup seleccionado.
    echo.
) else (
    echo.
    echo ❌ ERROR EN LA RESTAURACIÓN
    echo.
    echo Posibles causas:
    echo 1. Contraseña incorrecta
    echo 2. Problemas de conectividad
    echo 3. Archivo de backup corrupto
    echo.
    echo Verifica la configuración en backup.env
    echo.
)

REM Limpiar archivos temporales
rmdir /s /q temp_restore

echo.
pause