// Static data seeded from the Excel reference file.
// Used in demo mode (VITE_DEMO_MODE=true) so the app renders without Supabase.

export const BALANCE_MENSUAL = [
  // 2024
  { year: 2024, month: 1,  exports_usd: 677,  imports_usd: 287,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 2,  exports_usd: 718,  imports_usd: 160,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 3,  exports_usd: 825,  imports_usd: 132,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 4,  exports_usd: 945,  imports_usd: 242,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 5,  exports_usd: 892,  imports_usd: 392,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 6,  exports_usd: 629,  imports_usd: 761,  government: 'Milei', is_record: false, observations: 'Único mes con déficit en 2024' },
  { year: 2024, month: 7,  exports_usd: 864,  imports_usd: 650,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 8,  exports_usd: 758,  imports_usd: 445,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 9,  exports_usd: 776,  imports_usd: 166,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 10, exports_usd: 817,  imports_usd: 199,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 11, exports_usd: 641,  imports_usd: 128,  government: 'Milei', is_record: false, observations: null },
  { year: 2024, month: 12, exports_usd: 1032, imports_usd: 180,  government: 'Milei', is_record: true,  observations: 'Récord diciembre' },
  // 2025
  { year: 2025, month: 1,  exports_usd: 879,  imports_usd: 201,  government: 'Milei', is_record: false, observations: null },
  { year: 2025, month: 2,  exports_usd: 847,  imports_usd: 230,  government: 'Milei', is_record: false, observations: null },
  { year: 2025, month: 3,  exports_usd: 753,  imports_usd: 226,  government: 'Milei', is_record: false, observations: null },
  { year: 2025, month: 4,  exports_usd: 851,  imports_usd: 278,  government: 'Milei', is_record: false, observations: null },
  { year: 2025, month: 5,  exports_usd: 647,  imports_usd: 302,  government: 'Milei', is_record: false, observations: null },
  { year: 2025, month: 6,  exports_usd: 1064, imports_usd: 325,  government: 'Milei', is_record: true,  observations: 'Mayor exportación mensual del año' },
  { year: 2025, month: 7,  exports_usd: 763,  imports_usd: 546,  government: 'Milei', is_record: false, observations: null },
  { year: 2025, month: 8,  exports_usd: 1056, imports_usd: 307,  government: 'Milei', is_record: true,  observations: null },
  { year: 2025, month: 9,  exports_usd: 967,  imports_usd: 191,  government: 'Milei', is_record: true,  observations: null },
  { year: 2025, month: 10, exports_usd: 913,  imports_usd: 205,  government: 'Milei', is_record: true,  observations: null },
  { year: 2025, month: 11, exports_usd: 1008, imports_usd: 149,  government: 'Milei', is_record: false, observations: null },
  { year: 2025, month: 12, exports_usd: 1067, imports_usd: 174,  government: 'Milei', is_record: false, observations: null },
  // 2026
  { year: 2026, month: 1,  exports_usd: 781,  imports_usd: 163,  government: 'Milei', is_record: false, observations: null },
  { year: 2026, month: 2,  exports_usd: 631,  imports_usd: 145,  government: 'Milei', is_record: false, observations: null },
  { year: 2026, month: 3,  exports_usd: 1235, imports_usd: 145,  government: 'Milei', is_record: true,  observations: 'Superávit más alto de la historia para un mes' },
  { year: 2026, month: 4,  exports_usd: 1554, imports_usd: 152,  government: 'Milei', is_record: false, observations: null },
  // months 5-12 pending
  { year: 2026, month: 5,  exports_usd: null, imports_usd: null, government: 'Milei', is_record: false, observations: null },
  { year: 2026, month: 6,  exports_usd: null, imports_usd: null, government: 'Milei', is_record: false, observations: null },
  { year: 2026, month: 7,  exports_usd: null, imports_usd: null, government: 'Milei', is_record: false, observations: null },
  { year: 2026, month: 8,  exports_usd: null, imports_usd: null, government: 'Milei', is_record: false, observations: null },
  { year: 2026, month: 9,  exports_usd: null, imports_usd: null, government: 'Milei', is_record: false, observations: null },
  { year: 2026, month: 10, exports_usd: null, imports_usd: null, government: 'Milei', is_record: false, observations: null },
  { year: 2026, month: 11, exports_usd: null, imports_usd: null, government: 'Milei', is_record: false, observations: null },
  { year: 2026, month: 12, exports_usd: null, imports_usd: null, government: 'Milei', is_record: false, observations: null },
].map(r => {
  const balance = r.exports_usd != null ? r.exports_usd - (r.imports_usd || 0) : null
  return { ...r, balance }
})

// Add YTD per year and camelCase aliases
const withYtd = () => {
  const result = []
  const ytdByYear = {}
  for (const r of BALANCE_MENSUAL) {
    ytdByYear[r.year] = ytdByYear[r.year] || 0
    if (r.balance != null) ytdByYear[r.year] += r.balance
    result.push({
      ...r,
      exportsUsd: r.exports_usd,
      importsUsd: r.imports_usd,
      isRecord: r.is_record,
      ytdBalance: r.balance != null ? (result
        .filter(x => x.year === r.year && x.balance != null)
        .reduce((s, x) => s + x.balance, 0) + r.balance) : null,
    })
  }
  return result
}

export const BALANCE_MENSUAL_PROCESSED = withYtd()

export const BALANCE_ANUAL = [
  { year: 2011, balance_usd: -3114, government: 'Kirchnerismo', context: 'Kirchnerismo — inicio importaciones masivas de GNL' },
  { year: 2012, balance_usd: -2150, government: 'Kirchnerismo', context: 'Política de subsidios — demanda energética insostenible' },
  { year: 2013, balance_usd: -6902, government: 'Kirchnerismo', context: 'Año de mayor déficit histórico: USD -6.902 M' },
  { year: 2014, balance_usd: -6401, government: 'Kirchnerismo', context: 'Caída de precios del petróleo agrava la balanza' },
  { year: 2015, balance_usd: -4608, government: 'Kirchnerismo', context: 'Último año del kirchnerismo' },
  { year: 2016, balance_usd: -2808, government: 'Macrismo',     context: 'Macrismo — inicio de reformas tarifarias graduales' },
  { year: 2017, balance_usd: -3244, government: 'Macrismo',     context: 'Reforma energética, caída de importaciones de GNL' },
  { year: 2018, balance_usd: -2623, government: 'Macrismo',     context: 'Crisis cambiaria — tarifas no compensan el déficit' },
  { year: 2019, balance_usd:  -170, government: 'Macrismo',     context: 'Año casi equilibrado (USD -170 M)' },
  { year: 2020, balance_usd:   953, government: 'Alberto F.',   context: 'COVID — caída de demanda logra leve superávit' },
  { year: 2021, balance_usd:  -560, government: 'Alberto F.',   context: 'Recuperación de demanda — vuelve al déficit' },
  { year: 2022, balance_usd: -4359, government: 'Alberto F.',   context: 'Guerra en Ucrania: GNL caro, mayor costo de importación' },
  { year: 2023, balance_usd:   -13, government: 'Alberto F.',   context: 'Último año con déficit (USD -13 M)' },
  { year: 2024, balance_usd:  5658, government: 'Milei',        context: 'GESTIÓN MILEI — Superávit histórico: USD 5.667 M' },
  { year: 2025, balance_usd:  7681, government: 'Milei',        context: 'GESTIÓN MILEI — Nuevo récord anual: USD 7.681 M' },
  { year: 2026, balance_usd:  3807, government: 'Milei',        context: 'GESTIÓN MILEI — Q1+Q2 2026 (dato parcial)' },
].map(r => ({ ...r, balanceUsd: r.balance_usd }))
