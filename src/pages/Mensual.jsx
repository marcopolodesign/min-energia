import { useState, useEffect } from 'react'
import { balanceService } from '../services/balanceService'
import { useLocale } from '../context/LocaleContext'

const MONTHS_ES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const GOV_BADGE = {
  'Kirchnerismo': 'era-kirchner',
  'Macrismo': 'era-macri',
  'Alberto F.': 'era-alberto',
  'Milei': 'era-milei',
}

export default function Mensual() {
  const { t, fmtUSD, fmtPct } = useLocale()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()))

  const years = ['2024', '2025', '2026']

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const rows = await balanceService.getMensual(parseInt(yearFilter))
        setData(rows)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [yearFilter])

  const available = data.filter(r => r.exportsUsd != null)
  const totals = available.reduce((acc, r) => ({
    exports: acc.exports + r.exportsUsd,
    imports: acc.imports + (r.importsUsd || 0),
    balance: acc.balance + (r.balance ?? (r.exportsUsd - (r.importsUsd || 0))),
  }), { exports: 0, imports: 0, balance: 0 })

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Year selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-secondary">{t('filter.year')}:</span>
        <div className="flex gap-1">
          {years.map(y => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${yearFilter === y ? 'bg-brand text-white' : 'btn-secondary'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {available.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card-sm">
            <p className="kpi-label">{t('chart.balance.exports')}</p>
            <p className="text-xl font-bold text-text-primary">{fmtUSD(totals.exports)}</p>
          </div>
          <div className="card-sm">
            <p className="kpi-label">{t('chart.balance.imports')}</p>
            <p className="text-xl font-bold text-text-primary">{fmtUSD(totals.imports)}</p>
          </div>
          <div className={`card-sm ${totals.balance >= 0 ? 'bg-surplus-bg border-surplus-border' : 'bg-deficit-bg border-deficit-border'}`}>
            <p className={`kpi-label ${totals.balance >= 0 ? 'text-surplus' : 'text-deficit'}`}>{t('table.balance')}</p>
            <p className={`text-xl font-bold ${totals.balance >= 0 ? 'text-surplus' : 'text-deficit'}`}>
              {fmtUSD(totals.balance)}
            </p>
          </div>
        </div>
      )}

      {/* Main table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">{t('table.month')}</th>
                <th className="table-header-right">{t('table.exports')}</th>
                <th className="table-header-right">{t('table.yoy_exp')}</th>
                <th className="table-header-right">{t('table.imports')}</th>
                <th className="table-header-right">{t('table.yoy_imp')}</th>
                <th className="table-header-right">{t('table.balance')}</th>
                <th className="table-header-right">{t('table.ytd')}</th>
                <th className="table-header-right">{t('table.yoy_bal')}</th>
                <th className="table-header">{t('table.record')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-bg-surface rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.map(row => {
                const balance = row.balance ?? (row.exportsUsd != null ? row.exportsUsd - (row.importsUsd || 0) : null)
                const isPending = row.exportsUsd == null
                return (
                  <tr key={row.month} className="table-row">
                    <td className="table-cell font-medium">{MONTHS_ES[row.month]}</td>
                    <td className="table-cell-right">{isPending ? <span className="badge-pending">{t('pending')}</span> : fmtUSD(row.exportsUsd)}</td>
                    <td className="table-cell-right">
                      {row.yoyExports != null && !isPending && (
                        <span className={row.yoyExports >= 0 ? 'text-surplus font-medium' : 'text-deficit font-medium'}>
                          {fmtPct(row.yoyExports)}
                        </span>
                      )}
                    </td>
                    <td className="table-cell-right">{isPending ? '—' : fmtUSD(row.importsUsd)}</td>
                    <td className="table-cell-right">
                      {row.yoyImports != null && !isPending && (
                        <span className={row.yoyImports >= 0 ? 'text-deficit font-medium' : 'text-surplus font-medium'}>
                          {fmtPct(row.yoyImports)}
                        </span>
                      )}
                    </td>
                    <td className={`table-cell-right font-semibold ${balance != null ? (balance >= 0 ? 'text-surplus' : 'text-deficit') : ''}`}>
                      {balance != null ? fmtUSD(balance) : '—'}
                    </td>
                    <td className="table-cell-right font-medium">{fmtUSD(row.ytdBalance)}</td>
                    <td className="table-cell-right">
                      {row.yoyBalance != null && !isPending && (
                        <span className={row.yoyBalance >= 0 ? 'text-surplus font-medium' : 'text-deficit font-medium'}>
                          {fmtPct(row.yoyBalance)}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {row.isRecord && <span className="badge-record">⭐ {t('record')}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Totals row */}
            {!loading && available.length > 0 && (
              <tfoot>
                <tr className="bg-bg-surface">
                  <td className="table-cell font-semibold text-text-secondary">TOTAL {yearFilter}</td>
                  <td className="table-cell-right font-bold">{fmtUSD(totals.exports)}</td>
                  <td className="table-cell-right" />
                  <td className="table-cell-right font-bold">{fmtUSD(totals.imports)}</td>
                  <td className="table-cell-right" />
                  <td className={`table-cell-right font-bold text-base ${totals.balance >= 0 ? 'text-surplus' : 'text-deficit'}`}>
                    {fmtUSD(totals.balance)}
                  </td>
                  <td className="table-cell-right" />
                  <td className="table-cell-right" />
                  <td className="table-cell" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <p className="text-xs text-text-tertiary">{t('app.source')}</p>
    </div>
  )
}
