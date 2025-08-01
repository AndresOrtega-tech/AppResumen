# 🧠 Analizador de Contenido Inteligente

Una aplicación móvil moderna que utiliza IA para analizar texto y proporcionar resúmenes, palabras clave y análisis de sentimiento.

## 🚀 Stack Tecnológico

- **Frontend:** React Native
- **Backend:** FastAPI (Python)
- **Base de Datos:** Supabase (PostgreSQL)
- **IA:** Gemini Pro API
- **Despliegue:** Vercel
- **IDE:** TRAE AI

## 📁 Estructura del Proyecto

```
TRAE/
├── 📱 frontend/           # Aplicación React Native
├── 🔧 backend/            # API FastAPI
├── 📚 shared/             # Código compartido
├── 📖 docs/               # Documentación
├── 🔧 .github/workflows/  # CI/CD
├── 📄 ARCHITECTURE.md     # Arquitectura del sistema
└── 📄 README.md           # Este archivo
```

## 🛠️ Desarrollo Local

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🚀 Despliegue

- **Backend:** Vercel Serverless Functions
- **Frontend:** Vercel + App Stores
- **Base de Datos:** Supabase

## 📚 Documentación

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles de la arquitectura del sistema.