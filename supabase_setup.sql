-- Ejecuta esto en el SQL Editor de tu panel de Supabase:

-- 1. Agregar la columna 'vistas' a la tabla tiendas
ALTER TABLE tiendas ADD COLUMN IF NOT EXISTS vistas integer DEFAULT 0;

-- 2. Crear una función para incrementar las vistas de forma segura
CREATE OR REPLACE FUNCTION increment_vistas(tienda_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE tiendas
  SET vistas = vistas + 1
  WHERE id = tienda_id_param;
END;
$$ LANGUAGE plpgsql;
