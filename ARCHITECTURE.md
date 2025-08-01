# Arquitectura del Proyecto: Analizador de Contenido Inteligente

Este proyecto personal se basa en una arquitectura moderna de tres capas para crear una aplicación móvil que analiza texto usando inteligencia artificial. La aplicación utiliza servicios en la nube para escalabilidad y facilidad de despliegue.

---

### **1. Frontend (App Móvil)**

* **Tecnología:** React Native.
* **Despliegue:** Vercel (para la versión web) y stores móviles (iOS/Android).
* **IDE de Desarrollo:** TRAE AI.

* **Función:** La interfaz de usuario que permite la interacción con la aplicación.

* **Vistas Principales:**
    * `Login/Registro`: Autenticación de usuarios con Supabase Auth.
    * `Análisis de Texto`: Pantalla principal para ingresar texto.
    * `Resultados`: Muestra el resumen, las palabras clave y el análisis de sentimiento.
    * `Historial`: Acceso a los análisis guardados por el usuario.

* **Flujo de Datos:** La app móvil envía peticiones HTTP al Backend desplegado en Vercel y muestra los resultados recibidos.

---

### **2. Backend (Servidor de la API)**

* **Tecnología:** FastAPI (Python).
* **Despliegue:** Vercel (Serverless Functions).
* **IDE de Desarrollo:** TRAE AI.

* **Función:** Actúa como el intermediario entre el Frontend, Supabase y la API de Gemini Pro.

* **Endpoints (Rutas de la API):**
    * `POST /auth/login`: Autenticación de usuarios con Supabase.
    * `POST /auth/register`: Registro de nuevos usuarios en Supabase.
    * `POST /analyze`: Recibe el texto, se comunica con la API de Gemini Pro y guarda los resultados en Supabase.
    * `GET /history`: Recupera el historial de análisis de un usuario desde Supabase.
    * `GET /history/{id}`: Obtiene los detalles de un análisis específico.

* **Integración con IA:** API de Gemini Pro para análisis de texto inteligente.
* **Seguridad:** Variables de entorno en Vercel para gestionar claves de API de Gemini Pro y credenciales de Supabase.

---

### **3. Base de Datos (Supabase)**

* **Tecnología:** Supabase (PostgreSQL como servicio).
* **Tipo:** Base de datos en la nube con autenticación integrada.

* **Función:** Almacena la información persistente del proyecto y gestiona la autenticación de usuarios.

* **Estructura de Tablas:**
    * `usuarios`: Gestionada automáticamente por Supabase Auth (id, email, metadata, etc.).
    * `analisis`: Almacena el texto original y los resultados del análisis (resumen, palabras clave, sentimiento) asociados a cada usuario.

* **Ventajas de Supabase:**
    * Autenticación integrada y segura.
    * API REST automática.
    * Real-time subscriptions.
    * Escalabilidad automática.
    * Panel de administración web.

---

### **4. Servicios Externos**

* **API de IA:** Gemini Pro para análisis de contenido inteligente.
* **Hosting:** Vercel para backend y frontend web.
* **Base de Datos:** Supabase para persistencia y autenticación.

---

### **5. Flujo de Desarrollo**

* **IDE Principal:** TRAE AI para desarrollo completo del proyecto.
* **Control de Versiones:** GitHub con integración automática a Vercel.
* **CI/CD:** Despliegue automático en Vercel desde commits a main branch.