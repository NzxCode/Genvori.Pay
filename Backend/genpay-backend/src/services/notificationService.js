/*
  services/notificationService.js
  -------------------------
  Menangani pembuatan dan pengambilan notifikasi untuk pengguna.
*/

import { supabase } from '../config/supabase.js'

export async function createNotification(userId, { title, message, type = 'info' }) {
  console.log(`[NotificationService] Creating notification for user ${userId}: ${title}`);
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
      is_read: false
    })
    .select()
    .single()

  if (error) {
    console.error('[NotificationService] Error creating notification:', error);
    throw error;
  }
  console.log('[NotificationService] Notification created successfully:', data.id);
  return data;
}

export async function getNotifications(userId, filters = {}) {
  const page = parseInt(filters.page) || 1
  const limit = parseInt(filters.limit) || 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.is_read !== undefined) {
    query = query.eq('is_read', filters.is_read === 'true')
  }

  const { data, error, count } = await query

  if (error) throw error
  return data
}

export async function markAsRead(notificationId, userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}
