import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Brain, FileText, TrendingUp, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { useApi, HealthCheck } from '../contexts/ApiContext'

const HomePage: React.FC = () => {
  const { apiService } = useApi()
  const [healthStatus, setHealthStatus] = useState<HealthCheck | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiService.healthCheck()
        setHealthStatus(health)
      } catch (error) {
        console.error('Error checking health:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
  }, [apiService])

  const features = [
    {
      icon: Brain,
      title: 'Análisis con IA',
      description: 'Utiliza Gemini Pro para analizar texto de forma inteligente y precisa.',
      color: 'text-blue-600'
    },
    {
      icon: FileText,
      title: 'Resúmenes Automáticos',
      description: 'Genera resúmenes concisos y relevantes de cualquier texto.',
      color: 'text-green-600'
    },
    {
      icon: TrendingUp,
      title: 'Análisis de Sentimiento',
      description: 'Detecta emociones y sentimientos en el contenido analizado.',
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      title: 'Palabras Clave',
      description: 'Extrae automáticamente las palabras y conceptos más importantes.',
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Brain className="h-16 w-16 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Analizador de Contenido
          <span className="text-primary-600"> Inteligente</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Analiza cualquier texto con el poder de la inteligencia artificial. 
          Obtén resúmenes, palabras clave y análisis de sentimiento en segundos.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              to="/analysis"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Comenzar Análisis
            </Link>
          </div>
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <Link
              to="/history"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Ver Historial
            </Link>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Estado del Sistema</h3>
          </div>
          <div className="card-content">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-sm text-gray-500">Verificando estado...</span>
              </div>
            ) : healthStatus ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    API: <span className="font-medium text-green-600">{healthStatus.status}</span>
                  </span>
                </div>
                <div className="flex items-center">
                  {healthStatus.supabase_configured ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm text-gray-700">
                    Base de Datos: <span className={`font-medium ${healthStatus.supabase_configured ? 'text-green-600' : 'text-red-600'}`}>
                      {healthStatus.supabase_configured ? 'Conectada' : 'Desconectada'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center">
                  {healthStatus.gemini_configured ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm text-gray-700">
                    IA Gemini: <span className={`font-medium ${healthStatus.gemini_configured ? 'text-green-600' : 'text-red-600'}`}>
                      {healthStatus.gemini_configured ? 'Configurada' : 'No configurada'}
                    </span>
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Entorno: <span className="font-medium">{healthStatus.environment}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Error al conectar con la API</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Características Principales
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Descubre todo lo que puedes hacer con nuestro analizador de contenido
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center">
                      <Icon className={`h-12 w-12 ${feature.color}`} />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50 rounded-lg">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">¿Listo para analizar?</span>
            <span className="block text-primary-600">Comienza ahora mismo.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/analysis"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Analizar Texto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage