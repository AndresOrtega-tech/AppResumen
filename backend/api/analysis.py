from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
import google.generativeai as genai
from supabase import create_client, Client
from datetime import datetime
import json
import uuid
import sys
from pathlib import Path

# Agregar el directorio backend al path para importaciones
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

# Importar modelos y configuración
from models import AnalysisRequest, AnalysisResponse, AnalysisHistory, SentimentResult
from config import Settings

router = APIRouter()

# Configurar Gemini Pro
settings = Settings()
genai.configure(api_key=settings.GEMINI_API_KEY)

# Configurar Supabase
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest):
    """
    Analizar texto usando Gemini Pro y guardar en Supabase
    """
    try:
        # 1. Configurar el modelo Gemini
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # 2. Crear prompt para análisis completo
        prompt = f"""
        Analiza el siguiente texto y proporciona:
        1. Un resumen conciso (máximo 200 palabras)
        2. 5-10 palabras clave principales
        3. Análisis de sentimiento (positive, negative, neutral) con confianza (0-1)
        
        Texto a analizar:
        {request.text}
        
        Responde en formato JSON:
        {{
            "summary": "resumen aquí",
            "keywords": ["palabra1", "palabra2", "palabra3"],
            "sentiment": {{
                "label": "positive/negative/neutral",
                "confidence": 0.85
            }}
        }}
        """
        
        # 3. Generar análisis con Gemini Pro
        response = model.generate_content(prompt)
        
        # 4. Parsear respuesta JSON
        try:
            # Limpiar la respuesta para extraer solo el JSON
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            analysis_data = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback si no se puede parsear JSON
            analysis_data = {
                "summary": f"Análisis del texto proporcionado: {request.text[:100]}...",
                "keywords": ["análisis", "texto", "contenido"],
                "sentiment": {"label": "neutral", "confidence": 0.7}
            }
        
        # 5. Guardar en Supabase
        analysis_id = str(uuid.uuid4())
        
        # Para pruebas, usar un UUID válido que existe en auth.users
        # En producción, esto vendría del token de autenticación
        user_id = "633a8bbc-6727-426b-ad97-a497fbb15653"
        
        # Preparar datos para insertar
        insert_data = {
            "id": analysis_id,
            "user_id": user_id,
            "original_text": request.text,
            "summary": analysis_data["summary"],
            "keywords": analysis_data["keywords"],
            "sentiment_label": analysis_data["sentiment"]["label"],
            "sentiment_confidence": float(analysis_data["sentiment"]["confidence"])
        }
        
        # Insertar en Supabase
        result = supabase.table('analyses').insert(insert_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Error guardando análisis")
        
        # 6. Retornar respuesta
        return AnalysisResponse(
            id=analysis_id,
            summary=analysis_data["summary"],
            keywords=analysis_data["keywords"],
            sentiment=SentimentResult(
                label=analysis_data["sentiment"]["label"],
                confidence=analysis_data["sentiment"]["confidence"]
            ),
            created_at=datetime.now()
        )
        
    except Exception as e:
        print(f"Error en análisis: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando análisis: {str(e)}")

@router.get("/history", response_model=AnalysisHistory)
async def get_analysis_history(page: int = 1, limit: int = 10):
    """
    Obtener historial de análisis del usuario con paginación
    """
    try:
        # Calcular offset para paginación
        offset = (page - 1) * limit
        
        # Obtener análisis con paginación
        result = supabase.table('analyses')\
            .select("*")\
            .order('created_at', desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        # Obtener total de registros
        count_result = supabase.table('analyses')\
            .select("id", count="exact")\
            .execute()
        
        total = count_result.count if count_result.count else 0
        
        # Convertir datos a formato de respuesta
        analyses = []
        for item in result.data:
            analyses.append(AnalysisResponse(
                id=item['id'],
                summary=item['summary'],
                keywords=item['keywords'],
                sentiment=SentimentResult(
                    label=item['sentiment_label'],
                    confidence=item['sentiment_confidence']
                ),
                created_at=item['created_at']
            ))
        
        # Calcular total de páginas
        total_pages = (total + limit - 1) // limit if total > 0 else 0
        
        return AnalysisHistory(
            analyses=analyses,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
        
    except Exception as e:
        print(f"Error obteniendo historial: {e}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo historial: {str(e)}")

@router.get("/history/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_by_id(analysis_id: str):
    """
    Obtener un análisis específico por ID
    """
    try:
        # Buscar análisis por ID
        result = supabase.table('analyses')\
            .select("*")\
            .eq('id', analysis_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Análisis no encontrado")
        
        item = result.data[0]
        
        return AnalysisResponse(
            id=item['id'],
            summary=item['summary'],
            keywords=item['keywords'],
            sentiment=SentimentResult(
                label=item['sentiment_label'],
                confidence=item['sentiment_confidence']
            ),
            created_at=item['created_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo análisis: {e}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo análisis: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Verificar estado de conexiones a Supabase y Gemini Pro
    """
    try:
        # Verificar conexión a Supabase
        supabase_status = "ok"
        try:
            supabase.table('analyses').select("id").limit(1).execute()
        except Exception as e:
            supabase_status = f"error: {str(e)}"
        
        # Verificar conexión a Gemini
        gemini_status = "ok"
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            test_response = model.generate_content("Test")
            if not test_response:
                gemini_status = "error: no response"
        except Exception as e:
            gemini_status = f"error: {str(e)}"
        
        return {
            "status": "healthy" if supabase_status == "ok" and gemini_status == "ok" else "unhealthy",
            "supabase": supabase_status,
            "gemini": gemini_status,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }