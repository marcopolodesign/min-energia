import { supabase } from '../lib/supabase'

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !admin) {
      await supabase.auth.signOut()
      throw new Error('Acceso no autorizado')
    }

    localStorage.setItem('userProfile', JSON.stringify(admin))
    return { jwt: data.session.access_token, profile: admin }
  },

  async verifyToken(token) {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) return false
      return true
    } catch {
      return false
    }
  },

  async getCurrentUserProfile() {
    const cached = localStorage.getItem('userProfile')
    if (cached) {
      try { return JSON.parse(cached) } catch { /* fall through */ }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
    if (data) localStorage.setItem('userProfile', JSON.stringify(data))
    return data
  },

  async logout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('userProfile')
    await supabase.auth.signOut()
  }
}
