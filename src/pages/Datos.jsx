import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { balanceService } from '../services/balanceService'
import { toast } from '../components/Toast'
import { useLocale } from '../context/LocaleContext'

const MONTHS_ES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function Datos() {
  const { t, fmtUSD } = useLocale()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const rows = await balanceService.getAllMensual()
      setData(rows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const years = [...new Set(data.map(r => r.year))].sort((a, b) => b - a)

  const filtered = yearFilter === 'all' ? data : data.filter(r => String(r.year) === yearFilter)

  const handleDelete = async (year, month) => {
    if (!confirm(`¿Eliminar ${MONTHS_ES[month]} ${year}?`)) return
    setDeleting(`${year}-${month}`)
    try {
      await balanceService.deleteMensual(year, month)
      toast.success('Registro eliminado')
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">{t('filter.year')}:</span>
          <select className="form-select w-auto text-sm"
            value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="all">{t('filter.all')}</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <a href="/carga" className="btn-primary flex items-center gap-1.5 text-sm">
          <PlusIcon className="h-4 w-4" /> {t('form.new')}
        </a>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">{t('table.year')}</th>
                <th className="table-header">{t('table.month')}</th>
                <th className="table-header-right">{t('table.exports')}</th>
                <th className="table-header-right">{t('table.imports')}</th>
                <th className="table-header-right">{t('table.balance')}</th>
                <th className="table-header">{t('table.government')}</th>
                <th className="table-header">{t('table.record')}</th>
                <th className="table-header">{t('table.observations')}</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="table-row">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="table-cell">
                          <div className="h-4 bg-bg-surface rounded animate-pulse w-16" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map(row => {
                    const balance = row.balance ?? (row.exportsUsd != null ? row.exportsUsd - (row.importsUsd || 0) : null)
                    const key = `${row.year}-${row.month}`
                    return (
                      <tr key={key} className="table-row">
                        <td className="table-cell font-medium">{row.year}</td>
                        <td className="table-cell">{MONTHS_ES[row.month]}</td>
                        <td className="table-cell-right">{row.exportsUsd != null ? fmtUSD(row.exportsUsd) : '—'}</td>
                        <td className="table-cell-right">{row.importsUsd != null ? fmtUSD(row.importsUsd) : '—'}</td>
                        <td className={`table-cell-right font-semibold ${balance != null ? (balance >= 0 ? 'text-surplus' : 'text-deficit') : ''}`}>
                          {balance != null ? fmtUSD(balance) : '—'}
                        </td>
                        <td className="table-cell text-xs text-text-secondary">{row.government}</td>
                        <td className="table-cell">
                          {row.isRecord && <span className="badge-record">⭐</span>}
                        </td>
                        <td className="table-cell text-xs text-text-secondary max-w-[200px] truncate">{row.observations}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <a href={`/carga?year=${row.year}&month=${row.month}`}
                              className="p-1.5 text-text-tertiary hover:text-brand hover:bg-brand-muted rounded transition-colors">
                              <PencilIcon className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleDelete(row.year, row.month)}
                              disabled={deleting === key}
                              className="p-1.5 text-text-tertiary hover:text-error hover:bg-red-50 rounded transition-colors">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-text-tertiary text-sm">{t('no_data')}</div>
        )}
      </div>

      <p className="text-xs text-text-tertiary">
        {filtered.length} registros mostrados · {t('app.source')}
      </p>
    </div>
  )
}
