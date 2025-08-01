-- Deshabilitar temporalmente la foreign key constraint para pruebas
ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;

-- Insertar un usuario de prueba en auth.users (esto puede fallar, pero está bien)
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at)
VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'test@example.com',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Recrear la foreign key constraint (opcional, comentado para pruebas)
-- ALTER TABLE analyses ADD CONSTRAINT analyses_user_id_fkey 
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;