@echo off
REM ========================================
REM BÚSQUEDA EXHAUSTIVA DE POSTGRESQL
REM ========================================

echo ========================================
echo BUSCANDO POSTGRESQL EN TODO EL SISTEMA
echo ========================================
echo.

echo Buscando pg_dump.exe en todo el sistema...
echo (Esto puede tomar un momento)
echo.

REM Buscar en ubicaciones comunes primero
set FOUND=0
set POSTGRES_PATH=

echo Verificando ubicaciones comunes...

REM Program Files
for /d %%d in ("C:\Program Files\PostgreSQL\*") do (
    if exist "%%d\bin\pg_dump.exe" (
        echo ✅ Encontrado: %%d\bin\
        set POSTGRES_PATH=%%d\bin
        set FOUND=1
        goto :test_version
    )
)

REM Program Files (x86)
for /d %%d in ("C:\Program Files (x86)\PostgreSQL\*") do (
    if exist "%%d\bin\pg_dump.exe" (
        echo ✅ Encontrado: %%d\bin\
        set POSTGRES_PATH=%%d\bin
        set FOUND=1
        goto :test_version
    )
)

REM Buscar en otras ubicaciones
if exist "C:\PostgreSQL\bin\pg_dump.exe" (
    echo ✅ Encontrado: C:\PostgreSQL\bin\
    set POSTGRES_PATH=C:\PostgreSQL\bin
    set FOUND=1
    goto :test_version
)

if exist "C:\pgsql\bin\pg_dump.exe" (
    echo ✅ Encontrado: C:\pgsql\bin\
    set POSTGRES_PATH=C:\pgsql\bin
    set FOUND=1
    goto :test_version
)

REM Si no lo encontramos, buscar en todo el sistema
if %FOUND%==0 (
    echo.
    echo No encontrado en ubicaciones comunes. Buscando en todo el disco C:\...
    echo (Esto tomará varios minutos)
    echo.
    
    for /f "delims=" %%i in ('dir /s /b C:\pg_dump.exe 2^>nul') do (
        echo ✅ Encontrado: %%~dpi
        set POSTGRES_PATH=%%~dpi
        set FOUND=1
        goto :test_version
    )
)

if %FOUND%==0 (
    echo.
    echo ❌ No se encontró pg_dump.exe en el sistema
    echo.
    echo SOLUCIONES:
    echo 1. Reinstalar PostgreSQL desde: https://www.postgresql.org/download/
    echo 2. O usar una instalación portable
    echo 3. O instalar solo el cliente PostgreSQL
    echo.
    pause
    exit /b 1
)

:test_version
echo.
echo PostgreSQL encontrado en: %POSTGRES_PATH%
echo.
echo Probando la herramienta...
"%POSTGRES_PATH%\pg_dump.exe" --version

if %errorlevel% neq 0 (
    echo ❌ Error al ejecutar pg_dump
    pause
    exit /b 1
)

echo.
echo ✅ PostgreSQL funciona correctamente
echo.

echo ========================================
echo CONFIGURANDO BACKUPS CON ESTA RUTA
echo ========================================
echo.

set /p CONTINUE="¿Continuar con la configuración de backups? (s/n): "

if /i "%CONTINUE%" neq "s" (
    echo Configuración cancelada
    pause
    exit /b 0
)

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
set /p DB_PASSWORD="Ingresa la contraseña de tu base de datos Supabase: "

if "%DB_PASSWORD%"=="" (
    echo ❌ Contraseña vacía
    pause
    exit /b 1
)

REM Crear archivo de configuración
echo # Configuración de Backup - QR Order System > backup.env
echo POSTGRES_PATH=%POSTGRES_PATH% >> backup.env
echo DB_PASSWORD=%DB_PASSWORD% >> backup.env
echo DB_URL=postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres >> backup.env
echo BACKUP_RETENTION_DAYS=30 >> backup.env

echo ✅ Configuración guardada en backup.env

echo.
echo ========================================
echo PRUEBA DE CONEXIÓN
echo ========================================
echo.
echo Probando conexión a Supabase...

REM Probar conexión
"%POSTGRES_PATH%\psql.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" -c "SELECT 'Conexión exitosa' as status, current_database() as database, current_user as user, now() as timestamp;"

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡Conexión exitosa a Supabase!
    
    echo.
    echo ========================================
    echo BACKUP DE PRUEBA
    echo ========================================
    echo.
    set /p DO_BACKUP="¿Crear backup de prueba? (s/n): "
    
    if /i "%DO_BACKUP%"=="s" (
        echo.
        echo Creando backup de prueba...
        
        REM Timestamp
        for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
        for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
        set timestamp=%mydate%_%mytime%
        set timestamp=%timestamp: =0%
        
        set BACKUP_FILE=backups\backup_test_%timestamp%.sql
        
        echo Ejecutando pg_dump...
        "%POSTGRES_PATH%\pg_dump.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" --verbose --clean --no-owner --no-privileges --file="%BACKUP_FILE%"
        
        if %errorlevel% equ 0 (
            echo.
            echo ✅ Backup de prueba creado: %BACKUP_FILE%
            for %%i in ("%BACKUP_FILE%") do echo Tamaño: %%~zi bytes
            
            REM Comprimir
            echo Comprimiendo...
            powershell -command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
            if exist "%BACKUP_FILE%.zip" (
                del "%BACKUP_FILE%"
                echo ✅ Backup final: %BACKUP_FILE%.zip
                for %%i in ("%BACKUP_FILE%.zip") do echo Tamaño comprimido: %%~zi bytes
            )
            
        ) else (
            echo ❌ Error al crear backup de prueba
        )
    )
    
) else (
    echo.
    echo ❌ Error de conexión a Supabase
    echo.
    echo Verifica:
    echo 1. La contraseña esté correcta
    echo 2. Tengas conexión a internet
    echo 3. No haya firewall bloqueando
)

echo.
echo ========================================
echo CONFIGURACIÓN COMPLETADA
echo ========================================
echo.
echo PostgreSQL encontrado en: %POSTGRES_PATH%
echo Configuración guardada en: backup.env
echo.
echo Archivos disponibles:
echo • backup-manual.bat - Crear backup cuando quieras
echo • restore-backup.bat - Restaurar backup
echo.
echo ¡Tu sistema de backups está listo!
echo.
pause