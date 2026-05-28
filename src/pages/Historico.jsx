import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { balanceService } from '../services/balanceService'
import { useLocale } from '../context/LocaleContext'

const GOV_COLORS = {
  'Kirchnerismo': '#3182ce',
  'Macrismo': '#d69e2e',
  'Alberto F.': '#38a169',
  'Milei': '#805ad5',
}

const GOV_BADGE = {
  'Kirchnerismo': 'era-kirchner',
  'Macrismo': 'era-macri',
  'Alberto F.': 'era-alberto',
  'Milei': 'era-milei',
}

const CustomTooltip = ({ active, payload, fmtUSD }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-border-default rounded-lg shadow-lg p-3 text-sm min-w-[200px]">
      <p className="font-bold text-text-primary mb-1">{d.year}</p>
      <p className={`font-semibold mb-1 ${d.balanceUsd >= 0 ? 'text-surplus' : 'text-deficit'}`}>
        {fmtUSD(d.balanceUsd)}
      </p>
      {d.government && <p className="text-xs text-text-tertiary">{d.government}</p>}
      {d.context && <p className="text-xs text-text-secondary mt-1">{d.context}</p>}
    </div>
  )
}

export default function Historico() {
  const { t, fmtUSD } = useLocale()
  const [anual, setAnual] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    balanceService.getAnual()
      .then(setAnual)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const deficitTotal = anual
    .filter(r => r.balanceUsd < 0)
    .reduce((s, r) => s + r.balanceUsd, 0)

  const mileiTotal = anual
    .filter(r => r.government === 'Milei')
    .reduce((s, r) => s + r.balanceUsd, 0)

  const execSummary = [
    { label: 'Déficit acumulado 2011–2023', value: 'USD -36.953 M', cls: 'text-deficit' },
    { label: 'Superávit gestión Milei', value: fmtUSD(mileiTotal), cls: 'text-surplus' },
    { label: 'Brecha pendiente de recuperar', value: 'USD -18.526 M', cls: 'text-warning' },
    { label: 'Proyección 2026 (mínimo est.)', value: 'USD ~18.000–20.000 M', cls: 'text-brand' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {execSummary.map(s => (
          <div key={s.label} className="card-sm">
            <p className="kpi-label mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Annual balance chart */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-1">{t('chart.annual.title')}</h2>
        <p className="text-xs text-text-tertiary mb-4">Rojo = déficit | Verde = superávit | Dorado = gestión Milei</p>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anual} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#718096', fontSize: 11 }} />
                <YAxis tick={{ fill: '#718096', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip fmtUSD={fmtUSD} />} />
                <ReferenceLine y={0} stroke="#9b2335" strokeDasharray="4 2" strokeWidth={1.5} />
                <Bar dataKey="balanceUsd" name="Saldo anual" radius={[3,3,0,0]}>
                  {anual.map(r => (
                    <Cell key={r.year} fill={
                      r.government === 'Milei' ? '#805ad5'
                      : r.balanceUsd >= 0 ? '#38a169'
                      : '#e53e3e'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Annual table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">{t('table.year')}</th>
                <th className="table-header-right">{t('table.balance')}</th>
                <th className="table-header">{t('table.government')}</th>
                <th className="table-header">{t('table.context')}</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="table-row">
                      {[80, 60, 80, 200].map((w, j) => (
                        <td key={j} className="table-cell">
                          <div className={`h-4 bg-bg-surface rounded animate-pulse`} style={{ width: w }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : anual.map(row => (
                    <tr key={row.year} className={`table-row ${row.government === 'Milei' ? 'bg-purple-50/30' : ''}`}>
                      <td className="table-cell font-semibold">{row.year}</td>
                      <td className={`table-cell-right font-bold ${row.balanceUsd >= 0 ? 'text-surplus' : 'text-deficit'}`}>
                        {fmtUSD(row.balanceUsd)}
                        <span className="ml-2 text-xs font-normal">
                          {row.balanceUsd >= 0
                            ? <span className="badge-surplus">✅ Superávit</span>
                            : <span className="badge-deficit">🔴 Déficit</span>}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={GOV_BADGE[row.government] || 'badge-pending'}>
                          {row.government}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-text-secondary">{row.context}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
