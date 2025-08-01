from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

app = FastAPI(
    title="Analizador de Contenido Inteligente API",
    description="API para análisis de texto usando Gemini Pro",
    version="1.0.0"
)

# Configurar CORS con variables de entorno
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Analizador de Contenido Inteligente API",
        "version": "1.0.0",
        "status": "active",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health")
async def health_check():
    # Verificar que las variables de entorno estén configuradas
    supabase_configured = bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_ANON_KEY"))
    gemini_configured = bool(os.getenv("GEMINI_API_KEY"))
    
    return {
        "status": "healthy",
        "supabase_configured": supabase_configured,
        "gemini_configured": gemini_configured,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Importar rutas
from api.auth import router as auth_router
from api.analysis import router as analysis_router

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(analysis_router, prefix="/api/analysis", tags=["analysis"])