@echo off
REM ========================================
REM SISTEMA DE BACKUP LOCAL - QR ORDER SYSTEM
REM ========================================

echo [%date% %time%] Iniciando backup local...

REM Crear carpeta de backups si no existe
if not exist "backups" mkdir backups

REM Generar timestamp para el nombre del archivo
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
set timestamp=%mydate%_%mytime%
set timestamp=%timestamp: =0%

REM Leer configuración desde backup.env
if not exist "backup.env" (
    echo ❌ Archivo de configuración backup.env no encontrado
    echo Ejecuta setup-backup.bat primero para configurar
    pause
    exit /b 1
)

for /f "tokens=1,2 delims==" %%a in (backup.env) do (
    if "%%a"=="DB_URL" set DB_URL=%%b
)

set BACKUP_FILE=backups\backup_%timestamp%.sql

echo [%date% %time%] Creando backup: %BACKUP_FILE%

REM Ejecutar pg_dump (necesitas tener PostgreSQL client instalado)
pg_dump "%DB_URL%" --verbose --clean --no-owner --no-privileges --file="%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo [%date% %time%] ✅ Backup creado exitosamente: %BACKUP_FILE%
    
    REM Comprimir el backup
    echo [%date% %time%] Comprimiendo backup...
    powershell -command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip'"
    
    if %errorlevel% equ 0 (
        echo [%date% %time%] ✅ Backup comprimido: %BACKUP_FILE%.zip
        del "%BACKUP_FILE%"
        echo [%date% %time%] 🧹 Archivo SQL original eliminado (guardado comprimido)
    ) else (
        echo [%date% %time%] ❌ Error al comprimir backup
    )
    
    REM Limpiar backups antiguos (mantener últimos 30 archivos)
    echo [%date% %time%] Limpiando backups antiguos...
    for /f "skip=30" %%i in ('dir /b /o-d "backups\backup_*.zip" 2^>nul') do (
        echo [%date% %time%] 🗑️ Eliminando backup antiguo: %%i
        del "backups\%%i"
    )
    
    REM Mostrar estadísticas
    echo.
    echo ========================================
    echo BACKUP COMPLETADO EXITOSAMENTE
    echo ========================================
    echo Archivo: %BACKUP_FILE%.zip
    for %%i in ("%BACKUP_FILE%.zip") do echo Tamaño: %%~zi bytes
    echo Fecha: %date% %time%
    echo ========================================
    echo.
    
) else (
    echo [%date% %time%] ❌ Error al crear backup
    echo.
    echo POSIBLES SOLUCIONES:
    echo 1. Instalar PostgreSQL client: https://www.postgresql.org/download/
    echo 2. Verificar la contraseña de la base de datos
    echo 3. Verificar conexión a internet
    echo.
    exit /b 1
)

pause