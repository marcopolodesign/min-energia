import { createContext, useContext, useState, useCallback } from 'react'
import es from '../i18n/es.json'
import en from '../i18n/en.json'

const dicts = { es, en }

const LocaleContext = createContext(null)

export const LocaleProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(() => localStorage.getItem('locale') || 'es')

  const setLocale = useCallback((l) => {
    localStorage.setItem('locale', l)
    setLocaleState(l)
  }, [])

  const t = useCallback((key) => dicts[locale]?.[key] ?? dicts.es[key] ?? key, [locale])

  const fmtUSD = useCallback((value, digits = 0) => {
    if (value == null || isNaN(value)) return '—'
    return new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value)
  }, [locale])

  const fmtNum = useCallback((value, digits = 0) => {
    if (value == null || isNaN(value)) return '—'
    return new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value)
  }, [locale])

  const fmtPct = useCallback((value) => {
    if (value == null || isNaN(value)) return '—'
    const formatted = new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(Math.abs(value * 100))
    return `${value >= 0 ? '+' : '-'}${formatted}%`
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, fmtUSD, fmtNum, fmtPct }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}
