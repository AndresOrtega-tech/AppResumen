import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApi } from '../contexts/ApiContext'
import { AlertCircle, Loader2 } from 'lucide-react'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const { login, isAuthenticated } = useApi()
  const navigate = useNavigate()

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNeedsConfirmation(false)
    setResendMessage('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      console.error('Error en login:', err)
      
      let errorMessage = 'Error al iniciar sesión'
      
      if (err?.response?.status === 401) {
        errorMessage = 'Email o contraseña incorrectos'
      } else if (err?.response?.status === 400) {
        const detail = err.response?.data?.detail || 'Datos de login inválidos'
        errorMessage = detail
        
        // Detectar si necesita confirmación de email
        if (detail.includes('confirmar tu email') || detail.includes('email not confirmed')) {
          setNeedsConfirmation(true)
        }
      } else if (err?.response?.status === 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde'
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendConfirmation = async () => {
    setIsResending(true)
    setResendMessage('')
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/auth/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendMessage('Email de confirmación enviado. Revisa tu bandeja de entrada.')
      } else {
        const errorData = await response.json()
        setResendMessage(errorData.detail || 'Error al enviar email de confirmación')
      }
    } catch (error) {
      setResendMessage('Error al enviar email de confirmación')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Regístrate
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                {needsConfirmation && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={isResending}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Reenviar email de confirmación'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {resendMessage && (
          <div className={`rounded-md p-4 ${resendMessage.includes('enviado') ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex">
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${resendMessage.includes('enviado') ? 'text-green-800' : 'text-yellow-800'}`}>
                  {resendMessage}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage