@echo off
REM ========================================
REM CONFIGURACIÓN SIMPLE DE BACKUPS
REM ========================================

echo ========================================
echo CONFIGURACIÓN DE BACKUPS - QR ORDER SYSTEM
echo ========================================
echo.

REM Rutas comunes de PostgreSQL
set PG_PATHS[0]=C:\Program Files\PostgreSQL\17\bin
set PG_PATHS[1]=C:\Program Files\PostgreSQL\16\bin
set PG_PATHS[2]=C:\Program Files\PostgreSQL\15\bin
set PG_PATHS[3]=C:\Program Files (x86)\PostgreSQL\17\bin
set PG_PATHS[4]=C:\Program Files (x86)\PostgreSQL\16\bin
set PG_PATHS[5]=C:\Program Files (x86)\PostgreSQL\15\bin

set POSTGRES_PATH=
set FOUND=0

echo Buscando PostgreSQL...

REM Buscar PostgreSQL
for %%p in ("C:\Program Files\PostgreSQL\17\bin" "C:\Program Files\PostgreSQL\16\bin" "C:\Program Files\PostgreSQL\15\bin" "C:\Program Files (x86)\PostgreSQL\17\bin" "C:\Program Files (x86)\PostgreSQL\16\bin" "C:\Program Files (x86)\PostgreSQL\15\bin") do (
    if exist "%%p\pg_dump.exe" (
        set POSTGRES_PATH=%%p
        set FOUND=1
        echo ✅ PostgreSQL encontrado en: %%p
        goto :found
    )
)

:found
if %FOUND%==0 (
    echo.
    echo ❌ PostgreSQL no encontrado automáticamente
    echo.
    set /p MANUAL_PATH="Ingresa la ruta completa a la carpeta bin de PostgreSQL: "
    if exist "%MANUAL_PATH%\pg_dump.exe" (
        set POSTGRES_PATH=%MANUAL_PATH%
        echo ✅ PostgreSQL encontrado en: %MANUAL_PATH%
    ) else (
        echo ❌ pg_dump.exe no encontrado en esa ruta
        pause
        exit /b 1
    )
)

REM Mostrar versión
echo.
echo Versión de PostgreSQL:
"%POSTGRES_PATH%\pg_dump.exe" --version
echo.

REM Crear carpeta de backups
if not exist "backups" mkdir backups
echo ✅ Carpeta 'backups' creada

echo.
echo ========================================
echo CONFIGURACIÓN DE BASE DE DATOS
echo ========================================
echo.
echo Tu proyecto Supabase: osvgapxefsqqhltkabku.supabase.co
echo.
set /p DB_PASSWORD="Ingresa la contraseña de tu base de datos: "

if "%DB_PASSWORD%"=="" (
    echo ❌ Contraseña vacía
    pause
    exit /b 1
)

REM Crear archivo de configuración con ruta completa
echo # Configuración de Backup - QR Order System > backup.env
echo POSTGRES_PATH=%POSTGRES_PATH% >> backup.env
echo DB_PASSWORD=%DB_PASSWORD% >> backup.env
echo DB_URL=postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres >> backup.env
echo BACKUP_RETENTION_DAYS=30 >> backup.env

echo ✅ Configuración guardada

echo.
echo ========================================
echo PRUEBA DE CONEXIÓN
echo ========================================
echo.
echo Probando conexión...

REM Probar conexión
"%POSTGRES_PATH%\psql.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" -c "SELECT 'Conexión exitosa' as status, current_database(), current_user;"

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡Conexión exitosa!
    
    echo.
    echo ========================================
    echo PRIMER BACKUP DE PRUEBA
    echo ========================================
    echo.
    set /p DO_BACKUP="¿Crear backup de prueba ahora? (s/n): "
    
    if /i "%DO_BACKUP%"=="s" (
        echo.
        echo Creando backup de prueba...
        
        REM Timestamp
        for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
        for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
        set timestamp=%mydate%_%mytime%
        set timestamp=%timestamp: =0%
        
        set BACKUP_FILE=backups\backup_prueba_%timestamp%.sql
        
        echo Ejecutando backup...
        "%POSTGRES_PATH%\pg_dump.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" --verbose --clean --no-owner --no-privileges --file="%BACKUP_FILE%"
        
        if %errorlevel% equ 0 (
            echo.
            echo ✅ Backup creado: %BACKUP_FILE%
            for %%i in ("%BACKUP_FILE%") do echo Tamaño: %%~zi bytes
            
            REM Comprimir
            echo Comprimiendo...
            powershell -command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
            if exist "%BACKUP_FILE%.zip" del "%BACKUP_FILE%"
            
            echo ✅ Backup final: %BACKUP_FILE%.zip
        ) else (
            echo ❌ Error al crear backup
        )
    )
    
) else (
    echo ❌ Error de conexión
    echo Verifica la contraseña
)

echo.
echo ========================================
echo CONFIGURACIÓN COMPLETADA
echo ========================================
echo.
echo Ahora puedes usar:
echo • backup-manual.bat - Para crear backups cuando quieras
echo • restore-backup.bat - Para restaurar backups
echo.
pause