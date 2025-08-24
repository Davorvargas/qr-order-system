@echo off
REM ========================================
REM ARREGLAR CONFIGURACIÓN DE BACKUP
REM ========================================

echo ========================================
echo ARREGLANDO CONFIGURACIÓN DE BACKUP
echo ========================================
echo.

REM Definir ruta correcta sin espacios extra
set POSTGRES_PATH=C:\Program Files\PostgreSQL\17\bin

echo Verificando PostgreSQL en: %POSTGRES_PATH%

if exist "%POSTGRES_PATH%\pg_dump.exe" (
    echo ✅ pg_dump.exe encontrado
) else (
    echo ❌ pg_dump.exe no encontrado
    pause
    exit /b 1
)

echo.
echo Probando PostgreSQL...
"%POSTGRES_PATH%\pg_dump.exe" --version

echo.
echo ========================================
echo RECONFIGURAR CONTRASEÑA
echo ========================================
echo.
echo La contraseña anterior puede tener caracteres especiales que causan problemas.
echo.
echo Ve a tu dashboard de Supabase:
echo 1. Settings → Database
echo 2. Copia la contraseña exacta de "Database password"
echo 3. O genera una nueva contraseña si es necesario
echo.
set /p DB_PASSWORD="Pega la contraseña aquí (copia exacta): "

if "%DB_PASSWORD%"=="" (
    echo ❌ Contraseña vacía
    pause
    exit /b 1
)

REM Crear nueva configuración sin espacios extra
echo # Backup Configuration - Fixed > backup.env
echo POSTGRES_PATH=%POSTGRES_PATH% >> backup.env
echo DB_PASSWORD=%DB_PASSWORD% >> backup.env
echo DB_URL=postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres >> backup.env

echo ✅ Nueva configuración guardada

echo.
echo ========================================
echo PRUEBA DE CONEXIÓN
echo ========================================
echo.
echo Probando conexión con nueva configuración...

REM Usar comillas para manejar espacios y caracteres especiales
"%POSTGRES_PATH%\psql.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" -c "SELECT 'Conexión OK' as status;"

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡Conexión exitosa!
    
    echo.
    echo ========================================
    echo BACKUP DE PRUEBA ARREGLADO
    echo ========================================
    echo.
    
    REM Timestamp simple y confiable
    for /f "tokens=1-3 delims=/" %%a in ("%date%") do set mydate=%%c%%a%%b
    for /f "tokens=1 delims=:" %%a in ("%time%") do set mytime=%%a
    set mytime=%mytime: =0%
    set timestamp=%mydate%_%mytime%
    
    set BACKUP_FILE=backups\test_%timestamp%.sql
    
    echo Creando backup: %BACKUP_FILE%
    
    REM Ejecutar backup con comillas correctas
    "%POSTGRES_PATH%\pg_dump.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" --clean --no-owner --no-privileges --file="%BACKUP_FILE%"
    
    if %errorlevel% equ 0 (
        if exist "%BACKUP_FILE%" (
            for %%i in ("%BACKUP_FILE%") do set filesize=%%~zi
            if %filesize% gtr 1000 (
                echo ✅ Backup creado exitosamente: %BACKUP_FILE%
                echo Tamaño: %filesize% bytes
                
                REM Comprimir
                powershell -command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
                
                if exist "%BACKUP_FILE%.zip" (
                    del "%BACKUP_FILE%"
                    echo ✅ Backup comprimido: %BACKUP_FILE%.zip
                    
                    echo.
                    echo ========================================
                    echo ✅ ¡SISTEMA DE BACKUPS FUNCIONANDO!
                    echo ========================================
                    echo.
                    echo Configuración: backup.env
                    echo Primer backup: %BACKUP_FILE%.zip
                    echo.
                    echo Para uso diario:
                    echo • backup-manual.bat - Crear backup
                    echo • backups\ - Ver todos los backups
                    echo.
                    echo ¡Tu restaurante está protegido!
                    
                ) else (
                    echo ❌ Error al comprimir
                )
            ) else (
                echo ❌ El backup está muy pequeño (%filesize% bytes)
                echo Puede indicar un problema de conexión
            )
        ) else (
            echo ❌ No se creó el archivo de backup
        )
    ) else (
        echo ❌ Error en pg_dump - revisa la contraseña
    )
    
) else (
    echo ❌ Error de conexión
    echo.
    echo Posibles soluciones:
    echo 1. Verifica que la contraseña esté correcta
    echo 2. Intenta regenerar la contraseña en Supabase
    echo 3. Verifica tu conexión a internet
)

echo.
pause