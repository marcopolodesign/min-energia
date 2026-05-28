import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { authService } from '../services/authService'
import { useLocale } from '../context/LocaleContext'

const Login = ({ onLogin }) => {
  const { t } = useLocale()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await authService.login(form.email, form.password)
      onLogin(response.jwt)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary py-12 px-4">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 overflow-hidden bg-brand">
            {/* Argentine flag stripe */}
            <div className="flex flex-col w-full h-full">
              <div className="flex-1 bg-[#75AADB]" />
              <div className="flex-1 bg-white flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#F6B40E]" />
              </div>
              <div className="flex-1 bg-[#75AADB]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {t('login.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{t('login.subtitle')}</p>
        </div>

        <div className="card shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="form-label">{t('login.email')}</label>
              <input id="email" name="email" type="email" autoComplete="email" required
                className="form-input"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">{t('login.password')}</label>
              <div className="relative">
                <input id="password" name="password" type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password" required
                  className="form-input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-secondary"
                  onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('login.loading')}
                </span>
              ) : t('login.submit')}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-text-tertiary">
          {t('login.footer')}
        </p>
      </div>
    </div>
  )
}

export default Login
