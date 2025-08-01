# 🚀 Despliegue en Vercel

## Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno:

### 🔐 Supabase Configuration
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_supabase_service_key_aqui
```

### 🤖 Gemini Pro API Configuration
```
GEMINI_API_KEY=tu_gemini_api_key_aqui
```

### ⚙️ FastAPI Configuration
```
SECRET_KEY=tu_clave_secreta_super_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
```

### 🌐 CORS Configuration
```
ALLOWED_ORIGINS=https://tu-dominio-vercel.vercel.app,http://localhost:3000
```

## 📋 Pasos para Desplegar

1. **Conectar Repositorio**: Conecta tu repositorio de GitHub a Vercel
2. **Configurar Variables**: Agrega todas las variables de entorno en el dashboard de Vercel
3. **Desplegar**: Vercel automáticamente desplegará la aplicación

## 🔧 Configuración de Base de Datos

Antes del primer despliegue, asegúrate de:

1. Ejecutar el script de configuración de base de datos:
   ```bash
   python backend/database.py
   ```

2. Verificar que las tablas y políticas RLS estén configuradas correctamente

## ✅ Verificación

Una vez desplegado, puedes verificar que todo funcione visitando:
- `https://tu-app.vercel.app/` - Endpoint principal
- `https://tu-app.vercel.app/health` - Health check
- `https://tu-app.vercel.app/docs` - Documentación de la API

## 🧪 Testing

Las pruebas de API están disponibles en `backend/test_api.py` y pueden ejecutarse localmente para verificar la funcionalidad antes del despliegue.