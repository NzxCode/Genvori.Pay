import { supabase } from '../config/supabase.js'

export function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      // 1. req.user di-set oleh authMiddleware
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // 2. Query Supabase: cek role dari tabel profiles
      // Asumsi ada tabel 'profiles' dengan kolom 'role' dan 'user_id'
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', req.user.id)
        .single()

      if (error || !profile) {
        return res.status(403).json({ error: 'Forbidden: Profile not found' })
      }

      // 3. Cek role
      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
