import { useState, useEffect } from 'react'
import {
  ComposedChart, Bar, Line, AreaChart, Area, LineChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend
} from 'recharts'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, StarIcon } from '@heroicons/react/24/outline'
import { balanceService } from '../services/balanceService'
import { useLocale } from '../context/LocaleContext'

const MONTHS_SHORT_ES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const YEAR_COLORS = { 2024: '#2b6cb0', 2025: '#38a169', 2026: '#d69e2e' }

const CustomTooltip = ({ active, payload, label, fmtUSD }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border-default rounded-lg shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-mono text-text-primary">{fmtUSD(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const KPICard = ({ label, sub, value, badge, icon: Icon, trend }) => (
  <div className="card-sm flex flex-col gap-2">
    <div className="flex items-start justify-between">
      <p className="kpi-label">{label}</p>
      {Icon && <Icon className="h-4 w-4 text-text-muted" />}
    </div>
    <p className="kpi-value">{value}</p>
    {badge && <div>{badge}</div>}
    {sub && <p className="text-xs text-text-tertiary">{sub}</p>}
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-surplus' : 'text-deficit'}`}>
        {trend >= 0
          ? <ArrowTrendingUpIcon className="h-4 w-4" />
          : <ArrowTrendingDownIcon className="h-4 w-4" />}
        <span>{trend >= 0 ? '+' : ''}{(trend * 100).toFixed(1)}%</span>
      </div>
    )}
  </div>
)

export default function Panel() {
  const { t, fmtUSD, fmtPct } = useLocale()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState(null)
  const [mensualAll, setMensualAll] = useState([])
  const [yoyData, setYoyData] = useState([])
  const [anual, setAnual] = useState([])
  const [rangeFilter, setRangeFilter] = useState('ytd')

  useEffect(() => {
    const load = async () => {
      try {
        const [kpiData, mensual, yoy, annual] = await Promise.all([
          balanceService.getDashboardKPIs(),
          balanceService.getAllMensual(),
          balanceService.getYoYData(),
          balanceService.getAnual(),
        ])
        setKpis(kpiData)
        setMensualAll(mensual)
        setYoyData(yoy)
        setAnual(annual)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currentYear = new Date().getFullYear()

  // Chart data: monthly balance filtered by range
  const chartData = (() => {
    if (!mensualAll.length) return []
    let rows = mensualAll.filter(r => r.exportsUsd != null)
    if (rangeFilter === 'ytd') rows = rows.filter(r => r.year === currentYear)
    else if (rangeFilter === '12m') rows = rows.slice(-12)
    return rows.map(r => ({
      label: `${MONTHS_SHORT_ES[r.month]} ${r.year}`,
      exports: r.exportsUsd,
      imports: -(r.importsUsd),
      balance: r.balance ?? (r.exportsUsd - (r.importsUsd || 0)),
    }))
  })()

  // YTD per year for area chart
  const ytdByYear = (() => {
    const years = [...new Set(mensualAll.map(r => r.year))].sort()
    return MONTHS_SHORT_ES.slice(1).map((m, i) => {
      const obj = { month: m, monthNum: i + 1 }
      years.forEach(y => {
        const row = mensualAll.find(r => r.year === y && r.month === i + 1)
        if (row?.ytdBalance != null) obj[`ytd${y}`] = row.ytdBalance
      })
      return obj
    })
  })()

  // Record: all-time highest monthly balance
  const allTimeRecord = mensualAll.reduce((best, r) => {
    const b = r.balance ?? (r.exportsUsd - (r.importsUsd || 0))
    return (!best || b > best.value) ? { value: b, month: r.month, year: r.year } : best
  }, null)

  // Milei accumulated
  const mileiTotal = mensualAll
    .filter(r => (r.year > 2023 || (r.year === 2023 && r.month === 12)) && r.exportsUsd != null)
    .reduce((s, r) => s + (r.balance ?? (r.exportsUsd - (r.importsUsd || 0))), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const latestMonth = kpis?.latestMonth
  const latestBalance = latestMonth ? (latestMonth.balance ?? (latestMonth.exportsUsd - (latestMonth.importsUsd || 0))) : null
  const ytd = kpis?.ytd ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={t('kpi.ytd')}
          sub={t('kpi.ytd.sub')}
          value={fmtUSD(ytd)}
          badge={<span className="badge-surplus">{t('surplus')}</span>}
        />
        <KPICard
          label={t('kpi.month')}
          sub={latestMonth ? `${MONTHS_SHORT_ES[latestMonth.month]} ${latestMonth.year}` : ''}
          value={fmtUSD(latestBalance)}
          badge={latestBalance >= 0
            ? <span className="badge-surplus">↑ {t('surplus')}</span>
            : <span className="badge-deficit">↓ {t('deficit')}</span>}
          trend={kpis?.mom}
        />
        <KPICard
          label={t('kpi.milei.total')}
          sub={t('kpi.milei.sub')}
          value={fmtUSD(mileiTotal)}
          badge={<span className="badge-surplus">{t('surplus')}</span>}
        />
        {allTimeRecord && (
          <KPICard
            label={t('kpi.record')}
            sub={`${MONTHS_SHORT_ES[allTimeRecord.month]} ${allTimeRecord.year}`}
            value={fmtUSD(allTimeRecord.value)}
            badge={<span className="badge-record">⭐ {t('record')}</span>}
            icon={StarIcon}
          />
        )}
      </div>

      {/* Historical context banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-sm bg-deficit-bg border-deficit-border">
          <p className="kpi-label text-deficit mb-1">{t('kpi.deficit.hist')}</p>
          <p className="text-2xl font-bold text-deficit">USD -36.953 M</p>
          <p className="text-xs text-deficit/70 mt-1">{t('kpi.deficit.sub')}</p>
        </div>
        <div className="card-sm bg-surplus-bg border-surplus-border">
          <p className="kpi-label text-surplus mb-1">{t('kpi.milei.total')}</p>
          <p className="text-2xl font-bold text-surplus">{fmtUSD(mileiTotal)}</p>
          <p className="text-xs text-surplus/70 mt-1">{t('kpi.milei.sub')}</p>
        </div>
      </div>

      {/* Main chart: Trade balance over time */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">{t('chart.balance.title')}</h2>
          <div className="flex gap-1">
            {[['ytd', t('filter.ytd')], ['12m', t('filter.12m')], ['all', t('filter.all_history')]].map(([v, l]) => (
              <button key={v} onClick={() => setRangeFilter(v)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${rangeFilter === v ? 'bg-brand text-white' : 'btn-ghost'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fill: '#718096', fontSize: 11 }} />
              <YAxis tick={{ fill: '#718096', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip fmtUSD={fmtUSD} />} />
              <ReferenceLine y={0} stroke="#cbd5e0" />
              <Bar dataKey="exports" name={t('chart.balance.exports')} fill="#75aadb" radius={[2,2,0,0]} opacity={0.8} />
              <Bar dataKey="imports" name={t('chart.balance.imports')} fill="#fc8181" radius={[2,2,0,0]} opacity={0.8} />
              <Line dataKey="balance" name={t('chart.balance.balance')} type="monotone" stroke="#2b6cb0" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* YTD Accumulated surplus per year */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">{t('chart.ytd.title')}</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ytdByYear} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: '#718096', fontSize: 11 }} />
              <YAxis tick={{ fill: '#718096', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip fmtUSD={fmtUSD} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {[2024, 2025, 2026].map(y => (
                <Area key={y} type="monotone" dataKey={`ytd${y}`} name={String(y)}
                  stroke={YEAR_COLORS[y]} fill={YEAR_COLORS[y]} fillOpacity={0.08}
                  strokeWidth={2} dot={false} connectNulls />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* YoY monthly comparison */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">{t('chart.yoy.title')}</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yoyData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: '#718096', fontSize: 11 }} />
              <YAxis tick={{ fill: '#718096', fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip fmtUSD={fmtUSD} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={0} stroke="#cbd5e0" />
              {[2024, 2025, 2026].map(y => (
                <Line key={y} type="monotone" dataKey={`saldo${y}`} name={String(y)}
                  stroke={YEAR_COLORS[y]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Annual history */}
      {anual.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-text-primary mb-4">{t('chart.annual.title')}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={anual} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fill: '#718096', fontSize: 11 }} />
                <YAxis tick={{ fill: '#718096', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip fmtUSD={fmtUSD} />} />
                <ReferenceLine y={0} stroke="#9b2335" strokeDasharray="4 2" />
                <Bar dataKey="balanceUsd" name={t('chart.balance.balance')}
                  radius={[3,3,0,0]}
                  fill="#2b6cb0"
                  label={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
