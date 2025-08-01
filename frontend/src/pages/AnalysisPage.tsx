import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, FileText, Brain, TrendingUp, Hash, AlertCircle, CheckCircle } from 'lucide-react'
import { useApi, AnalysisResponse } from '../contexts/ApiContext'

const AnalysisPage: React.FC = () => {
  const { apiService } = useApi()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      setError('Por favor, ingresa un texto para analizar')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiService.analyzeText({ text: text.trim() })
      
      // Validar que la respuesta tenga la estructura esperada
      if (!response || typeof response !== 'object') {
        throw new Error('Respuesta inválida del servidor')
      }
      
      // Asegurar que los campos requeridos existan
      const validatedResponse = {
        ...response,
        summary: response.summary || 'No se pudo generar un resumen',
        sentiment: response.sentiment || { sentiment: 'neutral', confidence: 0 },
        keywords: Array.isArray(response.keywords) ? response.keywords : [],
        original_text: response.original_text || text.trim(),
        id: response.id || 'unknown',
        created_at: response.created_at || new Date().toISOString()
      }
      
      setResult(validatedResponse)
    } catch (err: any) {
      console.error('Error analyzing text:', err)
      
      let errorMessage = 'Error al analizar el texto. Por favor, inténtalo de nuevo.'
      
      if (err?.response?.status === 401) {
        errorMessage = 'No estás autenticado. Por favor, inicia sesión.'
      } else if (err?.response?.status === 400) {
        errorMessage = 'El texto proporcionado no es válido. Verifica que tenga al menos 10 caracteres.'
      } else if (err?.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor, inténtalo más tarde.'
      } else if (err?.message) {
        errorMessage = `Error: ${err.message}`
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'text-blue-600 bg-blue-100'
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'positivo':
        return 'text-green-600 bg-green-100'
      case 'negative':
      case 'negativo':
        return 'text-red-600 bg-red-100'
      case 'neutral':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  const getSentimentIcon = (sentiment?: string) => {
    if (!sentiment) return '🤔'
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'positivo':
        return '😊'
      case 'negative':
      case 'negativo':
        return '😔'
      case 'neutral':
        return '😐'
      default:
        return '🤔'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Brain className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Análisis de Contenido</h1>
        <p className="mt-2 text-lg text-gray-600">
          Ingresa tu texto y obtén un análisis completo con IA
        </p>
      </div>

      {/* Input Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Texto a Analizar
          </h2>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe o pega aquí el texto que quieres analizar..."
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
                disabled={isLoading}
              />
              <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                <span>{text.length} caracteres</span>
                <span>Mínimo 10 caracteres recomendado</span>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver Historial
              </button>
              <button
                type="submit"
                disabled={isLoading || !text.trim()}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Analizar Texto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">¡Análisis completado exitosamente!</span>
          </div>

          {/* Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Resumen
              </h3>
            </div>
            <div className="card-content">
              <p className="text-gray-700 leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Análisis de Sentimiento
              </h3>
            </div>
            <div className="card-content">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(result.sentiment?.sentiment)}`}>
                  <span className="mr-2">{getSentimentIcon(result.sentiment?.sentiment)}</span>
                  {result.sentiment?.sentiment || 'No determinado'}
                </div>
                <div className="text-sm text-gray-600">
                  Confianza: <span className="font-medium">{result.sentiment?.confidence ? (result.sentiment.confidence * 100).toFixed(1) : '0.0'}%</span>
                </div>
              </div>
              {result.sentiment?.explanation && (
                <p className="mt-3 text-gray-700">{result.sentiment.explanation}</p>
              )}
            </div>
          </div>

          {/* Keywords */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Hash className="h-5 w-5 mr-2" />
                Palabras Clave
              </h3>
            </div>
            <div className="card-content">
              <div className="flex flex-wrap gap-2">
                {result.keywords && result.keywords.length > 0 ? (
                  result.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No se encontraron palabras clave</span>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Info */}
          <div className="card">
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">ID de Análisis:</span>
                  <br />
                  <span className="font-mono text-xs">{result.id}</span>
                </div>
                <div>
                  <span className="font-medium">Fecha:</span>
                  <br />
                  {new Date(result.created_at).toLocaleString('es-ES')}
                </div>
                <div>
                  <span className="font-medium">Caracteres analizados:</span>
                  <br />
                  {result.original_text ? result.original_text.length : text.length}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setText('')
                setResult(null)
                setError(null)
              }}
              className="btn-secondary"
            >
              Nuevo Análisis
            </button>
            <button
              onClick={() => navigate('/history')}
              className="btn-primary"
            >
              Ver Historial Completo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisPage