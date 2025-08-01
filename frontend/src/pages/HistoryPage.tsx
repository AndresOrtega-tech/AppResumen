import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { History, FileText, TrendingUp, Hash, Calendar, Search, RefreshCw, AlertCircle, Plus } from 'lucide-react'
import { useApi, AnalysisHistory } from '../contexts/ApiContext'

const HistoryPage: React.FC = () => {
  const { apiService } = useApi()
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null)

  const loadHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiService.getHistory()
      setHistory(data)
    } catch (err) {
      console.error('Error loading history:', err)
      setError('Error al cargar el historial. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const filteredHistory = history.filter(item =>
    item.original_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getSentimentColor = (sentiment: string) => {
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

  const getSentimentIcon = (sentiment: string) => {
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

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <History className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial de Análisis</h1>
            <p className="text-gray-600">Revisa todos tus análisis anteriores</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={loadHistory}
            disabled={isLoading}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <Link to="/analysis" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Análisis
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="card-content">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en el historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Cargando historial...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron resultados' : 'No hay análisis aún'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza creando tu primer análisis de texto'
            }
          </p>
          {!searchTerm && (
            <Link to="/analysis" className="btn-primary">
              Crear Primer Análisis
            </Link>
          )}
        </div>
      )}

      {/* History List */}
      {!isLoading && !error && filteredHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredHistory.length} análisis encontrados
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAnalysis(selectedAnalysis?.id === item.id ? null : item)}
              >
                <div className="card-content">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment.sentiment)}`}>
                      <span className="mr-1">{getSentimentIcon(item.sentiment.sentiment)}</span>
                      {item.sentiment.sentiment}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Texto Original</h3>
                      <p className="text-gray-700 text-sm">
                        {truncateText(item.original_text)}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Resumen
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {truncateText(item.summary)}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Hash className="h-4 w-4 mr-1" />
                        Palabras Clave
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.slice(0, 5).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                        {item.keywords.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{item.keywords.length - 5} más
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedAnalysis?.id === item.id && (
                      <div className="pt-4 border-t border-gray-200 space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Análisis de Sentimiento Detallado
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getSentimentColor(item.sentiment.sentiment)}`}>
                                {item.sentiment.sentiment}
                              </span>
                              <span className="text-sm text-gray-600">
                                Confianza: {(item.sentiment.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            {item.sentiment.explanation && (
                              <p className="text-sm text-gray-700">{item.sentiment.explanation}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Todas las Palabras Clave</h4>
                          <div className="flex flex-wrap gap-1">
                            {item.keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                          ID: {item.id}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPage