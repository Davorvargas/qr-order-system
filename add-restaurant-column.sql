-- Agregar columna restaurant_id a la tabla profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON profiles(restaurant_id);

-- Actualizar el perfil específico como admin del restaurante
UPDATE profiles SET restaurant_id = 'd4503f1b-9fc5-48aa-ada6-354775e57a67', role = 'admin'
WHERE id = 'c6189bde-b806-436c-a9ea-5c4691a88853';