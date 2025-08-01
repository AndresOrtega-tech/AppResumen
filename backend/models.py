"""
📊 MODELOS DE DATOS PARA SUPABASE
================================

Modelos Pydantic que corresponden a las tablas de la base de datos.
Estos modelos se usan para validación y serialización de datos.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from enum import Enum

# =====================================================
# ENUMS
# =====================================================

class SentimentLabel(str, Enum):
    """Etiquetas de sentimiento posibles"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

# =====================================================
# MODELOS BASE
# =====================================================

class TimestampMixin(BaseModel):
    """Mixin para campos de timestamp"""
    created_at: datetime
    updated_at: datetime

# =====================================================
# MODELOS DE USUARIO
# =====================================================

class UserProfile(TimestampMixin):
    """Modelo para perfil de usuario"""
    id: str
    user_id: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfileCreate(BaseModel):
    """Modelo para crear perfil de usuario"""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfileUpdate(BaseModel):
    """Modelo para actualizar perfil de usuario"""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

# =====================================================
# MODELOS DE ANÁLISIS
# =====================================================

class SentimentResult(BaseModel):
    """Resultado de análisis de sentimiento"""
    label: SentimentLabel
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confianza entre 0 y 1")

class Analysis(TimestampMixin):
    """Modelo completo de análisis"""
    id: str
    user_id: str
    original_text: str
    summary: str
    keywords: List[str]
    sentiment: SentimentResult

    @validator('keywords')
    def validate_keywords(cls, v):
        """Validar que keywords no esté vacío"""
        if not v:
            raise ValueError('Keywords no puede estar vacío')
        return v

    @validator('original_text', 'summary')
    def validate_text_fields(cls, v):
        """Validar que los campos de texto no estén vacíos"""
        if not v or not v.strip():
            raise ValueError('El texto no puede estar vacío')
        return v.strip()

class AnalysisCreate(BaseModel):
    """Modelo para crear análisis"""
    original_text: str = Field(..., min_length=1, max_length=10000)
    summary: str = Field(..., min_length=1, max_length=2000)
    keywords: List[str] = Field(..., min_items=1, max_items=20)
    sentiment_label: SentimentLabel
    sentiment_confidence: float = Field(..., ge=0.0, le=1.0)

    @validator('keywords')
    def validate_keywords_create(cls, v):
        """Validar keywords en creación"""
        if not v:
            raise ValueError('Debe incluir al menos una palabra clave')
        # Limpiar y validar cada keyword
        cleaned = [kw.strip().lower() for kw in v if kw.strip()]
        if not cleaned:
            raise ValueError('Las palabras clave no pueden estar vacías')
        return cleaned[:20]  # Limitar a 20 keywords máximo

class AnalysisResponse(BaseModel):
    """Respuesta de análisis para API"""
    id: str
    summary: str
    keywords: List[str]
    sentiment: SentimentResult
    created_at: datetime

class AnalysisRequest(BaseModel):
    """Solicitud de análisis"""
    text: str = Field(..., min_length=10, max_length=10000, description="Texto a analizar")

    @validator('text')
    def validate_text(cls, v):
        """Validar texto de entrada"""
        if not v or not v.strip():
            raise ValueError('El texto no puede estar vacío')
        
        # Verificar longitud mínima significativa
        if len(v.strip().split()) < 3:
            raise ValueError('El texto debe tener al menos 3 palabras')
        
        return v.strip()

# =====================================================
# MODELOS DE PAGINACIÓN
# =====================================================

class PaginationParams(BaseModel):
    """Parámetros de paginación"""
    page: int = Field(default=1, ge=1, description="Número de página")
    limit: int = Field(default=10, ge=1, le=100, description="Elementos por página")

class AnalysisHistory(BaseModel):
    """Historial de análisis con paginación"""
    analyses: List[AnalysisResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1, le=100)
    total_pages: int = Field(..., ge=0)

    @validator('total_pages', pre=True, always=True)
    def calculate_total_pages(cls, v, values):
        """Calcular total de páginas automáticamente"""
        total = values.get('total', 0)
        limit = values.get('limit', 10)
        return (total + limit - 1) // limit if total > 0 else 0

# =====================================================
# MODELOS DE RESPUESTA API
# =====================================================

class ApiResponse(BaseModel):
    """Respuesta estándar de API"""
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None

class ApiError(BaseModel):
    """Error estándar de API"""
    success: bool = False
    error: str
    details: Optional[dict] = None

# =====================================================
# MODELOS DE ESTADÍSTICAS
# =====================================================

class AnalysisStats(BaseModel):
    """Estadísticas de análisis del usuario"""
    total_analyses: int = Field(..., ge=0)
    sentiment_distribution: dict = Field(default_factory=dict)
    most_common_keywords: List[str] = Field(default_factory=list)
    analyses_this_month: int = Field(..., ge=0)
    average_confidence: float = Field(..., ge=0.0, le=1.0)

# =====================================================
# CONFIGURACIÓN DE MODELOS
# =====================================================

# Configurar todos los modelos para usar alias de campo
for model_class in [
    UserProfile, UserProfileCreate, UserProfileUpdate,
    Analysis, AnalysisCreate, AnalysisResponse, AnalysisRequest,
    AnalysisHistory, PaginationParams, ApiResponse, ApiError, AnalysisStats
]:
    model_class.model_config = {
        'from_attributes': True,  # Para compatibilidad con ORMs
        'validate_assignment': True,  # Validar en asignación
        'use_enum_values': True,  # Usar valores de enum
        'json_encoders': {
            datetime: lambda v: v.isoformat()  # Serializar datetime como ISO
        }
    }