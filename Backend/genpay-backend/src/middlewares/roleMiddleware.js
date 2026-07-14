import { supabase } from '../config/supabase.js'

export function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      // 1. req.user di-set oleh authMiddleware
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // 2. Query Supabase: cek role dari tabel users
      // Role disimpan di tabel 'users' berdasarkan user_id
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single()

      console.log(`[ROLE_CHECK] User: ${req.user.id}, UserData:`, user, 'Error:', error);

      if (error || !user) {
        return res.status(403).json({ error: 'Forbidden: User not found' })
      }

      // 3. Cek role
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
