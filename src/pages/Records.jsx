import { useState, useEffect } from 'react'
import { supabase, toCamelCase } from '../lib/supabase'
import { useLocale } from '../context/LocaleContext'

const MONTHS_ES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Static records data from the Excel (Records Históricos sheet)
const RECORDS_SALDO = [
  { month: 'Enero',      r1y: 2025, r1v: 678, r2y: 2026, r2v: 618, r3y: 2008, r3v: 557, v2026: 618, status: 'No (mejor: 678M en 2025)' },
  { month: 'Febrero',    r1y: 2008, r1v: 665, r2y: 2025, r2v: 617, r3y: 2024, r3v: 564, v2026: 486, status: 'No (mejor: 665M en 2008)' },
  { month: 'Marzo',      r1y: 2026, r1v: 1090,r2y: 2024, r2v: 735, r3y: 2008, r3v: 552, v2026: 1090, status: '⭐ RECORD' },
  { month: 'Abril',      r1y: 2024, r1v: 704, r2y: 2006, r2v: 577, r3y: 2025, r3v: 573, v2026: null, status: 'A superar: 704M (2024)' },
  { month: 'Mayo',       r1y: 2024, r1v: 473, r2y: 2006, r2v: 467, r3y: 2007, r3v: 427, v2026: null, status: 'A superar: 473M (2024)' },
  { month: 'Junio',      r1y: 2025, r1v: 739, r2y: 2006, r2v: 499, r3y: 2005, r3v: 398, v2026: null, status: 'A superar: 739M (2025)' },
  { month: 'Julio',      r1y: 2006, r1v: 478, r2y: 2005, r2v: 431, r3y: 2003, r3v: 412, v2026: null, status: 'A superar: 478M (2006)' },
  { month: 'Agosto',     r1y: 2025, r1v: 749, r2y: 2005, r2v: 575, r3y: 2003, r3v: 458, v2026: null, status: 'A superar: 749M (2025)' },
  { month: 'Septiembre', r1y: 2025, r1v: 776, r2y: 2005, r2v: 602, r3y: 2004, r3v: 586, v2026: null, status: 'A superar: 776M (2025)' },
  { month: 'Octubre',    r1y: 2025, r1v: 708, r2y: 2024, r2v: 618, r3y: 2006, r3v: 576, v2026: null, status: 'A superar: 708M (2025)' },
  { month: 'Noviembre',  r1y: 2007, r1v: 536, r2y: 2005, r2v: 519, r3y: 2024, r3v: 513, v2026: null, status: 'A superar: 536M (2007)' },
  { month: 'Diciembre',  r1y: 2024, r1v: 852, r2y: 2006, r2v: 590, r3y: 2005, r3v: 542, v2026: null, status: 'A superar: 852M (2024)' },
]

const RECORDS_ACUM = [
  { period: 'Q1 (Ene–Mar)', r1y: 2025, r1v: 1822, r2y: 2008, r2v: 1774, r3y: 2024, r3v: 1712, v2026: 2194, status: '⭐ SÍ — NUEVO RECORD' },
  { period: 'H1 (Ene–Jun)', r1y: 2025, r1v: 3479, r2y: 2006, r2v: 3055, r3y: 2024, r3v: 2719, v2026: null, status: 'A superar: 3.479M (2025)' },
  { period: 'Anual (Ene–Dic)', r1y: 2006, r1v: 6081, r2y: 2024, r2v: 5667, r3y: 2005, r3v: 5605, v2026: null, status: 'A superar: 6.081M (2006)' },
]

const SectionTitle = ({ children, sub }) => (
  <div className="mb-3">
    <h2 className="font-semibold text-text-primary">{children}</h2>
    {sub && <p className="text-xs text-text-tertiary">{sub}</p>}
  </div>
)

export default function Records() {
  const { t, fmtUSD } = useLocale()

  const isRecord = (status) => status?.startsWith('⭐')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Context banner */}
      <div className="card-sm bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-900 font-medium">⭐ Récord vigente del mes | Serie Saldo: 1990–2026 | Serie Exp/Imp: 2024–2026</p>
        <p className="text-xs text-yellow-700 mt-1">{t('app.source')}</p>
      </div>

      {/* Monthly balance records */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-default">
          <SectionTitle sub="Serie 1990–2026">① {t('records.monthly.title')}</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">{t('table.month')}</th>
                <th className="table-header-right">#1 Año</th>
                <th className="table-header-right">#1 Saldo</th>
                <th className="table-header-right">#2 Año</th>
                <th className="table-header-right">#2 Saldo</th>
                <th className="table-header-right">#3 Año</th>
                <th className="table-header-right">#3 Saldo</th>
                <th className="table-header-right">2026</th>
                <th className="table-header">Estado</th>
              </tr>
            </thead>
            <tbody>
              {RECORDS_SALDO.map(row => (
                <tr key={row.month} className={`table-row ${isRecord(row.status) ? 'bg-yellow-50/50' : ''}`}>
                  <td className="table-cell font-medium">{row.month}</td>
                  <td className="table-cell-right text-xs text-text-tertiary">{row.r1y}</td>
                  <td className="table-cell-right font-semibold text-surplus">{fmtUSD(row.r1v)}</td>
                  <td className="table-cell-right text-xs text-text-tertiary">{row.r2y}</td>
                  <td className="table-cell-right">{fmtUSD(row.r2v)}</td>
                  <td className="table-cell-right text-xs text-text-tertiary">{row.r3y}</td>
                  <td className="table-cell-right text-text-secondary">{fmtUSD(row.r3v)}</td>
                  <td className="table-cell-right font-medium">
                    {row.v2026 != null ? fmtUSD(row.v2026) : <span className="badge-pending">{t('pending')}</span>}
                  </td>
                  <td className="table-cell">
                    {isRecord(row.status)
                      ? <span className="badge-record">{row.status}</span>
                      : <span className="text-xs text-text-tertiary">{row.status}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accumulated records */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-default">
          <SectionTitle sub="Q1 | 1er Semestre | Anual — serie histórica 1990–2026">④ {t('records.acum.title')}</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Período</th>
                <th className="table-header-right">#1 Año</th>
                <th className="table-header-right">#1 Saldo</th>
                <th className="table-header-right">#2 Año</th>
                <th className="table-header-right">#2 Saldo</th>
                <th className="table-header-right">#3 Año</th>
                <th className="table-header-right">#3 Saldo</th>
                <th className="table-header-right">2026</th>
                <th className="table-header">Estado</th>
              </tr>
            </thead>
            <tbody>
              {RECORDS_ACUM.map(row => (
                <tr key={row.period} className={`table-row ${isRecord(row.status) ? 'bg-yellow-50/50' : ''}`}>
                  <td className="table-cell font-medium">{row.period}</td>
                  <td className="table-cell-right text-xs text-text-tertiary">{row.r1y}</td>
                  <td className="table-cell-right font-semibold text-surplus">{fmtUSD(row.r1v)}</td>
                  <td className="table-cell-right text-xs text-text-tertiary">{row.r2y}</td>
                  <td className="table-cell-right">{fmtUSD(row.r2v)}</td>
                  <td className="table-cell-right text-xs text-text-tertiary">{row.r3y}</td>
                  <td className="table-cell-right text-text-secondary">{fmtUSD(row.r3v)}</td>
                  <td className="table-cell-right font-medium">
                    {row.v2026 != null ? fmtUSD(row.v2026) : <span className="badge-pending">{t('pending')}</span>}
                  </td>
                  <td className="table-cell">
                    {isRecord(row.status)
                      ? <span className="badge-record">{row.status}</span>
                      : <span className="text-xs text-text-tertiary">{row.status}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
