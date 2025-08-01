import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Settings:
    """Configuración de la aplicación usando variables de entorno"""
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # Gemini Pro
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # FastAPI
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    
    def validate_config(self) -> dict:
        """Validar que las configuraciones críticas estén presentes"""
        errors = []
        
        if not self.SUPABASE_URL:
            errors.append("SUPABASE_URL no está configurada")
        
        if not self.SUPABASE_ANON_KEY:
            errors.append("SUPABASE_ANON_KEY no está configurada")
            
        if not self.GEMINI_API_KEY:
            errors.append("GEMINI_API_KEY no está configurada")
            
        if self.SECRET_KEY == "fallback-secret-key-change-in-production":
            errors.append("SECRET_KEY debe ser cambiada en producción")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }

# Instancia global de configuración
settings = Settings()