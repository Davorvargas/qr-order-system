-- Configurar políticas de Storage para acceso público a assets del restaurante
-- Esto permite que las imágenes de fondo y logo sean accesibles sin autenticación

-- Habilitar RLS en el bucket restaurant-assets si no está habilitado
-- (Esto se hace automáticamente al crear el bucket, pero lo incluimos por seguridad)

-- Crear política para permitir acceso público de lectura a todos los archivos del bucket
CREATE POLICY "Public read access for restaurant assets" ON storage.objects
FOR SELECT
USING (bucket_id = 'restaurant-assets');

-- Crear política para permitir inserción de archivos (solo para usuarios autenticados)
CREATE POLICY "Authenticated users can upload restaurant assets" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');

-- Crear política para permitir actualización de archivos (solo para usuarios autenticados)
CREATE POLICY "Authenticated users can update restaurant assets" ON storage.objects
FOR UPDATE
USING (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');

-- Crear política para permitir eliminación de archivos (solo para usuarios autenticados)
CREATE POLICY "Authenticated users can delete restaurant assets" ON storage.objects
FOR DELETE
USING (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');

-- Comentario: Estas políticas permiten acceso público de lectura a las imágenes
-- mientras mantienen la seguridad para operaciones de escritura 