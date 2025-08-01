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
        error_message = str(e).lower()
        logger.error(f"Error en login: {str(e)}")
        
        if "email not confirmed" in error_message:
            raise HTTPException(
                status_code=400, 
                detail="Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada."
            )
        elif "invalid login credentials" in error_message:
            raise HTTPException(
                status_code=401, 
                detail="Email o contraseña incorrectos"
            )
        else:
            raise HTTPException(status_code=401, detail="Error de autenticación")

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    Registrar nuevo usuario en Supabase
    """
    try:
        # Verificar si el usuario ya existe
        try:
            existing_user = supabase_admin.auth.admin.get_user_by_email(request.email)
            if existing_user and existing_user.user:
                raise HTTPException(status_code=400, detail="El email ya está registrado")
        except Exception as check_error:
            # Si no se puede verificar, continuar con el registro
            logger.info(f"No se pudo verificar usuario existente: {str(check_error)}")
        
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
        
        # Si el email no está confirmado, informar al usuario
        if response.user.email_confirmed_at is None:
            logger.info(f"Email no confirmado para: {response.user.email}")
            # Retornar información sin token de acceso
            return {
                "access_token": "",
                "token_type": "bearer",
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "full_name": request.full_name,
                    "email_confirmed_at": response.user.email_confirmed_at,
                    "created_at": response.user.created_at,
                    "needs_confirmation": True
                }
            }
        
        return {
            "access_token": response.session.access_token if response.session else "",
            "token_type": "bearer",
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": request.full_name,
                "email_confirmed_at": response.user.email_confirmed_at,
                "created_at": response.user.created_at,
                "needs_confirmation": False
            }
        }
        
    except HTTPException:
        # Re-lanzar HTTPExceptions tal como están
        raise
    except Exception as e:
        logger.error(f"Error en registro: {str(e)}")
        error_message = str(e).lower()
        if "already registered" in error_message or "user already registered" in error_message:
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

@router.post("/resend-confirmation")
async def resend_confirmation(request: dict):
    """
    Reenviar email de confirmación
    """
    try:
        email = request.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email requerido")
        
        # Reenviar email de confirmación
        response = supabase.auth.resend({
            "type": "signup",
            "email": email
        })
        
        logger.info(f"Email de confirmación reenviado a: {email}")
        return {"message": "Email de confirmación enviado"}
        
    except Exception as e:
        logger.error(f"Error reenviando confirmación: {str(e)}")
        raise HTTPException(status_code=400, detail="Error al enviar email de confirmación")

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