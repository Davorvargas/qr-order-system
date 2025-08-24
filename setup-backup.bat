@echo off
REM ========================================
REM CONFIGURACIÓN RÁPIDA DE BACKUPS
REM ========================================

echo ========================================
echo CONFIGURACIÓN DE BACKUPS - QR ORDER SYSTEM
echo ========================================
echo.

REM Verificar si pg_dump está disponible
echo Verificando PostgreSQL...
pg_dump --version
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL no encontrado en PATH
    echo.
    echo SOLUCIÓN:
    echo 1. Busca donde instalaste PostgreSQL (ej: C:\Program Files\PostgreSQL\16\bin\)
    echo 2. Agrega esa carpeta al PATH de Windows
    echo 3. O navega a esa carpeta antes de ejecutar este script
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL encontrado
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
echo Para obtener la contraseña:
echo 1. Ve a: https://supabase.com/dashboard/projects
echo 2. Entra a tu proyecto
echo 3. Settings → Database
echo 4. Copia la "Database password"
echo.
set /p DB_PASSWORD="Pega aquí la contraseña de tu base de datos: "

if "%DB_PASSWORD%"=="" (
    echo ❌ Contraseña vacía
    pause
    exit /b 1
)

REM Crear archivo de configuración
echo # Configuración de Backup - QR Order System > backup.env
echo DB_PASSWORD=%DB_PASSWORD% >> backup.env
echo DB_URL=postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres >> backup.env
echo BACKUP_RETENTION_DAYS=30 >> backup.env

echo ✅ Configuración guardada en backup.env

echo.
echo ========================================
echo PRUEBA DE CONEXIÓN
echo ========================================
echo.
echo Probando conexión a la base de datos...

REM Probar conexión con un comando simple
psql "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" -c "SELECT current_database(), current_user, now();"

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡Conexión exitosa!
    echo.
    echo ========================================
    echo PRIMER BACKUP DE PRUEBA
    echo ========================================
    echo.
    set /p DO_BACKUP="¿Crear primer backup de prueba? (s/n): "
    
    if /i "%DO_BACKUP%"=="s" (
        echo.
        echo Creando backup de prueba...
        
        REM Generar timestamp
        for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
        for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
        set timestamp=%mydate%_%mytime%
        set timestamp=%timestamp: =0%
        
        set BACKUP_FILE=backups\backup_prueba_%timestamp%.sql
        
        echo Ejecutando: pg_dump...
        pg_dump "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" --verbose --clean --no-owner --no-privileges --file="%BACKUP_FILE%"
        
        if %errorlevel% equ 0 (
            echo.
            echo ✅ Backup creado: %BACKUP_FILE%
            
            REM Mostrar tamaño del backup
            for %%i in ("%BACKUP_FILE%") do echo Tamaño: %%~zi bytes
            
            REM Comprimir
            echo Comprimiendo...
            powershell -command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
            del "%BACKUP_FILE%"
            
            echo ✅ Backup comprimido: %BACKUP_FILE%.zip
            
        ) else (
            echo ❌ Error al crear backup
        )
    )
    
    echo.
    echo ========================================
    echo CONFIGURAR BACKUP AUTOMÁTICO
    echo ========================================
    echo.
    set /p AUTO_BACKUP="¿Configurar backup automático diario a las 2:00 AM? (s/n): "
    
    if /i "%AUTO_BACKUP%"=="s" (
        echo.
        echo Configurando tarea automática...
        
        REM Crear tarea programada
        schtasks /create /tn "QR-Order-Backup-Daily" /tr "%~dp0backup-local.bat" /sc daily /st 02:00 /f
        
        if %errorlevel% equ 0 (
            echo ✅ Backup automático configurado
            echo 📅 Se ejecutará diariamente a las 2:00 AM
            echo.
            echo Para administrar la tarea:
            echo - Ver: schtasks /query /tn "QR-Order-Backup-Daily"
            echo - Eliminar: schtasks /delete /tn "QR-Order-Backup-Daily" /f
        ) else (
            echo ❌ Error. Ejecuta como Administrador para configurar tareas automáticas
        )
    )
    
) else (
    echo.
    echo ❌ Error de conexión
    echo.
    echo Posibles causas:
    echo 1. Contraseña incorrecta
    echo 2. Sin acceso a internet
    echo 3. Firewall bloqueando la conexión
    echo.
    echo Verifica la contraseña en tu dashboard de Supabase
)

echo.
echo ========================================
echo CONFIGURACIÓN COMPLETADA
echo ========================================
echo.
echo Archivos disponibles:
echo • backup-local.bat    - Crear backup manual
echo • restore-backup.bat  - Restaurar backup
echo • backup.env          - Configuración
echo.
echo Carpeta de backups: backups\
echo.
echo Para backup manual ejecuta: backup-local.bat
echo.
pause