import { useContext } from 'react'
import { ApiContext } from './ApiContext'

export const useApi = () => {
  const context = useContext(ApiContext)
  
  if (context === undefined) {
    throw new Error('useApi debe ser usado dentro de un ApiProvider')
  }
  
  return context
}