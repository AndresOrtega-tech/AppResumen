# Backend - FastAPI

API REST para el análisis de contenido inteligente usando Gemini Pro.

## 🚀 Tecnologías

- FastAPI
- Python 3.9+
- Supabase (PostgreSQL)
- Gemini Pro API
- Pydantic para validación
- Uvicorn como servidor ASGI

## 🏗️ Estructura

```
backend/
├── api/
│   ├── __init__.py
│   ├── main.py         # Punto de entrada
│   ├── auth.py         # Autenticación
│   ├── analysis.py     # Análisis de texto
│   └── models.py       # Modelos Pydantic
├── services/
│   ├── __init__.py
│   ├── gemini.py       # Integración con Gemini Pro
│   └── supabase.py     # Cliente Supabase
├── utils/
│   ├── __init__.py
│   └── helpers.py      # Utilidades
├── requirements.txt
├── vercel.json
└── README.md
```

## 🛠️ Desarrollo Local

```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn api.main:app --reload
```

## 🌍 Variables de Entorno

```bash
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_key
GEMINI_API_KEY=tu_gemini_api_key
```

## 🚀 Despliegue en Vercel

El proyecto está configurado para desplegarse automáticamente en Vercel como funciones serverless.