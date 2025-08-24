@echo off
REM ========================================
REM CONFIGURADOR DE BACKUPS AUTOMÁTICOS
REM ========================================

echo ========================================
echo CONFIGURADOR DE BACKUPS - QR ORDER SYSTEM
echo ========================================
echo.

REM Verificar si pg_dump está disponible
pg_dump --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL client no encontrado
    echo.
    echo NECESITAS INSTALAR POSTGRESQL CLIENT:
    echo 1. Ve a: https://www.postgresql.org/download/windows/
    echo 2. Descarga e instala PostgreSQL
    echo 3. Asegúrate de que pg_dump esté en PATH
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL client encontrado
pg_dump --version

echo.
echo ========================================
echo CONFIGURACIÓN DE CONTRASEÑA
echo ========================================
echo.
echo Para configurar la contraseña de tu base de datos:
echo 1. Ve a tu dashboard de Supabase
echo 2. Settings ^> Database
echo 3. Busca "Database password" 
echo 4. Copia la contraseña
echo.
set /p DB_PASSWORD="Ingresa la contraseña de tu base de datos: "

echo.
echo ========================================
echo CREANDO ARCHIVO DE CONFIGURACIÓN
echo ========================================

REM Crear archivo .env para backups
echo DB_URL=postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres > backup.env
echo BACKUP_RETENTION_DAYS=30 >> backup.env

echo ✅ Configuración guardada en backup.env

echo.
echo ========================================
echo CONFIGURAR TAREA AUTOMÁTICA
echo ========================================
echo.
echo ¿Quieres configurar backups automáticos diarios?
echo 1) Sí - Configurar tarea diaria a las 2:00 AM
echo 2) No - Solo backup manual
echo.
set /p CHOICE="Tu elección (1 o 2): "

if "%CHOICE%"=="1" (
    echo.
    echo Configurando tarea automática...
    
    REM Crear tarea programada de Windows
    schtasks /create /tn "QR-Order-Backup" /tr "%~dp0backup-local.bat" /sc daily /st 02:00 /f
    
    if %errorlevel% equ 0 (
        echo ✅ Tarea automática configurada exitosamente
        echo 📅 Los backups se ejecutarán diariamente a las 2:00 AM
        echo.
        echo Para ver la tarea: schtasks /query /tn "QR-Order-Backup"
        echo Para eliminar la tarea: schtasks /delete /tn "QR-Order-Backup" /f
    ) else (
        echo ❌ Error al configurar tarea automática
        echo Ejecuta este script como Administrador para configurar tareas automáticas
    )
) else (
    echo ✅ Configuración manual completada
    echo Para hacer backup ejecuta: backup-local.bat
)

echo.
echo ========================================
echo PROBANDO BACKUP
echo ========================================
echo.
echo ¿Quieres hacer un backup de prueba ahora?
set /p TEST_BACKUP="(s/n): "

if /i "%TEST_BACKUP%"=="s" (
    echo.
    echo Ejecutando backup de prueba...
    call backup-local.bat
)

echo.
echo ========================================
echo CONFIGURACIÓN COMPLETADA
echo ========================================
echo.
echo Archivos creados:
echo - backup-local.bat (script de backup)
echo - backup.env (configuración)
echo - backup-config.bat (este configurador)
echo.
echo Para hacer backup manual: backup-local.bat
echo Carpeta de backups: backups\
echo.
pause