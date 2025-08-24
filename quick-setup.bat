@echo off
REM ========================================
REM CONFIGURACIÓN RÁPIDA CON RUTA CONOCIDA
REM ========================================

echo ========================================
echo CONFIGURACIÓN RÁPIDA DE BACKUPS
echo ========================================
echo.

REM Verificar la ruta específica
set POSTGRES_PATH=C:\Program Files\PostgreSQL\17\bin

echo Verificando PostgreSQL en: %POSTGRES_PATH%

if exist "%POSTGRES_PATH%\pg_dump.exe" (
    echo ✅ pg_dump.exe encontrado
) else (
    echo ❌ pg_dump.exe no encontrado en esa ruta
    echo.
    echo Verificando otras versiones...
    
    REM Buscar en otras versiones
    for /d %%d in ("C:\Program Files\PostgreSQL\*") do (
        if exist "%%d\bin\pg_dump.exe" (
            echo ✅ Encontrado en: %%d\bin\
            set POSTGRES_PATH=%%d\bin
            goto :found
        )
    )
    
    echo ❌ No se encontró pg_dump.exe
    pause
    exit /b 1
)

:found
echo.
echo Probando PostgreSQL...
"%POSTGRES_PATH%\pg_dump.exe" --version

if %errorlevel% neq 0 (
    echo ❌ Error al ejecutar pg_dump
    pause
    exit /b 1
)

echo ✅ PostgreSQL funciona correctamente

REM Crear carpeta de backups
if not exist "backups" mkdir backups
echo ✅ Carpeta 'backups' creada

echo.
echo ========================================
echo CONFIGURACIÓN DE SUPABASE
echo ========================================
echo.
echo Tu proyecto: osvgapxefsqqhltkabku.supabase.co
echo.
set /p DB_PASSWORD="Pega aquí la contraseña de Supabase: "

if "%DB_PASSWORD%"=="" (
    echo ❌ Contraseña vacía
    pause
    exit /b 1
)

REM Crear configuración
echo # Backup Configuration > backup.env
echo POSTGRES_PATH=%POSTGRES_PATH% >> backup.env
echo DB_PASSWORD=%DB_PASSWORD% >> backup.env
echo DB_URL=postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres >> backup.env

echo ✅ Configuración guardada

echo.
echo ========================================
echo PRUEBA DE CONEXIÓN
echo ========================================
echo.
echo Probando conexión a Supabase...

"%POSTGRES_PATH%\psql.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" -c "SELECT 'OK' as status, current_database(), current_user, now();"

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡CONEXIÓN EXITOSA!
    
    echo.
    echo ========================================
    echo BACKUP DE PRUEBA
    echo ========================================
    echo.
    
    REM Timestamp simple
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set d=%%c%%a%%b
    for /f "tokens=1 delims=: " %%a in ('time /t') do set t=%%a
    set timestamp=%d%_%t%
    set timestamp=%timestamp: =0%
    
    set BACKUP_FILE=backups\test_%timestamp%.sql
    
    echo Creando backup de prueba: %BACKUP_FILE%
    
    "%POSTGRES_PATH%\pg_dump.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" --clean --no-owner --no-privileges --file="%BACKUP_FILE%"
    
    if %errorlevel% equ 0 (
        echo ✅ Backup creado exitosamente
        for %%i in ("%BACKUP_FILE%") do echo Tamaño: %%~zi bytes
        
        REM Comprimir
        powershell -command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
        del "%BACKUP_FILE%"
        
        echo ✅ Backup comprimido: %BACKUP_FILE%.zip
        
        echo.
        echo ========================================
        echo ✅ ¡TODO CONFIGURADO!
        echo ========================================
        echo.
        echo PostgreSQL: %POSTGRES_PATH%
        echo Backup creado: %BACKUP_FILE%.zip
        echo Configuración: backup.env
        echo.
        echo PARA USAR:
        echo • backup-manual.bat - Crear backup
        echo • Carpeta backups\ - Ver todos los backups
        echo.
        echo ¡Tu sistema de backups está funcionando!
        
    ) else (
        echo ❌ Error al crear backup
        echo Verifica la configuración
    )
    
) else (
    echo ❌ Error de conexión
    echo Verifica la contraseña
)

echo.
pause