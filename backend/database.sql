-- =====================================================
-- SCRIPT SQL PARA CONFIGURAR BASE DE DATOS EN SUPABASE
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: user_profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Índices para optimizar consultas
    UNIQUE(user_id)
);

-- =====================================================
-- TABLA: analyses
-- =====================================================
CREATE TABLE IF NOT EXISTS analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    original_text TEXT NOT NULL,
    summary TEXT NOT NULL,
    keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('positive', 'negative', 'neutral')),
    sentiment_confidence DECIMAL(5,4) NOT NULL CHECK (sentiment_confidence >= 0 AND sentiment_confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice para consultas por usuario
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);

-- Índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- Índice para búsquedas por sentimiento
CREATE INDEX IF NOT EXISTS idx_analyses_sentiment ON analyses(sentiment_label);

-- Índice para búsquedas en keywords (JSONB)
CREATE INDEX IF NOT EXISTS idx_analyses_keywords ON analyses USING GIN(keywords);

-- =====================================================
-- FUNCIONES PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =====================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at 
    BEFORE UPDATE ON analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- =====================================================

-- Habilitar RLS en las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para analyses
CREATE POLICY "Users can view own analyses" ON analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analyses
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCIÓN PARA CREAR PERFIL AUTOMÁTICAMENTE
-- =====================================================

-- Función que se ejecuta cuando se crea un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL - SOLO PARA DESARROLLO)
-- =====================================================

-- Insertar algunos datos de ejemplo si estamos en desarrollo
-- NOTA: Estos datos solo se insertarán si no existen usuarios
DO $$
BEGIN
    -- Solo insertar datos de ejemplo si no hay análisis existentes
    IF NOT EXISTS (SELECT 1 FROM analyses LIMIT 1) THEN
        -- Este bloque se puede comentar en producción
        INSERT INTO analyses (
            user_id, 
            original_text, 
            summary, 
            keywords, 
            sentiment_label, 
            sentiment_confidence
        ) VALUES (
            '00000000-0000-0000-0000-000000000000'::uuid, -- UUID de ejemplo
            'Este es un texto de ejemplo para probar la funcionalidad de análisis.',
            'Texto de prueba para verificar el sistema de análisis.',
            '["ejemplo", "prueba", "análisis"]'::jsonb,
            'neutral',
            0.7500
        );
    END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN DE TABLAS CREADAS
-- =====================================================

-- Consulta para verificar que las tablas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('user_profiles', 'analyses')
ORDER BY tablename;

-- Consulta para verificar índices
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('user_profiles', 'analyses')
ORDER BY tablename, indexname;