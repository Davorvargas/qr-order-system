@echo off
REM ========================================
REM BACKUP FINAL - SIN ERRORES
REM ========================================

echo ========================================
echo BACKUP FINAL DE PRUEBA
echo ========================================
echo.

REM Leer configuración
for /f "tokens=1,2 delims==" %%a in (backup.env) do (
    if "%%a"=="POSTGRES_PATH" set POSTGRES_PATH=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
)

echo PostgreSQL: %POSTGRES_PATH%
echo.

REM Timestamp simple
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set d=%%c%%a%%b
for /f "tokens=1" %%a in ("%time%") do set t=%%a
set t=%t: =0%
set t=%t:~0,2%%t:~3,2%
set timestamp=%d%_%t%

set BACKUP_FILE=backups\final_%timestamp%.sql

echo Creando backup: %BACKUP_FILE%
echo.

REM Crear backup
"%POSTGRES_PATH%\pg_dump.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" --clean --no-owner --no-privileges --file="%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo ✅ Backup ejecutado exitosamente
    
    if exist "%BACKUP_FILE%" (
        echo ✅ Archivo creado: %BACKUP_FILE%
        for %%i in ("%BACKUP_FILE%") do echo Tamaño: %%~zi bytes
        
        REM Comprimir
        echo Comprimiendo...
        powershell -command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
        
        if exist "%BACKUP_FILE%.zip" (
            del "%BACKUP_FILE%"
            echo ✅ Backup final: %BACKUP_FILE%.zip
            for %%i in ("%BACKUP_FILE%.zip") do echo Tamaño comprimido: %%~zi bytes
            
            echo.
            echo ========================================
            echo ✅ ¡SISTEMA DE BACKUPS COMPLETO!
            echo ========================================
            echo.
            echo ✅ PostgreSQL funcionando
            echo ✅ Conexión a Supabase OK
            echo ✅ Backup creado y comprimido
            echo ✅ Configuración guardada
            echo.
            echo ARCHIVOS CREADOS:
            echo • backup.env - Configuración
            echo • %BACKUP_FILE%.zip - Tu primer backup
            echo • backup-manual.bat - Para backups futuros
            echo.
            echo CARPETA: backups\ - Todos tus backups
            echo.
            echo 🛡️ ¡Tu restaurante está protegido!
            echo.
            
        ) else (
            echo ❌ Error al comprimir
        )
    ) else (
        echo ❌ No se creó el archivo
    )
else (
    echo ❌ Error en pg_dump
)

echo.
pause