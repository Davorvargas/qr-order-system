@echo off
REM ========================================
REM RESTAURAR BACKUP A POSTGRESQL LOCAL
REM ========================================

echo ========================================
echo RESTAURAR BACKUP A POSTGRESQL LOCAL
echo ========================================
echo.

set POSTGRES_PATH=C:\Program Files\PostgreSQL\17\bin

echo Backups disponibles:
echo.
dir backups\*.zip /b
echo.

set /p BACKUP_NAME="¿Qué backup quieres restaurar? (nombre completo con .zip): "

if not exist "backups\%BACKUP_NAME%" (
    echo ❌ Backup no encontrado
    pause
    exit /b 1
)

echo.
echo ✅ Backup seleccionado: %BACKUP_NAME%
echo.

REM Limpiar carpeta temporal
if exist "temp_local" rmdir /s /q temp_local
mkdir temp_local

echo 1. Extrayendo backup...
powershell -command "Expand-Archive -Path 'backups\%BACKUP_NAME%' -DestinationPath 'temp_local' -Force"

REM Encontrar archivo SQL
for %%i in (temp_local\*.sql) do set SQL_FILE=%%i

if not exist "%SQL_FILE%" (
    echo ❌ No se encontró archivo SQL
    rmdir /s /q temp_local
    pause
    exit /b 1
)

echo ✅ Archivo SQL encontrado: %SQL_FILE%
echo.

echo 2. Restaurando a base de datos local 'restaurante_backup'...
echo    (Puede tomar varios minutos dependiendo del tamaño)
echo.

"%POSTGRES_PATH%\psql.exe" -U postgres -h localhost -d restaurante_backup -f "%SQL_FILE%"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ ¡BACKUP RESTAURADO A POSTGRESQL LOCAL!
    echo ========================================
    echo.
    echo 📊 INFORMACIÓN DE CONEXIÓN:
    echo Host: localhost
    echo Puerto: 5432
    echo Base de datos: restaurante_backup
    echo Usuario: postgres
    echo.
    echo 🔧 HERRAMIENTAS PARA VISUALIZAR:
    echo.
    echo 1. LÍNEA DE COMANDOS:
    echo    psql -U postgres -h localhost -d restaurante_backup
    echo.
    echo 2. PGADMIN (Interfaz gráfica):
    echo    - Abrir pgAdmin
    echo    - Conectar a localhost:5432
    echo    - Base de datos: restaurante_backup
    echo.
    echo 3. VER TABLAS DESDE CMD:
    echo    call view-local-tables.bat
    echo.
    
    REM Crear script para ver tablas
    (
    echo @echo off
    echo echo Tablas en tu restaurante:
    echo "%POSTGRES_PATH%\psql.exe" -U postgres -h localhost -d restaurante_backup -c "\dt"
    echo echo.
    echo echo Ver datos de menu_items:
    echo "%POSTGRES_PATH%\psql.exe" -U postgres -h localhost -d restaurante_backup -c "SELECT * FROM menu_items LIMIT 10;"
    echo echo.
    echo echo Ver datos de orders:
    echo "%POSTGRES_PATH%\psql.exe" -U postgres -h localhost -d restaurante_backup -c "SELECT * FROM orders LIMIT 5;"
    echo pause
    ) > view-local-tables.bat
    
    echo ✅ Script 'view-local-tables.bat' creado para explorar datos
    echo.
    
    set /p VIEW_NOW="¿Ver las tablas ahora? (s/n): "
    if /i "%VIEW_NOW%"=="s" (
        call view-local-tables.bat
    )
    
) else (
    echo ❌ Error al restaurar backup
    echo Verifica la conexión y permisos
)

REM Limpiar archivos temporales
rmdir /s /q temp_local

echo.
pause