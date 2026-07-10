/*
  services/historyService.js
  -------------------------
  Menangani pengambilan riwayat transaksi terpadu.
*/

import { supabase } from '../config/supabase.js'

export async function getUserHistory(userId, filters = {}) {
  const page = parseInt(filters.page) || 1
  const limit = parseInt(filters.limit) || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('transaction_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.type) {
    query = query.eq('type', filters.type)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    data,
    total: count,
    page,
    limit
  }
}
