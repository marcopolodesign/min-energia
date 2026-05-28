import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useLocale } from '../context/LocaleContext'

const PROYECCIONES = [
  { year: 2024, energia: 6,  mineria: 3,  total: 9  },
  { year: 2025, energia: 8,  mineria: 5,  total: 12 },
  { year: 2026, energia: 13, mineria: 6,  total: 19 },
  { year: 2027, energia: 19, mineria: 6,  total: 25 },
  { year: 2028, energia: 22, mineria: 6,  total: 28 },
  { year: 2029, energia: 28, mineria: 7,  total: 35 },
  { year: 2030, energia: 36, mineria: 14, total: 49 },
  { year: 2031, energia: 42, mineria: 17, total: 59 },
  { year: 2032, energia: 45, mineria: 22, total: 66 },
  { year: 2033, energia: 47, mineria: 24, total: 70 },
  { year: 2034, energia: 48, mineria: 29, total: 77 },
  { year: 2035, energia: 50, mineria: 34, total: 84 },
]

export default function Proyecciones() {
  const { fmtNum } = useLocale()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-sm bg-blue-50 border-blue-200">
        <p className="text-sm font-medium text-blue-900">
          Proyecciones Balanza Energía &amp; Minería — Ministerio de Economía (BUSD)
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Supuestos: Petróleo USD 70/bbl (2028+) | LNG USD 8–12/MMBTU | Oro ~USD 3.780/oz | Litio ~USD 13.230/tn
        </p>
      </div>

      {/* Stacked area chart */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">Proyección 2024–2035 (BUSD)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PROYECCIONES} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fill: '#718096', fontSize: 11 }} />
              <YAxis tick={{ fill: '#718096', fontSize: 11 }} unit=" BUSD" />
              <Tooltip formatter={(v, name) => [`${fmtNum(v)} BUSD`, name]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="energia" name="Energía" stackId="1"
                stroke="#2b6cb0" fill="#2b6cb0" fillOpacity={0.6} />
              <Area type="monotone" dataKey="mineria" name="Minería" stackId="1"
                stroke="#38a169" fill="#38a169" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Año</th>
                <th className="table-header-right">Energía (BUSD)</th>
                <th className="table-header-right">Minería (BUSD)</th>
                <th className="table-header-right">Total (BUSD)</th>
                <th className="table-header-right">Var. Total</th>
              </tr>
            </thead>
            <tbody>
              {PROYECCIONES.map((row, i) => {
                const prev = i > 0 ? PROYECCIONES[i - 1].total : null
                const varPct = prev ? ((row.total - prev) / prev * 100) : null
                const isCurrentOrPast = row.year <= 2026
                return (
                  <tr key={row.year} className={`table-row ${isCurrentOrPast ? 'bg-blue-50/30' : ''}`}>
                    <td className="table-cell font-semibold">
                      {row.year}
                      {isCurrentOrPast && <span className="ml-2 text-xs text-brand font-normal">est.</span>}
                    </td>
                    <td className="table-cell-right">{fmtNum(row.energia)}</td>
                    <td className="table-cell-right">{fmtNum(row.mineria)}</td>
                    <td className="table-cell-right font-bold text-brand">{fmtNum(row.total)}</td>
                    <td className="table-cell-right">
                      {varPct != null && (
                        <span className={varPct >= 0 ? 'text-surplus font-medium' : 'text-deficit font-medium'}>
                          {varPct >= 0 ? '+' : ''}{fmtNum(varPct, 1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
