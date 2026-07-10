/*
  services/locationService.js
  -------------------------
  Menangani penyimpanan dan pengolahan data lokasi user.
*/

import { supabase } from '../config/supabase.js'

export async function updateLocation(userId, { latitude, longitude, accuracy, address = null }) {
  const { data, error } = await supabase
    .from('user_locations')
    .insert({
      user_id: userId,
      latitude,
      longitude,
      accuracy,
      address
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLastLocation(userId) {
  const { data, error } = await supabase
    .from('user_locations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
