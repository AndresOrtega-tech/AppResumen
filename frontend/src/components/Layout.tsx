import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Brain, Home, FileText, History, Wifi, WifiOff, User, LogOut, LogIn, UserPlus } from 'lucide-react'
import { useApi } from '../contexts/ApiContext'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isOnline, user, logout, isAuthenticated } = useApi()

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Análisis', href: '/analysis', icon: FileText },
    { name: 'Historial', href: '/history', icon: History },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Analizador IA
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Status indicator and user menu */}
            <div className="flex items-center space-x-4">
              {/* Status indicator */}
              <div className="flex items-center">
                {isOnline ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">En línea</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Sin conexión</span>
                  </div>
                )}
              </div>
              
              {/* User menu */}
              <div className="flex items-center">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-gray-700">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                    <button 
                      onClick={async () => {
                        await logout()
                        navigate('/')
                      }}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      <span className="text-sm">Salir</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link to="/login" className="flex items-center text-gray-500 hover:text-gray-700">
                      <LogIn className="h-4 w-4 mr-1" />
                      <span className="text-sm">Iniciar sesión</span>
                    </Link>
                    <Link to="/register" className="flex items-center text-gray-500 hover:text-gray-700">
                      <UserPlus className="h-4 w-4 mr-1" />
                      <span className="text-sm">Registrarse</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Auth links for mobile */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center px-3 py-2 text-gray-700">
                    <User className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium truncate">{user?.email}</span>
                  </div>
                  <button
                    onClick={async () => {
                      await logout()
                      navigate('/')
                    }}
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <LogIn className="h-5 w-5 mr-3" />
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <UserPlus className="h-5 w-5 mr-3" />
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 Analizador de Contenido Inteligente. Powered by Gemini Pro.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400">v1.0.0</span>
              {isOnline && (
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="ml-1 text-xs text-gray-500">API conectada</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}