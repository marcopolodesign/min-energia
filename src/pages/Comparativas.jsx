import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import { balanceService } from '../services/balanceService'
import { useLocale } from '../context/LocaleContext'

const YEAR_COLORS = { 2024: '#2b6cb0', 2025: '#38a169', 2026: '#d69e2e', 2023: '#e53e3e', 2022: '#805ad5' }

const CustomTooltip = ({ active, payload, label, fmtUSD }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border-default rounded-lg shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map(p => p.value != null && (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-mono">{fmtUSD(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Comparativas() {
  const { t, fmtUSD } = useLocale()
  const [yoyData, setYoyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('monthly') // monthly | accumulated

  useEffect(() => {
    balanceService.getYoYData()
      .then(setYoyData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const years = [2024, 2025, 2026]
  const dataKey = view === 'monthly' ? 'saldo' : 'acum'
  const title = view === 'monthly' ? t('chart.yoy.title') : t('chart.ytd.title')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View toggle */}
      <div className="flex gap-2">
        {[['monthly', 'Saldo mensual'], ['accumulated', 'Acumulado']].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${view === v ? 'bg-brand text-white' : 'btn-secondary'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Main comparison chart */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">{title}</h2>
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yoyData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#718096', fontSize: 11 }} />
                <YAxis tick={{ fill: '#718096', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip fmtUSD={fmtUSD} />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={0} stroke="#cbd5e0" />
                {years.map(y => (
                  <Line key={y} type="monotone" dataKey={`${dataKey}${y}`} name={String(y)}
                    stroke={YEAR_COLORS[y]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly diverging bar — MoM change */}
      {view === 'monthly' && !loading && (
        <div className="card">
          <h2 className="font-semibold text-text-primary mb-4">Variación Mes a Mes — {new Date().getFullYear()}</h2>
          <MomChart fmtUSD={fmtUSD} yoyData={yoyData} />
        </div>
      )}

      {/* Summary stats table */}
      {!loading && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-default">
            <h2 className="font-semibold text-text-primary">Resumen por año</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Mes</th>
                  {years.map(y => <th key={y} className="table-header-right">{y}</th>)}
                  {years.map(y => <th key={`a${y}`} className="table-header-right">Acum. {y}</th>)}
                </tr>
              </thead>
              <tbody>
                {yoyData.map(row => (
                  <tr key={row.month} className="table-row">
                    <td className="table-cell font-medium">{row.month}</td>
                    {years.map(y => (
                      <td key={y} className={`table-cell-right font-medium ${
                        row[`saldo${y}`] == null ? 'text-text-muted' :
                        row[`saldo${y}`] >= 0 ? 'text-surplus' : 'text-deficit'
                      }`}>
                        {row[`saldo${y}`] != null ? fmtUSD(row[`saldo${y}`]) : '—'}
                      </td>
                    ))}
                    {years.map(y => (
                      <td key={`a${y}`} className="table-cell-right">
                        {row[`acum${y}`] != null ? fmtUSD(row[`acum${y}`]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function MomChart({ fmtUSD, yoyData }) {
  const currentYear = new Date().getFullYear()
  const yearData = yoyData.filter(r => r[`saldo${currentYear}`] != null)

  const momData = yearData.map((row, i) => {
    const prev = i > 0 ? yearData[i - 1][`saldo${currentYear}`] : null
    const cur = row[`saldo${currentYear}`]
    return {
      month: row.month,
      mom: prev != null ? cur - prev : 0,
    }
  }).slice(1)

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={momData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#718096', fontSize: 11 }} />
          <YAxis tick={{ fill: '#718096', fontSize: 11 }} tickFormatter={v => `$${v}`} />
          <Tooltip formatter={(v) => [fmtUSD(v), 'MoM']} />
          <ReferenceLine y={0} stroke="#cbd5e0" />
          <Bar dataKey="mom" name="Variación MoM" radius={[2,2,0,0]}
            fill="#2b6cb0"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
