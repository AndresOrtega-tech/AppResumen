# 🔧 Guía de Configuración de Variables de Entorno

## 📋 Pasos para Configurar

### 1. 🗃️ Configurar Supabase

1. **Crear cuenta en Supabase:**
   - Ve a [https://supabase.com](https://supabase.com)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Obtener credenciales:**
   - Ve a `Settings` > `API`
   - Copia la **URL del proyecto**
   - Copia la **anon key** (clave pública)
   - Copia la **service_role key** (clave privada)

3. **Configurar base de datos:**
   ```sql
   -- Crear tabla de análisis
   CREATE TABLE analisis (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     original_text TEXT NOT NULL,
     summary TEXT NOT NULL,
     keywords TEXT[] NOT NULL,
     sentiment JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Habilitar RLS (Row Level Security)
   ALTER TABLE analisis ENABLE ROW LEVEL SECURITY;

   -- Política para que usuarios solo vean sus análisis
   CREATE POLICY "Users can view own analyses" ON analisis
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own analyses" ON analisis
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

### 2. 🤖 Configurar Gemini Pro

1. **Obtener API Key:**
   - Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Inicia sesión con tu cuenta de Google
   - Crea una nueva API key
   - Copia la clave generada

2. **Verificar cuota:**
   - Las primeras 60 consultas por minuto son gratuitas
   - Revisa los límites en la consola

### 3. 🔐 Generar SECRET_KEY

**Opción 1 - OpenSSL (recomendado):**
```bash
openssl rand -hex 32
```

**Opción 2 - Python:**
```python
import secrets
print(secrets.token_hex(32))
```

**Opción 3 - Online:**
- Ve a [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

### 4. ✏️ Completar el archivo .env

Edita el archivo `backend/.env` con tus valores reales:

```env
# Supabase
SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini Pro
GEMINI_API_KEY=AIzaSyD-9tSrke72PouQMnMX-a7UUAAAAAAAAA

# FastAPI
SECRET_KEY=tu_clave_secreta_de_64_caracteres_generada_arriba
```

### 5. ✅ Verificar Configuración

Ejecuta el servidor y ve a `/health`:

```bash
cd backend
venv\Scripts\activate
uvicorn api.main:app --reload
```

Luego abre: [http://localhost:8000/health](http://localhost:8000/health)

Deberías ver:
```json
{
  "status": "healthy",
  "supabase_configured": true,
  "gemini_configured": true,
  "environment": "development"
}
```

## 🚨 Seguridad

- ❌ **NUNCA** subas el archivo `.env` a Git
- ✅ **SÍ** sube el archivo `.env.example`
- 🔒 Usa claves diferentes para desarrollo y producción
- 🔄 Rota las claves regularmente

## 🚀 Despliegue en Vercel

En Vercel, configura las variables en:
`Project Settings` > `Environment Variables`

Añade todas las variables del `.env` una por una.