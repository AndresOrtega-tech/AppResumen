import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage, AnalysisPage, HistoryPage, LoginPage, RegisterPage } from './pages'
import { ApiProvider } from './contexts/ApiContext'

function App() {
  return (
    <ApiProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Layout>
      </Router>
    </ApiProvider>
  )
}

export default App