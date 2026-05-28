import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './components/Login'
import { ToastContainer } from './components/Toast'
import Panel from './pages/Panel'
import Mensual from './pages/Mensual'
import Historico from './pages/Historico'
import Records from './pages/Records'
import Comparativas from './pages/Comparativas'
import Proyecciones from './pages/Proyecciones'
import Carga from './pages/Carga'
import Datos from './pages/Datos'
import { authService } from './services/authService'
import { useLocale } from './context/LocaleContext'

// Public dashboard — login screen is bypassed; site is protected by middleware password
const DEMO_MODE = true

const PAGE_TITLES = {
  '/panel':         'nav.panel',
  '/mensual':       'nav.mensual',
  '/historico':     'nav.historico',
  '/records':       'nav.records',
  '/comparativas':  'nav.comparativas',
  '/proyecciones':  'nav.proyecciones',
  '/carga':         'nav.carga',
  '/datos':         'nav.datos',
}

function AppShell({ onLogout }) {
  const { t } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Get page title from current path
  const [pageKey, setPageKey] = useState('')
  useEffect(() => {
    const path = window.location.pathname
    const key = Object.keys(PAGE_TITLES).find(k => path.startsWith(k))
    setPageKey(key ? PAGE_TITLES[key] : 'app.title')
  }, [])

  return (
    <Router>
      <ToastContainer />
      <div className="min-h-screen bg-bg-primary flex">
        <Sidebar
          userRole={DEMO_MODE ? 'demo' : 'admin'}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header
            onLogout={onLogout}
            onMenuToggle={() => setMobileMenuOpen(v => !v)}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/"             element={<Navigate to="/panel" replace />} />
                <Route path="/panel"        element={<Panel />} />
                <Route path="/mensual"      element={<Mensual />} />
                <Route path="/historico"    element={<Historico />} />
                <Route path="/records"      element={<Records />} />
                <Route path="/comparativas" element={<Comparativas />} />
                <Route path="/proyecciones" element={<Proyecciones />} />
                <Route path="/carga"        element={<Carga />} />
                <Route path="/datos"        element={<Datos />} />
                <Route path="*"             element={<Navigate to="/panel" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(DEMO_MODE)
  const [loading, setLoading] = useState(!DEMO_MODE)

  useEffect(() => {
    if (DEMO_MODE) return
    const check = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        if (token) {
          const valid = await authService.verifyToken(token)
          setIsAuthenticated(valid)
          if (!valid) localStorage.removeItem('admin_token')
        }
      } catch {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [])

  const handleLogin = (token) => {
    localStorage.setItem('admin_token', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    if (DEMO_MODE) return
    localStorage.removeItem('admin_token')
    localStorage.removeItem('userProfile')
    authService.logout()
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-text-tertiary text-sm">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return <AppShell onLogout={handleLogout} />
}
