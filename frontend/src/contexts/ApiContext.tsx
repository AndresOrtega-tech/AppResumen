import React, { createContext, useContext, ReactNode } from 'react'
import axios from 'axios'

// Tipos para la API
export interface AnalysisRequest {
  text: string
}

export interface SentimentResult {
  sentiment: string
  confidence: number
  explanation?: string
}

export interface AnalysisResponse {
  id: string
  original_text: string
  summary: string
  keywords: string[]
  sentiment: SentimentResult
  created_at: string
}

export interface AnalysisHistory extends AnalysisResponse {}

export interface HistoryResponse {
  items: AnalysisHistory[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface HealthCheck {
  status: string
  supabase_configured: boolean
  gemini_configured: boolean
  environment: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    full_name?: string
    email_confirmed_at: string
    created_at: string
  }
}

export interface User {
  id: string
  email: string
  full_name?: string
  email_confirmed_at: string
  created_at: string
}

// Configuración de la API
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : 'https://app-resumen-backend.vercel.app'

console.log('Using API URL:', API_BASE_URL)

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  response => response,
  error => {
    // No mostrar errores 401 en la consola, son normales cuando el usuario no está autenticado
    if (error.response?.status !== 401) {
      console.error('API Error:', error.response?.status, error.response?.data)
    }
    return Promise.reject(error)
  }
)

// Servicios de la API
export class ApiService {
  // Health check
  static async healthCheck(): Promise<HealthCheck> {
    try {
      console.log('Intentando health check desde:', `${API_BASE_URL}/health`)
      const response = await apiClient.get('/health')
      console.log('Respuesta de health check:', response.data)
      return response.data
    } catch (error: any) {
      // Mostrar mensaje más amigable
      console.log('No se pudo conectar al servidor:', error.message)
      
      // Devolver un estado por defecto en caso de error
      return {
        status: 'error',
        supabase_configured: false,
        gemini_configured: false,
        environment: 'unknown'
      }
    }
  }

  // Analizar texto
  static async analyzeText(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await apiClient.post('/api/analysis/analyze', request)
    return response.data
  }

  // Obtener historial
  static async getHistory(page: number = 1, limit: number = 10): Promise<AnalysisHistory[]> {
    try {
      const response = await apiClient.get(`/api/analysis/history?page=${page}&limit=${limit}`)
      return response.data.items || []
    } catch (error) {
      console.error('Error obteniendo historial:', error)
      return []
    }
  }

  // Obtener análisis por ID
  static async getAnalysisById(id: string): Promise<AnalysisResponse> {
    const response = await apiClient.get(`/api/analysis/history/${id}`)
    return response.data
  }

  // Login
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', credentials)
    return response.data
  }

  // Registro
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/register', userData)
    return response.data
  }

  // Logout
  static async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout')
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<User | null> {
    try {
      console.log('Intentando obtener usuario actual desde:', `${API_BASE_URL}/api/auth/me`)
      const response = await apiClient.get('/api/auth/me')
      console.log('Respuesta de usuario actual:', response.data)
      return response.data
    } catch (error: any) {
      // Si el error es 401, significa que el usuario no está autenticado, lo cual es normal
      if (error.response?.status === 401) {
        console.log('Usuario no autenticado')
      } else {
        // Solo mostrar error en consola si no es un 401
        console.error('Error obteniendo usuario actual:', error)
        console.error('Detalles del error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        })
      }
      return null
    }
  }
}

// Contexto de la API
interface ApiContextType {
  apiService: typeof ApiService
  isOnline: boolean
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

// Hook para usar el contexto
export const useApi = () => {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}

// Provider del contexto
interface ApiProviderProps {
  children: ReactNode
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)

  // Comprobar si el usuario está autenticado
  const isAuthenticated = !!user

  // Cargar usuario al iniciar
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const currentUser = await ApiService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error cargando usuario:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Gestionar estado online/offline
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await ApiService.login({ email, password })
      setUser(response.user)
    } finally {
      setLoading(false)
    }
  }

  // Función de registro
  const register = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)
      const response = await ApiService.register({ 
        email, 
        password, 
        full_name: fullName 
      })
      setUser(response.user)
    } finally {
      setLoading(false)
    }
  }

  // Función de logout
  const logout = async () => {
    try {
      setLoading(true)
      await ApiService.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ApiContext.Provider 
      value={{ 
        apiService: ApiService, 
        isOnline, 
        user, 
        loading, 
        login, 
        register, 
        logout, 
        isAuthenticated 
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}