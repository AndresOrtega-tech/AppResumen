from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
from config import settings
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Inicializar cliente Supabase
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
# Cliente con service role key para operaciones administrativas
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Autenticar usuario con Supabase
    """
    try:
        # Autenticar con Supabase
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if response.user is None:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        logger.info(f"Usuario autenticado: {response.user.email}")
        
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "email_confirmed_at": response.user.email_confirmed_at,
                "created_at": response.user.created_at
            }
        }
        
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        raise HTTPException(status_code=401, detail="Error de autenticación")

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    Registrar nuevo usuario en Supabase
    """
    try:
        # Registrar usuario en Supabase Auth
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        
        if response.user is None:
            raise HTTPException(status_code=400, detail="Error al crear usuario")
        
        logger.info(f"Usuario registrado: {response.user.email}")
        logger.info(f"Session disponible: {response.session is not None}")
        logger.info(f"Email confirmado: {response.user.email_confirmed_at is not None}")
        
        # Crear perfil de usuario en la tabla user_profiles
        if request.full_name:
            try:
                profile_data = {
                    "user_id": response.user.id,
                    "full_name": request.full_name
                }
                
                supabase_admin.table('user_profiles').insert(profile_data).execute()
                logger.info(f"Perfil creado para usuario: {response.user.email}")
                
            except Exception as profile_error:
                logger.warning(f"Error creando perfil: {str(profile_error)}")
                # No fallar el registro si el perfil no se puede crear
        
        return {
            "access_token": response.session.access_token if response.session else "",
            "token_type": "bearer",
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": request.full_name,
                "email_confirmed_at": response.user.email_confirmed_at,
                "created_at": response.user.created_at
            }
        }
        
    except Exception as e:
        logger.error(f"Error en registro: {str(e)}")
        if "already registered" in str(e).lower():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        raise HTTPException(status_code=400, detail="Error al registrar usuario")

@router.post("/logout")
async def logout():
    """
    Cerrar sesión del usuario
    """
    try:
        # Cerrar sesión en Supabase
        supabase.auth.sign_out()
        logger.info("Usuario cerró sesión")
        return {"message": "Logout successful"}
        
    except Exception as e:
        logger.error(f"Error en logout: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al cerrar sesión")

@router.get("/me")
async def get_current_user():
    """
    Obtener información del usuario actual
    """
    try:
        user = supabase.auth.get_user()
        if user is None:
            raise HTTPException(status_code=401, detail="No autenticado")
        
        return {
            "id": user.user.id,
            "email": user.user.email,
            "email_confirmed_at": user.user.email_confirmed_at,
            "created_at": user.user.created_at
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo usuario: {str(e)}")
        raise HTTPException(status_code=401, detail="No autenticado")