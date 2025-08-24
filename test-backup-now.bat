@echo off
REM ========================================
REM CREAR BACKUP DE PRUEBA - ARREGLADO
REM ========================================

echo ========================================
echo CREANDO BACKUP DE PRUEBA
echo ========================================
echo.

REM Leer configuración
if not exist "backup.env" (
    echo ❌ Configuración no encontrada
    pause
    exit /b 1
)

for /f "tokens=1,2 delims==" %%a in (backup.env) do (
    if "%%a"=="POSTGRES_PATH" set POSTGRES_PATH=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
)

echo PostgreSQL: %POSTGRES_PATH%
echo.

REM Crear timestamp correcto
set year=%date:~10,4%
set month=%date:~4,2%
set day=%date:~7,2%
set hour=%time:~0,2%
set minute=%time:~3,2%

REM Limpiar espacios
set hour=%hour: =0%

set timestamp=%year%%month%%day%_%hour%%minute%
set BACKUP_FILE=backups\backup_test_%timestamp%.sql

echo Creando backup: %BACKUP_FILE%
echo Conectando a: osvgapxefsqqhltkabku.supabase.co
echo.

REM Crear backup
"%POSTGRES_PATH%\pg_dump.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" --clean --no-owner --no-privileges --file="%BACKUP_FILE%"

if %errorlevel% equ 0 (
    if exist "%BACKUP_FILE%" (
        echo ✅ Backup creado: %BACKUP_FILE%
        for %%i in ("%BACKUP_FILE%") do echo Tamaño: %%~zi bytes
        
        REM Verificar que el archivo no esté vacío
        for %%i in ("%BACKUP_FILE%") do set filesize=%%~zi
        if %filesize% gtr 0 (
            echo ✅ Archivo válido, procediendo a comprimir...
            
            REM Comprimir
            powershell -command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
            
            if exist "%BACKUP_FILE%.zip" (
                del "%BACKUP_FILE%"
                echo ✅ Backup final: %BACKUP_FILE%.zip
                for %%i in ("%BACKUP_FILE%.zip") do echo Tamaño comprimido: %%~zi bytes
                echo.
                echo ========================================
                echo ✅ BACKUP COMPLETADO EXITOSAMENTE
                echo ========================================
                echo.
                echo Tu sistema de backups está funcionando perfectamente!
                echo.
                echo Archivos disponibles:
                echo • backup-manual.bat - Para backups manuales
                echo • backups\ - Carpeta con todos los backups
                echo.
            ) else (
                echo ❌ Error al comprimir
            )
        ) else (
            echo ❌ El archivo de backup está vacío
            del "%BACKUP_FILE%"
        )
    ) else (
        echo ❌ No se creó el archivo de backup
    )
) else (
    echo ❌ Error en pg_dump
)

echo.
pause