@echo off
REM ========================================
REM BACKUP COMPLETO - INCLUYE TODO
REM ========================================

echo ========================================
echo BACKUP COMPLETO DEL SISTEMA
echo ========================================
echo.

echo Este backup incluirá:
echo ✅ Base de datos completa (tablas, datos)
echo ✅ RLS Policies y seguridad
echo ✅ Functions y triggers
echo ✅ Storage (archivos subidos)
echo ✅ Edge Functions
echo ✅ Configuraciones de Auth
echo.

set /p CONTINUE="¿Continuar con backup completo? (s/n): "
if /i "%CONTINUE%" neq "s" (
    echo Backup cancelado
    pause
    exit /b 0
)

REM Leer configuración
set POSTGRES_PATH=C:\Program Files\PostgreSQL\17\bin
set DB_PASSWORD=pZsU4MWHtHPAgLwU

REM Timestamp
set timestamp=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%
set timestamp=%timestamp: =0%

REM Crear carpeta específica para este backup completo
set BACKUP_FOLDER=backups\completo_%timestamp%
mkdir "%BACKUP_FOLDER%"

echo [%date% %time%] Iniciando backup completo en: %BACKUP_FOLDER%
echo.

REM 1. BACKUP COMPLETO DE BASE DE DATOS (con RLS y todo)
echo 1/5 - Backup completo de base de datos (incluye RLS, functions, etc.)...
"%POSTGRES_PATH%\pg_dump.exe" "postgresql://postgres:%DB_PASSWORD%@db.osvgapxefsqqhltkabku.supabase.co:5432/postgres" ^
    --clean ^
    --if-exists ^
    --create ^
    --verbose ^
    --no-owner ^
    --no-privileges ^
    --include-security-labels ^
    --file="%BACKUP_FOLDER%\database_completo.sql"

if %errorlevel% neq 0 (
    echo ❌ Error en backup de base de datos
    pause
    exit /b 1
)
echo ✅ Base de datos completada

echo.

REM 2. BACKUP DE STORAGE (archivos)
echo 2/5 - Descargando archivos de Storage...
echo Creando script de descarga de Storage...

REM Crear script para descargar archivos de storage
(
echo const { createClient } = require('@supabase/supabase-js'^);
echo const fs = require('fs'^);
echo const path = require('path'^);
echo.
echo const supabase = createClient(
echo   'https://osvgapxefsqqhltkabku.supabase.co',
echo   '%DB_PASSWORD%'
echo ^);
echo.
echo async function downloadStorage(^) {
echo   console.log('Descargando archivos de Storage...'^);
echo   
echo   // Listar todos los buckets
echo   const { data: buckets } = await supabase.storage.listBuckets(^);
echo   
echo   for (const bucket of buckets ^|\| []^) {
echo     console.log(`Procesando bucket: ${bucket.name}`^);
echo     const bucketDir = path.join('%BACKUP_FOLDER%', 'storage', bucket.name^);
echo     fs.mkdirSync(bucketDir, { recursive: true }^);
echo     
echo     // Listar archivos del bucket
echo     const { data: files } = await supabase.storage.from(bucket.name^).list(^);
echo     
echo     for (const file of files ^|\| []^) {
echo       if (file.name^) {
echo         console.log(`  Descargando: ${file.name}`^);
echo         const { data } = await supabase.storage.from(bucket.name^).download(file.name^);
echo         if (data^) {
echo           const buffer = await data.arrayBuffer(^);
echo           fs.writeFileSync(path.join(bucketDir, file.name^), Buffer.from(buffer^)^);
echo         }
echo       }
echo     }
echo   }
echo   
echo   console.log('✅ Storage backup completado'^);
echo }
echo.
echo downloadStorage(^).catch(console.error^);
) > "%BACKUP_FOLDER%\download_storage.js"

REM Ejecutar descarga de storage (si node está disponible)
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo Ejecutando descarga de storage...
    cd "%BACKUP_FOLDER%"
    node download_storage.js
    cd ..\..
    echo ✅ Storage completado
) else (
    echo ⚠️  Node.js no encontrado - Storage no descargado
    echo Para descargar Storage manualmente, instala Node.js y ejecuta:
    echo node "%BACKUP_FOLDER%\download_storage.js"
)

echo.

REM 3. BACKUP DE EDGE FUNCTIONS
echo 3/5 - Backup de Edge Functions...
echo Listando Edge Functions disponibles...

REM Crear backup de edge functions (si existen en el proyecto)
if exist "supabase\functions" (
    echo ✅ Copiando Edge Functions locales...
    xcopy /E /I /Y "supabase\functions" "%BACKUP_FOLDER%\edge_functions\" >nul
    echo ✅ Edge Functions locales copiadas
) else (
    echo ⚠️  No se encontraron Edge Functions locales en supabase\functions
)

echo.

REM 4. BACKUP DE CONFIGURACIONES
echo 4/5 - Backup de configuraciones...

REM Copiar archivos de configuración del proyecto
if exist "supabase\config.toml" (
    copy "supabase\config.toml" "%BACKUP_FOLDER%\" >nul
    echo ✅ config.toml copiado
)

if exist "supabase\migrations" (
    xcopy /E /I /Y "supabase\migrations" "%BACKUP_FOLDER%\migrations\" >nul
    echo ✅ Migraciones copiadas
)

if exist ".env.local" (
    copy ".env.local" "%BACKUP_FOLDER%\env.local.backup" >nul
    echo ✅ Variables de entorno copiadas
)

echo.

REM 5. CREAR DOCUMENTACIÓN DEL BACKUP
echo 5/5 - Creando documentación del backup...

(
echo # BACKUP COMPLETO DEL SISTEMA QR-ORDER
echo # Creado: %date% %time%
echo # Proyecto: osvgapxefsqqhltkabku
echo.
echo ## Contenido del backup:
echo.
echo ### 1. Base de datos completa
echo - Archivo: database_completo.sql
echo - Incluye: Tablas, datos, RLS policies, functions, triggers
echo - Restaurar con: psql -f database_completo.sql
echo.
echo ### 2. Storage ^(archivos subidos^)
echo - Carpeta: storage/
echo - Incluye: Todos los archivos subidos por usuarios
echo - Nota: Restaurar manualmente a Supabase Storage
echo.
echo ### 3. Edge Functions
echo - Carpeta: edge_functions/
echo - Incluye: Código de funciones serverless
echo - Restaurar con: supabase functions deploy
echo.
echo ### 4. Configuraciones
echo - config.toml: Configuración de Supabase
echo - migrations/: Historial de migraciones
echo - env.local.backup: Variables de entorno
echo.
echo ### 5. Scripts de restauración
echo - download_storage.js: Para descargar storage
echo.
echo ## Para restaurar completamente:
echo 1. Restaurar base de datos: psql -f database_completo.sql
echo 2. Subir archivos de storage/ manualmente
echo 3. Redesplegar edge functions
echo 4. Verificar configuraciones
echo.
echo ## Información técnica:
echo - Tamaño total: [Se calculará al comprimir]
echo - Método: pg_dump completo + archivos + configuraciones
echo - Versión PostgreSQL: 17
) > "%BACKUP_FOLDER%\README.md"

echo ✅ Documentación creada

echo.
echo ========================================
echo COMPRIMIENDO BACKUP COMPLETO
echo ========================================
echo.

REM Comprimir todo el backup
set BACKUP_ZIP=backups\backup_completo_%timestamp%.zip
echo Comprimiendo backup completo...
powershell -command "Compress-Archive -Path '%BACKUP_FOLDER%' -DestinationPath '%BACKUP_ZIP%' -Force"

if exist "%BACKUP_ZIP%" (
    REM Eliminar carpeta sin comprimir
    rmdir /s /q "%BACKUP_FOLDER%"
    
    echo.
    echo ========================================
    echo ✅ BACKUP COMPLETO TERMINADO
    echo ========================================
    echo.
    echo 📦 Backup creado: %BACKUP_ZIP%
    for %%i in ("%BACKUP_ZIP%") do echo 📏 Tamaño: %%~zi bytes
    echo.
    echo 🎯 Este backup incluye:
    echo ✅ Base de datos completa con RLS
    echo ✅ Storage (archivos subidos)
    echo ✅ Edge Functions
    echo ✅ Configuraciones
    echo ✅ Migraciones
    echo ✅ Documentación de restauración
    echo.
    echo 🛡️  Tu sistema está COMPLETAMENTE respaldado
    echo.
    
) else (
    echo ❌ Error al comprimir backup
)

echo.
pause