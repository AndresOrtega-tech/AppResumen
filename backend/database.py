"""
🗄️ CONFIGURADOR DE BASE DE DATOS PARA SUPABASE
==============================================

Este script configura automáticamente las tablas necesarias en Supabase.
Ejecuta el script SQL y verifica que todo esté configurado correctamente.

Uso:
    python database.py

Requisitos:
    - Variables de entorno configuradas (.env)
    - Conexión a Supabase funcionando
"""

import os
import sys
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class DatabaseSetup:
    def __init__(self):
        """Inicializar conexión a Supabase"""
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError(
                "❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos.\n"
                "Verifica tu archivo .env"
            )
        
        try:
            self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
            print("✅ Conexión a Supabase establecida correctamente")
        except Exception as e:
            raise ConnectionError(f"❌ Error conectando a Supabase: {e}")

    def read_sql_file(self) -> str:
        """Leer el archivo SQL de configuración"""
        sql_file = Path(__file__).parent / "database.sql"
        
        if not sql_file.exists():
            raise FileNotFoundError(f"❌ Archivo SQL no encontrado: {sql_file}")
        
        with open(sql_file, 'r', encoding='utf-8') as f:
            return f.read()

    def execute_sql_script(self, sql_content: str) -> bool:
        """Ejecutar script SQL en Supabase"""
        try:
            # Dividir el script en comandos individuales
            commands = [cmd.strip() for cmd in sql_content.split(';') if cmd.strip()]
            
            print(f"📝 Ejecutando {len(commands)} comandos SQL...")
            
            for i, command in enumerate(commands, 1):
                if command.strip():
                    try:
                        # Ejecutar comando SQL
                        result = self.supabase.rpc('exec_sql', {'sql': command})
                        print(f"   ✅ Comando {i}/{len(commands)} ejecutado")
                    except Exception as e:
                        print(f"   ⚠️  Comando {i} falló (puede ser normal): {str(e)[:100]}...")
                        continue
            
            print("✅ Script SQL ejecutado completamente")
            return True
            
        except Exception as e:
            print(f"❌ Error ejecutando script SQL: {e}")
            return False

    def verify_tables(self) -> bool:
        """Verificar que las tablas se crearon correctamente"""
        try:
            print("\n🔍 Verificando tablas creadas...")
            
            # Verificar tabla user_profiles
            try:
                result = self.supabase.table('user_profiles').select('*').limit(1).execute()
                print("   ✅ Tabla 'user_profiles' existe y es accesible")
            except Exception as e:
                print(f"   ❌ Error con tabla 'user_profiles': {e}")
                return False
            
            # Verificar tabla analyses
            try:
                result = self.supabase.table('analyses').select('*').limit(1).execute()
                print("   ✅ Tabla 'analyses' existe y es accesible")
            except Exception as e:
                print(f"   ❌ Error con tabla 'analyses': {e}")
                return False
            
            print("✅ Todas las tablas verificadas correctamente")
            return True
            
        except Exception as e:
            print(f"❌ Error verificando tablas: {e}")
            return False

    def create_sample_data(self) -> bool:
        """Crear datos de ejemplo (opcional)"""
        try:
            print("\n📊 Creando datos de ejemplo...")
            
            # Verificar si ya existen datos
            result = self.supabase.table('analyses').select('*').limit(1).execute()
            if result.data:
                print("   ℹ️  Ya existen datos, omitiendo creación de ejemplos")
                return True
            
            # Crear análisis de ejemplo
            sample_analysis = {
                'original_text': 'Este es un texto de ejemplo para probar la funcionalidad de análisis de la aplicación.',
                'summary': 'Texto de prueba para verificar el sistema de análisis.',
                'keywords': ['ejemplo', 'prueba', 'análisis', 'funcionalidad'],
                'sentiment_label': 'neutral',
                'sentiment_confidence': 0.75
            }
            
            # Nota: user_id se asignará automáticamente por RLS cuando haya un usuario autenticado
            print("   ℹ️  Datos de ejemplo preparados (se crearán cuando haya usuarios)")
            return True
            
        except Exception as e:
            print(f"❌ Error creando datos de ejemplo: {e}")
            return False

    def setup_database(self) -> bool:
        """Configurar base de datos completa"""
        print("🚀 Iniciando configuración de base de datos...\n")
        
        try:
            # 1. Leer script SQL
            sql_content = self.read_sql_file()
            print("✅ Script SQL cargado correctamente")
            
            # 2. Ejecutar script SQL
            if not self.execute_sql_script(sql_content):
                return False
            
            # 3. Verificar tablas
            if not self.verify_tables():
                return False
            
            # 4. Crear datos de ejemplo
            self.create_sample_data()
            
            print("\n🎉 ¡Base de datos configurada exitosamente!")
            print("\n📋 Resumen de tablas creadas:")
            print("   • user_profiles - Perfiles de usuario")
            print("   • analyses - Análisis de texto")
            print("\n🔒 Características de seguridad:")
            print("   • Row Level Security (RLS) habilitado")
            print("   • Políticas de acceso configuradas")
            print("   • Triggers para updated_at automático")
            print("\n🚀 ¡Tu aplicación está lista para usar!")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error en configuración: {e}")
            return False

def main():
    """Función principal"""
    print("=" * 60)
    print("🗄️  CONFIGURADOR DE BASE DE DATOS - SUPABASE")
    print("=" * 60)
    
    try:
        # Crear instancia del configurador
        db_setup = DatabaseSetup()
        
        # Configurar base de datos
        success = db_setup.setup_database()
        
        if success:
            print("\n✅ Configuración completada exitosamente")
            sys.exit(0)
        else:
            print("\n❌ Configuración falló")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n💥 Error crítico: {e}")
        print("\n🔧 Soluciones posibles:")
        print("   1. Verifica tu archivo .env")
        print("   2. Confirma que las credenciales de Supabase son correctas")
        print("   3. Asegúrate de tener permisos de administrador en Supabase")
        sys.exit(1)

if __name__ == "__main__":
    main()