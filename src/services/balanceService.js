import { supabase, toCamelCase } from '../lib/supabase'
import {
  BALANCE_MENSUAL_PROCESSED,
  BALANCE_ANUAL,
} from '../lib/mockData'

// Use mock data only when Supabase isn't configured (placeholder URL)
const DEMO = !import.meta.env.VITE_SUPABASE_URL ||
             import.meta.env.VITE_SUPABASE_URL.includes('your-project')

const MONTHS_ES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export const balanceService = {
  // ─── Monthly balance (2024+) ────────────────────────────
  async getMensual(year) {
    if (DEMO) {
      const rows = BALANCE_MENSUAL_PROCESSED
        .filter(r => !year || r.year === Number(year))
        .sort((a, b) => b.year - a.year || a.month - b.month)
      return rows
    }
    const query = supabase
      .from('v_balance_mensual')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: true })

    if (year) query.eq('year', year)

    const { data, error } = await query
    if (error) throw error
    return toCamelCase(data || [])
  },

  async getAllMensual() {
    if (DEMO) {
      return BALANCE_MENSUAL_PROCESSED.slice().sort((a, b) => a.year - b.year || a.month - b.month)
    }
    const { data, error } = await supabase
      .from('v_balance_mensual')
      .select('*')
      .order('year', { ascending: true })
      .order('month', { ascending: true })
    if (error) throw error
    return toCamelCase(data || [])
  },

  async upsertMensual(row) {
    if (DEMO) return row
    const { year, month, exportsUsd, importsUsd, government, isRecord, observations } = row
    const { data, error } = await supabase
      .from('balance_mensual')
      .upsert({
        year,
        month,
        exports_usd: exportsUsd,
        imports_usd: importsUsd,
        government,
        is_record: isRecord,
        observations,
      }, { onConflict: 'year,month' })
      .select()
      .single()
    if (error) throw error
    return toCamelCase(data)
  },

  async deleteMensual(year, month) {
    if (DEMO) return
    const { error } = await supabase
      .from('balance_mensual')
      .delete()
      .eq('year', year)
      .eq('month', month)
    if (error) throw error
  },

  // ─── Annual (2011+) ─────────────────────────────────────
  async getAnual() {
    if (DEMO) return BALANCE_ANUAL.slice().sort((a, b) => a.year - b.year)
    const { data, error } = await supabase
      .from('balance_anual')
      .select('*')
      .order('year', { ascending: true })
    if (error) throw error
    return toCamelCase(data || [])
  },

  async upsertAnual(row) {
    if (DEMO) return row
    const { year, balanceUsd, government, context } = row
    const { data, error } = await supabase
      .from('balance_anual')
      .upsert({ year, balance_usd: balanceUsd, government, context },
        { onConflict: 'year' })
      .select()
      .single()
    if (error) throw error
    return toCamelCase(data)
  },

  // ─── Historical exports (1990+) ─────────────────────────
  async getExportacionesHistoricas(yearFrom, yearTo) {
    if (DEMO) return []
    let query = supabase
      .from('exportaciones_historicas')
      .select('*')
      .order('year', { ascending: true })
      .order('month', { ascending: true })

    if (yearFrom) query = query.gte('year', yearFrom)
    if (yearTo)   query = query.lte('year', yearTo)

    const { data, error } = await query
    if (error) throw error
    return toCamelCase(data || [])
  },

  async upsertExportaciones(rows) {
    if (DEMO) return
    const { error } = await supabase
      .from('exportaciones_historicas')
      .upsert(rows.map(r => ({
        year: r.year,
        month: r.month,
        exports_usd: r.exportsUsd,
      })), { onConflict: 'year,month' })
    if (error) throw error
  },

  // ─── Projections ─────────────────────────────────────────
  async getProyecciones() {
    if (DEMO) return []
    const { data, error } = await supabase
      .from('proyecciones')
      .select('*')
      .order('year', { ascending: true })
    if (error) throw error
    return toCamelCase(data || [])
  },

  // ─── Dashboard KPIs ──────────────────────────────────────
  async getDashboardKPIs() {
    if (DEMO) {
      const currentYear = new Date().getFullYear()
      const mensual = BALANCE_MENSUAL_PROCESSED.filter(r => r.year === currentYear)
      const anual = BALANCE_ANUAL.slice().sort((a, b) => b.year - a.year).slice(0, 5)
      const available = mensual.filter(r => r.exportsUsd != null)
      const latestMonth = available.at(-1)
      const prevMonth = available.at(-2)
      const ytd = latestMonth?.ytdBalance ?? 0
      const mom = (latestMonth && prevMonth && prevMonth.balance)
        ? (latestMonth.balance - prevMonth.balance) / Math.abs(prevMonth.balance)
        : null
      return { mensual, anual, latestMonth, ytd, mom }
    }

    const currentYear = new Date().getFullYear()
    const [mensualRes, anualRes] = await Promise.allSettled([
      supabase.from('v_balance_mensual').select('*')
        .eq('year', currentYear).order('month', { ascending: true }),
      supabase.from('balance_anual').select('*').order('year', { ascending: false }).limit(5),
    ])

    const mensual = toCamelCase(mensualRes.status === 'fulfilled' ? mensualRes.value.data || [] : [])
    const anual = toCamelCase(anualRes.status === 'fulfilled' ? anualRes.value.data || [] : [])

    const available = mensual.filter(r => r.exportsUsd != null)
    const latestMonth = available.at(-1)
    const prevMonth = available.at(-2)
    const ytd = latestMonth?.ytdBalance ?? 0
    const mom = (latestMonth && prevMonth)
      ? (latestMonth.balance - prevMonth.balance) / Math.abs(prevMonth.balance)
      : null

    return { mensual, anual, latestMonth, ytd, mom }
  },

  // ─── YoY comparison (Gráficos sheet) ────────────────────
  async getYoYData() {
    if (DEMO) {
      const pivot = {}
      for (const row of BALANCE_MENSUAL_PROCESSED) {
        const m = MONTHS_ES[row.month]
        if (!pivot[m]) pivot[m] = { month: m, monthNum: row.month }
        pivot[m][`saldo${row.year}`] = row.balance
        pivot[m][`acum${row.year}`] = row.ytdBalance
      }
      return Object.values(pivot).sort((a, b) => a.monthNum - b.monthNum)
    }

    const { data, error } = await supabase
      .from('v_balance_mensual')
      .select('year,month,balance_usd,ytd_balance')
      .order('year', { ascending: true })
      .order('month', { ascending: true })
    if (error) throw error

    const pivot = {}
    for (const row of (data || [])) {
      const m = MONTHS_ES[row.month]
      if (!pivot[m]) pivot[m] = { month: m, monthNum: row.month }
      pivot[m][`saldo${row.year}`] = row.balance_usd
      pivot[m][`acum${row.year}`] = row.ytd_balance
    }
    return Object.values(pivot).sort((a, b) => a.monthNum - b.monthNum)
  },
}
