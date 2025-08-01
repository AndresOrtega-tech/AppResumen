"""
Script para crear un usuario de prueba en Supabase Auth
"""
import os
from dotenv import load_dotenv
from supabase import create_client

def create_test_user():
    """Crear un usuario de prueba en Supabase Auth"""
    load_dotenv()
    
    # Configurar cliente Supabase
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_ANON_KEY')
    )
    
    # Primero, intentar obtener un usuario existente de la tabla user_profiles
    try:
        profiles_result = supabase.table('user_profiles').select('user_id').limit(1).execute()
        if profiles_result.data:
            existing_user_id = profiles_result.data[0]['user_id']
            print(f"✅ Usuario existente encontrado en user_profiles: {existing_user_id}")
            return existing_user_id
    except Exception as e:
        print(f"⚠️  No se pudieron obtener perfiles existentes: {e}")
    
    # Si no hay usuarios existentes, intentar crear uno nuevo
    test_email = "testuser@testdomain.com"
    test_password = "testpassword123"
    
    try:
        # Intentar registrar el usuario
        response = supabase.auth.sign_up({
            "email": test_email,
            "password": test_password
        })
        
        if response.user:
            print(f"✅ Usuario de prueba creado: {response.user.id}")
            print(f"📧 Email: {test_email}")
            return response.user.id
        else:
            print("❌ No se pudo crear el usuario")
            return None
            
    except Exception as e:
        print(f"⚠️  Error o usuario ya existe: {e}")
        return None

if __name__ == "__main__":
    user_id = create_test_user()
    if user_id:
        print(f"\n🎯 User ID para usar en pruebas: {user_id}")
    else:
        print("\n❌ No se pudo obtener un user_id válido")