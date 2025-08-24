@echo off
REM ========================================
REM BACKUP MANUAL - QR ORDER SYSTEM
REM ========================================

echo [%date% %time%] Iniciando backup manual...

REM Leer configuración
if not exist "backup.env" (
    echo ❌ Configuración no encontrada
    echo Ejecuta setup-backup-simple.bat primero
    pause
    exit /b 1
)

REM Leer variables del archivo
for /f "tokens=1,2 delims==" %%a in (backup.env) do (
    if "%%a"=="POSTGRES_PATH" set POSTGRES_PATH=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
    if "%%a"=="DB_URL" set DB_URL=%%b
)

REM Verificar que tenemos toda la configuración
if "%POSTGRES_PATH%"=="" (
    echo ❌ Ruta de PostgreSQL no configurada
    pause
    exit /b 1
)

if "%DB_PASSWORD%"=="" (
    echo ❌ Contraseña no configurada
    pause
    exit /b 1
)

REM Crear carpeta si no existe
if not exist "backups" mkdir backups

REM Generar timestamp correcto
set year=%date:~10,4%
set month=%date:~4,2%
set day=%date:~7,2%
set hour=%time:~0,2%
set minute=%time:~3,2%
set hour=%hour: =0%
set timestamp=%year%%month%%day%_%hour%%minute%

set BACKUP_FILE=backups\backup_%timestamp%.sql

echo [%date% %time%] Creando backup: %BACKUP_FILE%
echo [%date% %time%] Usando PostgreSQL en: %POSTGRES_PATH%

REM Ejecutar backup
"%POSTGRES_PATH%\pg_dump.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" --verbose --clean --no-owner --no-privileges --file="%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo [%date% %time%] ✅ Backup creado exitosamente
    
    REM Mostrar tamaño
    for %%i in ("%BACKUP_FILE%") do echo [%date% %time%] Tamaño: %%~zi bytes
    
    REM Comprimir
    echo [%date% %time%] Comprimiendo...
    powershell -command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
    
    if exist "%BACKUP_FILE%.zip" (
        del "%BACKUP_FILE%"
        echo [%date% %time%] ✅ Backup comprimido: %BACKUP_FILE%.zip
        
        REM Mostrar tamaño comprimido
        for %%i in ("%BACKUP_FILE%.zip") do echo [%date% %time%] Tamaño comprimido: %%~zi bytes
        
        REM Limpiar backups antiguos (mantener últimos 30)
        echo [%date% %time%] Limpiando backups antiguos...
        for /f "skip=30" %%i in ('dir /b /o-d "backups\backup_*.zip" 2^>nul') do (
            echo [%date% %time%] 🗑️ Eliminando: %%i
            del "backups\%%i"
        )
        
        echo.
        echo ========================================
        echo ✅ BACKUP COMPLETADO EXITOSAMENTE
        echo ========================================
        echo Archivo: %BACKUP_FILE%.zip
        echo Hora: %date% %time%
        echo ========================================
        
    ) else (
        echo [%date% %time%] ❌ Error al comprimir
    )
    
) else (
    echo [%date% %time%] ❌ Error al crear backup
    echo.
    echo Verifica:
    echo 1. Conexión a internet
    echo 2. Contraseña de la base de datos
    echo 3. Configuración en backup.env
)

echo.
pause