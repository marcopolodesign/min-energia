import { useState, useEffect } from 'react'
import { balanceService } from '../services/balanceService'
import { toast } from '../components/Toast'
import { useLocale } from '../context/LocaleContext'

const MONTHS_ES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const GOVERNMENTS = ['Kirchnerismo', 'Macrismo', 'Alberto F.', 'Milei']

export default function Carga() {
  const { t, fmtUSD } = useLocale()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [form, setForm] = useState({
    year: currentYear,
    month: currentMonth,
    exportsUsd: '',
    importsUsd: '',
    government: 'Milei',
    isRecord: false,
    observations: '',
  })
  const [saving, setSaving] = useState(false)
  const [existingData, setExistingData] = useState(null)
  const [loadingExisting, setLoadingExisting] = useState(false)

  const balance = form.exportsUsd && form.importsUsd
    ? parseFloat(form.exportsUsd) - parseFloat(form.importsUsd)
    : null

  // Load existing entry when year/month changes
  useEffect(() => {
    const load = async () => {
      setLoadingExisting(true)
      try {
        const rows = await balanceService.getMensual(form.year)
        const existing = rows.find(r => r.month === parseInt(form.month))
        if (existing) {
          setExistingData(existing)
          setForm(f => ({
            ...f,
            exportsUsd: existing.exportsUsd ?? '',
            importsUsd: existing.importsUsd ?? '',
            government: existing.government || 'Milei',
            isRecord: existing.isRecord || false,
            observations: existing.observations || '',
          }))
        } else {
          setExistingData(null)
        }
      } finally {
        setLoadingExisting(false)
      }
    }
    load()
  }, [form.year, form.month])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await balanceService.upsertMensual({
        year: parseInt(form.year),
        month: parseInt(form.month),
        exportsUsd: form.exportsUsd ? parseFloat(form.exportsUsd) : null,
        importsUsd: form.importsUsd ? parseFloat(form.importsUsd) : null,
        government: form.government,
        isRecord: form.isRecord,
        observations: form.observations || null,
      })
      toast.success(`${MONTHS_ES[form.month]} ${form.year} guardado correctamente`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 7 + i)

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div className="card-sm bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          Ingresá exportaciones e importaciones. El saldo, acumulado y variaciones se calculan automáticamente.
        </p>
      </div>

      {existingData && (
        <div className="card-sm bg-yellow-50 border-yellow-200">
          <p className="text-xs text-yellow-800">
            Ya existe un registro para {MONTHS_ES[form.month]} {form.year}. Al guardar, se sobreescribirá.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Period */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t('form.year')}</label>
            <select className="form-select" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">{t('form.month')}</label>
            <select className="form-select" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
              {MONTHS_ES.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t('form.exports')} <span className="text-brand font-medium">(azul = ingresás vos)</span></label>
            <input type="number" step="0.1" min="0" className="form-input text-brand font-medium"
              placeholder="ej: 781"
              value={form.exportsUsd}
              onChange={e => setForm(f => ({ ...f, exportsUsd: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">{t('form.imports')} <span className="text-brand font-medium">(azul = ingresás vos)</span></label>
            <input type="number" step="0.1" min="0" className="form-input text-brand font-medium"
              placeholder="ej: 163"
              value={form.importsUsd}
              onChange={e => setForm(f => ({ ...f, importsUsd: e.target.value }))}
            />
          </div>
        </div>

        {/* Live balance preview */}
        {balance != null && (
          <div className={`rounded-lg p-3 border ${balance >= 0 ? 'bg-surplus-bg border-surplus-border' : 'bg-deficit-bg border-deficit-border'}`}>
            <p className="text-xs font-medium text-text-tertiary mb-1">Saldo calculado (preview)</p>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-surplus' : 'text-deficit'}`}>
              {fmtUSD(balance)}
            </p>
          </div>
        )}

        {/* Government */}
        <div>
          <label className="form-label">{t('form.government')}</label>
          <select className="form-select" value={form.government} onChange={e => setForm(f => ({ ...f, government: e.target.value }))}>
            {GOVERNMENTS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Record flag */}
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isRecord" className="w-4 h-4 text-brand border-border-default rounded cursor-pointer"
            checked={form.isRecord}
            onChange={e => setForm(f => ({ ...f, isRecord: e.target.checked }))}
          />
          <label htmlFor="isRecord" className="text-sm font-medium text-text-secondary cursor-pointer">
            ⭐ {t('form.record')}
          </label>
        </div>

        {/* Observations */}
        <div>
          <label className="form-label">{t('form.observations')}</label>
          <textarea className="form-input resize-none" rows={2}
            placeholder="Ej: Superávit más alto de la historia para un mes"
            value={form.observations}
            onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
          />
        </div>

        <button type="submit" disabled={saving || loadingExisting} className="btn-primary w-full">
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('form.saving')}
            </span>
          ) : t('form.save')}
        </button>
      </form>
    </div>
  )
}
