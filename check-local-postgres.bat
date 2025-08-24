@echo off
REM ========================================
REM VERIFICAR POSTGRESQL LOCAL
REM ========================================

echo ========================================
echo VERIFICANDO POSTGRESQL LOCAL
echo ========================================
echo.

set POSTGRES_PATH=C:\Program Files\PostgreSQL\17\bin

echo 1. Verificando herramientas PostgreSQL...
"%POSTGRES_PATH%\pg_config.exe" --version
echo.

echo 2. Verificando si PostgreSQL está corriendo localmente...
netstat -an | findstr :5432
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL local está corriendo en puerto 5432
) else (
    echo ❌ PostgreSQL local no está corriendo
    echo.
    echo Para iniciarlo:
    echo - Busca "Services" en Windows
    echo - Busca "postgresql-x64-17"
    echo - Haz clic en "Start"
    echo.
    echo O ejecuta:
    echo net start postgresql-x64-17
)

echo.
echo 3. Probando conexión local...
echo.

REM Probar conexión local (puede pedir contraseña)
echo Intentando conectar a PostgreSQL local...
echo (Si pide contraseña, usa la que configuraste al instalar PostgreSQL)
echo.

"%POSTGRES_PATH%\psql.exe" -U postgres -h localhost -d postgres -c "SELECT 'PostgreSQL Local OK' as status, version();"

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡PostgreSQL local funciona!
    echo.
    echo ========================================
    echo PRÓXIMO PASO: CREAR BASE DE DATOS LOCAL
    echo ========================================
    echo.
    set /p CREATE_DB="¿Crear base de datos local para el backup? (s/n): "
    
    if /i "%CREATE_DB%"=="s" (
        echo.
        echo Creando base de datos 'restaurante_backup'...
        "%POSTGRES_PATH%\createdb.exe" -U postgres -h localhost restaurante_backup
        
        if %errorlevel% equ 0 (
            echo ✅ Base de datos 'restaurante_backup' creada
            echo.
            echo ¿Restaurar el backup ahora?
            set /p RESTORE="(s/n): "
            
            if /i "%RESTORE%"=="s" (
                echo.
                echo Preparando restauración...
                call restore-to-local.bat
            )
        ) else (
            echo ❌ Error al crear base de datos
            echo Verifica que tengas permisos de administrador
        )
    )
    
) else (
    echo ❌ No se pudo conectar a PostgreSQL local
    echo.
    echo SOLUCIONES:
    echo 1. Iniciar el servicio de PostgreSQL
    echo 2. Verificar la contraseña del usuario postgres
    echo 3. Configurar PostgreSQL local si no está configurado
)

echo.
pause